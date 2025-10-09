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
        User user = new User();
        user.setUsername("serviceuser");
        user.setPassword("servicepass");

        // Create user via service
        User createdUser = userService.saveUser(user);
        assertThat(createdUser.getId()).isNotNull();

        // Find user via service
        User foundUser = userService.getUserById(createdUser.getId());
        assertThat(foundUser).isNotNull();
        assertThat(foundUser.getUsername()).isEqualTo("serviceuser");

        // Cleanup
        userRepository.deleteById(createdUser.getId());
    }
}
