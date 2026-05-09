package com.attendx.student.controller;

import com.attendx.student.dto.*;
import com.attendx.student.model.User;
import com.attendx.student.repository.UserRepository;
import com.attendx.student.security.JwtTokenProvider;
import com.attendx.student.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.Random;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired private AuthenticationManager authenticationManager;
    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtTokenProvider tokenProvider;
    @Autowired private EmailService emailService;

    // ── Login ─────────────────────────────────────────────────────────────
    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getRegNo(), loginRequest.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);
        return ResponseEntity.ok(new JwtAuthenticationResponse(jwt));
    }

    // ── Register ──────────────────────────────────────────────────────────
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest signUpRequest) {
        if (userRepository.existsByRegNo(signUpRequest.getRegNo())) {
            return ResponseEntity.badRequest().body("Error: Registration number is already taken!");
        }
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity.badRequest().body("Error: Email is already in use!");
        }
        User user = new User(
                signUpRequest.getName(),
                signUpRequest.getEmail(),
                signUpRequest.getRegNo(),
                passwordEncoder.encode(signUpRequest.getPassword())
        );
        userRepository.save(user);
        return ResponseEntity.ok("User registered successfully");
    }

    // ── Forgot Password – send OTP ────────────────────────────────────────
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body("No account found with that email address.");
        }

        // Generate 6-digit OTP
        String otp = String.format("%06d", new Random().nextInt(999999));
        user.setResetToken(otp);
        user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(10)); // expires in 10 min
        userRepository.save(user);

        // Always print OTP to console as fallback (visible in backend terminal)
        System.out.println("\n========================================");
        System.out.println("  OTP for " + user.getEmail() + " : " + otp);
        System.out.println("  (expires in 10 minutes)");
        System.out.println("========================================\n");

        // Try sending real email — if Gmail not configured, just use console OTP
        boolean emailSent = false;
        try {
            emailService.sendOtpEmail(user.getEmail(), otp);
            emailSent = true;
        } catch (RuntimeException e) {
            System.err.println("Email sending failed (Gmail not configured?): " + e.getMessage());
        }

        String message = emailSent
            ? "OTP sent to " + user.getEmail()
            : "OTP generated — check the backend console (email not configured yet).";
        return ResponseEntity.ok(message);
    }

    // ── Verify OTP + Reset Password ───────────────────────────────────────
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);

        if (user == null) {
            return ResponseEntity.badRequest().body("No account found with that email address.");
        }
        if (user.getResetToken() == null || !user.getResetToken().equals(request.getOtp())) {
            return ResponseEntity.badRequest().body("Invalid OTP. Please check and try again.");
        }
        if (user.getResetTokenExpiry() == null || LocalDateTime.now().isAfter(user.getResetTokenExpiry())) {
            return ResponseEntity.badRequest().body("OTP has expired. Please request a new one.");
        }

        // Reset password & clear OTP
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);

        return ResponseEntity.ok("Password reset successfully. You can now login.");
    }

    // ── Legacy reset-password endpoint (kept for compatibility) ───────────
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);
        if (user == null || user.getResetToken() == null || !user.getResetToken().equals(request.getToken())) {
            return ResponseEntity.badRequest().body("Error: Invalid token or email!");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setResetToken(null);
        userRepository.save(user);
        return ResponseEntity.ok("Password has been reset successfully.");
    }
}
