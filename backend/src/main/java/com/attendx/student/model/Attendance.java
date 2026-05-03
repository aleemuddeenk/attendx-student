package com.attendx.student.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "attendances")
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, name = "scan_data")
    private String scanData;

    @Column(nullable = false, name = "scan_time")
    private LocalDateTime scanTime;

    public Attendance() {}

    public Attendance(User user, String scanData, LocalDateTime scanTime) {
        this.user = user;
        this.scanData = scanData;
        this.scanTime = scanTime;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getScanData() { return scanData; }
    public void setScanData(String scanData) { this.scanData = scanData; }
    public LocalDateTime getScanTime() { return scanTime; }
    public void setScanTime(LocalDateTime scanTime) { this.scanTime = scanTime; }
}
