package com.attendx.student.security;

import com.attendx.student.model.User;
import com.attendx.student.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String regNo) throws UsernameNotFoundException {
        User user = userRepository.findByRegNo(regNo)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with Registration Number : " + regNo));

        return new org.springframework.security.core.userdetails.User(user.getRegNo(), user.getPassword(), new ArrayList<>());
    }
}
