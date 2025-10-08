import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Mic, Key, Clock } from "lucide-react";
import { unlockVault, getUserSessions } from "@/lib/apiClient";
import { fadeInUp, staggerContainer, modalSlide, buttonTap, shake, checkmarkDraw, useMotionSafe } from "@/lib/motionSystem";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ToastContainer, ToastProps } from "@/components/Toast";

const Unlock = () => {
  const { shouldReduce } = useMotionSafe();
  const [method, setMethod] = useState<"face" | "voice" | "password" | null>(null);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [unlockStatus, setUnlockStatus] = useState<"idle" | "success" | "failure">("idle");
  const [confidence, setConfidence] = useState(0);
  const [toasts, setToasts] = useState<ToastProps[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);

  const addToast = (type: ToastProps["type"], message: string) => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { id, type, message, onClose: removeToast }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const handleUnlock = async () => {
    if (!method) return;

    setIsUnlocking(true);
    setUnlockStatus("idle");

    try {
      const response = await unlockVault({
        userId: "demo-user",
        method,
        proof: "demo-proof-data",
      });

      if (response.success) {
        setConfidence(response.confidence);
        setUnlockStatus("success");
        addToast("success", `Vault unlocked! Confidence: ${(response.confidence * 100).toFixed(0)}%`);
        
        // Fetch sessions
        const sessionsData = await getUserSessions("demo-user");
        if (sessionsData.success) {
          setSessions(sessionsData.sessions);
        }
      } else {
        setConfidence(response.confidence);
        setUnlockStatus("failure");
        addToast("error", "Biometric verification failed. Try again.");
      }
    } catch (error) {
      setUnlockStatus("failure");
      addToast("error", "Network error. Please try again.");
    } finally {
      setIsUnlocking(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <ToastContainer toasts={toasts} onClose={removeToast} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          variants={shouldReduce ? {} : staggerContainer}
          initial="initial"
          animate="animate"
          className="max-w-4xl mx-auto"
        >
          {/* Hero */}
          <motion.div variants={shouldReduce ? {} : fadeInUp} className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Unlock Your Vault</h1>
            <p className="text-lg text-muted-foreground">
              Choose your authentication method to access your secure passwords
            </p>
          </motion.div>

          {/* Method Selection */}
          <motion.div
            variants={shouldReduce ? {} : fadeInUp}
            className="grid sm:grid-cols-3 gap-4 mb-12"
          >
            <motion.button
              {...(shouldReduce ? {} : buttonTap)}
              onClick={() => setMethod("face")}
              className={`p-6 rounded-xl border-2 transition-all ${
                method === "face"
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <Camera className="w-12 h-12 text-primary mx-auto mb-3" />
              <h3 className="font-semibold">Face</h3>
            </motion.button>

            <motion.button
              {...(shouldReduce ? {} : buttonTap)}
              onClick={() => setMethod("voice")}
              className={`p-6 rounded-xl border-2 transition-all ${
                method === "voice"
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <Mic className="w-12 h-12 text-primary mx-auto mb-3" />
              <h3 className="font-semibold">Voice</h3>
            </motion.button>

            <motion.button
              {...(shouldReduce ? {} : buttonTap)}
              onClick={() => setMethod("password")}
              className={`p-6 rounded-xl border-2 transition-all ${
                method === "password"
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <Key className="w-12 h-12 text-primary mx-auto mb-3" />
              <h3 className="font-semibold">Password</h3>
            </motion.button>
          </motion.div>

          {/* Unlock Area */}
          <motion.div
            variants={shouldReduce ? {} : fadeInUp}
            className="bg-card rounded-2xl shadow-[var(--shadow-elevated)] p-8 mb-8"
          >
            <AnimatePresence mode="wait">
              {!method && (
                <motion.div
                  key="no-method"
                  {...(shouldReduce ? {} : modalSlide)}
                  className="text-center py-12"
                >
                  <p className="text-muted-foreground">Select an authentication method above</p>
                </motion.div>
              )}

              {method && unlockStatus === "idle" && !isUnlocking && (
                <motion.div
                  key="ready"
                  {...(shouldReduce ? {} : modalSlide)}
                  className="text-center py-12"
                >
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                    {method === "face" && <Camera className="w-12 h-12 text-primary" />}
                    {method === "voice" && <Mic className="w-12 h-12 text-primary" />}
                    {method === "password" && <Key className="w-12 h-12 text-primary" />}
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Ready to Unlock</h3>
                  <p className="text-muted-foreground mb-8">
                    {method === "face" && "Position your face in front of the camera"}
                    {method === "voice" && "Speak your passphrase clearly"}
                    {method === "password" && "Enter your password"}
                  </p>
                  <motion.button
                    {...(shouldReduce ? {} : buttonTap)}
                    onClick={handleUnlock}
                    className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
                  >
                    Unlock Vault
                  </motion.button>
                </motion.div>
              )}

              {isUnlocking && (
                <motion.div
                  key="unlocking"
                  {...(shouldReduce ? {} : modalSlide)}
                  className="text-center py-12"
                >
                  <motion.div
                    animate={shouldReduce ? {} : { rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto mb-6"
                  />
                  <h3 className="text-2xl font-bold mb-2">Verifying...</h3>
                  <p className="text-muted-foreground">Analyzing biometric data</p>
                </motion.div>
              )}

              {unlockStatus === "success" && (
                <motion.div
                  key="success"
                  {...(shouldReduce ? {} : modalSlide)}
                  className="text-center py-12"
                >
                  <motion.svg
                    width="120"
                    height="120"
                    viewBox="0 0 120 120"
                    className="mx-auto mb-6"
                  >
                    <motion.circle
                      cx="60"
                      cy="60"
                      r="55"
                      fill="none"
                      stroke="#22c55e"
                      strokeWidth="5"
                    />
                    <motion.path
                      d="M 35 60 L 52 77 L 85 40"
                      fill="none"
                      stroke="#22c55e"
                      strokeWidth="5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      {...(shouldReduce ? {} : checkmarkDraw)}
                    />
                  </motion.svg>
                  <h3 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                    Vault Unlocked!
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Matched with {(confidence * 100).toFixed(0)}% confidence
                  </p>
                  <div className="inline-block px-4 py-2 bg-green-500/10 rounded-lg">
                    <p className="text-sm text-green-600 dark:text-green-400">
                      Session started at {new Date().toLocaleTimeString()}
                    </p>
                  </div>
                </motion.div>
              )}

              {unlockStatus === "failure" && (
                <motion.div
                  key="failure"
                  {...(shouldReduce ? {} : shake)}
                  className="text-center py-12"
                >
                  <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
                    <Key className="w-12 h-12 text-red-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">
                    Verification Failed
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Confidence: {(confidence * 100).toFixed(0)}% (threshold: 80%)
                  </p>
                  <motion.button
                    {...(shouldReduce ? {} : buttonTap)}
                    onClick={() => setUnlockStatus("idle")}
                    className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
                  >
                    Try Again
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Recent Sessions */}
          {sessions.length > 0 && (
            <motion.div
              variants={shouldReduce ? {} : fadeInUp}
              className="bg-card rounded-2xl shadow-[var(--shadow-glass)] p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Recent Sessions</h3>
              </div>
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div
                    key={session.sessionId}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div>
                      <p className="font-medium capitalize">{session.method} Authentication</p>
                      <p className="text-sm text-muted-foreground">{session.device}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatDate(session.loginTime)}</p>
                      <p className="text-xs text-muted-foreground">
                        Logged out: {formatDate(session.logoutTime)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default Unlock;
