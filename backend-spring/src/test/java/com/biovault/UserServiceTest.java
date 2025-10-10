package com.biovault;

import com.biovault.User;
import com.biovault.UserService;
import com.biovault.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
public class UserServiceTest {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Test
    public void testCreateAndFindUser() {
        // Create user via service
        User createdUser = userService.registerUser("Service User", "service@test.com", "serviceuser", "servicepass");
        assertThat(createdUser.getId()).isNotNull();

        // Find user via repository (since the service doesn't have a find method)
        User foundUser = userRepository.findByUsername("serviceuser");
        assertThat(foundUser).isNotNull();
        assertThat(foundUser.getUsername()).isEqualTo("serviceuser");

        // Cleanup
        userRepository.deleteById(createdUser.getId());
    }
}