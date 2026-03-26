# SpeedGuard - Adaptive Smart Speed & Violation Management System

This project is a comprehensive solution for monitoring vehicle speeds, detecting violations, and managing merit points for drivers. It was developed for the TICT4262 Cloud Application Development course.

## How to Run Locally

### Using Docker (Preferred)
1. Build the image:
   ```bash
   docker build -t <your-dockerhub-username>/sguard:v1 .
   ```
2. Run the container:
   ```bash
   docker run -p 8080:8080 <your-dockerhub-username>/sguard:v1
   ```
3. Access the app at `http://localhost:8080`.

### Manual Setup
1. **Backend**:
   - `cd Backend`
   - `npm install`
   - `npm start` (Runs on port 8080)
2. **Frontend**:
   - `cd Frontend`
   - `npm install`
   - `npm run dev`
