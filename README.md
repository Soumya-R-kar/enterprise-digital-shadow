# Enterprise Digital Shadow

## 🎯 Project Overview

**Enterprise Digital Shadow** is an AI-driven early detection, risk prediction, and root-cause analysis platform that creates a digital representation of an organization's technical and operational environment.

Unlike traditional monitoring systems that alert you **after** a problem occurs, the Digital Shadow detects **weak signals** and **emerging patterns** to predict problems **before** they cause outages.

## 🚀 Key Features

### 1. Multi-Source Event Ingestion
- Collects events from servers, databases, APIs, helpdesk, security systems
- Normalizes all data into a unified format

### 2. Statistical Anomaly Detection
- Uses Z-score and threshold-based detection
- Identifies unusual behavior in real-time

### 3. Pattern-Based Correlation Engine
- Analyzes events from the last 10 minutes
- Detects cascade patterns (e.g., DB latency → API errors → user complaints)
- Creates "Emerging Incidents" before complete failure

### 4. Risk Scoring & Severity Calculation
- Calculates risk scores from 0-100
- Determines severity: LOW, MEDIUM, HIGH, CRITICAL

### 5. Visual Dependency Graph
- Interactive graph showing system relationships
- Click any system to simulate failure
- Visualizes cascade impact in real-time

### 6. What-If Impact Simulator
- Predicts downstream business impact
- Shows affected users, departments, and services
- Helps management make proactive decisions

### 7. AI-Powered Explanations
- Uses OpenAI GPT to generate natural language summaries
- Translates technical incidents into business impact
- Provides actionable recommendations

### 8. Incident Investigation Timeline
- Shows chronological sequence of events
- Identifies probable root cause
- Displays recommended actions

## 🛠️ Technology Stack

### Backend
- **FastAPI** (Python) - REST API framework
- **PostgreSQL** - Relational database
- **SQLAlchemy** - ORM for database operations
- **Pandas/NumPy** - Data processing
- **scikit-learn** - Machine learning (anomaly detection)
- **OpenAI API** - AI explanations

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **ReactFlow** - Dependency graph visualization
- **Recharts** - Data visualization
- **Lucide React** - Icons

## 📊 System Architecture
