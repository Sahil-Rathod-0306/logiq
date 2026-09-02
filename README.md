# 🛡️ LogIQ — Intelligent Log Monitoring & Anomaly Detection

LogIQ is a full-stack **Security Operations and Log Monitoring Platform** designed to ingest, parse, analyze, and monitor security logs.

The platform helps security teams identify **anomalous behavior, suspicious events, repeated failures, unusual response times, high-severity incidents, and potential network threats** through automated detection and AI-powered analysis.

---

## 🚀 Features

### 📂 Log File Ingestion

Upload security and application log files directly through the web application.

Supported formats:

* `.json`
* `.csv`
* `.log`
* `.txt`

The uploaded files are processed by the backend and converted into structured log events for analysis.

### 🔍 Intelligent Anomaly Detection

LogIQ analyzes incoming logs using multiple behavioral signals, including:

* Request frequency analysis
* Repeated authentication failures
* HTTP status codes
* Event severity
* Response-time anomalies
* Suspicious activity patterns
* Source/IP behavior
* Historical activity comparison

The system generates an anomaly score to help identify potentially malicious or abnormal activity.

### 🚨 Incident Detection

Suspicious events can be evaluated against configured thresholds to identify potential security incidents.

The system can classify incidents according to severity:

* `LOW`
* `MEDIUM`
* `HIGH`
* `CRITICAL`

### 🤖 AI Threat Analysis

High-severity security events can be sent to the AI analysis layer to generate:

* Threat explanations
* Security insights
* Possible attack scenarios
* Recommended actions
* Incident summaries

> **AI configuration:** Add the environment variable required by the AI provider used by your backend. For example, if your implementation uses OpenAI or Gemini, add the corresponding API key variable to `backend/.env`. Do not commit API keys to GitHub.

### 📊 Interactive Dashboard

The frontend provides an interactive security dashboard for monitoring:

* Total logs
* Anomalies
* Security incidents
* Severity distribution
* Event statistics
* Recent activity
* Security notifications

### 🔐 JWT Authentication

LogIQ uses JWT-based authentication to protect sensitive API endpoints.

Users must authenticate before accessing protected functionality.

### 👥 Role-Based Access Control

LogIQ supports three user roles:

| Role        | Permissions                                                      |
| ----------- | ---------------------------------------------------------------- |
| **ADMIN**   | Full system access, log uploads, user management and AI analysis |
| **ANALYST** | View logs, investigate anomalies and analyze incidents           |
| **VIEWER**  | Read-only access to basic statistics and monitoring information  |

---

# 🏗️ System Architecture

```text
                    ┌──────────────────────┐
                    │      LogIQ Web UI    │
                    │ Next.js + React + TS  │
                    └──────────┬───────────┘
                               │
                               │ REST API
                               ▼
                    ┌──────────────────────┐
                    │   Express.js API     │
                    │      Backend         │
                    └──────────┬───────────┘
                               │
                 ┌─────────────┼─────────────┐
                 │             │             │
                 ▼             ▼             ▼
          ┌────────────┐ ┌────────────┐ ┌──────────────┐
          │ Log Parser │ │ Detection  │ │ Notification │
          │ & Ingestion│ │   Engine   │ │   System     │
          └────────────┘ └─────┬──────┘ └──────────────┘
                               │
                               ▼
                       ┌───────────────┐
                       │ AI Analysis   │
                       │    Layer      │
                       └───────┬───────┘
                               │
                               ▼
                       ┌───────────────┐
                       │    MongoDB    │
                       │   Database    │
                       └───────────────┘
```

---

# 🔄 Log Analysis Pipeline

LogIQ processes uploaded logs through the following pipeline:

