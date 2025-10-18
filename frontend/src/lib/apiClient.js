import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth tokens from localStorage
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

// General response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response || error);
    // Return a structured error to be handled by the calling function
    return Promise.reject(error.response?.data || { success: false, message: 'An unknown error occurred' });
  }
);


// ==================================================
// REAL API METHODS (Connected to Spring Boot)
// ==================================================

/**
 * POST /api/register - Register a new user
 */
export const registerUser = async (userData) => {
  const response = await apiClient.post('/register', userData);
  return response.data;
};

/**
 * POST /api/request-otp - Request OTP for login
 */
export const requestOtp = async (data) => {
  const response = await apiClient.post('/request-otp', data);
  return response.data;
};

/**
 * POST /api/login - Log in a user with OTP
 */
export const loginUser = async (credentials) => {
  const response = await apiClient.post('/login', credentials);
  return response.data;
};

/**
 * POST /api/auth/unlock - Unlock the vault for a logged-in user
 */
export const unlockVault = async (data) => {
  const response = await apiClient.post('/auth/unlock', data);
  return response.data;
};


// ==================================================
// MOCKED API METHODS (Placeholders for future development)
// ==================================================

// Helper to simulate network delay
const mockDelay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * POST /api/biometrics/face/enroll
 * Sends face data to the Spring Boot backend, which forwards to Python
 * @param {Object} data - { username, faceEmbedding: base64 }
 * @returns {Promise} Enrollment response
 */
export const enrollFace = async (data) => {
  // This is now a real API call to your Spring Boot backend
  const response = await apiClient.post('/biometrics/face/enroll', data);
  return response.data;
};


/**
 * MOCKED - POST /api/biometrics/audio/enroll
 */
export const enrollVoice = async (data) => {
  await mockDelay(2000);
  console.log('MOCK API: Enroll voice', data);
  return { success: true, enrollmentId: `voice_${Date.now()}`, confidence: 0.95, message: 'Voice biometric enrolled successfully' };
};

/**
 * MOCKED - GET /api/user/sessions
 */
export const getUserSessions = async (userId) => {
  await mockDelay(800);
  console.log('MOCK API: Get user sessions for', userId);
  return {
    success: true,
    sessions: [
      { sessionId: 'session_001', loginTime: new Date(Date.now() - 3600000).toISOString(), logoutTime: new Date(Date.now() - 1800000).toISOString(), method: 'face', device: 'Chrome on MacOS' },
      { sessionId: 'session_002', loginTime: new Date(Date.now() - 86400000).toISOString(), logoutTime: new Date(Date.now() - 82800000).toISOString(), method: 'voice', device: 'Safari on iOS' },
    ],
  };
};

/**
 * MOCKED - POST /api/tools/generate-password
 */
export const generatePassword = async (options) => {
  await mockDelay(300);
  const length = options.length || 16;
  let chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (options.includeNumbers) chars += '0123456789';
  if (options.includeSymbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return { success: true, password, strength: 'Strong' };
};

/**
 * MOCKED - POST /api/data/export
 */
export const exportVaultData = async (userId) => {
  await mockDelay(1000);
  return { success: true, data: btoa(JSON.stringify({ userId, exportDate: new Date().toISOString(), entries: [] })), filename: `biovault_export_${Date.now()}.json` };
};

/**
 * MOCKED - POST /api/data/import
 */
export const importVaultData = async (data) => {
  await mockDelay(1500);
  return { success: true, importedCount: 0, message: 'Data imported successfully' };
};

/**
 * MOCKED - DELETE /api/biometrics/delete
 */
export const deleteBiometricData = async (data) => {
  await mockDelay(1000);
  return { success: true, message: 'Biometric data deleted successfully' };
};

/**
 * MOCKED - PUT /api/settings/update
 */
export const updateSettings = async (settings) => {
  await mockDelay(800);
  return { success: true, settings, message: 'Settings updated successfully' };
};

export default apiClient;