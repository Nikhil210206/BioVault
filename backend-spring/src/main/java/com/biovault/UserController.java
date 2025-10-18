package com.biovault;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    @Autowired
    private UserService userService;

    private final WebClient webClient;

    public UserController(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.baseUrl("http://localhost:5001").build();
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            User user = userService.registerUser(request.getName(), request.getEmail(), request.getUsername());
            return ResponseEntity.ok(new RegisterResponse(true, user.getId(), "Registration successful!"));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(new RegisterResponse(false, null, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new RegisterResponse(false, null, "An unexpected error occurred."));
        }
    }

    @PostMapping("/request-otp")
    public ResponseEntity<?> requestOtp(@RequestBody RequestOtpRequest request) {
        try {
            User user = userService.findByEmail(request.getEmail());
            if (user == null) {
                return ResponseEntity.status(404).body(new RequestOtpResponse(false, "Email not found"));
            }
            // Call Python script
            ProcessBuilder pb = new ProcessBuilder("python3", "otp_script.py", request.getEmail());
            pb.directory(new java.io.File("backend-spring"));
            Process p = pb.start();
            int exitCode = p.waitFor();
            if (exitCode == 0) {
                return ResponseEntity.ok(new RequestOtpResponse(true, "OTP sent to email"));
            } else {
                return ResponseEntity.status(500).body(new RequestOtpResponse(false, "Failed to send OTP"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new RequestOtpResponse(false, "Error requesting OTP"));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            User user = userService.loginUser(request.getEmail(), request.getOtp());
            if (user != null) {
                return ResponseEntity.ok(new LoginResponse(true, user.getId(), user.getUsername(), "token_" + System.currentTimeMillis()));
            } else {
                return ResponseEntity.status(401).body(new LoginResponse(false, null, null, null));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new LoginResponse(false, null, null, null));
        }
    }

    @PostMapping("/biometrics/face/enroll")
    public Mono<ResponseEntity<Map>> enrollFace(@RequestBody EnrollFaceRequest request) {
        return this.webClient.post()
            .uri("/enroll")
            .bodyValue(request)
            .retrieve()
            .onStatus(HttpStatus::isError, clientResponse -> 
                clientResponse.bodyToMono(Map.class).flatMap(errorBody -> 
                    Mono.error(new RuntimeException("Face enrollment failed: " + errorBody.get("message")))
                )
            )
            .toEntity(Map.class)
            .doOnError(throwable -> System.err.println("Error during face enrollment: " + throwable.getMessage()));
    }

    @PostMapping("/auth/unlock")
    public ResponseEntity<?> unlock(@RequestBody UnlockRequest request) {
        try {
            User user = userService.unlockUser(request.getUsername());
            if (user != null) {
                return ResponseEntity.ok(new UnlockResponse(true, 0.96, "token_" + System.currentTimeMillis()));
            } else {
                return ResponseEntity.status(401).body(new UnlockResponse(false, 0.0, null));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new UnlockResponse(false, 0.0, null));
        }
    }
    
    // Inner classes for Request/Response bodies
    public static class EnrollFaceRequest {
        private String username;
        private String faceEmbedding;
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getFaceEmbedding() { return faceEmbedding; }
        public void setFaceEmbedding(String faceEmbedding) { this.faceEmbedding = faceEmbedding; }
    }
    
    public static class RegisterRequest {
        private String name;
        private String email;
        private String username;
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
    }

    public static class RegisterResponse {
        private boolean success;
        private Long userId;
        private String message;
        public RegisterResponse(boolean success, Long userId, String message) {
            this.success = success;
            this.userId = userId;
            this.message = message;
        }
        public boolean isSuccess() { return success; }
        public Long getUserId() { return userId; }
        public String getMessage() { return message; }
    }

    public static class LoginRequest {
        private String email;
        private String otp;
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getOtp() { return otp; }
        public void setOtp(String otp) { this.otp = otp; }
    }

    public static class LoginResponse {
        private boolean success;
        private Long userId;
        private String username;
        private String token;
        public LoginResponse(boolean success, Long userId, String username, String token) {
            this.success = success;
            this.userId = userId;
            this.username = username;
            this.token = token;
        }
        public boolean isSuccess() { return success; }
        public Long getUserId() { return userId; }
        public String getUsername() { return username; }
        public String getToken() { return token; }
    }
    
    public static class UnlockRequest {
        private String username;
        private String method;
        private String proof;
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getMethod() { return method; }
        public void setMethod(String method) { this.method = method; }
        public String getProof() { return proof; }
        public void setProof(String proof) { this.proof = proof; }
    }

    public static class UnlockResponse {
        private boolean success;
        private double confidence;
        private String token;
        public UnlockResponse(boolean success, double confidence, String token) {
            this.success = success;
            this.confidence = confidence;
            this.token = token;
        }
        public boolean isSuccess() { return success; }
        public double getConfidence() { return confidence; }
        public String getToken() { return token; }
    }

    public static class RequestOtpRequest {
        private String email;
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }

    public static class RequestOtpResponse {
        private boolean success;
        private String message;
        public RequestOtpResponse(boolean success, String message) {
            this.success = success;
            this.message = message;
        }
        public boolean isSuccess() { return success; }
        public String getMessage() { return message; }
    }
}