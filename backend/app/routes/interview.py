import os
import json
import uuid
import hashlib
import sys
import traceback
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Body
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from backend.app.database.database import get_db, SessionLocal
from backend.app.models.models import InterviewQuestion, InterviewSession, InterviewReport, InterviewQuestionMemory
from backend.app.services.career_classifier import classify_career_profile
from backend.app.services.blueprint_generator import generate_interview_blueprint
from backend.app.ml.interview.answer_evaluator import evaluate_candidate_answer
from backend.app.services.pdf_generator import generate_pdf_report

# ML modules for stateless interview
from backend.app.ml.interview.question_generator import generate_questions_from_skills
from backend.app.ml.interview.interview_engine import evaluate_interview_answers

router = APIRouter(tags=["AI Interview"])

# V5 specific project questions for NeuroPath AI
NEUROPATH_PROJECT_QUESTIONS = [
    {
        "sub_topic": "Systems Architecture",
        "question_text": "Can you explain the high-level system architecture and data flow of NeuroPath AI, specifically how the React frontend interacts with the FastAPI backend during a live voice interview?",
        "expected_answer": "NeuroPath AI utilizes a decoupled architecture where the React frontend manages Web Speech API for voice interactions and streams proctoring events via HTTP. FastAPI acts as a high-performance backend, parsing resumes with pdfminer, executing local NLP scoring via Sentence Transformers, and generating Reports dynamically using ReportLab.",
        "rubric": ["decoupled architecture", "FastAPI backend", "React frontend", "Web Speech API", "data flow"]
    },
    {
        "sub_topic": "Database Schema",
        "question_text": "How did you design the database schemas for NeuroPath AI to handle stateful interview session histories, question knowledge graphs, and final evaluated reports using SQLAlchemy and SQLite?",
        "expected_answer": "We designed three main relational tables: InterviewQuestion (storing category, Expected Answer, and rubric tags), InterviewSession (tracking active rounds, difficulty levels, and full JSON history), and InterviewReport (storing multi-category scores and PDF paths). A memory table tracks asked questions to prevent repeats.",
        "rubric": ["SQLAlchemy", "SQLite schema", "relational tables", "InterviewSession state", "history tracking"]
    },
    {
        "sub_topic": "Authentication & Security",
        "question_text": "What security measures and authentication flows are implemented in NeuroPath AI to secure routes and candidate dashboards?",
        "expected_answer": "We implement JWT (JSON Web Token) authentication using OAuth2 password bearer flow with SHA-256 password hashing (via passlib/bcrypt). Routes are secured using FastAPI Depends dependencies, and the React frontend wraps protected pages in a wrapper checking localStorage tokens.",
        "rubric": ["JWT", "bcrypt hashing", "FastAPI Depends", "OAuth2 Bearer", "protected routes"]
    },
    {
        "sub_topic": "FastAPI Framework",
        "question_text": "Why was FastAPI selected as the backend framework for NeuroPath AI over traditional frameworks like Django or Flask? Highlight its async event loop benefits.",
        "expected_answer": "FastAPI was chosen for its outstanding performance, native async support, and auto OpenAPI docs. As NLP matching tasks are CPU-bound, FastAPI's async event loop handles non-blocking I/O operations and database queries concurrently without thread starvation.",
        "rubric": ["async event loop", "Uvicorn", "Starlette", "non-blocking I/O", "performance comparison"]
    },
    {
        "sub_topic": "React UI State Machine",
        "question_text": "Describe the frontend state machine in React that drives the live voice interview pages. How does it handle SpeechRecognition lifecycle hooks and timers?",
        "expected_answer": "The live page maintains a state machine (Idle, Prep, Speaking, Review). A 15-second prep timer synthesizes the question via SpeechSynthesis, then switches to Speaking state, enabling Web Speech recognition with a 90-second countdown and 2.5s silence auto-submit detection.",
        "rubric": ["React state machine", "SpeechRecognition lifecycle", "SpeechSynthesis TTS", "countdown timer", "silence detection"]
    },
    {
        "sub_topic": "Scalability & Message Brokers",
        "question_text": "If the number of concurrent candidates taking voice interviews on NeuroPath AI increases to 10,000, how would you scale the ML evaluations and PDF generation pipelines?",
        "expected_answer": "To scale to 10,000 concurrent sessions, we would decouple the heavy Sentence Transformer evaluations and ReportLab PDF generations from the main FastAPI server by introducing a message broker like Redis/RabbitMQ and running evaluations asynchronously via Celery worker pools.",
        "rubric": ["Redis/RabbitMQ broker", "Celery worker pools", "decoupled asynchronous execution", "load scaling"]
    },
    {
        "sub_topic": "Proctoring & Web APIs",
        "question_text": "How is candidate integrity monitored in NeuroPath AI? Describe the technical implementation of eye tracking and tab-focus hooks.",
        "expected_answer": "Webcam monitoring captures video frames using Haar Cascades to check for face/eye presence, warning if eyes look away for 5 consecutive frames. Browser focus/blur event listeners check tab-switching, and full-screen listeners check escape events to track candidate violations.",
        "rubric": ["Haar Cascades", "eye tracking", "blur focus listeners", "fullscreen escape detection", "violations tracker"]
    },
    {
        "sub_topic": "Deployment & CORS",
        "question_text": "What is the deployment architecture for NeuroPath AI? How would you containerize the FastAPI backend and configure CORS for production environments?",
        "expected_answer": "We containerize the backend using a Dockerfile running Uvicorn. CORS headers are restricted to the production React URL using CORSMiddleware, and static reports directories are mounted as a persistent volume to serve PDFs safely.",
        "rubric": ["Dockerfile", "Uvicorn server", "CORSMiddleware origins", "persistent volume storage", "static reports"]
    }
]

