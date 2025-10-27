import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Mic, Key, Play, Square, RefreshCw } from "lucide-react";
// UPDATED: Import the correct voice unlock function
import { unlockVaultWithVoice, getUserSessions, loginUser } from "@/lib/apiClient";
import { fadeInUp, staggerContainer, modalSlide, buttonTap, shake, checkmarkDraw, useMotionSafe, waveformBar } from "@/lib/motionSystem";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ToastContainer, ToastProps } from "@/components/Toast";

const Unlock = () => {
    const { shouldReduce } = useMotionSafe();
    const [method, setMethod] = useState<"face" | "voice" | "password" | null>(null);
    const [isUnlocking, setIsUnlocking] = useState(false);
    const [unlockStatus, setUnlockStatus] = useState<"idle" | "success" | "failure">("idle");
    const [toasts, setToasts] = useState<ToastProps[]>([]);
    const [sessions, setSessions] = useState<any[]>([]);
    const [username, setUsername] = useState<string | null>(null);

    // --- NEW: State and Refs for Audio Recording ---
    const [recordingStep, setRecordingStep] = useState<"prompt" | "recording" | "recorded">("prompt");
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const [password, setPassword] = useState("");


    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        setUsername(storedUsername);
        
        // Cleanup audio URL on component unmount
        return () => {
            if (audioUrl) URL.revokeObjectURL(audioUrl);
        };
    }, [audioUrl]);

    const addToast = (type: ToastProps["type"], message: string) => {
        const id = `toast-${Date.now()}`;
        setToasts((prev) => [...prev, { id, type, message, onClose: removeToast }]);
    };

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };
    
    // --- NEW: Audio Recording Functions (adapted from EnrollVoice) ---
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];
            
            mediaRecorder.ondataavailable = (event) => audioChunksRef.current.push(event.data);
            
            mediaRecorder.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
                setAudioBlob(blob);
                setAudioUrl(URL.createObjectURL(blob));
                stream.getTracks().forEach((track) => track.stop());
                setRecordingStep("recorded");
            };
            
            mediaRecorder.start();
            setRecordingStep("recording");
        } catch (error) {
            addToast("error", "Microphone access denied.");
        }
    };
    
    const stopRecording = () => {
        if (mediaRecorderRef.current?.state === "recording") {
            mediaRecorderRef.current.stop();
        }
    };
    
    const retakeRecording = () => {
        setAudioBlob(null);
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
        setRecordingStep("prompt");
    };

    // --- UPDATED: Main Unlock Handler ---
    const handleUnlock = async () => {
        if (!method || !username) {
            addToast("error", "Please select a method and ensure you are logged in.");
            return;
        }

        setIsUnlocking(true);
        setUnlockStatus("idle");

        try {
            let response;
            // Route the request based on the selected method
            if (method === 'voice') {
                if (!audioBlob) {
                    addToast("error", "No audio recorded. Please record your voice first.");
                    setIsUnlocking(false);
                    return;
                }
                // Call the new, correct function from apiClient
                response = await unlockVaultWithVoice(username, audioBlob);
            } else if (method === 'password') {
                // Assuming you have a password field in your UI
                response = await loginUser({ username, password });
            } else {
                // Placeholder for face unlock
                addToast("info", "Face unlock is not yet implemented.");
                setIsUnlocking(false);
                return;
            }

            if (response.success) {
                setUnlockStatus("success");
                addToast("success", `Vault unlocked successfully!`);
                // Optionally, fetch user sessions on success
                const sessionsData = await getUserSessions(username);
                if (sessionsData.success) setSessions(sessionsData.sessions);
            } else {
                setUnlockStatus("failure");
                addToast("error", response.message || "Verification failed. Try again.");
            }
        } catch (error) {
            const apiError = error as { message?: string };
            setUnlockStatus("failure");
            addToast("error", apiError.message || "An unknown error occurred.");
        } finally {
            setIsUnlocking(false);
            // Reset voice recording state after an attempt
            if (method === 'voice') {
                retakeRecording();
            }
        }
    };
    
    // Helper to render the correct UI for the selected method
    const renderUnlockMethodUI = () => {
        if (isUnlocking) {
            // "Verifying..." spinner
            return <motion.div key="unlocking" {...(shouldReduce ? {} : modalSlide)} className="text-center py-12">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto mb-6" />
                <h3 className="text-2xl font-bold mb-2">Verifying...</h3>
            </motion.div>
        }

        if (unlockStatus !== 'idle') {
            // Success or Failure UI
            return unlockStatus === 'success' ? (
                <motion.div key="success" {...(shouldReduce ? {} : modalSlide)} className="text-center py-12">
                    <motion.svg width="120" height="120" viewBox="0 0 120 120" className="mx-auto mb-6">
                        <motion.circle cx="60" cy="60" r="55" fill="none" stroke="#22c55e" strokeWidth="5" />
                        <motion.path d="M 35 60 L 52 77 L 85 40" fill="none" stroke="#22c55e" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" {...(shouldReduce ? {} : checkmarkDraw)} />
                    </motion.svg>
                    <h3 className="text-2xl font-bold text-green-600 dark:text-green-400">Vault Unlocked!</h3>
                </motion.div>
            ) : (
                <motion.div key="failure" {...(shouldReduce ? {} : shake)} className="text-center py-12">
                     <h3 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">Verification Failed</h3>
                     <motion.button {...(shouldReduce ? {} : buttonTap)} onClick={() => setUnlockStatus("idle")} className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium">Try Again</motion.button>
                </motion.div>
            );
        }

        // --- RENDER LOGIC BASED ON METHOD ---
        switch (method) {
            case 'voice':
                return renderVoiceUI();
            case 'password':
                return (
                    <motion.div key="password-ui" {...(shouldReduce ? {} : modalSlide)} className="flex flex-col items-center gap-4 py-8">
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" className="w-full max-w-xs p-3 rounded-lg bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary"/>
                        <motion.button {...(shouldReduce ? {} : buttonTap)} onClick={handleUnlock} className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium">Unlock with Password</motion.button>
                    </motion.div>
                );
            case 'face':
                 return <motion.div key="face-ui" className="text-center py-12 text-muted-foreground">Face Unlock is not yet implemented.</motion.div>;
            default:
                return <motion.div key="no-method" className="text-center py-12 text-muted-foreground">Select an authentication method above</motion.div>;
        }
    };

    const renderVoiceUI = () => (
        <motion.div key="voice-ui" {...(shouldReduce ? {} : modalSlide)} className="flex flex-col items-center gap-6 py-8">
            {recordingStep === 'prompt' && (
                <>
                    <p className="text-muted-foreground">Click below to record your voice.</p>
                    <motion.button {...(shouldReduce ? {} : buttonTap)} onClick={startRecording} className="px-8 py-4 bg-primary text-primary-foreground rounded-full font-medium flex items-center gap-2">
                        <Mic /> Start Recording
                    </motion.button>
                </>
            )}
            {recordingStep === 'recording' && (
                <>
                    <div className="flex items-end gap-1 h-16">{[...Array(7)].map((_, i) => <motion.div key={i} className="w-2 bg-primary rounded-full" style={{ originY: 1 }} {...(shouldReduce ? {} : waveformBar(i * 0.1))} />)}</div>
                    <motion.button {...(shouldReduce ? {} : buttonTap)} onClick={stopRecording} className="px-8 py-4 bg-destructive text-destructive-foreground rounded-full font-medium flex items-center gap-2">
                        <Square /> Stop Recording
                    </motion.button>
                </>
            )}
            {recordingStep === 'recorded' && (
                <>
                    <p className="text-muted-foreground">Recording complete. Click Unlock to verify.</p>
                    {audioUrl && <audio controls src={audioUrl} className="w-full max-w-xs" />}
                    <div className="flex gap-4">
                        <motion.button {...(shouldReduce ? {} : buttonTap)} onClick={retakeRecording} className="px-6 py-3 border border-border rounded-lg font-medium flex items-center gap-2"><RefreshCw size={18} /> Retake</motion.button>
                        <motion.button {...(shouldReduce ? {} : buttonTap)} onClick={handleUnlock} className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium flex items-center gap-2">Unlock</motion.button>
                    </div>
                </>
            )}
        </motion.div>
    );

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <ToastContainer toasts={toasts} onClose={removeToast} />
            <div className="container mx-auto px-4 py-12">
                 <motion.div variants={shouldReduce ? {} : staggerContainer} initial="initial" animate="animate" className="max-w-4xl mx-auto">
                    <motion.div variants={shouldReduce ? {} : fadeInUp} className="text-center mb-12">
                        <h1 className="text-4xl font-bold mb-4">Unlock Your Vault</h1>
                        <p className="text-lg text-muted-foreground">Welcome, {username || 'guest'}! Choose your authentication method.</p>
                    </motion.div>
                    
                    {/* Method Selection */}
                    <motion.div variants={shouldReduce ? {} : fadeInUp} className="grid sm:grid-cols-3 gap-4 mb-12">
                       {/* Face Button */}
                       <motion.button {...(shouldReduce ? {} : buttonTap)} onClick={() => setMethod("face")} className={`p-6 rounded-xl border-2 transition-all ${method === "face" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}>
                           <Camera className="w-12 h-12 text-primary mx-auto mb-3" /><h3 className="font-semibold">Face</h3>
                       </motion.button>
                       {/* Voice Button */}
                        <motion.button {...(shouldReduce ? {} : buttonTap)} onClick={() => setMethod("voice")} className={`p-6 rounded-xl border-2 transition-all ${method === "voice" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}>
                           <Mic className="w-12 h-12 text-primary mx-auto mb-3" /><h3 className="font-semibold">Voice</h3>
                       </motion.button>
                        {/* Password Button */}
                       <motion.button {...(shouldReduce ? {} : buttonTap)} onClick={() => setMethod("password")} className={`p-6 rounded-xl border-2 transition-all ${method === "password" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}>
                           <Key className="w-12 h-12 text-primary mx-auto mb-3" /><h3 className="font-semibold">Password</h3>
                       </motion.button>
                    </motion.div>

                    {/* Unlock Area */}
                    <motion.div variants={shouldReduce ? {} : fadeInUp} className="bg-card rounded-2xl shadow-[var(--shadow-elevated)] p-8">
                        <AnimatePresence mode="wait">
                            {renderUnlockMethodUI()}
                        </AnimatePresence>
                    </motion.div>
                 </motion.div>
            </div>
            <Footer />
        </div>
    );
};

export default Unlock;
