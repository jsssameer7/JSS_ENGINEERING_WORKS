package com.jss.portal.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "projects")
public class Project {
    @Id
    private String id;
    private String name;
    private String workerId;
    private String weldType;
    private int progress;
    private String status;
    private String startDate;
    private String description;

    // Constructors
    public Project() {}
    public Project(String id, String name, String workerId, String weldType, int progress, String status, String startDate, String description) {
        this.id = id;
        this.name = name;
        this.workerId = workerId;
        this.weldType = weldType;
        this.progress = progress;
        this.status = status;
        this.startDate = startDate;
        this.description = description;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getWorkerId() { return workerId; }
    public void setWorkerId(String workerId) { this.workerId = workerId; }

    public String getWeldType() { return weldType; }
    public void setWeldType(String weldType) { this.weldType = weldType; }

    public int getProgress() { return progress; }
    public void setProgress(int progress) { this.progress = progress; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getStartDate() { return startDate; }
    public void setStartDate(String startDate) { this.startDate = startDate; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