```text
Upload Log File
       │
       ▼
File Validation
       │
       ▼
Log Parsing
       │
       ▼
Data Validation
       │
       ▼
Store / Process Log Events
       │
       ▼
Frequency Analysis
       │
       ├── Current Activity
       ├── Historical Activity
       └── Source Frequency
       │
       ▼
Repeated Failure Detection
       │
       ├── Same IP
       ├── Same Endpoint
       ├── Multiple 401/403
       └── Short Time Window
       │
       ▼
Latency Anomaly Detection
       │
       ├── Average Response Time
       ├── Standard Deviation
       └── Z-Score
       │
       ▼
Behavioral Analysis
       │
       ▼
Anomaly Score
       │
       ▼
Incident Detection
       │
       ▼
AI Threat Analysis
       │
       ▼
Dashboard / Notifications
```

---

# 🧠 Detection Engine

The anomaly detection system combines multiple signals rather than relying on a single rule.

### 1. Frequency Analysis

The system compares current activity with historical activity.

For example:

```text
Previous 30 minutes → Normal request frequency
Current 1 minute    → Extremely high request frequency
                         ↓
                  Possible anomaly
```

### 2. Repeated Failure Detection

The system can identify patterns such as:

```text
Same IP
   ↓
Same endpoint
   ↓
Multiple 401 / 403 responses
   ↓
Short period of time
   ↓
Possible brute-force / suspicious activity
```

### 3. Response-Time Anomaly

Unusual latency can also indicate abnormal system behavior.

The system can compare the current response time against historical response times using statistical analysis such as a Z-score.

```text
Normal response time
        ↓
Historical mean + deviation
        ↓
Current response time
        ↓
Statistical comparison
        ↓
Latency anomaly score
```

### 4. Severity Analysis

Security events are evaluated based on their severity.

Example:

```text
LOW       → 1
MEDIUM    → 2
HIGH      → 3
CRITICAL  → 4
```

### 5. Final Anomaly Score

Multiple signals contribute to the final anomaly score.

```text
Frequency Score
       +
Status Score
       +
Severity Score
       +
Behavioral Score
       +
Latency Anomaly
       ↓
Final Anomaly Score
```

The resulting score can be used to determine whether an event should be treated as normal, suspicious, or an incident.

---

# 🛠️ Technology Stack

## Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS

## Backend

* Node.js
* Express.js
* REST API
* JWT Authentication

## Database

* MongoDB
* Mongoose

## Security & Analysis

* JWT
* Role-Based Access Control
* Anomaly Detection
* Incident Detection
* AI-powered Threat Analysis
* Notification System

---

# 📁 Project Structure

```text
logiq/
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── services/
│   ├── hooks/
│   ├── public/
│   ├── package.json
│   └── .env.local
│
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── uploads/
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── README.md
└── .gitignore
```

> The exact folder structure may vary depending on the current implementation.

---

# ⚙️ Local Installation

## Prerequisites

Make sure the following are installed:

* Node.js
* npm
* MongoDB
* Git

Check your versions:

```bash
node --version
npm --version
git --version
```

---

# 📥 Clone the Repository

```bash
git clone https://github.com/Sahil-Rathod-0306/logiq.git

cd logiq
```

---

# 🔧 Backend Setup

Navigate to the backend:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file:

```env
PORT=5000

MONGODB_URI=mongodb://localhost:27017/logiq

NODE_ENV=development

FRONTEND_URL=http://localhost:3000

JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRES_IN=1d

ANOMALY_THRESHOLD=50
INCIDENT_THRESHOLD=60

NOTIFICATION_MIN_SEVERITY=HIGH
NOTIFICATION_MAX_RETRIES=3

NOTIFICATION_EMAIL_ENABLED=false

SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=

# AI provider configuration
# Add the API key variable required by your AI implementation.
# Example:
# OPENAI_API_KEY=your_api_key
# or
# GEMINI_API_KEY=your_api_key
```

### Important

Only add the AI variable that your backend actually uses.

For example, if your code contains:

```javascript
process.env.OPENAI_API_KEY
```

then configure:

```env
OPENAI_API_KEY=your_api_key
```

If it contains:

```javascript
process.env.GEMINI_API_KEY
```

then configure:

```env
GEMINI_API_KEY=your_api_key
```

**Never commit `.env` files or API keys to GitHub.**

Start the backend:

```bash
npm run dev
```

The backend should run on:

```text
http://localhost:5000
```

---

# 🎨 Frontend Setup

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create:

