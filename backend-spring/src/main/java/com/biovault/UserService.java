package com.biovault;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Objects;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User registerUser(String name, String email, String username) {
        // Check if a user with the same username or email already exists
        if (userRepository.findByUsername(username) != null) {
            throw new IllegalStateException("Username '" + username + "' is already taken.");
        }
        if (userRepository.findByEmail(email) != null) {
            throw new IllegalStateException("Email '" + email + "' is already registered.");
        }

        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setUsername(username);
        return userRepository.save(user);
    }

    public User loginUser(String email, String otp) {
        User user = userRepository.findByEmail(email);
        if (user != null && Objects.equals(user.getOtp(), otp) && user.getOtpExpiry() != null && user.getOtpExpiry().after(new java.sql.Timestamp(System.currentTimeMillis()))) {
            // Clear OTP after successful login
            user.setOtp(null);
            user.setOtpExpiry(null);
            userRepository.save(user);
            return user;
        }
        return null;
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public User unlockUser(String username) {
        return userRepository.findByUsername(username);
    }
}