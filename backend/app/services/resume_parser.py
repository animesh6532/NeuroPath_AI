import re
import os
import zipfile
import xml.etree.ElementTree as ET

# 1. DYNAMIC IMPORTS FOR OTHER RUNTIMES
try:
    from pdfminer.high_level import extract_text as pdf_extract_text
except ImportError:
    pdf_extract_text = None

try:
    import pytesseract
    from PIL import Image
    HAS_OCR = True
except ImportError:
    HAS_OCR = False

# Comprehensive lists for parsing
DEGREE_KEYWORDS = [
    "B.Tech", "M.Tech", "B.Sc", "M.Sc", "BCA", "MCA", "BBA", "MBA", "MBBS",
    "BDS", "LLB", "LLM", "PhD", "Doctorate", "CA", "CS", "CMA", "Diploma",
    "ITI", "BA", "MA", "B.Com", "M.Com", "B.Arch", "M.Arch", "B.Pharm", "M.Pharm",
    "Nursing", "B.Ed", "M.Ed", "BFA", "MFA", "B.Des", "M.Des"
]

LANGUAGES = [
    "English", "Spanish", "French", "German", "Mandarin", "Japanese", "Hindi",
    "Russian", "Portuguese", "Italian", "Arabic", "Bengali", "Korean"
]

SKILL_ALIASES = {
    "js": "JavaScript", "javascript": "JavaScript", "java script": "JavaScript",
    "ml": "Machine Learning", "machine learning": "Machine Learning",
    "ai": "Artificial Intelligence", "artificial intelligence": "Artificial Intelligence",
    "python3": "Python", "py": "Python", "python": "Python",
    "reactjs": "React", "react.js": "React", "react": "React",
    "node": "Node.js", "nodejs": "Node.js", "node.js": "Node.js",
    "aws": "AWS", "amazon web services": "AWS",
    "kubernetes": "Kubernetes", "k8s": "Kubernetes",
    "docker": "Docker", "git": "Git", "github": "Git",
    "sql": "SQL", "postgresql": "PostgreSQL", "postgres": "PostgreSQL",
    "mysql": "MySQL", "mongodb": "MongoDB", "mongo": "MongoDB",
    "c#": "C#", "csharp": "C#", "c++": "C++", "cpp": "C++"
}

SOFT_SKILLS_LIST = [
    "leadership", "communication", "problem solving", "negotiation", "teamwork",
    "critical thinking", "time management", "adaptability", "conflict resolution",
    "emotional intelligence", "decision making", "presentation", "public speaking"
]

def normalize_skill(skill: str) -> str:
    """Standardizes skill names based on the aliases dictionary."""
    s_lower = skill.strip().lower()
    return SKILL_ALIASES.get(s_lower, skill.strip())

# 2. ZERO-DEPENDENCY FILE EXTRACTORS
def extract_docx_text(docx_path: str) -> str:
    try:
        with zipfile.ZipFile(docx_path) as docx:
            xml_content = docx.read('word/document.xml')
            root = ET.fromstring(xml_content)
            namespaces = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
            text_elements = root.findall('.//w:t', namespaces)
            return '\n'.join([el.text for el in text_elements if el.text])
    except Exception as e:
        print(f"[docx] native extraction failed: {e}")
        return ""

def extract_image_text(image_path: str) -> str:
    if not HAS_OCR:
        return "[OCR packages not configured on server. Please upload digital PDF/DOCX.]"
    try:
        img = Image.open(image_path)
        return pytesseract.image_to_string(img)
    except Exception as e:
        print(f"[ocr] image parsing failed: {e}")
        return f"[OCR execution failed: {e}]"

def extract_text_from_file(file_path: str) -> str:
    """Main entrypoint to extract raw text from PDF, DOCX, or Images."""
    ext = os.path.splitext(file_path)[1].lower()
    
    if ext == ".pdf":
        text = ""
        if pdf_extract_text:
            try:
                text = pdf_extract_text(file_path)
            except Exception as e:
                print(f"[pdfminer] failed: {e}")
        return text
    elif ext == ".docx":
        return extract_docx_text(file_path)
    elif ext in [".png", ".jpg", ".jpeg", ".bmp"]:
        return extract_image_text(file_path)
    else:
        # Plain text fallback
        try:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                return f.read()
        except Exception as e:
            print(f"[fallback] file reading failed: {e}")
            return ""

