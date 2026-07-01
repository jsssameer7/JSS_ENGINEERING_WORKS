package com.jss.portal.repository;

import com.jss.portal.model.Worker;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface WorkerRepository extends JpaRepository<Worker, String> {
    Optional<Worker> findByUsername(String username);
}
