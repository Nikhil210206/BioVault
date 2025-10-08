// apiClient.js - Mock API client for BioVault
// Replace with actual backend endpoints in production

import axios from 'axios';

const API_BASE_URL = '/api';

// Simulate network delay for realistic demo
const mockDelay = (ms = 1000) => new Promise(resolve => setTimeout(resolve, ms));

// Mock responses
const mockResponses = {
  success: { success: true, message: 'Operation completed successfully' },
  error: { success: false, message: 'Operation failed' },
};

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth tokens
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

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// ============= API METHODS =============

/**
 * POST /api/auth/register
 * Register a new user
 * @param {Object} userData - { name, email, username, passwordHash? }
 * @returns {Promise} User registration response
 */
export const registerUser = async (userData) => {
  await mockDelay(1200);
  console.log('API: Register user', userData);
  
  // Mock response
  return {
    success: true,
    userId: `user_${Date.now()}`,
    message: 'User registered successfully',
  };
};

/**
 * POST /api/biometrics/face/enroll
 * Enroll face biometric data
 * @param {Object} data - { userId, faceEmbedding: base64, metadata }
 * @returns {Promise} Enrollment response
 */
export const enrollFace = async (data) => {
  await mockDelay(2000);
  console.log('API: Enroll face', data);
  
  return {
    success: true,
    enrollmentId: `face_${Date.now()}`,
    confidence: 0.98,
    message: 'Face biometric enrolled successfully',
  };
};

/**
 * POST /api/biometrics/audio/enroll
 * Enroll voice biometric data
 * @param {Object} data - { userId, audioEmbedding: base64, metadata }
 * @returns {Promise} Enrollment response
 */
export const enrollVoice = async (data) => {
  await mockDelay(2500);
  console.log('API: Enroll voice', data);
  
  return {
    success: true,
    enrollmentId: `voice_${Date.now()}`,
    confidence: 0.95,
    transcript: data.metadata?.transcript || 'Sample phrase captured',
    message: 'Voice biometric enrolled successfully',
  };
};

/**
 * POST /api/auth/unlock
 * Unlock vault with biometric or password
 * @param {Object} data - { userId, method, proof, otp? }
 * @returns {Promise} Authentication response
 */
export const unlockVault = async (data) => {
  await mockDelay(1500);
  console.log('API: Unlock vault', data);
  
  // Simulate 90% success rate
  const success = Math.random() > 0.1;
  
  if (success) {
    return {
      success: true,
      token: `token_${Date.now()}`,
      confidence: 0.96,
      message: 'Vault unlocked successfully',
      sessionId: `session_${Date.now()}`,
    };
  } else {
    return {
      success: false,
      confidence: 0.45,
      message: 'Biometric verification failed',
    };
  }
};

/**
 * GET /api/user/sessions
 * Get recent login/logout timestamps
 * @param {string} userId - User ID
 * @returns {Promise} Sessions list
 */
export const getUserSessions = async (userId) => {
  await mockDelay(800);
  console.log('API: Get user sessions', userId);
  
  return {
    success: true,
    sessions: [
      {
        sessionId: 'session_001',
        loginTime: new Date(Date.now() - 3600000).toISOString(),
        logoutTime: new Date(Date.now() - 1800000).toISOString(),
        method: 'face',
        device: 'Chrome on MacOS',
      },
      {
        sessionId: 'session_002',
        loginTime: new Date(Date.now() - 86400000).toISOString(),
        logoutTime: new Date(Date.now() - 82800000).toISOString(),
        method: 'voice',
        device: 'Safari on iOS',
      },
    ],
  };
};

/**
 * POST /api/tools/generate-password
 * Generate a secure password
 * @param {Object} options - { length, includeSymbols, includeNumbers }
 * @returns {Promise} Generated password
 */
export const generatePassword = async (options) => {
  await mockDelay(300);
  
  const length = options.length || 16;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  let chars = charset;
  if (options.includeNumbers) chars += numbers;
  if (options.includeSymbols) chars += symbols;
  
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return {
    success: true,
    password,
    strength: 'Strong',
  };
};

/**
 * POST /api/data/export
 * Export encrypted vault data
 * @param {string} userId - User ID
 * @returns {Promise} Encrypted data
 */
export const exportVaultData = async (userId) => {
  await mockDelay(1000);
  
  return {
    success: true,
    data: btoa(JSON.stringify({
      userId,
      exportDate: new Date().toISOString(),
      entries: [],
      encrypted: true,
    })),
    filename: `biovault_export_${Date.now()}.json`,
  };
};

/**
 * POST /api/data/import
 * Import encrypted vault data
 * @param {Object} data - Encrypted vault data
 * @returns {Promise} Import result
 */
export const importVaultData = async (data) => {
  await mockDelay(1500);
  
  return {
    success: true,
    importedCount: 0,
    message: 'Data imported successfully',
  };
};

/**
 * DELETE /api/biometrics/delete
 * Delete biometric data
 * @param {Object} data - { userId, method }
 * @returns {Promise} Deletion response
 */
export const deleteBiometricData = async (data) => {
  await mockDelay(1000);
  
  return {
    success: true,
    message: 'Biometric data deleted successfully',
  };
};

/**
 * PUT /api/settings/update
 * Update user settings
 * @param {Object} settings - User settings
 * @returns {Promise} Update response
 */
export const updateSettings = async (settings) => {
  await mockDelay(800);
  
  return {
    success: true,
    settings,
    message: 'Settings updated successfully',
  };
};

export default apiClient;
