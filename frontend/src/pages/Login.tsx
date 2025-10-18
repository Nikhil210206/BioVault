import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { loginUser } from "@/lib/apiClient";
import { buttonTap, useMotionSafe } from "@/lib/motionSystem";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ToastContainer, ToastProps } from "@/components/Toast";

const Login = () => {
    const navigate = useNavigate();
    const { shouldReduce } = useMotionSafe();
    const [toasts, setToasts] = useState<ToastProps[]>([]);

    const [formData, setFormData] = useState({
        email: "",
        otp: "",
    });

    const addToast = (type: ToastProps["type"], message: string) => {
        const id = `toast-${Date.now()}`;
        setToasts((prev) => [...prev, { id, type, message, onClose: removeToast }]);
    };

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    const handleRequestOtp = async () => {
        try {
            // Assuming we have a requestOtp function in apiClient
            const response = await requestOtp({ email: formData.email });
            if (response.success) {
                addToast("success", "OTP sent to your email!");
            } else {
                addToast("error", response.message || "Failed to send OTP.");
            }
        } catch (error) {
            addToast("error", "Failed to request OTP. Please try again.");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await loginUser({
                email: formData.email,
                otp: formData.otp,
            });

            if (response.success) {
                // Store token and username
                localStorage.setItem('authToken', response.token);
                localStorage.setItem('username', response.username);
                addToast("success", "Login successful! Redirecting to unlock...");
                navigate("/unlock");
            } else {
                addToast("error", "Invalid email or OTP.");
            }
        } catch (error) {
            addToast("error", "Login failed. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <ToastContainer toasts={toasts} onClose={removeToast} />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <motion.div
                    initial="initial"
                    animate="animate"
                    className="max-w-md mx-auto"
                >
                    <motion.div
                        className="bg-card rounded-2xl shadow-[var(--shadow-elevated)] p-8"
                    >
                        <div className="text-center mb-8">
                            <Lock className="w-12 h-12 text-primary mx-auto mb-4" />
                            <h1 className="text-3xl font-bold mb-2">Login to BioVault</h1>
                        </div>

                        <div className="space-y-6">
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

                            <motion.button
                                {...(shouldReduce ? {} : buttonTap)}
                                type="button"
                                onClick={handleRequestOtp}
                                className="w-full px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
                            >
                                Request OTP
                            </motion.button>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2">OTP</label>
                                    <input
                                        type="text"
                                        value={formData.otp}
                                        onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                                        required
                                    />
                                </div>

                                <motion.button
                                    {...(shouldReduce ? {} : buttonTap)}
                                    type="submit"
                                    className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
                                >
                                    Login
                                </motion.button>
                            </form>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
            <Footer />
        </div>
    );
};

export default Login;