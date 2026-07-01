package com.jss.portal.controller;

import com.jss.portal.model.User;
import com.jss.portal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");

        Map<String, Object> response = new HashMap<>();
        Optional<User> userOpt = userRepository.findByUsername(username);

        if (userOpt.isPresent() && userOpt.get().getPassword().equals(password)) {
            User user = userOpt.get();
            response.put("success", true);
            response.put("username", user.getUsername());
            response.put("role", user.getRole());
            response.put("name", user.getName());
            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            response.put("message", "Incorrect username or password");
            return ResponseEntity.ok(response); // Return 200 with success=false for simple XHR processing
        }
    }

    @PostMapping("/register-visitor")
    public ResponseEntity<Map<String, Object>> registerVisitor(@RequestBody Map<String, String> regData) {
        String name = regData.get("name");
        String username = regData.get("username");
        String password = regData.get("password");

        Map<String, Object> response = new HashMap<>();
        
        if (userRepository.findByUsername(username).isPresent()) {
            response.put("success", false);
            response.put("message", "Username already exists");
            return ResponseEntity.ok(response);
        }

        User visitor = new User(username, password, "visitor", name);
        userRepository.save(visitor);
        
        response.put("success", true);
        response.put("username", username);
        response.put("role", "visitor");
        response.put("name", name);
        return ResponseEntity.ok(response);
    }
}
