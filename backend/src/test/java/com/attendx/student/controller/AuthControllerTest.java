package com.attendx.student.controller;

import com.attendx.student.dto.RegisterRequest;
import com.attendx.student.model.User;
import com.attendx.student.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class AuthControllerTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthController authController;

    @Test
    public void testRegisterUser_Success() {
        RegisterRequest request = new RegisterRequest();
        request.setName("John");
        request.setEmail("john@test.com");
        request.setRegNo("STU1");
        request.setPassword("pass");

        when(userRepository.existsByRegNo(any())).thenReturn(false);
        when(userRepository.existsByEmail(any())).thenReturn(false);
        when(passwordEncoder.encode(any())).thenReturn("encodedPass");

        ResponseEntity<?> response = authController.registerUser(request);
        assertEquals(200, response.getStatusCode().value());
        assertEquals("User registered successfully", response.getBody());
    }

    @Test
    public void testRegisterUser_EmailExists() {
        RegisterRequest request = new RegisterRequest();
        request.setName("John");
        request.setEmail("john@test.com");
        request.setRegNo("STU1");
        request.setPassword("pass");

        when(userRepository.existsByRegNo(any())).thenReturn(false);
        when(userRepository.existsByEmail(any())).thenReturn(true);

        ResponseEntity<?> response = authController.registerUser(request);
        assertEquals(400, response.getStatusCode().value());
        assertEquals("Error: Email is already in use!", response.getBody());
    }
}
