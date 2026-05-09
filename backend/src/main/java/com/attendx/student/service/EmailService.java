package com.attendx.student.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendOtpEmail(String toEmail, String otp) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("ATTENDX – Your Password Reset OTP");

            String htmlContent =
                "<!DOCTYPE html>" +
                "<html><body style='font-family:Arial,sans-serif;background:#f3f4f6;padding:20px;margin:0'>" +
                "<div style='max-width:480px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.1)'>" +
                "  <div style='background:#1D4ED8;padding:28px 24px;text-align:center'>" +
                "    <h1 style='color:#ffffff;margin:0;font-size:24px;letter-spacing:1px'>ATTENDX</h1>" +
                "    <p style='color:#BFDBFE;margin:6px 0 0;font-size:13px'>Rajalakshmi Institute of Technology</p>" +
                "  </div>" +
                "  <div style='padding:32px 24px;text-align:center'>" +
                "    <h2 style='color:#0A192F;margin:0 0 8px;font-size:20px'>Password Reset OTP</h2>" +
                "    <p style='color:#64748B;font-size:14px;margin:0 0 28px'>Use the OTP below to reset your password. It expires in <strong>10 minutes</strong>.</p>" +
                "    <div style='background:#EFF6FF;border:2px dashed #1D4ED8;border-radius:10px;padding:20px 0;margin:0 auto 24px;max-width:200px'>" +
                "      <span style='font-size:36px;font-weight:800;letter-spacing:10px;color:#1D4ED8'>" + otp + "</span>" +
                "    </div>" +
                "    <p style='color:#94A3B8;font-size:12px;margin:0'>If you did not request this, please ignore this email.<br>Your password will remain unchanged.</p>" +
                "  </div>" +
                "  <div style='background:#F8FAFC;padding:14px 24px;text-align:center;border-top:1px solid #E2E8F0'>" +
                "    <p style='color:#94A3B8;font-size:11px;margin:0'>© 2024 ATTENDX · RIT Chennai</p>" +
                "  </div>" +
                "</div></body></html>";

            helper.setText(htmlContent, true);
            mailSender.send(message);

            System.out.println("OTP email sent successfully to: " + toEmail);

        } catch (MessagingException e) {
            System.err.println("Failed to send OTP email to " + toEmail + ": " + e.getMessage());
            throw new RuntimeException("Failed to send OTP email: " + e.getMessage());
        }
    }

    // Keep old method for backward compatibility
    public void sendResetEmail(String toEmail, String resetToken) {
        sendOtpEmail(toEmail, resetToken);
    }
}
