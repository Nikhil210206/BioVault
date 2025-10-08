import { useState } from "react";
import { motion } from "framer-motion";
import { Settings as SettingsIcon, Shield, Trash2, RefreshCw, Lock } from "lucide-react";
import { deleteBiometricData, updateSettings } from "@/lib/apiClient";
import { fadeInUp, staggerContainer, buttonTap, useMotionSafe } from "@/lib/motionSystem";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Modal from "@/components/Modal";
import { ToastContainer, ToastProps } from "@/components/Toast";

const Settings = () => {
  const { shouldReduce } = useMotionSafe();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toasts, setToasts] = useState<ToastProps[]>([]);
  const [settings, setSettings] = useState({
    vpnOnly: false,
    saveRawData: false,
    twoFactorEnabled: false,
  });

  const addToast = (type: ToastProps["type"], message: string) => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { id, type, message, onClose: removeToast }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const handleSettingChange = async (key: string, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    try {
      const response = await updateSettings(newSettings);
      if (response.success) {
        addToast("success", "Settings updated successfully");
      }
    } catch (error) {
      addToast("error", "Failed to update settings");
    }
  };

  const handleDeleteBiometric = async () => {
    try {
      const response = await deleteBiometricData({
        userId: "demo-user",
        method: "all",
      });

      if (response.success) {
        addToast("success", "Biometric data deleted successfully");
        setShowDeleteModal(false);
      }
    } catch (error) {
      addToast("error", "Failed to delete biometric data");
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
          className="max-w-4xl mx-auto"
        >
          {/* Hero */}
          <motion.div variants={shouldReduce ? {} : fadeInUp} className="text-center mb-12">
            <SettingsIcon className="w-16 h-16 text-primary mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-4">Settings</h1>
            <p className="text-lg text-muted-foreground">
              Manage your security preferences and biometric data
            </p>
          </motion.div>

          {/* Security Settings */}
          <motion.div
            variants={shouldReduce ? {} : fadeInUp}
            className="bg-card rounded-2xl shadow-[var(--shadow-elevated)] p-8 mb-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold">Security & Privacy</h2>
            </div>

            <div className="space-y-6">
              {/* VPN-Only Unlock */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">VPN-Only Unlock</h3>
                  <p className="text-sm text-muted-foreground">
                    Require VPN connection to unlock vault. Backend will verify VPN status.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.vpnOnly}
                    onChange={(e) => handleSettingChange("vpnOnly", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              {/* Save Raw Data */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Save Raw Biometric Data</h3>
                  <p className="text-sm text-muted-foreground">
                    Store original images/audio in addition to embeddings. Requires explicit consent.
                  </p>
                  {settings.saveRawData && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                      ⚠️ Warning: Raw biometric data will be stored encrypted but increases privacy risk
                    </p>
                  )}
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.saveRawData}
                    onChange={(e) => handleSettingChange("saveRawData", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              {/* Two-Factor Authentication */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Two-Factor Authentication</h3>
                  <p className="text-sm text-muted-foreground">
                    Require OTP code in addition to biometric verification
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.twoFactorEnabled}
                    onChange={(e) => handleSettingChange("twoFactorEnabled", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </motion.div>

          {/* Biometric Management */}
          <motion.div
            variants={shouldReduce ? {} : fadeInUp}
            className="bg-card rounded-2xl shadow-[var(--shadow-elevated)] p-8 mb-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <RefreshCw className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold">Biometric Management</h2>
            </div>

            <div className="space-y-4">
              <motion.button
                {...(shouldReduce ? {} : buttonTap)}
                className="w-full p-4 rounded-lg border-2 border-border hover:border-primary hover:bg-primary/5 transition-colors text-left"
              >
                <h3 className="font-semibold mb-1">Re-enroll Face</h3>
                <p className="text-sm text-muted-foreground">
                  Update your face biometric data for better accuracy
                </p>
              </motion.button>

              <motion.button
                {...(shouldReduce ? {} : buttonTap)}
                className="w-full p-4 rounded-lg border-2 border-border hover:border-primary hover:bg-primary/5 transition-colors text-left"
              >
                <h3 className="font-semibold mb-1">Re-enroll Voice</h3>
                <p className="text-sm text-muted-foreground">
                  Update your voice biometric data for better accuracy
                </p>
              </motion.button>

              <motion.button
                {...(shouldReduce ? {} : buttonTap)}
                onClick={() => setShowDeleteModal(true)}
                className="w-full p-4 rounded-lg border-2 border-destructive/50 hover:border-destructive hover:bg-destructive/5 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <Trash2 className="w-5 h-5 text-destructive" />
                  <div>
                    <h3 className="font-semibold text-destructive">Delete All Biometric Data</h3>
                    <p className="text-sm text-muted-foreground">
                      Permanently remove all stored biometric embeddings
                    </p>
                  </div>
                </div>
              </motion.button>
            </div>
          </motion.div>

          {/* Documentation Links */}
          <motion.div
            variants={shouldReduce ? {} : fadeInUp}
            className="bg-card rounded-2xl shadow-[var(--shadow-glass)] p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <Lock className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold">Documentation</h2>
            </div>

            <div className="space-y-3">
              <a
                href="#"
                className="block p-4 rounded-lg hover:bg-muted transition-colors"
              >
                <h3 className="font-semibold mb-1">View Security Documentation</h3>
                <p className="text-sm text-muted-foreground">
                  Learn about our encryption and security practices
                </p>
              </a>

              <a
                href="#"
                className="block p-4 rounded-lg hover:bg-muted transition-colors"
              >
                <h3 className="font-semibold mb-1">Download Security Report (PDF)</h3>
                <p className="text-sm text-muted-foreground">
                  Technical security audit and compliance documentation
                </p>
              </a>

              <a
                href="#"
                className="block p-4 rounded-lg hover:bg-muted transition-colors"
              >
                <h3 className="font-semibold mb-1">Privacy Policy</h3>
                <p className="text-sm text-muted-foreground">
                  How we handle and protect your data
                </p>
              </a>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Biometric Data"
      >
        <div className="space-y-4">
          <div className="p-4 bg-destructive/10 rounded-lg">
            <p className="text-sm text-destructive font-medium">
              ⚠️ Warning: This action cannot be undone
            </p>
          </div>

          <p>
            This will permanently delete all your biometric data including face and voice
            embeddings. You will need to re-enroll if you want to use biometric authentication
            again.
          </p>

          <p className="text-sm text-muted-foreground">
            Your vault data and passwords will remain intact. Only biometric authentication data
            will be removed.
          </p>

          <div className="flex gap-3 pt-4">
            <motion.button
              {...(shouldReduce ? {} : buttonTap)}
              onClick={handleDeleteBiometric}
              className="flex-1 px-4 py-3 bg-destructive text-destructive-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Delete Permanently
            </motion.button>
            <motion.button
              {...(shouldReduce ? {} : buttonTap)}
              onClick={() => setShowDeleteModal(false)}
              className="flex-1 px-4 py-3 border border-border rounded-lg font-medium hover:bg-muted transition-colors"
            >
              Cancel
            </motion.button>
          </div>
        </div>
      </Modal>

      <Footer />
    </div>
  );
};

export default Settings;