```text
.env.local
```

Add:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

# 🔑 Authentication Flow

The application uses JWT authentication.

```text
User
 │
 ▼
Register / Login
 │
 ▼
Backend Authentication
 │
 ▼
JWT Token
 │
 ▼
Frontend stores authentication state
 │
 ▼
JWT sent with protected API requests
 │
 ▼
Authentication Middleware
 │
 ▼
Role-Based Authorization
 │
 ▼
Protected Resource
```

Protected endpoints require authentication.

Example:

```http
Authorization: Bearer <JWT_TOKEN>
```

---

# 📂 Uploading a Log File

After logging into LogIQ:

1. Open the **Log Upload** page.
2. Select a `.json`, `.csv`, `.log`, or `.txt` file.
3. Upload the file.
4. The frontend sends the file to the backend.
5. The backend validates the file.
6. Logs are parsed.
7. Log events are analyzed.
8. Anomaly detection is performed.
9. Potential incidents are generated.
10. Results become available in the dashboard.

Example flow:

```text
Browser
   │
   │ Upload File
   ▼
Next.js Frontend
   │
   │ multipart/form-data
   ▼
Express API
   │
   ▼
File Parser
   │
   ▼
Log Model
   │
   ▼
Anomaly Detection
   │
   ▼
Incident Detection
   │
   ▼
AI Analysis
   │
   ▼
Dashboard
```

---

# 📄 Example JSON Log

```json
{
  "timestamp": "2026-09-02T10:30:00Z",
  "source": "192.168.1.10",
  "eventType": "LOGIN_ATTEMPT",
  "severity": "HIGH",
  "status": 401,
  "responseTime": 125,
  "endpoint": "/api/login",
  "message": "Authentication failed"
}
```

---

# 📊 Example CSV Log

```csv
timestamp,source,eventType,severity,status,responseTime,endpoint,message
2026-09-02T10:30:00Z,192.168.1.10,LOGIN_ATTEMPT,HIGH,401,125,/api/login,Authentication failed
```

---

# 🧪 Testing

## Start MongoDB

Make sure MongoDB is running locally or configure a MongoDB Atlas connection.

Example:

```env
MONGODB_URI=mongodb://localhost:27017/logiq
```

## Start Backend

```bash
cd backend
npm run dev
```

## Start Frontend

```bash
cd frontend
npm run dev
```

Then open:

```text
http://localhost:3000
```

### Recommended Testing Flow

```text
1. Register user
        ↓
2. Login
        ↓
3. Verify JWT authentication
        ↓
4. Assign ADMIN role
        ↓
5. Open Log Upload
        ↓
6. Upload sample log
        ↓
7. Check processed logs
        ↓
8. Check anomaly score
        ↓
9. Check incidents
        ↓
10. Check AI analysis
        ↓
11. Check notifications
        ↓
12. Check dashboard
```

---

# 🔐 Security Considerations

LogIQ follows several security practices:

* JWT-based authentication
* Role-based authorization
* Protected API endpoints
* Environment variables for secrets
* File validation
* Server-side validation
* MongoDB data persistence
* Restricted administrative operations
* Configurable anomaly and incident thresholds

### Never commit secrets

Add the following to `.gitignore`:

```gitignore
node_modules/
.env
.env.local
.next/
uploads/
logs/
```

---

# 🌐 Environment Variables

## Backend

