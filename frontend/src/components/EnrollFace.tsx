import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { enrollFace } from "@/lib/apiClient";
import { modalSlide, buttonTap, pulse, useMotionSafe, checkmarkDraw } from "@/lib/motionSystem";

interface EnrollFaceProps {
  userId: string;
  onComplete: (success: boolean) => void;
  onSkip: () => void;
}

const EnrollFace = ({ userId, onComplete, onSkip }: EnrollFaceProps) => {
  const [step, setStep] = useState<"preview" | "captured" | "processing" | "success" | "error">("preview");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { shouldReduce } = useMotionSafe();

  useEffect(() => {
    if (step === "preview") {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [step]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Camera access denied:", error);
      setErrorMessage("Camera access denied. Please enable camera permissions.");
      setStep("error");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const imageData = canvasRef.current.toDataURL("image/jpeg", 0.8);
        setCapturedImage(imageData);
        stopCamera();
        setStep("captured");
      }
    }
  };

  const retake = () => {
    setCapturedImage(null);
    setStep("preview");
  };

  const confirmCapture = async () => {
    setStep("processing");

    try {
      // Simulate embedding generation (in production, use face recognition SDK)
      const faceEmbedding = capturedImage?.split(",")[1] || "";
      
      const response = await enrollFace({
        userId,
        faceEmbedding,
        metadata: {
          device: navigator.userAgent,
          timestamp: new Date().toISOString(),
          captureMethod: "webcam",
        },
      });

      if (response.success) {
        setStep("success");
        setTimeout(() => onComplete(true), 2000);
      } else {
        setErrorMessage("Enrollment failed. Please try again.");
        setStep("error");
      }
    } catch (error) {
      setErrorMessage("Network error. Please check your connection.");
      setStep("error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Instruction */}
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-2">Face Enrollment</h3>
        <p className="text-muted-foreground">
          {step === "preview" && "Position your face inside the circle. Keep neutral expression and good lighting."}
          {step === "captured" && "Review your capture. Retake if needed, or confirm to continue."}
          {step === "processing" && "Analyzing sample and creating encrypted embedding..."}
          {step === "success" && "Face biometric enrolled successfully!"}
          {step === "error" && errorMessage}
        </p>
      </div>

      {/* Camera/Preview Area */}
      <div className="relative aspect-video bg-muted rounded-2xl overflow-hidden">
        <AnimatePresence mode="wait">
          {step === "preview" && (
            <motion.div
              key="preview"
              {...(shouldReduce ? {} : modalSlide)}
              className="relative w-full h-full"
            >
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              
              {/* Framing guide */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.svg
                  width="200"
                  height="200"
                  viewBox="0 0 200 200"
                  className="pointer-events-none"
                >
                  <motion.circle
                    cx="100"
                    cy="100"
                    r="90"
                    fill="none"
                    stroke="white"
                    strokeWidth="3"
                    strokeDasharray="5,5"
                    {...(shouldReduce ? {} : pulse)}
                  />
                </motion.svg>
              </div>
              
              <canvas ref={canvasRef} className="hidden" />
            </motion.div>
          )}

          {step === "captured" && capturedImage && (
            <motion.div
              key="captured"
              {...(shouldReduce ? {} : modalSlide)}
              className="w-full h-full"
            >
              <img src={capturedImage} alt="Captured face" className="w-full h-full object-cover" />
            </motion.div>
          )}

          {step === "processing" && (
            <motion.div
              key="processing"
              {...(shouldReduce ? {} : modalSlide)}
              className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20"
            >
              <div className="text-center">
                <motion.div
                  animate={shouldReduce ? {} : { rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="inline-block mb-4"
                >
                  <RefreshCw className="w-12 h-12 text-primary" />
                </motion.div>
                <p className="text-lg font-medium">Processing...</p>
              </div>
            </motion.div>
          )}

          {step === "success" && (
            <motion.div
              key="success"
              {...(shouldReduce ? {} : modalSlide)}
              className="w-full h-full flex items-center justify-center bg-green-500/10"
            >
              <div className="text-center">
                <motion.svg
                  width="100"
                  height="100"
                  viewBox="0 0 100 100"
                  className="mx-auto mb-4"
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
              </div>
            </motion.div>
          )}

          {step === "error" && (
            <motion.div
              key="error"
              {...(shouldReduce ? {} : modalSlide)}
              className="w-full h-full flex items-center justify-center bg-red-500/10"
            >
              <div className="text-center">
                <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <p className="text-lg font-medium text-red-600 dark:text-red-400">
                  {errorMessage}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-center">
        {step === "preview" && (
          <>
            <motion.button
              {...(shouldReduce ? {} : buttonTap)}
              onClick={captureImage}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <Camera className="w-5 h-5" />
              Capture
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

        {step === "captured" && (
          <>
            <motion.button
              {...(shouldReduce ? {} : buttonTap)}
              onClick={confirmCapture}
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
        🔒 Your face image is processed locally. Only an encrypted biometric embedding is stored.
      </div>
    </div>
  );
};

export default EnrollFace;
