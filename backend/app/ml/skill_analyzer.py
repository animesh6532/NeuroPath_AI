import re

SKILLS = [
    "python",
    "machine learning",
    "sql",
    "java",
    "c++",
    "pandas",
    "numpy",
    "tensorflow",
    "data analysis",
    "react",
    "node",
    "fastapi",
    "aws",
    "docker",
    "kubernetes"
]

def extract_skills(text):
    text = text.lower()
    detected = []
    for skill in SKILLS:
        if re.search(r'\b' + re.escape(skill) + r'\b', text):
            detected.append(skill)
    return detected

def extract_projects(text):
    # Simple heuristic: Look for keywords like "project", "developed", "built", "created"
    projects = []
    lines = text.split('\n')
    in_project_section = False
    
    for line in lines:
        lower_line = line.lower().strip()
        if not lower_line:
            continue
            
        if "project" in lower_line and len(lower_line) < 30:
            in_project_section = True
            continue
        elif in_project_section and any(header in lower_line for header in ["experience", "education", "skills"]):
            in_project_section = False
            
        if in_project_section and len(lower_line) > 10:
            projects.append(line.strip())
            
    # Fallback if no specific project section found
    if not projects:
        for line in lines:
            if any(word in line.lower() for word in ["built", "developed", "created", "designed"]) and len(line.strip()) > 20:
                projects.append(line.strip())
                if len(projects) >= 3:
                    break
                    
    return projects[:3] if projects else ["Personal Portfolio", "Academic Project"]

def extract_experience(text):
    # Simple heuristic
    experience = []
    lines = text.split('\n')
    in_exp_section = False
    
    for line in lines:
        lower_line = line.lower().strip()
        if not lower_line:
            continue
            
        if any(header in lower_line for header in ["experience", "work history", "employment"]) and len(lower_line) < 30:
            in_exp_section = True
            continue
        elif in_exp_section and any(header in lower_line for header in ["project", "education", "skills"]):
            in_exp_section = False
            
        if in_exp_section and len(lower_line) > 10:
            experience.append(line.strip())
            
    # Fallback
    if not experience:
        for line in lines:
            if any(word in line.lower() for word in ["intern", "engineer", "developer", "manager"]) and len(line.strip()) > 15:
                experience.append(line.strip())
                if len(experience) >= 2:
                    break
                    
    return experience[:3] if experience else ["Software Developer Intern", "Freelance Developer"]