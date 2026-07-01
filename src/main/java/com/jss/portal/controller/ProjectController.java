package com.jss.portal.controller;

import com.jss.portal.model.Project;
import com.jss.portal.model.Worker;
import com.jss.portal.repository.ProjectRepository;
import com.jss.portal.repository.WorkerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = "*")
public class ProjectController {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private WorkerRepository workerRepository;

    @GetMapping
    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<Project> addProject(@RequestBody Project project) {
        project.setId("proj_" + System.currentTimeMillis());
        project.setProgress(0);
        project.setStatus("Not Started");

        Project savedProject = projectRepository.save(project);

        // Update assigned worker active project
        String workerId = project.getWorkerId();
        if (workerId != null && !workerId.equals("unassigned") && !workerId.isEmpty()) {
            Optional<Worker> workerOpt = workerRepository.findById(workerId);
            if (workerOpt.isPresent()) {
                Worker worker = workerOpt.get();
                worker.setActiveProject(project.getName());
                if (worker.getStatus().equals("Off-Duty")) {
                    worker.setStatus("Active");
                }
                workerRepository.save(worker);
            }
        }
        return ResponseEntity.ok(savedProject);
    }

    @PutMapping("/progress")
    public ResponseEntity<Project> updateProjectProgress(@RequestBody Map<String, Object> body) {
        String projectId = (String) body.get("projectId");
        int progress = Integer.parseInt(body.get("progress").toString());
        String status = (String) body.get("status");

        Optional<Project> projectOpt = projectRepository.findById(projectId);
        if (projectOpt.isPresent()) {
            Project project = projectOpt.get();
            project.setProgress(progress);
            project.setStatus(status);
            projectRepository.save(project);

            // If completed, release the worker
            if (status.equals("Completed") && project.getWorkerId() != null) {
                Optional<Worker> workerOpt = workerRepository.findById(project.getWorkerId());
                if (workerOpt.isPresent()) {
                    Worker worker = workerOpt.get();
                    worker.setActiveProject("None");
                    workerRepository.save(worker);
                }
            }
            return ResponseEntity.ok(project);
        }
        return ResponseEntity.notFound().build();
    }
}