| Variable                     | Description                   | Example                           |
| ---------------------------- | ----------------------------- | --------------------------------- |
| `PORT`                       | Backend server port           | `5000`                            |
| `MONGODB_URI`                | MongoDB connection string     | `mongodb://localhost:27017/logiq` |
| `NODE_ENV`                   | Application environment       | `development`                     |
| `FRONTEND_URL`               | Frontend URL                  | `http://localhost:3000`           |
| `JWT_SECRET`                 | JWT signing secret            | `your_secret`                     |
| `JWT_EXPIRES_IN`             | JWT expiration                | `1d`                              |
| `ANOMALY_THRESHOLD`          | Anomaly detection threshold   | `50`                              |
| `INCIDENT_THRESHOLD`         | Incident detection threshold  | `60`                              |
| `NOTIFICATION_MIN_SEVERITY`  | Minimum notification severity | `HIGH`                            |
| `NOTIFICATION_MAX_RETRIES`   | Notification retry count      | `3`                               |
| `NOTIFICATION_EMAIL_ENABLED` | Enable email notifications    | `false`                           |
| `SMTP_HOST`                  | SMTP server                   | —                                 |
| `SMTP_PORT`                  | SMTP port                     | —                                 |
| `SMTP_USER`                  | SMTP username                 | —                                 |
| `SMTP_PASS`                  | SMTP password                 | —                                 |
| `AI_API_KEY`                 | AI provider API key           | Provider-specific                 |

> Replace `AI_API_KEY` with the exact environment variable used by your AI service.

## Frontend

| Variable              | Description     | Example                     |
| --------------------- | --------------- | --------------------------- |
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:5000/api` |

---

# 🔌 API Overview

The backend follows a RESTful API architecture.

Typical API groups include:

```text
/api/auth
/api/logs
/api/incidents
/api/notifications
/api/users
/api/ai
```

Example requests:

```http
POST /api/auth/register
POST /api/auth/login

POST /api/logs
GET  /api/logs

GET  /api/incidents
GET  /api/notifications
```

> The exact available endpoints depend on the current backend implementation.

---

# 👤 RBAC Permissions

### ADMIN

Can:

* Upload log files
* View logs
* View anomalies
* Investigate incidents
* Trigger AI analysis
* Manage users
* Manage permissions
* Access administrative functionality

### ANALYST

Can:

* View dashboard
* View logs
* Investigate anomalies
* Analyze incidents
* Access security information

### VIEWER

Can:

* View dashboard
* View basic statistics
* Monitor system information

---

# 🧠 Example Detection Scenario

Suppose the system receives:

```text
IP: 192.168.1.10

POST /api/login
401 Unauthorized

POST /api/login
401 Unauthorized

POST /api/login
401 Unauthorized

POST /api/login
401 Unauthorized

POST /api/login
401 Unauthorized
```

The system identifies:

```text
Repeated failures
        +
Same source IP
        +
Same endpoint
        +
Short time interval
        ↓
Suspicious behavior
        ↓
High anomaly score
        ↓
Potential security incident
        ↓
AI threat analysis
```

This can help identify patterns associated with brute-force or credential-abuse activity.

---

# 📈 Future Improvements

Potential future enhancements include:

* Real-time log streaming
* WebSocket-based monitoring
* Advanced threat intelligence integration
* SIEM integrations
* Machine-learning-based anomaly detection
* IP reputation analysis
* Geo-location visualization
* Advanced attack-pattern recognition
* Automated incident response
* Slack/Teams security alerts
* Cloud log integrations
* Docker deployment
* Kubernetes deployment

---

# 🎯 Project Goals

LogIQ aims to provide a centralized platform for:

```text
Log Collection
      ↓
Log Processing
      ↓
Security Analysis
      ↓
Anomaly Detection
      ↓
Incident Detection
      ↓
AI Threat Analysis
      ↓
Security Monitoring
```

The goal is to reduce manual log investigation and help security teams identify potentially dangerous behavior faster.

---

# 👨‍💻 Author

**Sahil Rathod**

Full-Stack Developer | Node.js | Express.js | MongoDB | Next.js

GitHub:
https://github.com/Sahil-Rathod-0306

---

# ⭐ Contributing

Contributions, issues, and feature requests are welcome.

### Fork the repository

```bash
git fork
```

### Create a feature branch

```bash
git checkout -b feature/new-feature
```

### Commit changes

```bash
git add .
git commit -m "Add new feature"
```

### Push changes

```bash
git push origin feature/new-feature
```

Then create a Pull Request.

---

# 📜 License

This project is intended for educational, development, and security research purposes.

---

## ⭐ LogIQ

**Upload → Analyze → Detect → Investigate → Respond**

If you find this project useful, consider giving the repository a ⭐ on GitHub.
