package com.attendx.student.dto;

import jakarta.validation.constraints.NotBlank;

public class LoginRequest {
    @NotBlank
    private String regNo;

    @NotBlank
    private String password;

    public String getRegNo() { return regNo; }
    public void setRegNo(String regNo) { this.regNo = regNo; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
