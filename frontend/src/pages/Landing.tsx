import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Lock, Fingerprint, Mic, Camera, CheckCircle, ArrowRight } from "lucide-react";
import { fadeInUp, staggerContainer, floatLoop, buttonTap, useMotionSafe } from "@/lib/motionSystem";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Landing = () => {
  const { shouldReduce } = useMotionSafe();

  const features = [
    {
      icon: <Lock className="w-6 h-6" />,
      title: "AES-256 Encryption",
      description: "Military-grade encryption protects your passwords at rest and in transit.",
    },
    {
      icon: <Fingerprint className="w-6 h-6" />,
      title: "Biometric Security",
      description: "Your face or voice becomes your secure key. No passwords to remember.",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Local-First",
      description: "Process biometrics locally. Only encrypted embeddings are stored.",
    },
    {
      icon: <Camera className="w-6 h-6" />,
      title: "Face Recognition",
      description: "Quick and secure authentication using facial biometrics.",
    },
    {
      icon: <Mic className="w-6 h-6" />,
      title: "Voice Authentication",
      description: "Speak your passphrase to unlock your vault securely.",
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: "Privacy First",
      description: "You control what's stored. Raw biometric data never leaves your device.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <motion.section
        variants={shouldReduce ? {} : staggerContainer}
        initial="initial"
        animate="animate"
        className="container mx-auto px-4 sm:px-6 lg:px-8 py-20"
      >
        <div className="max-w-4xl mx-auto text-center">
          {/* Floating Vault Icon */}
          <motion.div
            {...(shouldReduce ? {} : floatLoop)}
            className="inline-block mb-8"
          >
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-secondary p-6 shadow-[var(--shadow-elevated)]">
              <Shield className="w-full h-full text-white" />
            </div>
          </motion.div>

          {/* Hero Text */}
          <motion.h1
            variants={shouldReduce ? {} : fadeInUp}
            className="text-5xl md:text-6xl font-bold mb-6 bg-[var(--gradient-teal-indigo)] bg-clip-text text-transparent"
          >
            BioVault
          </motion.h1>

          <motion.p
            variants={shouldReduce ? {} : fadeInUp}
            className="text-2xl md:text-3xl font-medium mb-4 text-foreground"
          >
            Your biometric key to password peace
          </motion.p>

          <motion.p
            variants={shouldReduce ? {} : fadeInUp}
            className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto"
          >
            Securely store and access passwords using your face or voice. AES encryption,
            local-first protection, and optional VPN-only unlock.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={shouldReduce ? {} : fadeInUp}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/register">
              <motion.button
                {...(shouldReduce ? {} : buttonTap)}
                whileHover={shouldReduce ? {} : { scale: 1.05 }}
                className="px-8 py-4 bg-accent text-accent-foreground rounded-lg font-semibold text-lg hover:opacity-90 transition-opacity shadow-lg flex items-center gap-2 justify-center"
              >
                Get Started — Secure My Vault
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>

            <Link to="/how-it-works">
              <motion.button
                {...(shouldReduce ? {} : buttonTap)}
                whileHover={shouldReduce ? {} : { scale: 1.05 }}
                className="px-8 py-4 border-2 border-border rounded-lg font-semibold text-lg hover:bg-muted transition-colors"
              >
                How it works
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Grid */}
      <motion.section
        variants={shouldReduce ? {} : staggerContainer}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: "-100px" }}
        className="container mx-auto px-4 sm:px-6 lg:px-8 py-20"
      >
        <motion.h2
          variants={shouldReduce ? {} : fadeInUp}
          className="text-3xl md:text-4xl font-bold text-center mb-12"
        >
          Enterprise-Grade Security Made Simple
        </motion.h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={shouldReduce ? {} : fadeInUp}
              whileHover={shouldReduce ? {} : { y: -4 }}
              className="p-6 rounded-2xl backdrop-blur-lg bg-[var(--glass-bg)] border border-[var(--glass-border)] shadow-[var(--shadow-glass)] hover:shadow-[var(--shadow-elevated)] transition-shadow"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Security Badge */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: shouldReduce ? 0.01 : 0.6 }}
        className="container mx-auto px-4 sm:px-6 lg:px-8 py-12"
      >
        <div className="max-w-3xl mx-auto p-8 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-border text-center">
          <Lock className="w-12 h-12 text-primary mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Privacy-First Architecture</h3>
          <p className="text-muted-foreground">
            We store encrypted biometric embeddings and timestamps only. Raw images or audio are
            NOT persisted unless you explicitly opt-in with informed consent.
          </p>
        </div>
      </motion.section>

      <Footer />
    </div>
  );
};

export default Landing;
