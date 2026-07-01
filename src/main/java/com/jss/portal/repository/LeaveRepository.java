package com.jss.portal.repository;

import com.jss.portal.model.Leave;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LeaveRepository extends JpaRepository<Leave, String> {
    List<Leave> findByWorkerId(String workerId);
}
