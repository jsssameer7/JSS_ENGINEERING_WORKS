package com.jss.portal.controller;

import com.jss.portal.model.Project;
import com.jss.portal.model.WeldLog;
import com.jss.portal.repository.ProjectRepository;
import com.jss.portal.repository.WeldLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/weldlogs")
@CrossOrigin(origins = "*")
public class WeldLogController {

    @Autowired
    private WeldLogRepository weldLogRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @GetMapping
    public List<WeldLog> getAllWeldLogs() {
        return weldLogRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<WeldLog> addWeldLog(@RequestBody WeldLog weldLog) {
        weldLog.setId("log_" + System.currentTimeMillis());
        weldLog.setDate(new SimpleDateFormat("yyyy-MM-dd").format(new Date()));

        WeldLog savedLog = weldLogRepository.save(weldLog);

        // Auto progress increment for the project
        String projectId = weldLog.getProjectId();
        if (projectId != null && !projectId.isEmpty()) {
            Optional<Project> projectOpt = projectRepository.findById(projectId);
            if (projectOpt.isPresent()) {
                Project project = projectOpt.get();
                int nextProgress = Math.min(project.getProgress() + 10, 95);
                project.setProgress(nextProgress);
                project.setStatus("In Progress");
                projectRepository.save(project);
            }
        }
        return ResponseEntity.ok(savedLog);
    }
}
