import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { UserPlus, Camera, Mic } from "lucide-react";
import { registerUser } from "@/lib/apiClient";
import { fadeInUp, staggerContainer, modalSlide, buttonTap, useMotionSafe } from "@/lib/motionSystem";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Modal from "@/components/Modal";
import EnrollFace from "@/components/EnrollFace";
import EnrollVoice from "@/components/EnrollVoice";
import { ToastContainer, ToastProps } from "@/components/Toast";

const Register = () => {
  const navigate = useNavigate();
  const { shouldReduce } = useMotionSafe();
  const [step, setStep] = useState<"form" | "biometric-choice" | "enroll-face" | "enroll-voice" | "complete">("form");
  const [userId, setUserId] = useState<string>("");
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    agreeToTerms: false,
  });

  const addToast = (type: ToastProps["type"], message: string) => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { id, type, message, onClose: removeToast }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.agreeToTerms) {
      addToast("error", "Please agree to terms and conditions");
      return;
    }

    try {
      const response = await registerUser({
        name: formData.name,
        email: formData.email,
        username: formData.username,
        passwordHash: btoa(formData.password), // Base64 encode the password or an empty string
      });

      if (response.success && response.userId) {
        setUserId(response.userId.toString());
        setStep("biometric-choice");
        addToast("success", "Account created successfully!");
      } else {
        addToast("error", "Registration failed. Please try again.");
      }
    } catch (error) {
      addToast("error", "Registration failed. Please try again.");
    }
  };

  const handleBiometricChoice = (choice: "face" | "voice" | "both" | "skip") => {
    if (choice === "skip") {
      setStep("complete");
    } else if (choice === "face" || choice === "both") { // *** THIS IS THE FIX ***
      setStep("enroll-face");
    } else if (choice === "voice") {
      setStep("enroll-voice");
    }
  };

  const handleFaceEnrollComplete = (success: boolean) => {
    if (success) {
      addToast("success", "Face biometric enrolled!");
      setStep("enroll-voice");
    } else {
        // If they fail face enrollment, give them an option to skip to the end
        setStep("complete");
    }
  };

  const handleVoiceEnrollComplete = (success: boolean) => {
    if (success) {
      addToast("success", "Voice biometric enrolled!");
    }
    setStep("complete");
  };

  const handleSkipBiometric = () => {
    // This function can be used to skip from either face or voice enrollment
    if (step === 'enroll-face') {
        setStep('enroll-voice'); // Skip to the next biometric step
    } else {
        setStep('complete'); // Skip to the final step
    }
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
          className="max-w-2xl mx-auto"
        >
          <AnimatePresence mode="wait">
            {/* Registration Form */}
            {step === "form" && (
              <motion.div
                key="form"
                {...(shouldReduce ? {} : modalSlide)}
                className="bg-card rounded-2xl shadow-[var(--shadow-elevated)] p-8"
              >
                <div className="text-center mb-8">
                  <UserPlus className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h1 className="text-3xl font-bold mb-2">Create Your BioVault</h1>
                  <p className="text-muted-foreground">
                    Set up your account and choose your biometric security
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Username</label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Password (Optional)
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="Leave empty for biometric-only"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Recommended: Set a fallback password in case biometric fails.
                    </p>
                  </div>

                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={formData.agreeToTerms}
                      onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                      className="mt-1"
                    />
                    <label htmlFor="terms" className="text-sm text-muted-foreground">
                      I agree to the Terms of Service and Privacy Policy, including biometric data
                      processing.
                    </label>
                  </div>

                  <motion.button
                    {...(shouldReduce ? {} : buttonTap)}
                    type="submit"
                    className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
                  >
                    Create Account
                  </motion.button>
                </form>
              </motion.div>
            )}

            {step === "biometric-choice" && (
              <motion.div
                key="biometric-choice"
                {...(shouldReduce ? {} : modalSlide)}
                className="bg-card rounded-2xl shadow-[var(--shadow-elevated)] p-8"
              >
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold mb-2">Choose Your Biometric Method</h2>
                  <p className="text-muted-foreground">
                    Select how you want to unlock your vault securely.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  <motion.button
                    {...(shouldReduce ? {} : buttonTap)}
                    onClick={() => handleBiometricChoice("face")}
                    className="p-6 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-colors text-center"
                  >
                    <Camera className="w-12 h-12 text-primary mx-auto mb-3" />
                    <h3 className="font-semibold mb-1">Face Recognition</h3>
                    <p className="text-sm text-muted-foreground">Use your face to unlock.</p>
                  </motion.button>

                  <motion.button
                    {...(shouldReduce ? {} : buttonTap)}
                    onClick={() => handleBiometricChoice("voice")}
                    className="p-6 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-colors text-center"
                  >
                    <Mic className="w-12 h-12 text-primary mx-auto mb-3" />
                    <h3 className="font-semibold mb-1">Voice Authentication</h3>
                    <p className="text-sm text-muted-foreground">Use your voice to unlock.</p>
                  </motion.button>
                </div>

                <motion.button
                  {...(shouldReduce ? {} : buttonTap)}
                  onClick={() => handleBiometricChoice("both")}
                  className="w-full p-4 mb-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
                >
                  Enroll Both (Recommended)
                </motion.button>

                <motion.button
                  {...(shouldReduce ? {} : buttonTap)}
                  onClick={() => handleBiometricChoice("skip")}
                  className="w-full p-4 rounded-lg border border-border hover:bg-muted transition-colors"
                >
                  Skip for now
                </motion.button>
              </motion.div>
            )}

            {step === "enroll-face" && (
              <motion.div
                key="enroll-face"
                {...(shouldReduce ? {} : modalSlide)}
                className="bg-card rounded-2xl shadow-[var(--shadow-elevated)] p-8"
              >
                <EnrollFace
                  userId={userId}
                  onComplete={handleFaceEnrollComplete}
                  onSkip={handleSkipBiometric}
                />
              </motion.div>
            )}

            {step === "enroll-voice" && (
              <motion.div
                key="enroll-voice"
                {...(shouldReduce ? {} : modalSlide)}
                className="bg-card rounded-2xl shadow-[var(--shadow-elevated)] p-8"
              >
                <EnrollVoice
                  userId={userId}
                  onComplete={handleVoiceEnrollComplete}
                  onSkip={handleSkipBiometric}
                />
              </motion.div>
            )}

            {step === "complete" && (
              <motion.div
                key="complete"
                {...(shouldReduce ? {} : modalSlide)}
                className="bg-card rounded-2xl shadow-[var(--shadow-elevated)] p-8 text-center"
              >
                <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
                  <UserPlus className="w-10 h-10 text-green-500" />
                </div>
                <h2 className="text-3xl font-bold mb-2">Welcome to BioVault!</h2>
                <p className="text-muted-foreground mb-8">
                  Your account is ready. Start securing your passwords with biometric protection.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.button
                    {...(shouldReduce ? {} : buttonTap)}
                    onClick={() => navigate("/login")}
                    className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
                  >
                    Go to Login
                  </motion.button>
                  <motion.button
                    {...(shouldReduce ? {} : buttonTap)}
                    onClick={() => navigate("/tools")}
                    className="px-8 py-3 border border-border rounded-lg font-medium hover:bg-muted transition-colors"
                  >
                    Password Generator
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default Register;