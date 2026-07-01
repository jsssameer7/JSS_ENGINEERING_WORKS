package com.jss.portal.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "visitor_logs")
public class VisitorLog {
    @Id
    private String id;
    private String name;
    private String org;
    private String dateTime;
    private String purpose;
    private String status;
    private String signupUser;

    // Constructors
    public VisitorLog() {}
    public VisitorLog(String id, String name, String org, String dateTime, String purpose, String status, String signupUser) {
        this.id = id;
        this.name = name;
        this.org = org;
        this.dateTime = dateTime;
        this.purpose = purpose;
        this.status = status;
        this.signupUser = signupUser;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getOrg() { return org; }
    public void setOrg(String org) { this.org = org; }

    public String getDateTime() { return dateTime; }
    public void setDateTime(String dateTime) { this.dateTime = dateTime; }

    public String getPurpose() { return purpose; }
    public void setPurpose(String purpose) { this.purpose = purpose; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getSignupUser() { return signupUser; }
    public void setSignupUser(String signupUser) { this.signupUser = signupUser; }
}
