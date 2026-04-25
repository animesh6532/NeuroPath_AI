<div align="center">

# 🧠 NeuroPath AI  

### 🚀 AI-Powered Career Intelligence & Interview Simulation Platform  

> Transforming resume data into actionable career insights using AI  

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-React-blue?style=for-the-badge&logo=react"/>
  <img src="https://img.shields.io/badge/Backend-FastAPI-green?style=for-the-badge&logo=fastapi"/>
  <img src="https://img.shields.io/badge/AI-ML-orange?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Database-SQLite-lightgrey?style=for-the-badge"/>
</p>

</div>

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Run Locally](#-running-locally)
- [Future Improvements](#-future-improvements)

---

## 🚀 Overview

**NeuroPath AI** is a full-stack AI platform that simulates a **real-world hiring pipeline** — from resume analysis → interview → roadmap → placement.

It helps users:

✔ Understand their career trajectory  
✔ Identify skill gaps  
✔ Practice real interview scenarios  
✔ Improve placement readiness with data-driven insights  

---

# 🎯 Key Features

---

### 🏠 Landing Page & Authentication

<p align="center">
  <img src="./assets/landing.gif" width="800"/>
</p>

- Clean SaaS-style UI  
- Secure login & registration  
- Smooth onboarding experience  
- Responsive modern design  

---

### 📄 Resume Intelligence Engine

<p align="center">
  <img src="./assets/resume.gif" width="800"/>
</p>

- Extracts skills, projects, experience  
- Detects domain automatically  
- Generates resume score  
- Identifies missing skills  

👉 Gives clear **career direction + improvement path**

---

### 🎤 AI Mock Interview System

<p align="center">
  <img src="./assets/interview.gif" width="800"/>
</p>

- 15 intelligent questions  
- No repetition  
- Skill-based + project-based  
- Real interview simulation  

#### 🔒 Strict Mode

<p align="center">
  <img src="./assets/interview-strict.gif" width="700"/>
</p>

- Face detection (OpenCV)  
- No-face & multi-person detection  
- Anti-cheating system  

#### 📊 Interview Result

<p align="center">
  <img src="./assets/interview-result.gif" width="700"/>
</p>

- Technical score  
- Communication score  
- Confidence level  
- Weakness analysis  

---

### 🛣️ Learning Roadmap

<p align="center">
  <img src="./assets/roadmap_source.gif" width="800"/>
</p>

- Personalized roadmap  
- Based on weaknesses + missing skills  
- Step-by-step improvement path  
- Learning resources included  

---

### 📈 Placement Prediction

<p align="center">
  <img src="./assets/placement.gif" width="800"/>
</p>

- Predicts placement readiness  
- Suggests job roles  
- Links to real jobs (LinkedIn, Internshala)  

---

### 💻 Daily Coding Challenge

<p align="center">
  <img src="./assets/coding.gif" width="800"/>
</p>

- 2–3 problems daily  
- Tracks streak  
- Improves DSA skills  

#### 🔒 Strict Mode

<p align="center">
  <img src="./assets/coding-strict.gif" width="700"/>
</p>

- Fullscreen enforcement  
- Exit = termination  

---

### 🧠 Aptitude System

<p align="center">
  <img src="./assets/aptitude.gif" width="800"/>
</p>

- 20 questions  
- 30 min timer  
- Standardized test  

#### 🔒 Strict Mode

<p align="center">
  <img src="./assets/aptitude-strict.gif" width="700"/>
</p>

- Auto submit on exit  
- Real exam environment  

---

### 👤 Profile & Dashboard

<p align="center">
  <img src="./assets/profile.gif" width="800"/>
</p>

- Resume score  
- Interview score  
- Coding + aptitude progress  
- Centralized career dashboard  

---

# 🧠 System Architecture

```mermaid
flowchart TD

A[User] --> B[Authentication]

B --> C[Resume Upload]
C --> D[Resume Analyzer]

D --> D1[Skill Extraction]
D --> D2[Project Experience Extraction]
D --> D3[Domain Detection]
D --> D4[Resume Score Missing Skills]

D1 --> E[Interview Generator]

E --> F[AI Mock Interview]

F --> G[Proctoring System]
G --> G1[Face Detection]
G --> G2[Multi Person Detection]
G --> G3[Strict Mode Monitoring]

F --> H[Answer Evaluation Engine]

H --> H1[Technical Score]
H --> H2[Communication Score]
H --> H3[Confidence Level]
H --> H4[Weakness Detection]

H4 --> I[Learning Roadmap Engine]
D4 --> I

I --> I1[Topics]
I --> I2[Resources]
I --> I3[Progress Tracking]

I --> J{User Type}

J -->|Technical| K[Daily Coding]
K --> K1[Problems]
K --> K2[Strict Mode]
K --> K3[Streak]

J -->|All Users| L[Aptitude]
L --> L1[Questions]
L --> L2[Timer]
L --> L3[Strict Mode]
L --> L4[Score]

H --> M[Dashboard]
D --> M
K --> M
L --> M
I --> M

M --> N[Career Insights]
