"""
Learning Roadmap Generator
--------------------------
Generates a detailed, personalized career improvement path by combining:
1. Resume Skill Gaps
2. Interview Evaluated Weaknesses
3. Coding Solved Challenges
4. Aptitude Attempt Mistakes (wrong concepts, weak concepts)
5. Predicted Placement Readiness

Output format:
{
  "career_goal": str,
  "current_readiness": int,
  "strengths": list[str],
  "weak_skills": list[str],
  "priority_skills": list[str],
  "learning_order": list[str],
  "weekly_plan": list[dict],
  "monthly_plan": list[str],
  "estimated_completion": str,
  "difficulty": str,
  "projects": list[dict],
  "coding_challenges": list[str],
  "practice_interviews": list[str],
  "mock_tests": list[str],
  "milestones": list[dict]  # Flat list of modules
}
"""

import json
from sqlalchemy.orm import Session
from backend.app.db.models import AptitudeAttempt
from backend.app.ml.placement.placement_engine import predict_placement_result

def generate_learning_roadmap(
    weaknesses: list,
    missing_skills: list,
    domain: str = "General",
    coding_score: float = 100,
    aptitude_score: float = 100,
    resume_score: float = 70,
    interview_score: float = 70,
    profile_completeness: float = 70,
    email: str = "",
    db: Session = None
) -> dict:
    
    # 1. Normalize and clean inputs
    weaknesses = [w for w in (weaknesses or []) if isinstance(w, str) and w.strip()]
    missing_skills = [s for s in (missing_skills or []) if isinstance(s, str) and s.strip()]
    domain = (domain or "General").strip()

    # 2. Query DB for aptitude failures to find real weak concepts
    apt_wrong_concepts = set()
    apt_weak_categories = set()
    if db and email:
        attempts = db.query(AptitudeAttempt).filter(AptitudeAttempt.email == email).all()
        for attempt in attempts:
            try:
                wrongs = json.loads(attempt.wrong_concepts)
                weaks = json.loads(attempt.weak_concepts)
                if isinstance(wrongs, list):
                    apt_wrong_concepts.update(wrongs)
                if isinstance(weaks, list):
                    apt_weak_categories.update(weaks)
            except Exception as e:
                print(f"[Roadmap Engine] Error querying aptitude attempt details: {e}")

    # Add aptitude and coding weaknesses to combined areas
    combined_gaps = list(dict.fromkeys(weaknesses + missing_skills))
    
    if coding_score < 70:
        combined_gaps.append("Data Structures & Algorithms")
        combined_gaps.append("Code Optimization")
        
    if aptitude_score < 70 or apt_weak_categories:
        for cat in apt_weak_categories:
            combined_gaps.append(cat)
        if "Quantitative Reasoning" not in combined_gaps:
            combined_gaps.append("Quantitative Reasoning")
        if "Logical Reasoning" not in combined_gaps:
            combined_gaps.append("Logical Reasoning")

    # If no specific gaps are found, add default domain milestones
    if not combined_gaps:
        combined_gaps = [
            f"{domain} System Design" if domain != "General" else "General System Design",
            "Advanced API Integrations",
            "Continuous Delivery & Cloud Deployments"
        ]

    # Deduplicate gaps
    combined_gaps = list(dict.fromkeys(combined_gaps))

    # 3. Predict placement readiness index
    placement_res = predict_placement_result(
        resume_score=resume_score,
        interview_score=interview_score,
        coding_score=coding_score,
        aptitude_score=aptitude_score,
        profile_completeness=profile_completeness,
        domain=domain,
        missing_skills=missing_skills
    )
    readiness_idx = placement_res.get("placement_score", 70)

    # 4. Strengths list (inferred from domain competencies minus the weaknesses)
    all_competencies = {
        "Technology": ["Python", "Git", "SQL", "REST APIs", "System Design"],
        "Finance": ["Excel", "Financial Modeling", "Accounting", "Corporate Valuation"],
        "HR": ["Communication", "Recruitment", "Conflict Resolution", "Interpersonal Skills"],
        "Teaching": ["Classroom Management", "Lesson Planning", "Communication", "Academic Research"],
        "General": ["Problem Solving", "Time Management", "Critical Thinking", "Adaptability"]
    }
    domain_comp = all_competencies.get(domain, all_competencies["General"])
    strengths = [s for s in domain_comp if s not in combined_gaps]
    if not strengths:
        strengths = [domain_comp[0], "Problem Solving"]

    # 5. Priority Skills (Top 3 weak areas)
    priority_skills = combined_gaps[:3]

    # 6. Learning Order
    learning_order = combined_gaps

    # 7. Estimated Completion & Difficulty
    gap_count = len(combined_gaps)
    if gap_count > 6:
        estimated_completion = "12 Weeks (3 Months)"
        difficulty_level = "Hard"
    elif gap_count > 3:
        estimated_completion = "8 Weeks (2 Months)"
        difficulty_level = "Medium"
    else:
        estimated_completion = "4 Weeks (1 Month)"
        difficulty_level = "Easy"

    # 8. Weekly Plan & Monthly Plan
    weekly_plan = []
    for week_idx in range(1, min(13, gap_count + 1)):
        skill = combined_gaps[week_idx - 1]
        weekly_plan.append({
            "week": f"Week {week_idx}",
            "topic": skill,
            "focus": f"Mastery of {skill} fundamentals, hands-on implementation, and solving practice test cases."
        })
        
    monthly_plan = []
    num_months = (gap_count + 3) // 4
    for m in range(1, num_months + 1):
        monthly_plan.append(f"Month {m}: Focus on " + ", ".join(combined_gaps[(m-1)*4 : m*4]))

    # 9. Projects
    projects = []
    if "tech" in domain.lower() or "software" in domain.lower() or "developer" in domain.lower() or "engineer" in domain.lower() or domain == "Technology":
        projects = [
            {"title": "Automated Deployment Pipeline", "description": "Construct a full CI/CD deployment flow utilizing GitHub Actions, Docker containers, and AWS EC2 with automatic rollbacks."},
            {"title": "Full-Stack Dashboard Application", "description": "Develop a responsive dashboard with authentication using React for frontend and FastAPI for backend, integrated with SQLite database."}
        ]
    elif "finance" in domain.lower() or domain == "Finance":
        projects = [
            {"title": "Portfolio Optimization Simulator", "description": "Construct an Excel/Python simulation running Monte Carlo algorithms to optimize asset allocation models."},
            {"title": "Corporate LBO Valuation Model", "description": "Design an interactive Leveraged Buyout valuation model analyzing historical performance and debt paydown structures."}
        ]
    else:
        projects = [
            {"title": "Workplace Policy Framework", "description": "Design a comprehensive, compliance-oriented remote work policy handbook with conflict escalation matrixes."},
            {"title": "Interactive Training Bootcamp", "description": "Create a structures onboarding syllabus with lesson plans and interactive proctored quizzes."}
        ]

    # 10. Coding Challenges
    coding_challenges = [
        "Solve daily Array and Sorting challenges on LeetCode.",
        "Implement a custom Stack/Queue or LRU Cache compiler challenge.",
        "Optimize recursion depth and edge-case handling for algorithmic outputs."
    ]

    # 11. Practice Interviews & Mock Tests
    practice_interviews = [
        f"Mock system architectural speaking round targeting {domain} competencies.",
        "Behavioral situational leadership and project conflict-resolution vocal test."
    ]
    mock_tests = [
        "Attempt a 20-question cognitive logical aptitude test.",
        "Solve numerical data interpretation chart analysis exercises."
    ]

    # 12. Milestones / Modules (flat list for backward compatibility with frontend rendering)
    milestones = []
    levels = ["Beginner", "Intermediate", "Advanced"]
    
    # Resource template mappings for official/premium links
    resource_links = {
        "Data Structures": [
            "https://docs.python.org/3/tutorial/datastructures.html",
            "https://www.geeksforgeeks.org/data-structures/",
            "https://leetcode.com"
        ],
        "System Design": [
            "https://github.com/donnemartin/system-design-primer",
            "https://roadmap.sh/system-design",
            "https://www.youtube.com/watch?v=m8IofR5ZTrg"
        ],
        "Quantitative Reasoning": [
            "https://www.khanacademy.org/math/algebra",
            "https://www.indiabix.com/aptitude/questions-and-answers/",
            "https://www.hackerrank.com"
        ],
        "Logical Reasoning": [
            "https://www.indiabix.com/logical-reasoning/questions-and-answers/",
            "https://www.geeksforgeeks.org/logical-reasoning/"
        ]
    }

    for idx, skill in enumerate(combined_gaps):
        level = levels[idx % len(levels)]
        skill_slug = skill.replace(" ", "%20")
        
        # Pull custom resources if matched
        resources = []
        for key, links in resource_links.items():
            if key.lower() in skill.lower():
                resources.extend(links)
                break
                
        if not resources:
            resources = [
                f"https://www.coursera.org/search?query={skill_slug}",
                f"https://roadmap.sh/search?q={skill_slug}",
                f"https://github.com/search?q={skill.replace(' ', '+')}+tutorial",
                f"https://www.youtube.com/results?search_query={skill_slug}+course"
            ]

        milestones.append({
            "skill": skill,
            "level": level,
            "steps": [
                f"Review core definitions and fundamental structures of {skill}.",
                f"Solve hands-on practice questions and trace edge-cases on {skill}.",
                f"Build a standalone code prototype or project integration embodying {skill}.",
                f"Take a mock evaluation assessment to verify concept mastery.",
                f"Optimize the implementation for performance, scalability, and code style."
            ],
            "resources": resources
        })

    return {
        "career_goal": domain,
        "current_readiness": readiness_idx,
        "strengths": strengths,
        "weak_skills": combined_gaps,
        "priority_skills": priority_skills,
        "learning_order": learning_order,
        "weekly_plan": weekly_plan,
        "monthly_plan": monthly_plan,
        "estimated_completion": estimated_completion,
        "difficulty": difficulty_level,
        "projects": projects,
        "coding_challenges": coding_challenges,
        "practice_interviews": practice_interviews,
        "mock_tests": mock_tests,
        "milestones": milestones
    }
