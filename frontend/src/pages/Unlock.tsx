import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Mic, Key, Play, Square, RefreshCw } from "lucide-react";
// UPDATED: Import the REAL face unlock function
import { unlockVaultWithFace, unlockVaultWithVoice, getUserSessions, loginUser, requestOtp } from "@/lib/apiClient";
import { fadeInUp, staggerContainer, modalSlide, buttonTap, shake, checkmarkDraw, useMotionSafe, waveformBar, pulse } from "@/lib/motionSystem";
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

    // --- State for Audio Recording ---
    const [recordingStep, setRecordingStep] = useState<"prompt" | "recording" | "recorded">("prompt");
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    
    // --- State for Password ---
    const [email, setEmail] = useState(""); // Use email for OTP
    const [otp, setOtp] = useState("");

    // --- State for Face Capture ---
    const [faceStep, setFaceStep] = useState<"preview" | "captured">("preview");
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);


    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        const storedEmail = localStorage.getItem('email'); // Assuming email is stored on login
        setUsername(storedUsername);
        if (storedEmail) setEmail(storedEmail);
        
        // Cleanup audio URL on component unmount
        return () => {
            if (audioUrl) URL.revokeObjectURL(audioUrl);
            stopCamera(); // Ensure camera is off
        };
    }, [audioUrl]);
    
    // Start camera when face method is selected
    useEffect(() => {
        if (method === 'face' && faceStep === 'preview' && unlockStatus === 'idle') {
            startCamera();
        } else {
            stopCamera();
        }
    }, [method, faceStep, unlockStatus]);


    const addToast = (type: ToastProps["type"], message: string) => {
        const id = `toast-${Date.now()}`;
        setToasts((prev) => [...prev, { id, type, message, onClose: removeToast }]);
    };

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    // --- Face Capture Functions ---
    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "user", width: 640, height: 480 },
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (error) {
            addToast("error", "Camera access denied. Please enable permissions.");
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach((track) => track.stop());
            videoRef.current.srcObject = null;
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
                setFaceStep("captured");
            }
        }
    };
    
    const retakeFace = () => {
        setCapturedImage(null);
        setFaceStep("preview");
    };

    // --- Audio Recording Functions ---
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

    // --- Password/OTP Functions ---
    const handleRequestOtp = async () => {
        if (!email) {
            addToast("error", "Please enter your email first.");
            return;
        }
        try {
            const response = await requestOtp({ email: email });
            if (response.success) {
                addToast("success", "OTP sent to your email!");
            } else {
                addToast("error", response.message || "Failed to send OTP.");
            }
        } catch (error: any) {
            addToast("error", error.message || "Failed to request OTP.");
        }
    };
    
    // --- Main Unlock Handler ---
    const handleUnlock = async () => {
        if (!username) {
            addToast("error", "Username not found. Please log in again.");
            return;
        }

        setIsUnlocking(true);
        setUnlockStatus("idle");

        try {
            let response;
            if (method === 'face') {
                if (!capturedImage) {
                    addToast("error", "No face image captured.");
                    setIsUnlocking(false);
                    return;
                }
                const faceEmbedding = capturedImage.split(",")[1] || ""; // Get Base64 data
                response = await unlockVaultWithFace(username, faceEmbedding);

            } else if (method === 'voice') {
                if (!audioBlob) {
                    addToast("error", "No audio recorded.");
                    setIsUnlocking(false);
                    return;
                }
                response = await unlockVaultWithVoice(username, audioBlob); // This is still mocked

            } else if (method === 'password') {
                if (!email || !otp) {
                    addToast("error", "Email and OTP are required.");
                    setIsUnlocking(false);
                    return;
                }
                response = await loginUser({ email, otp }); // This is the OTP login

            } else {
                addToast("error", "Please select an unlock method.");
                setIsUnlocking(false);
                return;
            }

            if (response.success) {
                setUnlockStatus("success");
                addToast("success", "Vault unlocked successfully!");
                if (response.token) {
                     localStorage.setItem('authToken', response.token); // Store session token
                }
                // Fetch sessions on success
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
            // Reset states
            if (method === 'voice') retakeRecording();
            if (method === 'face') retakeFace();
            if (method === 'password') setOtp("");
        }
    };
    
    // --- RENDER FUNCTIONS ---
    
    const renderUnlockMethodUI = () => {
        if (isUnlocking) {
            return <motion.div key="unlocking" {...(shouldReduce ? {} : modalSlide)} className="text-center py-12">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto mb-6" />
                <h3 className="text-2xl font-bold mb-2">Verifying...</h3>
            </motion.div>;
        }

        if (unlockStatus !== 'idle') {
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

        switch (method) {
            case 'face':
                return renderFaceUI();
            case 'voice':
                return renderVoiceUI();
            case 'password':
                return renderPasswordUI();
            default:
                return <motion.div key="no-method" className="text-center py-12 text-muted-foreground">Select an authentication method above</motion.div>;
        }
    };
    
    const renderFaceUI = () => (
        <motion.div key="face-ui" {...(shouldReduce ? {} : modalSlide)} className="flex flex-col items-center gap-6 py-8">
            <div className="relative aspect-video w-full max-w-sm bg-muted rounded-2xl overflow-hidden">
                <AnimatePresence mode="wait">
                    {faceStep === 'preview' && (
                        <motion.div key="preview" {...(shouldReduce ? {} : modalSlide)} className="relative w-full h-full">
                            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <motion.svg width="200" height="200" viewBox="0 0 200 200">
                                    <motion.circle cx="100" cy="100" r="90" fill="none" stroke="white" strokeWidth="3" strokeDasharray="5,5" {...(shouldReduce ? {} : pulse)} />
                                </motion.svg>
                            </div>
                            <canvas ref={canvasRef} className="hidden" />
                        </motion.div>
                    )}
                    {faceStep === 'captured' && capturedImage && (
                        <motion.div key="captured" {...(shouldReduce ? {} : modalSlide)} className="w-full h-full">
                            <img src={capturedImage} alt="Captured face" className="w-full h-full object-cover" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            {faceStep === 'preview' && (
                <motion.button {...(shouldReduce ? {} : buttonTap)} onClick={captureImage} className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium flex items-center gap-2">
                    <Camera /> Capture Face
                </motion.button>
            )}
            {faceStep === 'captured' && (
                <div className="flex gap-4">
                    <motion.button {...(shouldReduce ? {} : buttonTap)} onClick={retakeFace} className="px-6 py-3 border border-border rounded-lg font-medium flex items-center gap-2"><RefreshCw size={18} /> Retake</motion.button>
                    <motion.button {...(shouldReduce ? {} : buttonTap)} onClick={handleUnlock} className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium flex items-center gap-2">Unlock</motion.button>
                </div>
            )}
        </motion.div>
    );

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
    
    const renderPasswordUI = () => (
         <motion.div key="password-ui" {...(shouldReduce ? {} : modalSlide)} className="flex flex-col items-center gap-4 py-8">
            <div className="w-full max-w-sm space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" className="w-full p-3 rounded-lg bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary"/>
                </div>
                 <motion.button {...(shouldReduce ? {} : buttonTap)} onClick={handleRequestOtp} className="w-full px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium">Request OTP</motion.button>
                <div>
                    <label className="block text-sm font-medium mb-2">OTP</label>
                    <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter OTP" className="w-full p-3 rounded-lg bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary"/>
                </div>
            </div>
            <motion.button {...(shouldReduce ? {} : buttonTap)} onClick={handleUnlock} className="px-8 py-3 mt-4 bg-primary text-primary-foreground rounded-lg font-medium">Unlock with OTP</motion.button>
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
                           <Key className="w-12 h-12 text-primary mx-auto mb-3" /><h3 className="font-semibold">OTP</h3>
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