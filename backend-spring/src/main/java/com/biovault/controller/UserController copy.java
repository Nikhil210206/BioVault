package com.biovault.controller;

import com.biovault.model.User;
import com.biovault.service.UserService;
import com.biovault.service.VoiceAuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000") // For local development
public class UserController {

    @Autowired
    private UserService userService;

    // --- STEP 1: INJECT THE VOICE AUTH SERVICE ---
    // Spring will automatically provide an instance of your VoiceAuthService.
    @Autowired
    private VoiceAuthService voiceAuthService;
    // ---------------------------------------------

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            User user = userService.registerUser(request.getName(), request.getEmail(), request.getUsername(), request.getPassword());
            return ResponseEntity.ok(Map.of("success", true, "userId", user.getId(), "message", "Registration successful!"));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        User user = userService.loginUser(request.getUsername(), request.getPassword());
        if (user != null) {
            String fakeJwtToken = "jwt_token_for_user_" + user.getId(); // Replace with real JWT
            return ResponseEntity.ok(Map.of("success", true, "userId", user.getId(), "token", fakeJwtToken));
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("success", false, "message", "Invalid credentials."));
        }
    }

    // --- STEP 2: CALL THE ENROLLMENT METHOD ---
    @PostMapping("/voice/enroll")
    public ResponseEntity<?> enrollVoice(@RequestParam("username") String username) {
        try {
            System.out.println("Starting voice enrollment for user: " + username);

            // This is the call to your service to contact Azure
            String voiceProfileId = voiceAuthService.enrollTextIndependentProfile();

            if (voiceProfileId == null) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("success", false, "message", "Voice enrollment failed. See server logs."));
            }

            // After getting the ID from Azure, save it to our database
            userService.setVoiceProfileIdForUser(username, voiceProfileId);

            return ResponseEntity.ok(Map.of("success", true, "message", "Voice profile enrolled successfully."));

        } catch (Exception e) {
            System.err.println("Error during voice enrollment: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("success", false, "message", "An error occurred during enrollment."));
        }
    }

    // --- STEP 3: CALL THE VERIFICATION METHOD ---
    @PostMapping("/voice/unlock")
    public ResponseEntity<?> unlockWithVoice(@RequestParam("username") String username) {
        try {
            // 1. Get the user from our database to find their stored profile ID
            Optional<User> userOptional = userService.findByUsername(username);

            if (userOptional.isEmpty() || userOptional.get().getVoiceProfileId() == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "User not found or no voice profile enrolled."));
            }

            User user = userOptional.get();
            String storedProfileId = user.getVoiceProfileId();
            System.out.println("Attempting to verify voice for user: " + username + " with profile ID: " + storedProfileId);

            // This is the call to your service to verify the voice against the stored ID
            boolean isVerified = voiceAuthService.verifyTextIndependent(storedProfileId);

            if (isVerified) {
                String fakeJwtToken = "jwt_token_for_user_" + user.getId(); // Replace with real JWT
                return ResponseEntity.ok(Map.of("success", true, "message", "Vault unlocked!", "token", fakeJwtToken));
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("success", false, "message", "Voice verification failed. Access denied."));
            }

        } catch (Exception e) {
            System.err.println("Error during voice unlock: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("success", false, "message", "An error occurred during verification."));
        }
    }

    // --- Request/Response DTOs ---
    // (These should ideally be in their own 'dto' package)

    public static class RegisterRequest {
        private String name;
        private String email;
        private String username;
        private String password;
        // getters and setters...
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class LoginRequest {
        private String username;
        private String password;
        // getters and setters...
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }
}
