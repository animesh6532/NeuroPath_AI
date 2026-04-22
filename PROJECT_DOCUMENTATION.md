# NeuroPath AI — Project Documentation (LLM/Developer Reference)

> **Purpose:** This document explains the full system, architecture, modules, APIs, flows, constraints, current behavior, and expected future enhancements of **NeuroPath AI** so that any developer or LLM can quickly understand, maintain, debug, extend, or deploy the project.

---

# 1) Project Overview

**NeuroPath AI** is an **AI-powered career intelligence and interview preparation platform**. It is designed to help candidates improve their hiring readiness by combining:

- **Resume Analysis**
- **Career / Domain Detection**
- **AI Mock Interview**
- **Voice-based Interview Flow**
- **Basic Proctoring / Webcam Monitoring**
- **Placement Prediction**
- **Personalized Learning Roadmap**

The system is intended to simulate a realistic interview pipeline and provide candidate-centric feedback and guidance.

---

# 2) Core Product Goals

The platform aims to solve these user problems:

1. **Users don’t know how good their resume is**
2. **Users are underprepared for real interviews**
3. **Users don’t know what skills they are missing**
4. **Users want role/domain-specific mock interview practice**
5. **Users want an estimate of their placement/job readiness**
6. **Users want a personalized roadmap for improvement**

---

# 3) High-Level User Flow

