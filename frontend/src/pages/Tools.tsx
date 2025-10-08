import { useState } from "react";
import { motion } from "framer-motion";
import { Key, Download, Upload, Copy, Check } from "lucide-react";
import { generatePassword, exportVaultData, importVaultData } from "@/lib/apiClient";
import { fadeInUp, staggerContainer, buttonTap, useMotionSafe } from "@/lib/motionSystem";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ToastContainer, ToastProps } from "@/components/Toast";

const Tools = () => {
  const { shouldReduce } = useMotionSafe();
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);
  const [passwordOptions, setPasswordOptions] = useState({
    length: 16,
    includeNumbers: true,
    includeSymbols: true,
  });
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = (type: ToastProps["type"], message: string) => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { id, type, message, onClose: removeToast }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const handleGeneratePassword = async () => {
    try {
      const response = await generatePassword(passwordOptions);
      if (response.success) {
        setPassword(response.password);
        addToast("success", `${response.strength} password generated`);
      }
    } catch (error) {
      addToast("error", "Failed to generate password");
    }
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    addToast("success", "Password copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = async () => {
    try {
      const response = await exportVaultData("demo-user");
      if (response.success) {
        const blob = new Blob([response.data], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = response.filename;
        a.click();
        URL.revokeObjectURL(url);
        addToast("success", "Vault data exported successfully");
      }
    } catch (error) {
      addToast("error", "Failed to export data");
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const data = event.target?.result;
        const response = await importVaultData({ data });
        if (response.success) {
          addToast("success", `Imported ${response.importedCount} entries`);
        }
      };
      reader.readAsText(file);
    } catch (error) {
      addToast("error", "Failed to import data");
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
            <h1 className="text-4xl font-bold mb-4">BioVault Tools</h1>
            <p className="text-lg text-muted-foreground">
              Generate secure passwords and manage your vault data
            </p>
          </motion.div>

          {/* Password Generator */}
          <motion.div
            variants={shouldReduce ? {} : fadeInUp}
            className="bg-card rounded-2xl shadow-[var(--shadow-elevated)] p-8 mb-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <Key className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold">Password Generator</h2>
            </div>

            <div className="space-y-6">
              {/* Generated Password Display */}
              {password && (
                <div className="p-4 bg-muted rounded-lg font-mono text-lg break-all flex items-center justify-between gap-4">
                  <span>{password}</span>
                  <motion.button
                    {...(shouldReduce ? {} : buttonTap)}
                    onClick={handleCopyPassword}
                    className="flex-shrink-0 p-2 hover:bg-background rounded transition-colors"
                    aria-label="Copy password"
                  >
                    {copied ? (
                      <Check className="w-5 h-5 text-green-500" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </motion.button>
                </div>
              )}

              {/* Options */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Password Length: {passwordOptions.length}
                </label>
                <input
                  type="range"
                  min="8"
                  max="32"
                  value={passwordOptions.length}
                  onChange={(e) =>
                    setPasswordOptions({ ...passwordOptions, length: parseInt(e.target.value) })
                  }
                  className="w-full"
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={passwordOptions.includeNumbers}
                    onChange={(e) =>
                      setPasswordOptions({ ...passwordOptions, includeNumbers: e.target.checked })
                    }
                    className="w-4 h-4"
                  />
                  <span>Include Numbers (0-9)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={passwordOptions.includeSymbols}
                    onChange={(e) =>
                      setPasswordOptions({ ...passwordOptions, includeSymbols: e.target.checked })
                    }
                    className="w-4 h-4"
                  />
                  <span>Include Symbols (!@#$%...)</span>
                </label>
              </div>

              <motion.button
                {...(shouldReduce ? {} : buttonTap)}
                onClick={handleGeneratePassword}
                className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Generate Password
              </motion.button>

              <p className="text-xs text-muted-foreground text-center">
                💡 Tip: Generated passwords are cryptographically secure and never leave your device
              </p>
            </div>
          </motion.div>

          {/* Import/Export */}
          <motion.div
            variants={shouldReduce ? {} : fadeInUp}
            className="bg-card rounded-2xl shadow-[var(--shadow-elevated)] p-8"
          >
            <h2 className="text-2xl font-bold mb-6">Data Management</h2>

            <div className="grid sm:grid-cols-2 gap-4">
              {/* Export */}
              <motion.button
                {...(shouldReduce ? {} : buttonTap)}
                onClick={handleExport}
                className="p-6 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-colors text-center"
              >
                <Download className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Export Vault</h3>
                <p className="text-sm text-muted-foreground">
                  Download encrypted backup of your vault data
                </p>
              </motion.button>

              {/* Import */}
              <label className="cursor-pointer">
                <motion.div
                  {...(shouldReduce ? {} : buttonTap)}
                  className="p-6 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-colors text-center"
                >
                  <Upload className="w-8 h-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Import Vault</h3>
                  <p className="text-sm text-muted-foreground">
                    Restore vault data from encrypted backup
                  </p>
                </motion.div>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>
            </div>

            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                🔒 <strong>Security Note:</strong> Exported files are encrypted with AES-256.
                Store your backup in a secure location. Import only files you trust.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default Tools;
