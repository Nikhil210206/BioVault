import axios from 'axios';

// CORRECTED: The base URL should not include the /api part, as we add it in each call.
const API_BASE_URL = 'http://localhost:8080';

// This instance is for standard JSON requests (register, login, etc.)
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptors remain the same - this is good code!
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response || error);
    // Ensure you return a rejected promise with a standard error structure
    const errorMessage = error.response?.data?.message || error.message || 'An unknown error occurred';
    return Promise.reject({ success: false, message: errorMessage, error });
  }
);


// ==================================================
// REAL API METHODS (Connected to Spring Boot)
// ==================================================

/**
 * POST /api/register - Register a new user (adjusted path)
 */
export const registerUser = async (userData: { name: string; email: string; username: string }) => {
  // Corrected path to match UserController.java
  const response = await apiClient.post('/api/register', userData);
  return response.data;
};

/**
 * POST /api/login - Log in a user with OTP (adjusted path)
 */
export const loginUser = async (credentials: { email: string; otp: string }) => {
  // Corrected path to match UserController.java
  const response = await apiClient.post('/api/login', credentials);
  return response.data;
};

/**
 * POST /api/request-otp - Request an OTP for login
 */
export const requestOtp = async (data: { email: string }) => {
    const response = await apiClient.post('/api/request-otp', data);
    return response.data;
};

/**
 * POST /api/biometrics/face/enroll - Enrolls a user's face.
 * @param {object} data - Enrollment data { username, faceEmbedding }
 * @returns {Promise} Enrollment response
 */
export const enrollFace = async (data: { username: string; faceEmbedding: string }) => {
    // Corrected path to match UserController.java
    const response = await apiClient.post('/api/biometrics/face/enroll', data);
    return response.data;
};

// --- NEW FACE UNLOCK FUNCTION ---
/**
 * POST /api/auth/unlock (using face method) - Unlocks vault via face
 * @param {string} username - The username.
 * @param {string} faceEmbedding - The Base64 encoded face *image* for verification.
 * @returns {Promise} Unlock response
 */
export const unlockVaultWithFace = async (username: string, faceEmbedding: string) => {
    console.log("Attempting face unlock for:", username);
    const response = await apiClient.post('/api/auth/unlock', {
        username: username,
        method: "face",
        proof: faceEmbedding // 'proof' field contains the Base64 image string
    });
    return response.data;
};


// --- VOICE ENROLLMENT FUNCTION (MOCK - needs backend implementation) ---
/**
 * POST /api/biometrics/audio/enroll - Enrolls a user's voice (Mocked)
 * @param {string} username - The username.
 * @param {Blob} audioBlob - The audio data.
 * @returns {Promise} Mock enrollment response
 */
export const enrollVoice = async (username: string, audioBlob: Blob) => {
  console.log("Mock enrollVoice called for:", username, audioBlob.size);
  await mockDelay(1500); // Simulate network delay
  // Simulate a successful response structure based on your API docs
  return {
    success: true,
    enrollmentId: `mock_voice_${Date.now()}`,
    confidence: 0.95, // Example confidence
    message: "Mock voice biometric enrolled successfully",
    enrollmentDate: new Date().toISOString()
  };
  // To make it fail, uncomment below:
  // throw { success: false, message: "Mock enrollment failed: Low audio quality" };
};


// --- VOICE UNLOCK FUNCTION (MOCK - needs backend implementation) ---
/**
 * POST /api/auth/unlock (using voice method) - Unlocks vault via voice (Mocked)
 * @param {string} username - The username.
 * @param {Blob} audioBlob - The audio data for verification.
 * @returns {Promise} Mock unlock response
 */
export const unlockVaultWithVoice = async (username: string, audioBlob: Blob) => {
    console.log("Mock unlockVaultWithVoice called for:", username, audioBlob.size);
    await mockDelay(1800);
    // Simulate success
    return {
        success: true,
        token: `mock_jwt_token_${Date.now()}`,
        refreshToken: `mock_refresh_${Date.now()}`,
        confidence: 0.96,
        message: "Mock vault unlocked successfully (voice)",
        sessionId: `mock_session_${Date.now()}`,
        expiresIn: 3600
    };
    // Simulate failure
    // throw { success: false, confidence: 0.45, message: "Mock voice verification failed" };
};


// ==================================================
// MOCKED API METHODS (Placeholders for features not yet fully implemented in backend)
// ==================================================
const mockDelay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * POST /api/tools/generate-password - Generate a password (Mocked)
 */
export const generatePassword = async (options: { length: number; includeNumbers: boolean; includeSymbols: boolean }) => {
    await mockDelay(300);
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ" + (options.includeNumbers ? "0123456789" : "") + (options.includeSymbols ? "!@#$%^&*()_+-=[]{};:,.<>?" : "");
    let generatedPassword = "";
    for (let i = 0; i < options.length; i++) {
        generatedPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return { success: true, password: generatedPassword, strength: "Strong" }; // Mocked response
};

/**
 * GET /api/user/sessions - Get user sessions (Mocked)
 */
export const getUserSessions = async (username: string) => {
    await mockDelay(700);
    console.log("Mock getUserSessions called for:", username);
    // Simulate fetching sessions
    return {
        success: true,
        sessions: [
            { sessionId: "mock1", loginTime: new Date(Date.now() - 3600000).toISOString(), method: "face", device: "Mock Chrome" },
            { sessionId: "mock2", loginTime: new Date(Date.now() - 86400000).toISOString(), method: "voice", device: "Mock Firefox" },
        ],
        total: 2,
        limit: 10,
        offset: 0
    };
};

/**
 * POST /api/data/export - Export vault data (Mocked)
 */
export const exportVaultData = async (username: string) => {
    await mockDelay(1200);
    console.log("Mock exportVaultData called for:", username);
    const mockData = JSON.stringify({ vault: [{ site: "example.com", user: "test", pass: "encrypted..." }] });
    // Simulate base64 encoding (very basic)
    const base64Data = btoa(mockData);
    return {
        success: true,
        data: base64Data, // Should be base64 encoded encrypted data
        filename: `mock_biovault_export_${Date.now()}.json`,
        exportDate: new Date().toISOString(),
        entryCount: 1
    };
};

/**
 * POST /api/data/import - Import vault data (Mocked)
 */
export const importVaultData = async (data: { data: string }) => {
    await mockDelay(1500);
    console.log("Mock importVaultData called with data length:", data.data.length);
    // Simulate decoding and importing
    try {
        const decoded = atob(data.data);
        const jsonData = JSON.parse(decoded);
        const count = jsonData?.vault?.length || 0;
        return {
            success: true,
            importedCount: count,
            skippedCount: 0,
            duplicateCount: 0,
            message: `Mock import successful: ${count} entries`,
            importDate: new Date().toISOString()
        };
    } catch (e) {
        console.error("Mock import failed:", e);
        throw { success: false, message: "Mock import failed: Invalid file format" };
    }
};

/**
 * DELETE /api/biometrics/delete - Delete biometric data (Mocked)
 */
export const deleteBiometricData = async (data: { userId: string, method: 'all' | 'face' | 'voice' }) => {
  await mockDelay(1000);
  console.log("Mock deleteBiometricData called:", data);
  return { success: true, message: 'Mock biometric data deleted successfully' };
};

/**
 * PUT /api/settings/update - Update user settings (Mocked)
 */
export const updateSettings = async (settings: object) => {
  await mockDelay(800);
  console.log("Mock updateSettings called:", settings);
  return { success: true, settings, message: 'Mock settings updated successfully' };
};


export default apiClient;