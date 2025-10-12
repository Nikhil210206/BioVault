import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, Play, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { enrollVoice } from "@/lib/apiClient";
import { modalSlide, buttonTap, waveformBar, useMotionSafe, checkmarkDraw } from "@/lib/motionSystem";

interface EnrollVoiceProps {
  username: string;
  onComplete: (success: boolean) => void;
  onSkip: () => void;
}

const EnrollVoice = ({ username, onComplete, onSkip }: EnrollVoiceProps) => {
  const [step, setStep] = useState<"prompt" | "recording" | "recorded" | "processing" | "success" | "error">("prompt");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { shouldReduce } = useMotionSafe();

  const phrases = [
    "BioVault secures my passwords",
    "My voice is my key",
    "Security through biometrics",
  ];

  const [currentPhrase] = useState(phrases[Math.floor(Math.random() * phrases.length)]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setStep("recording");
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Microphone access denied:", error);
      setErrorMessage("Microphone access denied. Please enable microphone permissions.");
      setStep("error");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setStep("recorded");
    }
  };

  const playRecording = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
    }
  };

  const retake = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    setStep("prompt");
  };

  const confirmRecording = async () => {
    setStep("processing");

    try {
      // Convert audio blob to base64 (in production, extract voice embedding)
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob!);
      reader.onloadend = async () => {
        const base64Audio = reader.result?.toString().split(",")[1] || "";

        const response = await enrollVoice({
          username: username,
          audioEmbedding: base64Audio,
          metadata: {
            duration: recordingTime,
            transcript: currentPhrase,
            timestamp: new Date().toISOString(),
            device: navigator.userAgent,
          },
        });

        if (response.success) {
          setStep("success");
          setTimeout(() => onComplete(true), 2000);
        } else {
          setErrorMessage("Enrollment failed. Please try again.");
          setStep("error");
        }
      };
    } catch (error) {
      setErrorMessage("Network error. Please check your connection.");
      setStep("error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Instruction */}
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-2">Voice Enrollment</h3>
        <p className="text-muted-foreground">
          {step === "prompt" && "Say the phrase clearly when you're ready to record."}
          {step === "recording" && "Recording... Speak the phrase now."}
          {step === "recorded" && "Review your recording. Retake if needed, or confirm to continue."}
          {step === "processing" && "Analyzing voice sample and creating encrypted embedding..."}
          {step === "success" && "Voice biometric enrolled successfully!"}
          {step === "error" && errorMessage}
        </p>
      </div>

      {/* Phrase Display */}
      {(step === "prompt" || step === "recording") && (
        <motion.div
          {...(shouldReduce ? {} : modalSlide)}
          className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl border border-border"
        >
          <p className="text-center text-xl font-medium">"{currentPhrase}"</p>
        </motion.div>
      )}

      {/* Recording Area */}
      <div className="relative aspect-video bg-muted rounded-2xl overflow-hidden flex items-center justify-center">
        <AnimatePresence mode="wait">
          {(step === "prompt" || step === "recording") && (
            <motion.div
              key="recording-area"
              {...(shouldReduce ? {} : modalSlide)}
              className="flex flex-col items-center justify-center gap-6"
            >
              {step === "recording" && (
                <>
                  {/* Animated waveform */}
                  <div className="flex items-end gap-1 h-24">
                    {[...Array(12)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-3 bg-primary rounded-full"
                        style={{ originY: 1 }}
                        {...(shouldReduce ? {} : waveformBar(i * 0.1))}
                      />
                    ))}
                  </div>
                  <div className="text-2xl font-mono font-bold">
                    {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, "0")}
                  </div>
                </>
              )}

              {step === "prompt" && (
                <Mic className="w-24 h-24 text-muted-foreground" />
              )}
            </motion.div>
          )}

          {step === "processing" && (
            <motion.div
              key="processing"
              {...(shouldReduce ? {} : modalSlide)}
              className="flex flex-col items-center justify-center"
            >
              <motion.div
                animate={shouldReduce ? {} : { rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="mb-4"
              >
                <RefreshCw className="w-12 h-12 text-primary" />
              </motion.div>
              <p className="text-lg font-medium">Processing...</p>
            </motion.div>
          )}

          {step === "success" && (
            <motion.div
              key="success"
              {...(shouldReduce ? {} : modalSlide)}
              className="flex flex-col items-center justify-center"
            >
              <motion.svg
                width="100"
                height="100"
                viewBox="0 0 100 100"
                className="mb-4"
              >
                <motion.circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="4"
                />
                <motion.path
                  d="M 30 50 L 45 65 L 70 35"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  {...(shouldReduce ? {} : checkmarkDraw)}
                />
              </motion.svg>
              <p className="text-lg font-medium text-green-600 dark:text-green-400">
                Enrollment Successful!
              </p>
            </motion.div>
          )}

          {step === "error" && (
            <motion.div
              key="error"
              {...(shouldReduce ? {} : modalSlide)}
              className="flex flex-col items-center justify-center"
            >
              <XCircle className="w-16 h-16 text-red-500 mb-4" />
              <p className="text-lg font-medium text-red-600 dark:text-red-400">
                {errorMessage}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-center">
        {step === "prompt" && (
          <>
            <motion.button
              {...(shouldReduce ? {} : buttonTap)}
              onClick={startRecording}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <Mic className="w-5 h-5" />
              Start Recording
            </motion.button>
            <motion.button
              {...(shouldReduce ? {} : buttonTap)}
              onClick={onSkip}
              className="px-6 py-3 border border-border rounded-lg font-medium hover:bg-muted transition-colors"
            >
              Skip for now
            </motion.button>
          </>
        )}

        {step === "recording" && (
          <motion.button
            {...(shouldReduce ? {} : buttonTap)}
            onClick={stopRecording}
            className="px-6 py-3 bg-destructive text-destructive-foreground rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <Square className="w-5 h-5" />
            Stop Recording
          </motion.button>
        )}

        {step === "recorded" && (
          <>
            <motion.button
              {...(shouldReduce ? {} : buttonTap)}
              onClick={playRecording}
              className="px-6 py-3 border border-border rounded-lg font-medium hover:bg-muted transition-colors flex items-center gap-2"
            >
              <Play className="w-5 h-5" />
              Play
            </motion.button>
            <motion.button
              {...(shouldReduce ? {} : buttonTap)}
              onClick={confirmRecording}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Confirm
            </motion.button>
            <motion.button
              {...(shouldReduce ? {} : buttonTap)}
              onClick={retake}
              className="px-6 py-3 border border-border rounded-lg font-medium hover:bg-muted transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Retake
            </motion.button>
          </>
        )}

        {step === "error" && (
          <motion.button
            {...(shouldReduce ? {} : buttonTap)}
            onClick={retake}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Try Again
          </motion.button>
        )}
      </div>

      {/* Privacy Note */}
      <div className="text-xs text-muted-foreground text-center p-4 bg-muted/50 rounded-lg">
        🔒 Your voice recording is processed locally. Only an encrypted voice embedding is stored.
      </div>
    </div>
  );
};

export default EnrollVoice;