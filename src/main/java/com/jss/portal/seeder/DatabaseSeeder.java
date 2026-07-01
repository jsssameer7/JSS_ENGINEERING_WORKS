package com.jss.portal.seeder;

import com.jss.portal.model.*;
import com.jss.portal.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WorkerRepository workerRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private VisitorLogRepository visitorLogRepository;

    @Autowired
    private LeaveRepository leaveRepository;

    @Override
    public void run(String... args) throws Exception {
        seedUsers();
        seedWorkers();
        seedProjects();
        seedVisitorLogs();
        seedLeaves();
    }

    private void seedUsers() {
        if (userRepository.count() == 0) {
            userRepository.saveAll(Arrays.asList(
                new User("admin", "admin123", "admin", "JSS Administrator"),
                new User("worker1", "worker123", "worker", "Amit Kumar"),
                new User("worker2", "worker123", "worker", "Rajesh Sharma"),
                new User("worker3", "worker123", "worker", "Vikram Singh"),
                new User("visitor1", "visitor123", "visitor", "Visitor Demo Account")
            ));
            System.out.println("Seeded initial users database.");
        }
    }

    private void seedWorkers() {
        if (workerRepository.count() == 0) {
            workerRepository.saveAll(Arrays.asList(
                new Worker("worker1", "worker1", "Amit Kumar", "AWS D1.1 Structural Steel", "Active", "Structural Framework - Metro", 24, 2),
                new Worker("worker2", "worker2", "Rajesh Sharma", "ASME Section IX High Pressure Pipe", "On Break", "HP Gas Pipeline Section D", 20, 3),
                new Worker("worker3", "worker3", "Vikram Singh", "API 1104 Pipeline Welding", "Off-Duty", "None", 18, 1)
            ));
            System.out.println("Seeded initial workers registry.");
        }
    }

    private void seedProjects() {
        if (projectRepository.count() == 0) {
            projectRepository.saveAll(Arrays.asList(
                new Project("proj1", "Structural Framework - Metro", "worker1", "MIG / FCAW", 75, "In Progress", "2026-06-01", "Welding of support columns, rafters and base braces for Metro line expansion support."),
                new Project("proj2", "HP Gas Pipeline Section D", "worker2", "TIG (Root) + SMAW (Fill)", 30, "In Progress", "2026-06-15", "Welding of high pressure pipelines requiring radiographic inspection."),
                new Project("proj3", "Stainless Steel Vessel V-201", "worker3", "TIG (GTAW)", 100, "Completed", "2026-05-10", "Fabrication of chemical storage container.")
            ));
            System.out.println("Seeded initial projects list.");
        }
    }

    private void seedVisitorLogs() {
        if (visitorLogRepository.count() == 0) {
            visitorLogRepository.saveAll(Arrays.asList(
                new VisitorLog("vis1", "Suresh Gupta", "L&T Construction", "2026-07-02T10:00", "WPQR Review and Fabrication Progress Audit", "Pending", "visitor1"),
                new VisitorLog("vis2", "Dr. John Doe", "Safety Inspecto Ltd", "2026-06-25T14:00", "Scheduled Environmental & Safety Inspection", "Approved", "visitor1")
            ));
            System.out.println("Seeded initial visitor safety logs.");
        }
    }

    private void seedLeaves() {
        if (leaveRepository.count() == 0) {
            leaveRepository.saveAll(Arrays.asList(
                new Leave("leave1", "worker2", "Rajesh Sharma", "2026-07-05", "2026-07-08", "Casual Leave", "Family function back home.", "Pending")
            ));
            System.out.println("Seeded initial leave requests registry.");
        }
    }
}
