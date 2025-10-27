package com.biovault.service;

import com.microsoft.cognitiveservices.speech.*;
import com.microsoft.cognitiveservices.speech.audio.AudioConfig;
import com.microsoft.cognitiveservices.speech.audio.AudioInputStream;
import com.microsoft.cognitiveservices.speech.audio.PushAudioInputStream;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile; // CHANGED: Import for file handling

import javax.annotation.PostConstruct;
import java.io.InputStream; // CHANGED: For handling file streams
import java.time.Duration;
import java.util.concurrent.Future;

@Service
public class VoiceAuthService {

    @Value("${azure.speech.key}")
    private String speechKey;

    @Value("${azure.speech.region}")
    private String speechRegion;

    private SpeechConfig speechConfig;

    @PostConstruct
    public void init() {
        this.speechConfig = SpeechConfig.fromSubscription(speechKey, speechRegion);
    }

    // CHANGED: The method now accepts a MultipartFile from the controller
    public String enrollTextIndependentProfile(MultipartFile audioFile) throws Exception {
        try (VoiceProfileClient client = new VoiceProfileClient(speechConfig)) {
            Future<VoiceProfile> profileFuture = client.createProfileAsync(VoiceProfileType.TextIndependent, "en-us");
            VoiceProfile profile = profileFuture.get();
            System.out.println("Created Azure voice profile. ID: " + profile.getId());

            // This part is now simplified as we get a complete audio file
            System.out.println("Processing enrollment audio file...");

            // CHANGED: Create an AudioConfig from the uploaded file's stream
            try (InputStream fileStream = audioFile.getInputStream();
                 AudioInputStream pushStream = AudioInputStream.createPushStream();
                 AudioConfig audioConfig = AudioConfig.fromStreamInput(pushStream)) {
                
                // Write the file's bytes into the Azure SDK's push stream
                pushStream.write(fileStream.readAllBytes());
                pushStream.close(); // Signal that no more data is coming

                Future<EnrollmentResult> enrollFuture = client.enrollProfileAsync(profile, audioConfig);
                EnrollmentResult result = enrollFuture.get();

                if (result.getReason() == ResultReason.EnrolledVoiceProfile) {
                    System.out.println("Enrollment complete!");
                    return profile.getId();
                } else {
                    // Handle cases where audio isn't long enough or quality is poor
                    String reason = result.getReason() == ResultReason.Canceled ?
                        SpeakerRecognitionCancellationDetails.fromResult(result).getErrorDetails() :
                        result.getProperties().getProperty(PropertyId.SpeechServiceResponse_JsonResult);
                    throw new RuntimeException("Enrollment failed. Reason: " + reason);
                }
            }
        }
    }

    // CHANGED: The method now accepts a MultipartFile from the controller
    public boolean verifyTextIndependent(String savedProfileId, MultipartFile audioFile) throws Exception {
        VoiceProfile profile = new VoiceProfile(savedProfileId, VoiceProfileType.TextIndependent);

        // CHANGED: Create an AudioConfig from the uploaded file's stream
        try (InputStream fileStream = audioFile.getInputStream();
             AudioInputStream pushStream = AudioInputStream.createPushStream();
             AudioConfig audioConfig = AudioConfig.fromStreamInput(pushStream);
             SpeakerRecognizer recognizer = new SpeakerRecognizer(speechConfig, audioConfig)) {
            
            // Write the file's bytes into the push stream
            pushStream.write(fileStream.readAllBytes());
            pushStream.close();

            SpeakerVerificationModel model = SpeakerVerificationModel.fromProfile(profile);
            Future<SpeakerRecognitionResult> resultFuture = recognizer.recognizeOnceAsync(model);
            SpeakerRecognitionResult result = resultFuture.get();

            if (result.getReason() == ResultReason.RecognizedSpeaker) {
                System.out.println("VERIFIED: Welcome back! Confidence Score: " + result.getScore());
                return true;
            } else {
                System.out.println("ACCESS DENIED: Voice does not match profile.");
                return false;
            }
        }
    }
}

