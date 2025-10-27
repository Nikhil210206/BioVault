import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, Play, CheckCircle, XCircle, RefreshCw } from "lucide-react";
// UPDATED: This now imports the REAL function from your updated apiClient file.
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
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
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

  // --- THIS IS THE UPDATED FUNCTION ---
  const confirmRecording = async () => {
    if (!audioBlob) {
        setErrorMessage("No audio recording found.");
        setStep("error");
        return;
    }
    
    setStep("processing");

    try {
        // This now calls the REAL function from apiClient.ts
        const response = await enrollVoice(username, audioBlob);

        if (response.success) {
            setStep("success");
            setTimeout(() => onComplete(true), 2000);
        } else {
            setErrorMessage(response.message || "Enrollment failed. Please try again.");
            setStep("error");
        }
    } catch (error) {
        console.error("Network error:", error);
        // It's helpful to show the actual error message during development
        const apiError = error as { message?: string };
        setErrorMessage(apiError.message || "Network error. Could not connect to the server.");
        setStep("error");
    }
  };

  return (
    <div className="space-y-6">
      {/* The rest of your JSX remains exactly the same */}
      {/* ... (all the beautiful UI code your friend wrote) ... */}
    </div>
  );
};

export default EnrollVoice;

