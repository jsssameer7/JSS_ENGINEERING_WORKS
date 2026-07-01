package com.jss.portal.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "workers")
public class Worker {
    @Id
    private String id;
    private String username;
    private String name;
    private String cert;
    private String status;
    private String activeProject;
    private int presentDays;
    private int absentDays;

    // Constructors
    public Worker() {}
    public Worker(String id, String username, String name, String cert, String status, String activeProject, int presentDays, int absentDays) {
        this.id = id;
        this.username = username;
        this.name = name;
        this.cert = cert;
        this.status = status;
        this.activeProject = activeProject;
        this.presentDays = presentDays;
        this.absentDays = absentDays;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCert() { return cert; }
    public void setCert(String cert) { this.cert = cert; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getActiveProject() { return activeProject; }
    public void setActiveProject(String activeProject) { this.activeProject = activeProject; }

    public int getPresentDays() { return presentDays; }
    public void setPresentDays(int presentDays) { this.presentDays = presentDays; }

    public int getAbsentDays() { return absentDays; }
    public void setAbsentDays(int absentDays) { this.absentDays = absentDays; }
}
