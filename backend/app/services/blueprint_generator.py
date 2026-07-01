def generate_interview_blueprint(career_profile: dict, resume_profile: dict) -> list:
    """
    Generates a level-appropriate, role-aligned, and project-aware interview
    blueprint consisting of 6 to 10 rounds.
    """
    level = career_profile.get("career_level", "Entry")
    role = career_profile.get("primary_role", "Software Developer")
    detected_skills = resume_profile.get("detected_skills", [])
    if not detected_skills:
        detected_skills = ["programming", "problem solving", "communication"]
        
    projects_list = resume_profile.get("structured_projects", [])
    proj_name = projects_list[0].get("name", "Key Project") if projects_list else "Recent Project"
    
    exp_list = resume_profile.get("structured_experience", [])
    company_name = exp_list[0].get("company", "Prior Organization") if exp_list else "Prior Work"

    # Define all possible blueprint rounds
    all_rounds = {
        "Intro": {
            "name": "Introduction & Background",
            "category": "Intro",
            "focus": "General",
            "description": "Tell us about yourself and your professional journey.",
            "duration": 90,
            "difficulty": "Easy"
        },
        "Resume": {
            "name": "Resume Walkthrough",
            "category": "Resume",
            "focus": "Experience History",
            "description": f"Discussing your career progression leading towards {role}.",
            "duration": 90,
            "difficulty": "Easy" if level == "Entry" else "Medium"
        },
        "Projects": {
            "name": "Project Evaluation",
            "category": "Projects",
            "focus": proj_name,
            "description": f"Deep dive into design decisions and methodologies of project '{proj_name}'.",
            "duration": 120,
            "difficulty": "Medium" if level in ["Entry", "Mid"] else "Hard"
        },
        "Internship": {
            "name": "Work Experience Discussion",
            "category": "Internship",
            "focus": company_name,
            "description": f"Reviewing responsibilities and impact achieved at '{company_name}'.",
            "duration": 90,
            "difficulty": "Medium" if level in ["Entry", "Mid"] else "Hard"
        },
        "TechFundamentals": {
            "name": "Technical Fundamentals",
            "category": "Technical",
            "focus": detected_skills[0] if detected_skills else "Core Concepts",
            "description": f"Testing core concepts related to '{detected_skills[0] if detected_skills else 'Fundamentals'}'.",
            "duration": 90,
            "difficulty": "Easy" if level == "Entry" else "Medium"
        },
        "TechAdvanced": {
            "name": "Advanced Concept Analysis",
            "category": "Technical",
            "focus": detected_skills[1] if len(detected_skills) > 1 else detected_skills[0],
            "description": f"Exploring edge cases, optimizations, and internal details of '{detected_skills[1] if len(detected_skills) > 1 else detected_skills[0]}'.",
            "duration": 120,
            "difficulty": "Medium" if level == "Entry" else ("Hard" if level in ["Mid", "Senior"] else "Expert")
        },
        "Scenario": {
            "name": "Scenario-Based Problems",
            "category": "Scenario",
            "focus": "System Troubleshooting",
            "description": "How you diagnose, mitigate, and resolve sudden production or business crises.",
            "duration": 120,
            "difficulty": "Medium" if level == "Entry" else ("Hard" if level in ["Mid", "Senior"] else "Expert")
        },
        "SystemDesign": {
            "name": "Architecture & System Design",
            "category": "System Design",
            "focus": "Scalability & Performance",
            "description": "Designing highly scalable, reliable, and decoupled systems or processes.",
            "duration": 120,
            "difficulty": "Medium" if level == "Mid" else ("Hard" if level == "Senior" else "Expert")
        },
        "Behavioural": {
            "name": "Behavioural & Leadership",
            "category": "Behavioural",
            "focus": "Conflict & Collaboration",
            "description": "Handling interpersonal team situations, deadlines, and ownership responsibilities.",
            "duration": 90,
            "difficulty": "Medium" if level in ["Entry", "Mid"] else "Hard"
        },
        "HR": {
            "name": "HR & Cultural Alignment",
            "category": "HR",
            "focus": "Long-term Goals",
            "description": "Assessing cultural fit, motivations, and salary/career expectations.",
            "duration": 90,
            "difficulty": "Easy" if level == "Entry" else "Medium"
        },
        "Closing": {
            "name": "Candidate Questions & Closing",
            "category": "HR",
            "focus": "Q&A",
            "description": "Closing remarks, and addressing candidate questions regarding company culture or expectations.",
            "duration": 60,
            "difficulty": "Easy"
        }
    }

    # Select level-appropriate rounds
    selected_keys = []
    if level == "Entry":
        # 6 Rounds
        selected_keys = ["Intro", "Resume", "Projects", "TechFundamentals", "Behavioural", "Closing"]
    elif level == "Mid":
        # 8 Rounds
        selected_keys = ["Intro", "Resume", "Projects", "Internship", "TechFundamentals", "Scenario", "Behavioural", "Closing"]
    else:
        # Senior / Lead - 10 Rounds
        selected_keys = ["Intro", "Resume", "Projects", "Internship", "TechFundamentals", "TechAdvanced", "SystemDesign", "Scenario", "Behavioural", "Closing"]

    blueprint = []
    for idx, key in enumerate(selected_keys):
        round_data = all_rounds[key].copy()
        round_data["round_number"] = idx + 1
        blueprint.append(round_data)
        
    return blueprint