def get_fallback_question(industry: str, role: str, topic: str, difficulty: str) -> dict:
    q_map = {
        "Intro": "Tell me about your background and how it led you to pursue this role.",
        "Resume": "Walk me through your most relevant work experience and major accomplishments.",
        "Projects": "Describe the most technically challenging project you have worked on. What engineering decisions did you make?",
        "Internship": "Talk about a time during an internship or work experience where you had to quickly adapt to a new codebase or environment.",
        "Technical": f"Explain the internal working mechanisms and common optimization bottlenecks of {topic} at a {difficulty} level.",
        "Scenario": "How would you diagnose and resolve a severe production outage or bottleneck where latency spikes suddenly?",
        "System Design": "How would you design a highly scalable, distributed system to handle millions of transactions per day?",
        "Behavioural": "Describe a conflict you had with a team member or stakeholder and how you resolved it.",
        "HR": "Where do you see yourself in five years, and how does this position align with your goals?",
        "Closing": "What questions do you have for us regarding the team structure or expectations?"
    }
    q_text = q_map.get(topic, f"Explain your experience with {topic} and how you implement it in a real-world scenario.")
    
    return {
        "question_text": q_text,
        "topic": topic,
        "sub_topic": "General Principles",
        "difficulty": difficulty,
        "industry": industry,
        "role": role,
        "expected_answer": f"A comprehensive answer about {topic} at a {difficulty} level, focusing on details and trade-offs.",
        "evaluation_rubric": json.dumps([topic, "scalability", "diagnostics", "trade-offs"]),
        "follow_ups": json.dumps([f"Can you explain {topic} in more detail?", f"How does this apply to distributed environments?"]),
        "concept_tags": json.dumps([topic.lower(), difficulty.lower()]),
        "estimated_time": 90
    }

