package com.jss.portal.controller;

import com.jss.portal.model.VisitorLog;
import com.jss.portal.repository.VisitorLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/visitors")
@CrossOrigin(origins = "*")
public class VisitorController {

    @Autowired
    private VisitorLogRepository visitorLogRepository;

    @GetMapping
    public List<VisitorLog> getAllVisitors() {
        return visitorLogRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<VisitorLog> addVisitorRequest(@RequestBody VisitorLog visitorLog) {
        visitorLog.setId("vis_" + System.currentTimeMillis());
        visitorLog.setStatus("Pending");
        VisitorLog savedLog = visitorLogRepository.save(visitorLog);
        return ResponseEntity.ok(savedLog);
    }

    @PutMapping("/status")
    public ResponseEntity<VisitorLog> updateVisitorStatus(@RequestBody Map<String, String> body) {
        String requestId = body.get("requestId");
        String status = body.get("status");

        Optional<VisitorLog> logOpt = visitorLogRepository.findById(requestId);
        if (logOpt.isPresent()) {
            VisitorLog log = logOpt.get();
            log.setStatus(status);
            visitorLogRepository.save(log);
            return ResponseEntity.ok(log);
        }
        return ResponseEntity.notFound().build();
    }
}
