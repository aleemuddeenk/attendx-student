package com.attendx.student.service;

import org.springframework.stereotype.Service;

@Service
public class EmailService {
    public void sendResetEmail(String toEmail, String resetToken) {
        // Since no SMTP details were provided, we mock the email dispatch
        System.out.println("=================================================");
        System.out.println("MOCK EMAIL SENT TO: " + toEmail);
        System.out.println("Your password reset token is: " + resetToken);
        System.out.println("=================================================");
    }
}