def select_question(db: Session, email: str, industry: str, role: str, category: str, difficulty: str, projects: list, round_number: int) -> dict:
    """
    Selects a highly structured question for the candidate, generating it dynamically from the candidate's actual resume profile.
    """
    from backend.app.services.resume_question_generator import generate_personalized_question
    
    # Resolve focus and round_name from active session blueprint
    focus = None
    round_name = None
    try:
        session = db.query(InterviewSession).filter(
            InterviewSession.email == email, 
            InterviewSession.is_completed == 0
        ).order_by(InterviewSession.created_at.desc()).first()
        if session:
            blueprint = json.loads(session.blueprint)
            if blueprint and 0 <= (round_number - 1) < len(blueprint):
                round_item = blueprint[round_number - 1]
                focus = round_item.get("focus")
                round_name = round_item.get("name")
    except Exception as e:
        print(f"[select_question Warning] Could not load active blueprint round: {str(e)}")

    # Simple history list from InterviewQuestionMemory
    resume_hash = hashlib.sha256(email.strip().lower().encode('utf-8')).hexdigest()
    asked_records = db.query(InterviewQuestionMemory).filter(
        InterviewQuestionMemory.resume_hash == resume_hash
    ).all()
    asked_ids = [{"question_id": rec.question_id} for rec in asked_records]

    return generate_personalized_question(
        email=email,
        name="Candidate",
        skills=[],
        experience=[],
        projects=projects or [],
        category=category,
        difficulty=difficulty,
        round_number=round_number,
        history=asked_ids,
        focus=focus,
        round_name=round_name
    )

# ================= STATELESS INTERVIEWS (from main.py) =================

@router.post("/generate-interview")
async def generate_interview(data: dict):
    try:
        skills    = data.get("skills", [])
        questions = generate_questions_from_skills(skills)
        return {"success": True, "message": "Questions generated", "data": {"skills": skills, "questions": questions}}
    except Exception as e:
        return {"success": False, "message": str(e), "data": None}

@router.post("/submit-interview")
async def submit_interview(data: dict):
    try:
        skills  = data.get("skills", [])
        answers = data.get("answers", [])
        results = evaluate_interview_answers(answers, skills)
        weak    = results.get("weaknesses", [])
        if not isinstance(weak, list):
            weak = []
        return {
            "success": True,
            "message": "Interview evaluated",
            "data": {
                "score":        results.get("score", 0),
                "confidence":   results.get("confidence_score", 0),
                "communication":results.get("communication_score", 0),
                "weaknesses":   weak,
                "full_results": results,
            }
        }
    except Exception as e:
        return {"success": False, "message": str(e), "data": None}

@router.post("/ai-interview")
async def ai_interview(data: dict):
    try:
        results    = evaluate_interview_answers(data.get("answers", []), data.get("skills", []))
        weak_areas = results.get("weaknesses", [])
        if not isinstance(weak_areas, list):
            weak_areas = []
        return {
            "success": True,
            "message": "AI interview evaluated",
            "data": {"interview_results": results, "weak_areas": weak_areas}
        }
    except Exception as e:
        return {"success": False, "message": str(e), "data": None}

# ================= STATEFUL INTERVIEWS =================

