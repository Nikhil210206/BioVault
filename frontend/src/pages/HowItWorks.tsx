import { motion } from "framer-motion";
import { UserPlus, Fingerprint, Lock, CheckCircle, ArrowRight } from "lucide-react";
import { fadeInUp, staggerContainer, useMotionSafe } from "@/lib/motionSystem";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const HowItWorks = () => {
  const { shouldReduce } = useMotionSafe();

  const steps = [
    {
      icon: <UserPlus className="w-8 h-8" />,
      title: "Register",
      description: "Create your account with basic information and choose your authentication methods",
    },
    {
      icon: <Fingerprint className="w-8 h-8" />,
      title: "Enroll",
      description: "Capture your face or voice biometrics. We process and create encrypted embeddings locally",
    },
    {
      icon: <Lock className="w-8 h-8" />,
      title: "Encrypt & Backup",
      description: "Your data is encrypted with AES-256 and securely stored. Only you can decrypt it",
    },
    {
      icon: <CheckCircle className="w-8 h-8" />,
      title: "Unlock",
      description: "Access your vault using your biometric key. Fast, secure, and passwordless",
    },
  ];

  const technicalDetails = [
    { label: "Encryption", value: "AES-256-GCM" },
    { label: "Transport", value: "TLS 1.3" },
    { label: "Key Derivation", value: "PBKDF2-SHA256" },
    { label: "Biometric Storage", value: "Encrypted Embeddings Only" },
    { label: "Architecture", value: "Local-First Processing" },
    { label: "Compliance", value: "GDPR, CCPA Ready" },
  ];

  const endpoints = [
    {
      method: "POST",
      path: "/api/auth/register",
      description: "Register new user account",
    },
    {
      method: "POST",
      path: "/api/biometrics/face/enroll",
      description: "Enroll face biometric data",
    },
    {
      method: "POST",
      path: "/api/biometrics/audio/enroll",
      description: "Enroll voice biometric data",
    },
    {
      method: "POST",
      path: "/api/auth/unlock",
      description: "Unlock vault with biometric proof",
    },
    {
      method: "GET",
      path: "/api/user/sessions",
      description: "Get recent login/logout timestamps",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          variants={shouldReduce ? {} : staggerContainer}
          initial="initial"
          animate="animate"
          className="max-w-6xl mx-auto"
        >
          {/* Hero */}
          <motion.div variants={shouldReduce ? {} : fadeInUp} className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">How BioVault Works</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Enterprise-grade security meets simple biometric authentication. Here's how we keep
              your passwords safe.
            </p>
          </motion.div>

          {/* Steps */}
          <motion.div
            variants={shouldReduce ? {} : staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
          >
            {steps.map((step, index) => (
              <motion.div
                key={index}
                variants={shouldReduce ? {} : fadeInUp}
                className="relative"
              >
                <div className="bg-card rounded-2xl shadow-[var(--shadow-glass)] p-6 h-full">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <ArrowRight className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 text-muted-foreground" />
                )}
              </motion.div>
            ))}
          </motion.div>

          {/* Technical Summary */}
          <motion.div
            variants={shouldReduce ? {} : fadeInUp}
            className="bg-card rounded-2xl shadow-[var(--shadow-elevated)] p-8 mb-16"
          >
            <h2 className="text-3xl font-bold mb-6 text-center">Technical Architecture</h2>
            <p className="text-muted-foreground text-center mb-8 max-w-3xl mx-auto">
              BioVault uses a local-first architecture with end-to-end encryption. Biometric data
              is processed on your device, and only encrypted embeddings are transmitted and stored.
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {technicalDetails.map((detail, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg bg-muted/50 border border-border"
                >
                  <p className="text-sm text-muted-foreground mb-1">{detail.label}</p>
                  <p className="font-semibold">{detail.value}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Data Flow */}
          <motion.div
            variants={shouldReduce ? {} : fadeInUp}
            className="bg-card rounded-2xl shadow-[var(--shadow-elevated)] p-8 mb-16"
          >
            <h2 className="text-3xl font-bold mb-6 text-center">Data Flow & Privacy</h2>
            
            <div className="space-y-6">
              <div className="p-6 rounded-lg bg-primary/5 border border-primary/20">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-primary" />
                  What We Store
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>✓ Encrypted biometric embeddings (mathematical representations)</li>
                  <li>✓ Enrollment timestamps and device metadata</li>
                  <li>✓ User account information (encrypted)</li>
                  <li>✓ Session logs and authentication history</li>
                </ul>
              </div>

              <div className="p-6 rounded-lg bg-green-500/5 border border-green-500/20">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  What We DON'T Store
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>✗ Raw face images or photos</li>
                  <li>✗ Raw audio recordings or voice samples</li>
                  <li>✗ Unencrypted passwords or sensitive data</li>
                  <li>✗ Biometric data without explicit user consent</li>
                </ul>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
                💡 <strong>User Control:</strong> You can enable "raw data storage" in settings if
                you want original images/audio saved (requires explicit consent). By default, we only
                store encrypted embeddings.
              </div>
            </div>
          </motion.div>

          {/* API Endpoints */}
          <motion.div
            variants={shouldReduce ? {} : fadeInUp}
            className="bg-card rounded-2xl shadow-[var(--shadow-glass)] p-8"
          >
            <h2 className="text-3xl font-bold mb-6 text-center">API Endpoints</h2>
            <p className="text-muted-foreground text-center mb-8">
              For developers: Core endpoints for integrating BioVault
            </p>

            <div className="space-y-3">
              {endpoints.map((endpoint, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 rounded-lg bg-muted/30 border border-border hover:border-primary/50 transition-colors"
                >
                  <span className="inline-flex items-center px-3 py-1 rounded-md bg-primary/10 text-primary text-xs font-mono font-semibold">
                    {endpoint.method}
                  </span>
                  <div className="flex-1">
                    <p className="font-mono text-sm font-medium mb-1">{endpoint.path}</p>
                    <p className="text-sm text-muted-foreground">{endpoint.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 text-center">
              <a
                href="#"
                className="inline-flex items-center gap-2 text-primary hover:underline"
              >
                View Full API Documentation
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default HowItWorks;