```mermaid
flowchart TD

A[User Signs Up / Logs In] --> B[Upload Resume]
B --> C[Resume Parsing]
C --> D[Skill / Project / Experience Extraction]
D --> E[Career / Domain Mapping]
E --> F[AI Interview Question Generation]
F --> G[Voice-Based Mock Interview]
G --> H[Basic Webcam Proctoring]
G --> I[Answer Collection]
I --> J[Interview Evaluation]
J --> K[Placement Prediction]
J --> L[Learning Roadmap]
J --> M[Final Report / Dashboard]
4) Tech Stack
Frontend
React.js
Vite
React Router DOM
CSS (custom styling, dark futuristic UI)
Web Speech API (for speech recognition and text-to-speech)
Browser Media APIs (getUserMedia) for webcam + microphone
Backend
FastAPI
Python
Uvicorn
Pydantic
Resume text extraction utilities
Custom ML / heuristic logic
AI / ML / Logic Layer
Resume intelligence engine
Career mapping logic
Question generation engine
Placement scoring logic
Roadmap generation logic
Proctoring logic (basic OpenCV/manual heuristics depending on implementation)
Optional / Planned
OpenCV
Face / movement detection
LLM integration
Semantic similarity filtering
Speech scoring
Adaptive interviewing
5) Folder / Module Structure
Frontend Structure (expected)
frontend/src/
│
├── api/
│   └── endpoints.js
│
├── components/
│   ├── Navbar.jsx
│   ├── ProtectedRoute.jsx
│   ├── ResumeUpload.jsx
│   └── (other reusable UI components)
│
├── context/
│   ├── AuthContext.jsx
│   ├── AppContext.jsx
│   └── ThemeContext.jsx (if used)
│
├── pages/
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Dashboard.jsx
│   ├── ResumePage.jsx
│   ├── AIInterview.jsx
│   ├── AIInterviewSetup.jsx
│   ├── AIInterviewLive.jsx
│   ├── InterviewResult.jsx
│   ├── PlacementPrediction.jsx
│   ├── LearningRoadmap.jsx
│   └── Profile.jsx
│
├── App.jsx
└── main.jsx
Backend Structure (expected)
backend/app/
│
├── main.py
│
├── auth/
│   ├── routes.py
│   ├── models.py
│   └── utils.py
│
├── ml/
│   ├── resume/
│   ├── interview/
│   ├── placement/
│   └── learning/
│
├── proctoring/
│   ├── proctor_routes.py
│   └── face_monitor.py
│
├── database/
│   ├── db.py
│   └── models.py
│
└── utils/
    ├── pdf_parser.py
    └── helper.py
6) Core Functional Modules
6.1 Authentication Module
Purpose

Handles user signup/login and protected route access.

Expected Features
Register user
Login user
Store token or auth state
Protect dashboard/interview/profile routes
Common Frontend Routes
/login
/register
Common Backend Endpoints
POST /register or POST /auth/register
POST /login or POST /auth/login
Important Note

Frontend and backend endpoints must match exactly.
A frequent issue during development was:

frontend calling POST /login
backend exposing POST /auth/login

This causes 404 Not Found.

Rule:

Always verify the backend path in:

http://127.0.0.1:8001/docs
6.2 Resume Analysis Module
Purpose

Accept a user-uploaded resume PDF and extract useful career intelligence.

Input
Resume file (PDF)
Processing Goals
Extract raw text from resume
Identify skills
Identify career/domain hints
Identify projects
Identify internships/experience
Identify certifications
Identify education
Expected Output Example
{
  "skills": ["python", "sql", "machine learning"],
  "career": "Data Scientist",
  "projects": ["Stock Market Prediction System"],
  "experience": ["Data Analyst Intern"],
  "certifications": ["Google Data Analytics"]
}
Related Frontend Page
ResumePage.jsx
Related Backend Logic
resume parser / extractor
career intelligence logic
skill extraction logic
6.3 Career / Domain Mapping Module
Purpose

Map extracted resume content to likely career roles.

Example Careers
Software Developer
Data Scientist
AI Engineer
Teacher
Business Analyst
Financial Analyst
UI/UX Designer
Digital Marketer
Lawyer
Civil Engineer
etc.
Inputs
Skills
Projects
Experience
Education
Certifications
Output
Primary career
Secondary role suggestions
Domain confidence
Current System Behavior

This module is often rule-based / keyword-based rather than LLM-based.

6.4 AI Interview Module
Purpose

Generate a mock interview and run a voice-based interview experience.

This is one of the most important modules in the project.

6.4.1 AI Interview Setup Page
Frontend Page
AIInterview.jsx or AIInterviewSetup.jsx
Responsibilities
Upload resume
Start interview generation
Validate prerequisites
Optionally request camera/mic permissions
Expected UX
User uploads resume
Clicks Start Interview
System calls backend
Backend returns generated questions
User navigates to live interview screen
Expected Backend Endpoint
POST /start-ai-interview
Typical Response
{
  "skills": ["python", "machine learning", "sql"],
  "questions": [
    "Tell me about yourself.",
    "Why should we hire you?",
    "Explain your experience with Python.",
    "What are real-world applications of SQL?"
  ]
}
6.4.2 AI Interview Question Generation Logic
Purpose

Generate realistic interview questions based on the user’s resume.

Important Design Requirement

Questions should:

feel realistic
not always repeat for the same CV
be role-aware
be skill-aware
include HR + technical + project-based questions
Current / Planned Structure

A well-designed interview should usually contain:

1 Self Introduction
4 HR / Behavioral Questions
8–10 Domain / Technical Questions
3 Project-Based Questions
2 Situational Questions
Common Problem Previously

Questions were too repetitive or too generic.

Better Design Principle

Question generation should be based on:

extracted career
extracted skills
extracted projects
extracted experience
randomized templates
anti-duplication logic
6.4.3 AI Interview Live Page
Frontend Page
AIInterviewLive.jsx
Responsibilities
Display current question
Speak question aloud using browser TTS
Listen to user voice response using speech recognition
Show timer (e.g. 60 seconds)
Automatically move to next question
Send answers for scoring/evaluation
Display proctoring status
Intended Behavior
No typing box required
Interview should be voice-first
Each question has a timer
After time ends, move to next question automatically
Common Development Issues Encountered
User had to click “Next” manually
Camera preview was showing too early
Interview wasn’t stopping when no face detected
Questions were not matching uploaded resume
Same CV caused same question set repeatedly

These are known design/debug themes for this module.

6.4.4 Interview Result Page
Frontend Page
InterviewResult.jsx
Purpose

Display the final outcome of the interview.

Expected Output
Overall interview score
Confidence estimate
Technical performance
Communication quality
Placement readiness
Suggested improvements
Example UI Sections
Final Score
Strengths
Weak Areas
Suggested Learning Path
Resume Match Score
6.5 Voice AI / Speech Module
Purpose

Enable voice-based question asking and answer capturing.

Frontend Browser APIs Used
window.speechSynthesis → ask questions aloud
SpeechRecognition / webkitSpeechRecognition → capture user speech
Intended UX
AI reads question
User speaks answer
Transcript appears live
Timer runs
Auto move to next question
Important Constraints

This is browser-dependent:

Works best in Chrome
Requires mic permissions
May behave differently across devices
Mobile-linked cameras or microphones may get selected unexpectedly
Common Issues Encountered
mic not capturing
laptop camera not selected
mobile linked device being used instead
browser permission mismatch
recognition stopping unexpectedly
6.6 Proctoring / Webcam Monitoring Module
Purpose

Provide basic interview integrity checks during live interview.

Frontend Goal
Start webcam only when interview begins
Avoid showing preview before actual interview
Monitor user presence during interview
Backend Goal (optional / planned)

Analyze frames or metadata to detect suspicious behavior.

Desired Detection Scenarios
No face visible
Multiple people in frame
Excessive movement
Leaving frame
Possible tab switching or fullscreen exit
Important Reality / Constraint

True “interview integrity” cannot be fully enforced from browser-only frontend code.
A browser can:

detect tab visibility
detect fullscreen exit
request webcam/mic
capture frames

But it cannot fully lock the system like a real exam software.

Current / Planned Proctoring Strategy
Frontend captures webcam frames
Sends frame/events to backend
Backend returns warnings or stop signals
Common Backend Endpoints
POST /proctoring/analyze-frame
POST /proctoring/analyze-events
Common Issues Encountered
no face detected even when user is visible
false negatives / false positives
preview showing when not desired
interview not stopping when face absent
interview stopping too aggressively
Important Recommendation

Treat current proctoring as mock-interview integrity simulation, not a real secure exam environment.

6.7 Placement Prediction Module
Purpose

Estimate the user’s job/placement readiness.

Frontend Page
PlacementPrediction.jsx
Backend Endpoint
POST /placement-analysis
Inputs
resume features
interview performance
communication / confidence estimate
skill match
domain readiness
Example Output
{
  "placement_probability": 78,
  "strengths": ["Strong Python fundamentals", "Good communication"],
  "weaknesses": ["Needs more SQL depth", "Weak project articulation"],
  "summary": "Moderately placement-ready"
}
Intended UX
user sees placement %
receives strengths + weaknesses
gets actionable suggestions
6.8 Learning Roadmap Module
Purpose

Generate a personalized roadmap for improving weak areas.

Frontend Page
LearningRoadmap.jsx
Backend Endpoint
POST /learning-roadmap
Inputs
resume profile
extracted skill gaps
interview weaknesses
target career/domain
Example Output
{
  "career_target": "Data Scientist",
  "missing_skills": ["Statistics", "SQL optimization", "ML model deployment"],
  "roadmap": [
    "Revise Python for data analysis",
    "Practice SQL joins and aggregations",
    "Build 2 end-to-end ML projects",
    "Prepare project explanations"
  ]
}
7) Backend API Contract

This section documents the expected behavior of major endpoints.

7.1 POST /analyze-resume
Purpose

Analyze uploaded resume and return extracted intelligence.

Request
multipart/form-data
file: PDF
Response Example
{
  "skills": ["python", "sql", "machine learning"],
  "projects": ["Stock Market Analysis Dashboard"],
  "experience": ["Data Analyst Intern"],
  "career": "Data Scientist"
}
7.2 POST /start-ai-interview
Purpose

Start the interview generation flow from resume.

Request
multipart/form-data
file: PDF
Response Example
{
  "skills": ["python", "machine learning", "sql"],
  "questions": [
    "Tell me about yourself.",
    "Why should we hire you?",
    "Explain your experience with Python.",
    "Describe one machine learning project you have worked on."
  ]
}
7.3 POST /submit-interview
Purpose

Submit final interview answers / transcripts for evaluation.

Request Example
{
  "questions": ["Tell me about yourself."],
  "answers": ["I am a final-year student..."],
  "skills": ["python", "sql"]
}
Response Example
{
  "score": 82,
  "confidence_score": 74,
  "technical_score": 85,
  "communication_score": 78,
  "feedback": [
    "Good clarity in self-introduction",
    "Needs more specific technical examples"
  ]
}
7.4 POST /ai-interview
Purpose

May be used for on-demand question generation or interview operations depending on implementation.

Important Note

If this endpoint exists, document clearly whether it:

generates questions
evaluates answers
performs both

Avoid overlapping endpoint responsibilities.

7.5 POST /placement-analysis
Purpose

Predict placement/job readiness.

Response Example
{
  "placement_probability": 76,
  "summary": "Good technical base, needs stronger interview delivery"
}
7.6 POST /learning-roadmap
Purpose

Generate learning recommendations.

Response Example
{
  "career_target": "AI Engineer",
  "roadmap": [
    "Strengthen Python and NumPy",
    "Build 2 deep learning projects",
    "Practice ML interview questions"
  ]
}
7.7 Proctoring Endpoints
POST /proctoring/analyze-frame

Analyze current webcam frame or detection summary.

POST /proctoring/analyze-events

Analyze interview events such as:

tab switch
fullscreen exit
face absence
multiple persons
8) Smart Question Generation Design

This is one of the most important system components.

Goal

Generate a fresh, realistic, resume-aware interview.

Current Problem to Avoid
same CV = same repeated questions
questions too generic
questions unrelated to actual domain
no proper HR/domain/project structure
Recommended Internal Generation Pipeline
Step 1 — Extract Resume Intelligence

From resume text, extract:

skills
projects
certifications
experience
likely career
Step 2 — Determine Interview Blueprint

Create interview structure such as:

1 intro
4 HR
8–10 technical
3 project-based
2 situational
Step 3 — Pull From Banks / Templates

Use:

HR question bank
career-specific question bank
skill-based question bank
project-based templates
situational bank
Step 4 — Randomize & De-duplicate

Use:

shuffled templates
anti-repeat normalization
recent-question filtering
varied phrasing
Step 5 — Return Final Interview

Return final ordered list of interview questions.

9) Anti-Repetition Requirement
Very Important Requirement

The same or similar CV should not always produce identical interviews.

Better Design

Use:

template rotation
random seed
question normalization
semantic / text duplicate removal
alternate phrasing
Desired Behavior

If the same resume is uploaded again:

overall role alignment remains similar
exact questions should vary
10) Known Development Issues / Common Bugs

This section documents the real issues encountered during development so future debugging is easier.

Frontend Issues Encountered
1. CSS not loading

Symptoms:

pages look like plain HTML
white background
no styled cards

Cause:

CSS file not imported
wrong CSS file path
class name mismatch
2. Navbar import / component path issues

Example:

Failed to resolve import "./Navbar"
should be ./components/Navbar

Cause:

incorrect relative import path
3. Entire frontend showing blank / null

Cause:

import errors
missing exports
route pointing to broken component
syntax error in page component
4. Wrong API import

Example:

endpoints.js does not provide an export named authAPI

Cause:

frontend importing non-existent API object
Backend Issues Encountered
1. ImportError for ML functions

Examples:

cannot import name 'generate_questions'
cannot import name 'run_interview'
cannot import name 'predict_placement'

Cause:

function name mismatch
file exists but function not defined
wrong import path
2. cv2 module not found

Error:

ModuleNotFoundError: No module named 'cv2'

Cause:

OpenCV not installed in Python environment

Fix:

pip install opencv-python
3. Face monitor import errors

Example:

cannot import name 'analyze_frame'

Cause:

route expects function not defined in face_monitor.py
4. 404 Not Found on login/register

Cause:

frontend calling wrong endpoint
backend route path mismatch

Example:

frontend → /login
backend → /auth/login
11) Security / Integrity Notes
What the platform can reasonably do
request webcam/mic
detect tab switch
detect fullscreen exit
show interview warnings
stop mock interview on violations
What the platform cannot truly guarantee
full anti-cheat lockdown like exam browsers
OS-level app blocking
perfect identity verification
fully reliable face/eye tracking without strong CV models
Best Framing

This should be described as:

AI Mock Interview + Basic Integrity Monitoring

not as a fully secure exam environment.

12) Recommended Product Positioning

This project should be presented as:

A full-stack AI-powered career preparation platform that combines resume intelligence, voice-based mock interviews, placement prediction, learning roadmaps, and interview integrity simulation.

This is much stronger and more accurate than calling it only:

“resume analyzer”
“mock interview app”
“placement predictor”

It is a career intelligence ecosystem.

13) Current Strengths of the Project

This project is strong because it combines multiple layers:

Resume intelligence
Career mapping
AI interview simulation
Voice interaction
Basic proctoring
Placement scoring
Personalized learning roadmap

That makes it much more impressive than a simple CRUD or ML-only project.

14) Recommended Future Enhancements

These are the best future improvements for NeuroPath AI.

14.1 LLM-Based Dynamic Question Generation

Replace or augment rule-based question generation with LLM-powered, career-aware generation.

Benefits:

more natural questions
less repetition
better domain depth
14.2 Adaptive Interviewing

Instead of a fixed question list:

next question depends on previous answer quality

This would make the interview feel much more realistic.

14.3 Speech Quality Analysis

Analyze:

fluency
hesitation
speaking speed
filler words
confidence markers
14.4 Better Proctoring

Improve with:

stronger face detection
multiple person detection
head pose estimation
eye gaze estimation
14.5 Recruiter / Admin Dashboard

Add a dashboard where:

recruiter/admin can review candidate interview results
compare candidates
see reports
14.6 Deployment

Deploy:

frontend → Vercel
backend → Render / Railway / VPS
DB → cloud-hosted DB
15) Deployment Notes
Frontend

Can be deployed on:

Vercel
Netlify
Backend

Can be deployed on:

Render
Railway
VPS
Docker-based hosting
Important Deployment Constraints

Features like:

webcam
mic
speech recognition

work more reliably on:

HTTPS
supported browsers
desktop Chrome
16) How an LLM Should Reason About This Project

If an LLM is asked to help on this project, it should assume:

This is a React + FastAPI full-stack app
The UI is intended to be futuristic / dark / premium
The interview system is intended to be voice-first
Resume intelligence is central to all downstream features
The AI interview should feel realistic, not just generic Q&A
Question generation should avoid repetition
Proctoring is basic integrity simulation, not real secure exam enforcement
Frontend/backend route mismatches are a common source of bugs
Import path mismatches are a common source of bugs
The system should remain modular and easy to extend
17) Summary

NeuroPath AI is a modular, full-stack AI career preparation platform with these core pillars:

Resume Intelligence
Career Detection
Voice AI Mock Interview
Basic Proctoring
Placement Prediction
Learning Roadmap

It is designed as a realistic, futuristic, portfolio-grade project that demonstrates:

full-stack engineering
AI/ML logic design
product thinking
interview simulation systems
candidate evaluation workflows

This project is best understood not as a single feature, but as a connected intelligent hiring-readiness platform.

End of Documentation

### Best way to use this
- Save it as: **`PROJECT_DOCUMENTATION.md`**
- Add it to your repo root
- If you give another LLM your repo, give it:
  1. `README.md`
  2. `PROJECT_DOCUMENTATION.md`

That will make the model understand your project **far more accurately**.

If you want, I can also give you a second file:

## `LLM_CONTEXT.md`
A **shorter, compressed AI instruction file** (much more powerful for Copilot / Cursor / Cla