@router.post("/interview/start")
async def start_stateful_interview(payload: dict = Body(...), db: Session = Depends(get_db)):
    print(f"[AI Stateful Interview Log] Incoming payload: {json.dumps(payload)}")
    try:
        email = payload.get("email", "candidate@neuropath.ai")
        name = payload.get("name", "Candidate")
        skills = payload.get("skills", ["Software Engineering", "Programming"])
        experience = payload.get("experience", ["Prior Work"])
        projects = payload.get("projects", ["Academic Project"])
        
        resume_profile = {
            "name": name,
            "email": email,
            "phone": "N/A",
            "location": "N/A",
            "linkedin": "N/A",
            "github": "N/A",
            "summary": "N/A",
            "education": [{"institution": "N/A", "degree": "N/A", "duration": "N/A", "detail": "N/A"}],
            "skills": skills,
            "detected_skills": skills,
            "experience": experience,
            "structured_experience": [{"role": "Professional Role", "company": exp, "duration": "N/A", "responsibilities": [exp]} for exp in experience],
            "projects": projects,
            "structured_projects": [{"name": p, "description": p, "technologies": []} for p in projects],
            "certifications": [],
            "languages": ["English"],
            "achievements": [],
            "full_text": f"{name} {email} " + " ".join(skills) + " " + " ".join(experience) + " " + " ".join(projects)
        }
        
        classification = classify_career_profile(resume_profile)
        industry = classification["industry"]
        role = classification["primary_role"]
        level = classification["career_level"]
        
        blueprint = generate_interview_blueprint(classification, resume_profile)
        first_round = blueprint[0]
        category = first_round["category"]
        diff = first_round["difficulty"]
        
        from backend.app.services.resume_question_generator import generate_personalized_question
        first_question = generate_personalized_question(
            email=email,
            name=name,
            skills=skills,
            experience=experience,
            projects=projects,
            category=category,
            difficulty=diff,
            round_number=1,
            history=[]
        )

        session_id = str(uuid.uuid4())
        initial_history = [{
            "round_number": 1,
            "round_name": first_round["name"],
            "category": category,
            "question_id": first_question["id"],
            "question_text": first_question["question_text"],
            "expected_answer": first_question["expected_answer"],
            "rubric": first_question["rubric"],
            "follow_ups": first_question["follow_ups"],
            "difficulty": first_question["difficulty"],
            "answer": None,
            "score": None,
            "feedback": None,
            "time_taken": None,
            "is_follow_up": False
        }]

        session = InterviewSession(
            id=session_id,
            email=email,
            role=role,
            level=level,
            blueprint=json.dumps(blueprint),
            current_round_index=0,
            current_difficulty=diff,
            history=json.dumps(initial_history),
            violations=json.dumps([]),
            is_completed=0,
            created_at=datetime.utcnow().isoformat()
        )
        db.add(session)
        db.commit()

        return {
            "success": True,
            "message": "Interview started",
            "data": {
                "session_id": session_id,
                "role": role,
                "level": level,
                "blueprint": blueprint,
                "first_question": {
                    "question_text": first_question["question_text"],
                    "estimated_time": first_question["estimated_time"],
                    "difficulty": first_question["difficulty"],
                    "round_name": first_round["name"],
                    "round_number": 1
                }
            }
        }
    except Exception as e:
        db.rollback()
        exc_type, exc_value, exc_tb = sys.exc_info()
        tb_list = traceback.extract_tb(exc_tb)
        last_tb = tb_list[-1] if tb_list else None
        err_log = {
            "error_message": str(e),
            "exception_type": type(e).__name__,
            "failing_file": last_tb.filename if last_tb else "Unknown",
            "failing_line_number": last_tb.lineno if last_tb else -1,
            "failing_function": last_tb.name if last_tb else "Unknown",
            "stack_trace": traceback.format_exc()
        }
        print(f"[AI Stateful Interview Error] Exception trace: {json.dumps(err_log, indent=2)}", file=sys.stderr)
        raise HTTPException(status_code=500, detail=err_log)