# 3. TEXT INTELLIGENCE PARSER
def parse_resume(text: str) -> dict:
    """
    Exhaustive rule-based parser that segments any resume layout into clean 
    normalized sections, extracting granular metadata.
    """
    clean_lines = [line.strip() for line in text.split("\n") if line.strip()]
    full_clean_text = " ".join(clean_lines)
    full_clean_text_lower = full_clean_text.lower()

    # 1. Contact Information & Socials
    email = ""
    phone = ""
    location = "N/A"
    linkedin = ""
    github = ""
    portfolio = ""
    website = ""

    email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', full_clean_text)
    if email_match:
        email = email_match.group(0)

    phone_match = re.search(r'\+?\d[\d\-\s\(\)]{8,16}\d', full_clean_text)
    if phone_match:
        phone = phone_match.group(0)

    loc_match = re.search(r'\b[A-Z][a-zA-Z\s]{2,15},\s*[A-Z]{2,3}\b|\b[A-Z][a-zA-Z\s]{2,20}\s+\d{5,6}\b', full_clean_text)
    if loc_match:
        location = loc_match.group(0)

    li_match = re.search(r'linkedin\.com/in/[\w\-]+', full_clean_text, re.IGNORECASE)
    if li_match:
        linkedin = "https://" + li_match.group(0)

    gh_match = re.search(r'github\.com/[\w\-]+', full_clean_text, re.IGNORECASE)
    if gh_match:
        github = "https://" + gh_match.group(0)

    port_match = re.search(r'(portfolio|website|behance\.net|dribbble\.com)/[\w\-]+', full_clean_text, re.IGNORECASE)
    if port_match:
        portfolio = "https://" + port_match.group(0)

    # 2. Extract Candidate Name
    name = "Candidate"
    for line in clean_lines[:4]:
        if "@" not in line and "curriculum" not in line.lower() and "resume" not in line.lower() and len(line) < 30:
            if re.match(r'^[a-zA-Z\s\.]+$', line):
                name = line
                break

    # 3. Section Segmentation (Multi-Layout compliance)
    sections = {
        "education": [],
        "experience": [],
        "projects": [],
        "certifications": [],
        "languages": [],
        "objective": [],
        "achievements": [],
        "volunteer": [],
        "hobbies": [],
        "publications": [],
        "leadership": []
    }

    HEADERS = {
        "education": ["education", "academic background", "academic profile", "qualification", "academics", "scholastic", "educational qualification"],
        "experience": ["experience", "employment history", "work experience", "professional experience", "work history", "career history", "internship", "employment"],
        "projects": ["projects", "personal projects", "academic projects", "key projects", "portfolio"],
        "certifications": ["certifications", "certificates", "licenses", "credentials", "courses"],
        "languages": ["languages", "language proficiency"],
        "objective": ["objective", "summary", "professional summary", "about me", "profile", "career objective"],
        "achievements": ["achievements", "awards", "patents", "honors"],
        "volunteer": ["volunteer work", "volunteer experience", "community service", "volunteering"],
        "hobbies": ["hobbies", "interests", "extracurricular activities"],
        "publications": ["publications", "research papers", "conference", "journal articles", "articles"],
        "leadership": ["leadership", "leadership positions", "roles of responsibility"]
    }

    current_section = None
    for line in clean_lines:
        line_lower = line.lower()
        is_header = False
        for sec, keywords in HEADERS.items():
            if any(line_lower == kw or line_lower.startswith(kw + " ") or line_lower.endswith(" " + kw) for kw in keywords) and len(line) < 35:
                current_section = sec
                is_header = True
                break
        
        if is_header:
            continue

        if current_section:
            sections[current_section].append(line)

    # 4. Extract Structured Education
    education_list = []
    for edu_line in sections["education"]:
        degree = "N/A"
        major = "General"
        university = "N/A"
        gpa = "N/A"
        year = "N/A"
        
        for d_kw in DEGREE_KEYWORDS:
            if re.search(r'\b' + re.escape(d_kw) + r'\b', edu_line, re.IGNORECASE):
                degree = d_kw
                break
                
        if degree == "N/A" and not any(k in edu_line.lower() for k in ["university", "college", "school", "board"]):
            continue

        major_match = re.search(r'(?:in|of)\s+([A-Za-z\s]{3,20})(?:,|\s|$)', edu_line)
        if major_match:
            major = major_match.group(1).strip()
            
        univ_match = re.search(r'([A-Za-z\s\.\-]{3,40}\s+(?:University|College|Institute|School|Academy|Board))', edu_line, re.IGNORECASE)
        if univ_match:
            university = univ_match.group(1).strip()
            
        gpa_match = re.search(r'\b(GPA|CGPA|Percentage)?\s*:?\s*(\d(?:\.\d{1,2})?)(?:/10|/4)?\b|\b(\d{2}(?:\.\d{1,2})?%)\b', edu_line, re.IGNORECASE)
        if gpa_match:
            gpa = gpa_match.group(0).strip()
            
        year_match = re.search(r'\b(19|20)\d{2}\b', edu_line)
        if year_match:
            year = year_match.group(0)

        education_list.append({
            "degree": degree,
            "major": major,
            "university": university,
            "gpa": gpa,
            "year": year,
            "detail": edu_line
        })

    if not education_list and sections["education"]:
        education_list.append({
            "degree": "Degree / Diploma",
            "major": "General",
            "university": sections["education"][0],
            "gpa": "N/A",
            "year": "N/A",
            "detail": " ".join(sections["education"][:2])
        })

    # 5. Extract Structured Experience & Internships
    # Corporate Experience and Internships must be separated!
    experience_list = []
    internships_list = []
    
    current_job = None
    DESIGNATIONS = ["engineer", "developer", "manager", "associate", "intern", "officer", "analyst", "practitioner", "specialist", "lawyer", "nurse", "teacher", "director"]

    for line in sections["experience"]:
        is_new_job = any(des in line.lower() for des in DESIGNATIONS) and len(line) < 60
        
        if is_new_job:
            if current_job:
                # Segment between Corporate vs Internships
                if "intern" in current_job["role"].lower() or "co-op" in current_job["role"].lower():
                    internships_list.append(current_job)
                else:
                    experience_list.append(current_job)
            
            role = line
            company = "Company"
            duration = "N/A"
            
            comp_match = re.search(r'at\s+([A-Za-z0-9\s\.\-]+)(?:,|\s|$)', line, re.IGNORECASE)
            if comp_match:
                company = comp_match.group(1).strip()
                
            date_match = re.search(r'\b(?:19|20)\d{2}\b.*(Present|current|\b(?:19|20)\d{2}\b)', line, re.IGNORECASE)
            if date_match:
                duration = date_match.group(0).strip()

            current_job = {
                "role": role,
                "company": company,
                "duration": duration,
                "responsibilities": [],
                "metrics": []
            }
        else:
            if current_job:
                current_job["responsibilities"].append(line)
                metric_matches = re.findall(r'\b\d+%\b|\$\d+(?:,\d+)*(?:\s*[kKmMbB])?\b|\b\d+\s*x\b', line)
                if metric_matches:
                    current_job["metrics"].extend(metric_matches)
            else:
                current_job = {
                    "role": "Professional Role",
                    "company": "Organization",
                    "duration": "N/A",
                    "responsibilities": [line],
                    "metrics": []
                }

    if current_job:
        if "intern" in current_job["role"].lower() or "co-op" in current_job["role"].lower():
            internships_list.append(current_job)
        else:
            experience_list.append(current_job)

    # 6. Extract Projects & Research
    projects_list = []
    research_list = []
    
    current_proj = None
    prev_was_bullet = False
    bullet_chars = ("•", "-", "*", "▪", "◦", "✓", "+", "—", "–", "■")
    
    for line in sections["projects"]:
        line_stripped = line.strip()
        if not line_stripped:
            continue
            
        starts_with_bullet = line_stripped.startswith(bullet_chars) or re.match(r'^\d+\.', line_stripped) is not None
        
        # Check if this line starts a new project
        is_new_proj = False
        
        # Check keywords
        has_keywords = len(line_stripped) < 70 and any(keyword in line_stripped.lower() for keyword in [
            "project", "portfolio", "system", "app", "website", "platform", "model", "tool", 
            "application", "solver", "compiler", "engine", "pipeline", "simulator", "dashboard", 
            "network", "detector", "classifier", "matcher", "bot", "interface"
        ])
        
        # Heuristics for bullet lists: short lines without bullets, following a bullet or at start
        if not starts_with_bullet and len(line_stripped) < 80:
            if current_proj is None or prev_was_bullet:
                is_new_proj = True
                
        if has_keywords:
            is_new_proj = True
            
        if is_new_proj:
            if current_proj:
                projects_list.append(current_proj)
            current_proj = {
                "name": line_stripped,
                "description": "",
                "technologies": []
            }
        else:
            if current_proj:
                current_proj["description"] += " " + line_stripped
            else:
                current_proj = {
                    "name": line_stripped if len(line_stripped) < 50 else "Project Task",
                    "description": line_stripped,
                    "technologies": []
                }
        prev_was_bullet = starts_with_bullet
        
    if current_proj:
        projects_list.append(current_proj)

    for p in projects_list:
        p["description"] = p["description"].strip()
        # Segment project technical keywords
        for alias in SKILL_ALIASES.keys():
            if re.search(r'\b' + re.escape(alias) + r'\b', p["description"].lower()):
                p["technologies"].append(normalize_skill(alias))
        p["technologies"] = list(set(p["technologies"]))

    # Sort Research papers/publications from Projects
    for line in sections["publications"]:
        if len(line) > 10:
            research_list.append(line)
            
    # If publications empty, fallback to achievements scans
    if not research_list:
        for line in sections["achievements"]:
            if any(keyword in line.lower() for keyword in ["paper", "publication", "patent", "journal", "research"]):
                research_list.append(line)

    # 7. Extract Certifications
    certs_list = []
    for line in sections["certifications"]:
        if len(line) > 3:
            certs_list.append(line)

    # 8. Extract Languages
    languages_list = []
    for lang in LANGUAGES:
        if re.search(r'\b' + re.escape(lang) + r'\b', full_clean_text, re.IGNORECASE):
            languages_list.append(lang)
    if not languages_list:
        languages_list = ["English"]

    # 9. Extract and Normalize Skills
    detected_skills = set()
    detected_soft_skills = set()

    # Match technical skills
    for alias, standard_name in SKILL_ALIASES.items():
        if re.search(r'\b' + re.escape(alias) + r'\b', full_clean_text_lower):
            detected_skills.add(standard_name)

    # Match soft skills
    for soft_skill in SOFT_SKILLS_LIST:
        if re.search(r'\b' + re.escape(soft_skill) + r'\b', full_clean_text_lower):
            detected_soft_skills.add(soft_skill.capitalize())

    # 10. Summary / Objective
    objective_statement = "N/A"
    if sections["objective"]:
        objective_statement = " ".join(sections["objective"])

    return {
        "name": name,
        "email": email,
        "phone": phone,
        "location": location,
        "linkedin": linkedin,
        "github": github,
        "portfolio": portfolio,
        "website": website,
        "summary": objective_statement,
        "education": education_list,
        "experience": [f"{exp['role']} at {exp['company']} ({exp['duration']}): {', '.join(exp['responsibilities'][:2])}" for exp in experience_list],
        "structured_experience": experience_list,
        "internships": [f"{i['role']} at {i['company']} ({i['duration']}): {', '.join(i['responsibilities'][:2])}" for i in internships_list],
        "structured_internships": internships_list,
        "projects": [f"{p['name']}: {p['description']}" for p in projects_list],
        "structured_projects": projects_list,
        "research": research_list,
        "certifications": certs_list,
        "languages": languages_list,
        "detected_skills": list(detected_skills),
        "soft_skills": list(detected_soft_skills),
        "achievements": sections["achievements"],
        "volunteer_work": sections["volunteer"],
        "hobbies": sections["hobbies"],
        "publications": research_list,
        "leadership": sections["leadership"],
        "full_text": text
    }
