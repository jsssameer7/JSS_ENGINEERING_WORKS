package com.jss.portal.controller;

import com.jss.portal.model.Leave;
import com.jss.portal.model.Worker;
import com.jss.portal.repository.LeaveRepository;
import com.jss.portal.repository.WorkerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/leaves")
@CrossOrigin(origins = "*")
public class LeaveController {

    @Autowired
    private LeaveRepository leaveRepository;

    @Autowired
    private WorkerRepository workerRepository;

    @GetMapping
    public List<Leave> getLeaves(@RequestParam(value = "workerId", required = false) String workerId) {
        if (workerId != null && !workerId.isEmpty()) {
            return leaveRepository.findByWorkerId(workerId);
        }
        return leaveRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<Leave> addLeaveRequest(@RequestBody Leave leave) {
        leave.setId("leave_" + System.currentTimeMillis());
        leave.setStatus("Pending");
        Leave savedLeave = leaveRepository.save(leave);
        return ResponseEntity.ok(savedLeave);
    }

    @PutMapping("/status")
    public ResponseEntity<Leave> updateLeaveStatus(@RequestBody Map<String, String> body) {
        String leaveId = body.get("leaveId");
        String status = body.get("status");

        Optional<Leave> leaveOpt = leaveRepository.findById(leaveId);
        if (leaveOpt.isPresent()) {
            Leave leave = leaveOpt.get();
            leave.setStatus(status);
            leaveRepository.save(leave);

            // If approved, update worker status
            if (status.equals("Approved")) {
                Optional<Worker> workerOpt = workerRepository.findById(leave.getWorkerId());
                if (workerOpt.isPresent()) {
                    Worker worker = workerOpt.get();
                    worker.setStatus("On Leave");
                    workerRepository.save(worker);
                }
            }
            return ResponseEntity.ok(leave);
        }
        return ResponseEntity.notFound().build();
    }
}