@router.post("/interview/answer")
async def submit_candidate_answer(payload: dict = Body(...), db: Session = Depends(get_db)):
    try:
        session_id = payload.get("session_id")
        answer_text = payload.get("answer", "")
        time_taken = payload.get("time_taken", 60)
        violations = payload.get("violations", [])
        max_violations = payload.get("max_violations", 5)
        
        session = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
        if not session:
            raise HTTPException(status_code=404, detail="Interview session not found.")
            
        if session.is_completed == 1:
            return {"is_completed": True, "message": "Interview already completed."}

        history = json.loads(session.history)
        blueprint = json.loads(session.blueprint)
        session_violations = json.loads(session.violations)
        
        for v in violations:
            if v not in session_violations:
                session_violations.append(v)
        session.violations = json.dumps(session_violations)
        
        if len(session_violations) >= max_violations:
            session.is_completed = 1
            db.commit()
            return {
                "is_completed": True,
                "terminated": True,
                "message": f"Interview terminated due to exceeding limit of {max_violations} proctoring violations."
            }

        active_idx = -1
        for i in range(len(history) - 1, -1, -1):
            if history[i]["answer"] is None:
                active_idx = i
                break
                
        if active_idx == -1:
            raise HTTPException(status_code=400, detail="No active question waiting for response.")
            
        active_q = history[active_idx]
        eval_result = evaluate_candidate_answer(
            question_text=active_q["question_text"],
            expected_answer=active_q["expected_answer"],
            rubric_json=active_q["rubric"],
            candidate_answer=answer_text,
            violations_count=len(session_violations)
        )
        
        active_q["answer"] = answer_text
        active_q["time_taken"] = time_taken
        active_q["score"] = eval_result["overall_score"]
        active_q["technical_score"] = eval_result["technical_score"]
        active_q["communication_score"] = eval_result["communication_score"]
        active_q["confidence_score"] = eval_result["confidence_score"]
        active_q["feedback"] = eval_result["feedback"]
        active_q["missed_topics"] = eval_result["missed_topics"]
        
        session.history = json.dumps(history)
        db.commit()

        resume_hash = hashlib.sha256(session.email.strip().lower().encode('utf-8')).hexdigest()
        mem_entry = InterviewQuestionMemory(
            resume_hash=resume_hash,
            user_id=1,
            interview_id=session_id,
            question_id=active_q["question_id"],
            difficulty=active_q["difficulty"],
            topic=active_q["category"],
            answer=answer_text,
            score=eval_result["overall_score"]
        )
        db.add(mem_entry)
        db.commit()

        # 4. Determine Next Question / Follow-up Logic
        # Dynamic keyword-matched follow-ups (Phase 7 & 11)
        # Skip if empty or skipped answer (score <= 20)
        if 20 < eval_result["overall_score"] < 60 and not active_q.get("is_follow_up", False):
            from backend.app.services.resume_question_generator import get_followup_question
            
            followup_q = get_followup_question(answer_text, active_q["category"])
            followup_item = {
                "round_number": session.current_round_index + 1,
                "round_name": f"{blueprint[session.current_round_index]['name']} (Follow-up)",
                "category": active_q["category"],
                "question_id": followup_q["id"],
                "question_text": followup_q["question_text"],
                "expected_answer": followup_q["expected_answer"],
                "rubric": followup_q["rubric"],
                "follow_ups": json.dumps([]),
                "difficulty": active_q["difficulty"],
                "answer": None,
                "score": None,
                "feedback": None,
                "is_follow_up": True
            }
            history.append(followup_item)
            session.history = json.dumps(history)
            db.commit()
            
            return {
                "is_completed": False,
                "next_question": {
                    "question_text": followup_q["question_text"],
                    "estimated_time": 90,
                    "difficulty": active_q["difficulty"],
                    "round_name": followup_item["round_name"],
                    "round_number": session.current_round_index + 1
                }
            }

        # 5. Advance to Next Round
        session.current_round_index += 1
        if session.current_round_index >= len(blueprint):
            session.is_completed = 1
            db.commit()
            compile_session_report(session, db)
            
            return {
                "is_completed": True,
                "session_id": session_id,
                "overall_score": eval_result["overall_score"],
                "hiring_recommendation": "Calculated on Report compiling"
            }
            
        next_round = blueprint[session.current_round_index]
        category = next_round["category"]
        
        # Adaptive difficulty adjustment based on past answers (Phase 8 instant adaptivity)
        evaluated_scores = [h["score"] for h in history if h["score"] is not None]
        curr_diff = session.current_difficulty
        
        if evaluated_scores:
            last_score = evaluated_scores[-1]
            if last_score >= 80:
                diff_flow = {"Easy": "Medium", "Medium": "Hard", "Hard": "Expert", "Expert": "Expert"}
                curr_diff = diff_flow.get(curr_diff, "Medium")
            elif last_score < 60:
                diff_flow = {"Expert": "Hard", "Hard": "Medium", "Medium": "Easy", "Easy": "Easy"}
                curr_diff = diff_flow.get(curr_diff, "Medium")
                
        session.current_difficulty = curr_diff
        projects_list = [p["name"] for p in blueprint if p["category"] == "Projects"]
        
        next_question = select_question(
            db=db,
            email=session.email,
            industry=session.role,
            role=session.role,
            category=category,
            difficulty=curr_diff,
            projects=projects_list,
            round_number=session.current_round_index + 1
        )
        
        history_item = {
            "round_number": session.current_round_index + 1,
            "round_name": next_round["name"],
            "category": category,
            "question_id": next_question["id"],
            "question_text": next_question["question_text"],
            "expected_answer": next_question["expected_answer"],
            "rubric": next_question["rubric"],
            "follow_ups": next_question["follow_ups"],
            "difficulty": next_question["difficulty"],
            "answer": None,
            "score": None,
            "feedback": None,
            "is_follow_up": False
        }
        
        history.append(history_item)
        session.history = json.dumps(history)
        db.commit()
        
        return {
            "is_completed": False,
            "next_question": {
                "question_text": next_question["question_text"],
                "estimated_time": next_question["estimated_time"],
                "difficulty": next_question["difficulty"],
                "round_name": next_round["name"],
                "round_number": session.current_round_index + 1
            }
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/interview/report/{session_id}")
async def get_stateful_interview_report(session_id: str, db: Session = Depends(get_db)):
    report = db.query(InterviewReport).filter(InterviewReport.session_id == session_id).first()
    session = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
    
    if not report:
        if session:
            session.is_completed = 1
            db.commit()
            compile_session_report(session, db)
            report = db.query(InterviewReport).filter(InterviewReport.session_id == session_id).first()
        else:
            raise HTTPException(status_code=404, detail="Interview session not found.")
            
    history_list = []
    if session:
        try:
            history_list = json.loads(session.history)
        except:
            pass
            
    return {
        "success": True,
        "message": "Report fetched",
        "data": {
            "session_id": session_id,
            "overall_score": report.overall_score,
            "scores_breakdown": {
                "technical": report.technical_score,
                "communication": report.communication_score,
                "confidence": report.confidence_score,
                "problem_solving": report.problem_solving_score,
                "behavioural": report.behavioural_score,
                "hr": report.hr_score,
                "projects": report.project_score
            },
            "strengths": json.loads(report.strengths),
            "weaknesses": json.loads(report.weaknesses),
            "missed_topics": json.loads(report.missed_topics),
            "repeated_mistakes": json.loads(report.repeated_mistakes),
            "skill_gaps": json.loads(report.skill_gaps),
            "hiring_recommendation": report.hiring_recommendation,
            "career_readiness": report.career_readiness,
            "pdf_download_url": f"/interview/report/{session_id}/pdf",
            "history": history_list
        }
    }

@router.get("/interview/report/{session_id}/pdf")
async def download_stateful_pdf_report(session_id: str, db: Session = Depends(get_db)):
    report = db.query(InterviewReport).filter(InterviewReport.session_id == session_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found.")
        
    if not report.pdf_path or not os.path.exists(report.pdf_path):
        raise HTTPException(status_code=404, detail="PDF report file does not exist on disk.")
        
    return FileResponse(report.pdf_path, filename=f"NeuroPath_AI_Interview_{session_id}.pdf", media_type="application/pdf")

def compile_session_report(session: InterviewSession, db: Session) -> dict:
    history = json.loads(session.history)
    violations = json.loads(session.violations)
    
    tech_scores = []
    comm_scores = []
    conf_scores = []
    prob_scores = []
    beh_scores = []
    hr_scores = []
    proj_scores = []
    
    strengths = []
    weaknesses = []
    missed_topics = []
    repeated_mistakes = []
    skill_gaps = []
    
    for h in history:
        score = h.get("score")
        if score is None:
            continue
            
        category = h.get("category", "")
        
        if category in ["Technical", "System Design", "Scenario", "Projects"]:
            tech_scores.append(h.get("technical_score", score))
            
        if category in ["System Design", "Scenario"]:
            prob_scores.append(h.get("technical_score", score))
            
        if category in ["Behavioural"]:
            beh_scores.append(h["score"])
            
        if category in ["HR", "Intro", "Closing"]:
            hr_scores.append(h["score"])
            
        if category in ["Projects", "Resume"]:
            proj_scores.append(h["score"])
            
        comm_scores.append(h.get("communication_score", score))
        conf_scores.append(h.get("confidence_score", score))
        
        topic = h.get("round_name", category)
        if score >= 75:
            strengths.append(f"Demonstrates proficiency in {topic}")
        elif score < 60:
            weaknesses.append(f"Needs improvement in {topic}")
            skill_gaps.append(h.get("topic", category))
            
        missed = h.get("missed_topics", [])
        if missed:
            missed_topics.extend(missed)
            if len([m for m in missed_topics if m == missed[0]]) > 1:
                repeated_mistakes.append(f"Repeated omission of {missed[0]}")

    def avg(lst, fallback=60):
        return round(sum(lst) / len(lst), 1) if lst else fallback

    technical_avg = avg(tech_scores, 70)
    communication_avg = avg(comm_scores, 75)
    confidence_avg = max(20, avg(conf_scores, 75) - (len(violations) * 8))
    problem_solving_avg = avg(prob_scores, 65)
    behavioural_avg = avg(beh_scores, 75)
    hr_avg = avg(hr_scores, 75)
    project_avg = avg(proj_scores, 70)
    
    overall_score = round(
        technical_avg * 0.4 +
        communication_avg * 0.2 +
        confidence_avg * 0.15 +
        problem_solving_avg * 0.15 +
        behavioural_avg * 0.1,
        1
    )
    
    if len(violations) >= 3:
        overall_score = max(10, overall_score - 15)
        
    strengths = list(set(strengths))[:4]
    weaknesses = list(set(weaknesses))[:4]
    missed_topics = list(set(missed_topics))[:5]
    repeated_mistakes = list(set(repeated_mistakes))[:3]
    skill_gaps = list(set(skill_gaps))[:4]
    
    if not strengths:
        strengths = ["Structured basic response delivery", "Cooperative conversational tone"]
    if not weaknesses:
        weaknesses = ["Incorporate more practical metrics in project descriptions"]
        
    recommendation = "No Hire"
    if overall_score >= 80:
        recommendation = "Strong Hire"
    elif overall_score >= 62:
        recommendation = "Hire"
    elif overall_score >= 50:
        recommendation = "Deferred / Needs Review"
        
    readiness = f"{overall_score}% Profile Alignment"
    
    roadmap_items = []
    for gap in skill_gaps[:3]:
        roadmap_items.append({
            "skill": gap,
            "level": "Intermediate",
            "steps": [
                f"Review foundational documentation and articles on {gap}.",
                f"Build a sandbox prototype implementation demonstrating {gap}.",
                f"Optimize the prototype's performance and security boundaries."
            ],
            "resources": [f"https://www.google.com/search?q={gap.replace(' ', '+')}+tutorial", "https://roadmap.sh"]
        })
        
    if not roadmap_items:
        roadmap_items = [{
            "skill": f"Mastery of {session.role}",
            "level": "Advanced",
            "steps": [
                "Deploy production integrations handling peak operational load.",
                "Acquire certifications focusing on architecture.",
                "Review open-source codebases for system design optimization."
            ],
            "resources": ["https://roadmap.sh"]
        }]

    candidate_info = {
        "name": session.email.split("@")[0].capitalize(),
        "email": session.email,
        "date": session.created_at.split("T")[0],
        "industry": "Technology",
        "role": session.role,
        "level": session.level
    }
    
    scores = {
        "overall": overall_score,
        "technical": technical_avg,
        "communication": communication_avg,
        "confidence": confidence_avg,
        "problem_solving": problem_solving_avg,
        "behavioural": behavioural_avg,
        "hr": hr_avg,
        "project": project_avg
    }
    
    analytics = {
        "strengths": strengths,
        "weaknesses": weaknesses,
        "missed_topics": missed_topics,
        "repeated_mistakes": repeated_mistakes,
        "skill_gaps": skill_gaps,
        "hiring_recommendation": recommendation,
        "career_readiness": readiness
    }
    
    pdf_path = generate_pdf_report(session.id, candidate_info, scores, analytics, roadmap_items)
    
    report = InterviewReport(
        session_id=session.id,
        overall_score=overall_score,
        technical_score=technical_avg,
        communication_score=communication_avg,
        confidence_score=confidence_avg,
        problem_solving_score=problem_solving_avg,
        behavioural_score=behavioural_avg,
        hr_score=hr_avg,
        project_score=project_avg,
        strengths=json.dumps(strengths),
        weaknesses=json.dumps(weaknesses),
        missed_topics=json.dumps(missed_topics),
        repeated_mistakes=json.dumps(repeated_mistakes),
        skill_gaps=json.dumps(skill_gaps),
        hiring_recommendation=recommendation,
        career_readiness=readiness,
        pdf_path=pdf_path
    )
    
    db.add(report)
    db.commit()
    
    return scores
