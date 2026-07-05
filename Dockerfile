# Build stage: Use official Maven image to compile the Java project
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# Copy pom.xml and compile dependencies first (for faster rebuilds)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build the final jar package
COPY src ./src
RUN mvn clean package -DskipTests

# Run stage: Use a lightweight JRE image for deployment
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Copy the generated JAR from the build stage
COPY --from=build /app/target/*.jar app.jar

# Expose the application port (configured as 3000 in application.properties)
EXPOSE 3000

# Start the Spring Boot application
ENTRYPOINT ["java", "-jar", "app.jar"]
