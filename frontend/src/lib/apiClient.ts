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
    return Promise.reject(error.response?.data || { success: false, message: 'An unknown error occurred' });
  }
);


// ==================================================
// REAL API METHODS (Connected to Spring Boot)
// ==================================================

/**
 * POST /api/auth/register - Register a new user
 */
export const registerUser = async (userData) => {
  // CORRECTED: Added /auth path
  const response = await apiClient.post('/api/auth/register', userData);
  return response.data;
};

/**
 * POST /api/auth/login - Log in a user with a password
 */
export const loginUser = async (credentials) => {
  // CORRECTED: Added /auth path
  const response = await apiClient.post('/api/auth/login', credentials);
  return response.data;
};

// --- NEW VOICE ENROLLMENT FUNCTION ---
/**
 * POST /api/auth/voice/enroll - Enrolls a user's voice by uploading an audio file.
 * This function is now REAL and connects to your Java backend.
 * @param {string} username - The username of the user enrolling.
 * @param {Blob} audioBlob - The recorded audio data.
 * @returns {Promise} Enrollment response
 */
export const enrollVoice = async (username, audioBlob) => {
  // 1. Create FormData to handle the file upload.
  const formData = new FormData();
  formData.append('username', username);
  formData.append('audio_data', audioBlob, 'enrollment.webm');

  // 2. Make the POST request.
  // We override the default 'Content-Type' header for this specific call.
  const response = await apiClient.post('/api/auth/voice/enroll', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    // It might take Azure a while to process, so we use a longer timeout.
    timeout: 30000, 
  });

  return response.data;
};

// --- NEW VOICE UNLOCK FUNCTION ---
/**
 * POST /api/auth/voice/unlock - Unlocks the vault by verifying an audio file.
 * @param {string} username - The username of the user unlocking.
 * @param {Blob} audioBlob - The new recorded audio data for verification.
 * @returns {Promise} Unlock response
 */
export const unlockVaultWithVoice = async (username, audioBlob) => {
  const formData = new FormData();
  formData.append('username', username);
  formData.append('audio_data', audioBlob, 'unlock-attempt.webm');

  const response = await apiClient.post('/api/auth/voice/unlock', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 30000,
  });

  return response.data;
};


// The rest of the mocked functions can remain for your friend's other features.
// ==================================================
// MOCKED API METHODS (Placeholders for future development)
// ==================================================
const mockDelay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));
export const deleteBiometricData = async (data) => {
  await mockDelay(1000);
  return { success: true, message: 'Biometric data deleted successfully' };
};
export const updateSettings = async (settings) => {
  await mockDelay(800);
  return { success: true, settings, message: 'Settings updated successfully' };
};

// ... other mocked functions ...

export default apiClient;
