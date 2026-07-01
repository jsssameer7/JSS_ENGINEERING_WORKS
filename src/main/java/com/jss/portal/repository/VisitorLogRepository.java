package com.jss.portal.repository;

import com.jss.portal.model.VisitorLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface VisitorLogRepository extends JpaRepository<VisitorLog, String> {
    List<VisitorLog> findBySignupUser(String signupUser);
}
