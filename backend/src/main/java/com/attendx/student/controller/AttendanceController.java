package com.attendx.student.controller;

import com.attendx.student.dto.AttendanceRequest;
import com.attendx.student.model.Attendance;
import com.attendx.student.model.User;
import com.attendx.student.repository.AttendanceRepository;
import com.attendx.student.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    @Autowired
    private AttendanceRepository attendanceRepository;
    
    @Autowired
    private UserRepository userRepository;

    @PostMapping("/scan")
    public ResponseEntity<?> recordAttendance(@RequestBody AttendanceRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String regNo = auth.getName();
        
        User user = userRepository.findByRegNo(regNo).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body("Error: User not found!");
        }

        // Mock validating specific static payload.
        if(request.getQrData() == null || request.getQrData().trim().isEmpty()) {
             return ResponseEntity.badRequest().body("Error: Invalid QR payload.");
        }
        
        Attendance attendance = new Attendance(user, request.getQrData(), LocalDateTime.now());
        attendanceRepository.save(attendance);
        
        return ResponseEntity.ok("Attendance marked successfully.");
    }
}
