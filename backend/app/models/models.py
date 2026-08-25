from sqlalchemy import Column, Integer, String, Float
from backend.app.database.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True)
    password = Column(String)

class Occupation(Base):
    __tablename__ = "occupations"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    industry = Column(String, index=True)
    subdomain = Column(String, index=True)
    required_skills = Column(String)    # JSON serialized list of skills
    preferred_skills = Column(String)   # JSON serialized list of skills
    soft_skills = Column(String)        # JSON serialized list of soft skills
    degrees = Column(String)            # JSON serialized list of degrees
    certifications = Column(String)     # JSON serialized list of certifications
    salary_entry = Column(Integer)
    salary_avg = Column(Integer)
    salary_senior = Column(Integer)
    growth_rate = Column(Float)
    future_demand = Column(String)
    career_path = Column(String)        # JSON serialized list
    description = Column(String)

class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    aliases = Column(String)            # JSON serialized list
    category = Column(String, index=True)
    parent_category = Column(String)
    industry = Column(String)
    difficulty = Column(String)

class AnalysisCache(Base):
    __tablename__ = "analysis_cache"

    id = Column(Integer, primary_key=True, index=True)
    fingerprint = Column(String, unique=True, index=True)
    payload = Column(String)            # JSON serialized result payload

class InterviewQuestion(Base):
    __tablename__ = "interview_questions"

    id = Column(Integer, primary_key=True, index=True)
    question_text = Column(String, index=True)
    topic = Column(String, index=True)
    sub_topic = Column(String, index=True)
    difficulty = Column(String, index=True) # Easy, Medium, Hard, Expert
    industry = Column(String, index=True)
    role = Column(String, index=True)
    experience_level = Column(String, index=True) # Entry, Mid, Senior, Lead
    expected_answer = Column(String)
    evaluation_rubric = Column(String) # JSON list
    follow_ups = Column(String) # JSON list
    concept_tags = Column(String) # JSON list
    estimated_time = Column(Integer, default=90) # seconds

class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id = Column(String, primary_key=True, index=True) # UUID string
    email = Column(String, index=True)
    role = Column(String)
    level = Column(String)
    blueprint = Column(String) # JSON list of rounds
    current_round_index = Column(Integer, default=0)
    current_difficulty = Column(String, default="Medium")
    history = Column(String, default="[]") # JSON list of asked questions, answers, and scores
    violations = Column(String, default="[]") # JSON list of proctoring violations
    is_completed = Column(Integer, default=0) # 0 for False, 1 for True
    session_status = Column(String, default="CREATED") # CREATED, READY, ACTIVE, COMPLETED, TERMINATED, EXPIRED
    created_at = Column(String) # Date string

class InterviewReport(Base):
    __tablename__ = "interview_reports"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, unique=True, index=True)
    overall_score = Column(Float)
    technical_score = Column(Float)
    communication_score = Column(Float)
    confidence_score = Column(Float)
    problem_solving_score = Column(Float)
    behavioural_score = Column(Float)
    hr_score = Column(Float)
    project_score = Column(Float)
    strengths = Column(String) # JSON list
    weaknesses = Column(String) # JSON list
    missed_topics = Column(String) # JSON list
    repeated_mistakes = Column(String) # JSON list
    skill_gaps = Column(String) # JSON list
    hiring_recommendation = Column(String)
    career_readiness = Column(String)
    pdf_path = Column(String)

class InterviewQuestionMemory(Base):
    __tablename__ = "interview_question_memory"

    id = Column(Integer, primary_key=True, index=True)
    resume_hash = Column(String, index=True)
    user_id = Column(Integer, index=True)
    interview_id = Column(String, index=True)
    question_id = Column(Integer)
    difficulty = Column(String)
    topic = Column(String)
    answer = Column(String)
    score = Column(Float)


class AptitudeQuestion(Base):
    __tablename__ = "aptitude_questions"

    id = Column(Integer, primary_key=True, index=True)
    question_text = Column(String, index=True)
    category = Column(String, index=True)
    topic = Column(String, index=True)
    subtopic = Column(String, index=True)
    difficulty = Column(String, index=True)
    bloom_level = Column(String)
    expected_time = Column(Integer)
    correct_answer = Column(String)
    options = Column(String)  # JSON-serialized list of strings
    explanation = Column(String)
    skills_tested = Column(String)  # JSON-serialized list of strings
    tags = Column(String)  # JSON-serialized list of strings
    weight = Column(Float, default=1.0)
    company_tags = Column(String)  # JSON-serialized list of strings
    source = Column(String)
    similarity_hash = Column(String, index=True)
    embedding_vector = Column(String, nullable=True)  # JSON-serialized floats


class AptitudeAttempt(Base):
    __tablename__ = "aptitude_attempts"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, index=True)
    question_ids = Column(String)  # JSON-serialized list of integers
    answers_submitted = Column(String)  # JSON-serialized dict/list of answers
    timestamp = Column(String)  # ISO-formatted date string
    difficulty = Column(String)
    category = Column(String)
    score = Column(Integer)
    total = Column(Integer)
    time_taken = Column(Integer)
    wrong_concepts = Column(String)  # JSON-serialized list of strings
    weak_concepts = Column(String)  # JSON-serialized list of strings


class CodingProblem(Base):
    __tablename__ = "coding_problems"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    difficulty = Column(String, index=True)  # Easy, Medium, Hard
    topic = Column(String, index=True)
    subtopic = Column(String, index=True)
    constraints = Column(String)  # JSON-serialized list of strings
    examples = Column(String)  # JSON-serialized list of dicts (input, output, explanation)
    hints = Column(String)  # JSON-serialized list of strings
    starter_code = Column(String)  # JSON-serialized dict of lang -> code
    reference_solution = Column(String)  # JSON-serialized dict of lang -> code
    test_cases = Column(String)  # JSON-serialized list of dicts (input, output)
    hidden_test_cases = Column(String)  # JSON-serialized list of dicts (input, output)
    complexity = Column(String)
    tags = Column(String)  # JSON-serialized list of strings
    companies = Column(String)  # JSON-serialized list of strings
    similarity_hash = Column(String, index=True)
    embeddings = Column(String, nullable=True)  # JSON-serialized floats


class CodingAttempt(Base):
    __tablename__ = "coding_attempts"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, index=True)
    problem_id = Column(Integer, index=True)
    code = Column(String)
    language = Column(String)
    status = Column(String)  # Accepted, Wrong Answer, Compile Error, TLE, Runtime Error
    runtime = Column(Float)  # execution time in milliseconds
    memory = Column(Float)  # memory footprint in MB
    passed_test_cases = Column(Integer)
    total_test_cases = Column(Integer)
    timestamp = Column(String)  # ISO datetime string
