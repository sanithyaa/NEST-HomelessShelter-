# Homeless Aid Platform

> An AI-powered social impact platform designed to help NGOs, shelters, and volunteers support homeless individuals more efficiently through smart technology.

---

## 📌 Overview

The **Homeless Aid Platform** is a full-stack web application that combines **Artificial Intelligence**, **Web Development**, and **Real-Time Systems** to improve homeless outreach operations.

Instead of relying on spreadsheets, manual coordination, and inefficient field visits, this platform provides a centralized system for managing support services, volunteers, and individuals in need.

---

## 🚀 Key Features

### 📍 Smart Route Optimization
Plan the most efficient routes for volunteers using:

- Travelling Salesman Problem (TSP)
- A* Pathfinding Algorithm

### 🤖 AI Recommendations
Suggest the best support services such as:

- Shelters
- Food centers
- Healthcare assistance
- Employment programs

### 📝 Intelligent Needs Assessment
Adaptive questionnaires that assess:

- Urgency level
- Shelter priority
- Health risk
- Support requirements

### 💬 AI Chatbot Assistant
Provides instant help for:

- Finding nearby shelters
- Explaining available services
- Assisting with forms
- General support queries

### 📊 Dashboard & Analytics
Track and manage:

- Volunteers
- Cases
- Priorities
- Outreach progress

### 🌐 Real-Time Updates
Live notifications using WebSockets for:

- New cases
- Volunteer assignments
- Status updates

---

# 🏗️ Project Architecture

```bash
homeless-aid-platform/
├── backend/                          # Flask + AI/ML Backend
│   ├── api/
│   ├── models/
│   ├── config.py
│   └── requirements.txt
│
├── frontend/                         # Next.js Frontend
│   ├── app/
│   ├── components/
│   ├── contexts/
│   └── utils/
│
├── docs/                             # Documentation
└── README.md



Backend Setup
cd backend

python -m venv venv

# Activate environment

# Windows
venv\Scripts\activate

# Linux / Mac
source venv/bin/activate

pip install -r requirements.txt

python api/app.py

Backend runs at:

http://localhost:5000
Frontend Setup
cd frontend

npm install

npm run dev

Frontend runs at:

http://localhost:3000
Environment Variables

Create .env file inside backend:

OPENAI_API_KEY=your_key
GOOGLE_MAPS_API_KEY=your_key

Create .env.local inside frontend:

NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_WS_URL=http://localhost:5000
