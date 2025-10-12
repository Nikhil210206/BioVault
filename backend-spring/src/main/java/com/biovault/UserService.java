package com.biovault;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Objects;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User registerUser(String name, String email, String username, String passwordHash) {
        // *** THIS IS THE KEY CHANGE ***
        // Check if a user with the same username or email already exists
        if (userRepository.findByUsername(username) != null) {
            // Throw an exception with a specific message
            throw new IllegalStateException("Username '" + username + "' is already taken.");
        }
        if (userRepository.findByEmail(email) != null) {
            // Throw an exception with a specific message
            throw new IllegalStateException("Email '" + email + "' is already registered.");
        }

        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setUsername(username);
        user.setPasswordHash(passwordHash);
        return userRepository.save(user);
    }

    public User loginUser(String username, String passwordHash) {
        User user = userRepository.findByUsername(username);
        if (user != null && Objects.equals(user.getPasswordHash(), passwordHash)) {
            return user;
        }
        return null;
    }

    public User unlockUser(String username) {
        return userRepository.findByUsername(username);
    }

    public void storeFaceEmbeddingPath(String username, String path) {
        User user = userRepository.findByUsername(username);
        if (user != null) {
            user.setFaceEmbeddingPath(path);
            userRepository.save(user);
        }
    }
}