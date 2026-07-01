package com.jss.portal.controller;

import com.jss.portal.model.User;
import com.jss.portal.model.Worker;
import com.jss.portal.repository.UserRepository;
import com.jss.portal.repository.WorkerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/workers")
@CrossOrigin(origins = "*")
public class WorkerController {

    @Autowired
    private WorkerRepository workerRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public List<Worker> getAllWorkers() {
        return workerRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<Worker> addWorker(@RequestBody Worker worker) {
        worker.setId("worker_" + System.currentTimeMillis());
        worker.setStatus("Off-Duty");
        worker.setActiveProject("None");
        worker.setPresentDays(15);
        worker.setAbsentDays(1);

        Worker savedWorker = workerRepository.save(worker);

        // Auto create corresponding user login
        User user = new User(
            worker.getUsername() != null ? worker.getUsername() : worker.getId(),
            "worker123", // Default seed password
            "worker",
            worker.getName()
        );
        userRepository.save(user);

        return ResponseEntity.ok(savedWorker);
    }

    @PutMapping("/status")
    public ResponseEntity<Worker> updateWorkerStatus(@RequestBody Map<String, String> body) {
        String workerId = body.get("workerId");
        String status = body.get("status");

        Optional<Worker> workerOpt = workerRepository.findById(workerId);
        if (workerOpt.isPresent()) {
            Worker worker = workerOpt.get();
            worker.setStatus(status);
            workerRepository.save(worker);
            return ResponseEntity.ok(worker);
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/profile")
    public ResponseEntity<Worker> updateWorkerProfile(@RequestBody Map<String, String> body) {
        String workerId = body.get("workerId");
        String oldUsername = body.get("oldUsername");
        String newUsername = body.get("username");
        String newName = body.get("name");
        String newCert = body.get("cert");

        Optional<Worker> workerOpt = workerRepository.findById(workerId);
        if (workerOpt.isPresent()) {
            Worker worker = workerOpt.get();
            worker.setName(newName);
            worker.setCert(newCert);
            worker.setUsername(newUsername);
            workerRepository.save(worker);

            // Sync user credentials
            Optional<User> userOpt = userRepository.findByUsername(oldUsername);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                user.setUsername(newUsername);
                user.setName(newName);
                userRepository.save(user);
            }
            return ResponseEntity.ok(worker);
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/password")
    public ResponseEntity<Map<String, Object>> resetPassword(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");

        Map<String, Object> response = new HashMap<>();
        Optional<User> userOpt = userRepository.findByUsername(username);
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setPassword(password);
            userRepository.save(user);
            response.put("success", true);
            return ResponseEntity.ok(response);
        }
        
        response.put("success", false);
        response.put("message", "User not found");
        return ResponseEntity.ok(response);
    }
}
