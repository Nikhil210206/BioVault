package com.biovault;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User registerUser(String name, String email, String username, String passwordHash) {
        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setUsername(username);
        user.setPasswordHash(passwordHash);
        return userRepository.save(user);
    }

    /**
     * Authenticates a user.
     * For now, this is a mock implementation that just finds the user.
     * We will add real password/biometric checking later.
     * @param username The username to check.
     * @return The User if found, otherwise null.
     */
    public User unlockUser(String username) {
        // In a real application, you would also check the password or biometric proof here.
        return userRepository.findByUsername(username);
    }
}