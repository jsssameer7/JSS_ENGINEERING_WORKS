package com.jss.portal.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.datasource.DriverManagerDataSource;

import javax.sql.DataSource;
import java.sql.Connection;

@Configuration
public class DataSourceConfig {

    @Bean
    public DataSource dataSource() {
        // Try MySQL first
        DriverManagerDataSource mysqlDataSource = new DriverManagerDataSource();
        mysqlDataSource.setDriverClassName("com.mysql.cj.jdbc.Driver");
        
        // Connect to MySQL with auto-database creation
        mysqlDataSource.setUrl("jdbc:mysql://localhost:3306/jss_engineering?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC");
        mysqlDataSource.setUsername("root");
        mysqlDataSource.setPassword("root"); // Try common default password

        try {
            // Test connection to verify credentials and availability
            System.out.println("Attempting to connect to MySQL database on localhost:3306...");
            Connection conn = mysqlDataSource.getConnection();
            conn.close();
            System.out.println("Successfully connected to MySQL database (jss_engineering)!");
            return mysqlDataSource;
        } catch (Exception e) {
            System.err.println("MySQL Connection Failed (or credentials incorrect). Error: " + e.getMessage());
            
            // Try with empty password as a fallback
            try {
                DriverManagerDataSource mysqlEmptyPass = new DriverManagerDataSource();
                mysqlEmptyPass.setDriverClassName("com.mysql.cj.jdbc.Driver");
                mysqlEmptyPass.setUrl("jdbc:mysql://localhost:3306/jss_engineering?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC");
                mysqlEmptyPass.setUsername("root");
                mysqlEmptyPass.setPassword("");
                
                Connection conn = mysqlEmptyPass.getConnection();
                conn.close();
                System.out.println("Successfully connected to MySQL database with empty password!");
                return mysqlEmptyPass;
            } catch (Exception err) {
                System.err.println("MySQL empty password connection failed. Starting H2 In-Memory Fail-Safe Mode...");
            }
            
            // Fall back to in-memory H2 database
            DriverManagerDataSource h2DataSource = new DriverManagerDataSource();
            h2DataSource.setDriverClassName("org.h2.Driver");
            h2DataSource.setUrl("jdbc:h2:mem:jss_engineering;DB_CLOSE_DELAY=-1;MODE=MySQL");
            h2DataSource.setUsername("sa");
            h2DataSource.setPassword("");
            System.out.println("Successfully initialized In-Memory H2 Database Fail-Safe Fallback!");
            return h2DataSource;
        }
    }
}
