package com.jss.portal.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "weld_logs")
public class WeldLog {
    @Id
    private String id;
    private String workerId;
    private String projectId;
    private String date;
    private int inchesWelded;
    private String process;
    private boolean ppeChecked;
    private boolean gasChecked;
    private boolean qualityChecked;
    private String notes;

    // Constructors
    public WeldLog() {}
    public WeldLog(String id, String workerId, String projectId, String date, int inchesWelded, String process, boolean ppeChecked, boolean gasChecked, boolean qualityChecked, String notes) {
        this.id = id;
        this.workerId = workerId;
        this.projectId = projectId;
        this.date = date;
        this.inchesWelded = inchesWelded;
        this.process = process;
        this.ppeChecked = ppeChecked;
        this.gasChecked = gasChecked;
        this.qualityChecked = qualityChecked;
        this.notes = notes;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getWorkerId() { return workerId; }
    public void setWorkerId(String workerId) { this.workerId = workerId; }

    public String getProjectId() { return projectId; }
    public void setProjectId(String projectId) { this.projectId = projectId; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public int getInchesWelded() { return inchesWelded; }
    public void setInchesWelded(int inchesWelded) { this.inchesWelded = inchesWelded; }

    public String getProcess() { return process; }
    public void setProcess(String process) { this.process = process; }

    public boolean isPpeChecked() { return ppeChecked; }
    public void setPpeChecked(boolean ppeChecked) { this.ppeChecked = ppeChecked; }

    public boolean isGasChecked() { return gasChecked; }
    public void setGasChecked(boolean gasChecked) { this.gasChecked = gasChecked; }

    public boolean isQualityChecked() { return qualityChecked; }
    public void setQualityChecked(boolean qualityChecked) { this.qualityChecked = qualityChecked; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
