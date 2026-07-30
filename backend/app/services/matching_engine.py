import json
import re
import hashlib
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from backend.app.db.database import SessionLocal
from backend.app.db.models import Occupation, Skill, AnalysisCache

def get_resume_fingerprint(text: str) -> str:
    """Normalizes whitespace, punctuation, and casing, then computes a SHA-256 fingerprint."""
    normalized = re.sub(r'\s+', ' ', text).strip().lower()
    normalized = re.sub(r'[^\w\s]', '', normalized)
    return hashlib.sha256(normalized.encode('utf-8')).hexdigest()

# Global cache to keep queries fast and responsive
MATCHING_CACHE = {
    "vectorizer": None,
    "matrix": None,
    "occupations": None,
    "skills_taxonomy": None
}

DOMAINS_KEYWORD_TAXONOMY = {
    "Technology": ["python", "java", "system design", "data structures", "algorithms", "rest api", "git", "c++", "c#", "unity", "swift", "kotlin", "flutter", "cloud", "docker", "kubernetes", "cybersecurity", "active directory", "databases", "fastapi", "django", "node.js"],
    "Healthcare": ["medical diagnosis", "patient care", "clinical surgery", "anatomy", "physiology", "nursing care", "cpr", "first aid", "phlebotomy", "diagnostics", "pathology", "pharmacology", "therapy", "dental", "orthodontics", "psychology", "mental health"],
    "Finance": ["financial modeling", "financial analysis", "excel", "corporate finance", "valuation", "accounting", "auditing", "taxation", "wealth management", "portfolio management", "capital markets", "mergers", "acquisitions", "quickbooks", "tally", "sap"],
    "Legal": ["contract drafting", "corporate governance", "legal research", "due diligence", "litigation", "court representation", "dispute resolution", "patent", "compliance auditing", "regulatory policy", "paralegal"],
    "Education": ["classroom management", "lesson planning", "pedagogy", "grading", "curriculum design", "academic research", "instructional design", "e-learning", "lms", "school", "teaching", "tutoring"],
    "Marketing": ["digital marketing", "seo", "google analytics", "market research", "campaign tracking", "branding", "public relations", "press releases", "social media strategy", "copywriting"],
    "Engineering": ["solidworks", "cad design", "thermodynamics", "product design", "materials testing", "civil engineering", "structural analysis", "autocad", "circuit design", "power systems", "plc programming", "chemical process safety"],
    "Design": ["adobe creative suite", "photoshop", "illustrator", "typography", "color theory", "figma", "wireframing", "prototyping", "usability testing", "fashion design", "interior design", "blender"],
    "Media": ["journalism", "reporting", "video editing", "premiere pro", "after effects", "sound design"],
    "Hospitality": ["culinary arts", "food hygiene", "inventory management", "recipe creation", "menu design", "hotel management", "event planning"],
    "Agriculture": ["soil science", "crop protection", "agricultural technology", "irrigation design", "agronomist"],
    "Government": ["policy analyst", "public administration", "regulatory policy", "legislative brief", "public affairs"],
    "Transportation": ["flight navigation", "meteorology", "aircraft mechanics", "radar systems", "pilot", "traffic controller"],
    "Human Resources": ["recruitment", "employee relations", "hr policies", "conflict resolution", "onboarding", "hrms"]
}

def init_matching_cache():
    """Initialise the matching cache and vectors on boot or first request."""
    if MATCHING_CACHE["vectorizer"] is not None:
        return
        
    db = SessionLocal()
    try:
        occs = db.query(Occupation).all()
        # V5 requires at least 20,000 occupations
        if not occs or len(occs) < 20000:
            print("[Matching Engine V5] Database missing V5 taxonomy. Seeding combinatorial occupations database...")
            from backend.app.services.career_db import seed_career_db
            seed_career_db()
            occs = db.query(Occupation).all()

        MATCHING_CACHE["occupations"] = occs
        
        # Fit TF-IDF Vectorizer on all canonical descriptions
        documents = []
        for o in occs:
            req = " ".join(json.loads(o.required_skills))
            pref = " ".join(json.loads(o.preferred_skills))
            documents.append(f"{o.title} {o.subdomain} {o.industry} {req} {pref} {o.description}")
            
        vectorizer = TfidfVectorizer(stop_words="english", ngram_range=(1, 2))
        matrix = vectorizer.fit_transform(documents)
        
        MATCHING_CACHE["vectorizer"] = vectorizer
        MATCHING_CACHE["matrix"] = matrix
        
        skills = db.query(Skill).all()
        MATCHING_CACHE["skills_taxonomy"] = [s.name.lower() for s in skills]
        print(f"[Matching Engine V5] Initialization completed successfully with {len(occs)} occupations and {len(skills)} skill terms.")
        
    finally:
        db.close()

def classify_domains(resume_text: str) -> list:
    """Classifies a resume into one or more industries based on taxonomy overlap."""
    text_lower = resume_text.lower()
    domain_scores = {}
    
    for domain, terms in DOMAINS_KEYWORD_TAXONOMY.items():
        overlap = 0
        for term in terms:
            if term in text_lower:
                overlap += 1
        domain_scores[domain] = overlap
        
    sorted_domains = [d for d, s in sorted(domain_scores.items(), key=lambda x: x[1], reverse=True) if s > 0]
    
    if not sorted_domains:
        sorted_domains = ["Technology", "Business"]
        
    return sorted_domains[:2]

def match_resume_to_careers(resume_profile: dict) -> dict:
    """
    V5 Matching Engine using strict Multi-Factor Weighted Scoring.
    Optimized for 20,000+ occupations by applying an initial TF-IDF matrix product filter step.
    """
    init_matching_cache()

    # Query fingerprint cache
    fingerprint = get_resume_fingerprint(resume_profile["full_text"])
    db = SessionLocal()
    try:
        cached = db.query(AnalysisCache).filter(AnalysisCache.fingerprint == fingerprint).first()
        if cached:
            print(f"[Matching Engine] Cache hit for: {fingerprint}")
            return json.loads(cached.payload)
    except Exception as e:
        print(f"[Matching Engine] Cache query error: {e}")
    finally:
        db.close()
    
    full_text = resume_profile["full_text"]
    full_text_lower = full_text.lower()
    
    # 1. Domain Classification First
    classified_industries = classify_domains(full_text)
    
    # Expand detected skills using the full skill taxonomy
    taxonomy = MATCHING_CACHE["skills_taxonomy"]
    expanded_skills = set(resume_profile["detected_skills"])
    for skill in taxonomy:
        if len(skill) > 3 and skill in full_text_lower:
            if bool(re.search(r'\b' + re.escape(skill) + r'\b', full_text_lower)):
                expanded_skills.add(skill)
    detected_skills = list(expanded_skills)
    resume_profile["detected_skills"] = detected_skills

    # Assemble texts for matching
    exp_text = " ".join(resume_profile["experience"])
    proj_text = " ".join(resume_profile["projects"])
    cert_text = " ".join(resume_profile["certifications"])
    
    occs = MATCHING_CACHE["occupations"]
    vectorizer = MATCHING_CACHE["vectorizer"]
    matrix = MATCHING_CACHE["matrix"]
    
    # Compute TF-IDF similarity to filter top 100 candidate occupations
    resume_doc = f"{full_text_lower} {' '.join(detected_skills)}"
    resume_vec = vectorizer.transform([resume_doc])
    similarities = cosine_similarity(resume_vec, matrix)[0]
    
    # Get top 100 candidate indices sorted by similarity score
    candidate_indices = np.argsort(similarities)[-100:][::-1]
    
    ranked_careers = []
    
    for idx in candidate_indices:
        occ = occs[idx]
        
        # Multi-factor score breakdown
        # A. Skills Score (30%)
        req_skills = json.loads(occ.required_skills)
        pref_skills = json.loads(occ.preferred_skills)
        
        req_matched = [s for s in req_skills if s.lower() in [ds.lower() for ds in detected_skills]]
        pref_matched = [s for s in pref_skills if s.lower() in [ds.lower() for ds in detected_skills]]
        
        req_contrib = (len(req_matched) / len(req_skills)) * 20 if req_skills else 20
        pref_contrib = (len(pref_matched) / len(pref_skills)) * 10 if pref_skills else 10
        skills_score = int(req_contrib + pref_contrib)

        # B. Work Experience Score (25%)
        exp_score = 0
        if exp_text:
            local_vec = TfidfVectorizer(stop_words="english")
            try:
                vectors = local_vec.fit_transform([exp_text, f"{occ.title} {occ.description}"])
                sim = cosine_similarity(vectors[0], vectors[1])[0][0]
                exp_score = int(sim * 25)
            except:
                exp_score = 10
        else:
            exp_score = 0

        # C. Education Score (15%)
        edu_score = 0
        occ_degrees = json.loads(occ.degrees)
        for dr in occ_degrees:
            if any(dr.lower() in e["detail"].lower() for e in resume_profile["education"]):
                edu_score = 15
                break
        if edu_score == 0:
            if any(kw in e["detail"].lower() for kw in ["computer", "tech", "engineering", "science"] for e in resume_profile["education"]):
                edu_score = 8
            else:
                edu_score = 4

        # D. Projects Score (10%)
        proj_score = 0
        if proj_text:
            local_vec = TfidfVectorizer(stop_words="english")
            try:
                vectors = local_vec.fit_transform([proj_text, f"{' '.join(req_skills)} {occ.description}"])
                sim = cosine_similarity(vectors[0], vectors[1])[0][0]
                proj_score = int(sim * 10)
            except:
                proj_score = 4
        else:
            proj_score = 0

        # E. Certifications Score (8%)
        cert_score = 0
        occ_certs = json.loads(occ.certifications)
        matched_certs = []
        for cr in occ_certs:
            if any(cr.lower() in c.lower() for c in resume_profile["certifications"]):
                cert_score = 8
                matched_certs.append(cr)
                break
        if not occ_certs:
            cert_score = 8

        # F. Achievements Score (5%)
        ach_score = 0
        ach_keywords = ["award", "publication", "scholarship", "patent", "national", "first place", "achieved", "winner"]
        if any(kw in full_text_lower for kw in ach_keywords):
            ach_score = 5

        # G. Soft Skills Score (5%)
        soft_skills = json.loads(occ.soft_skills)
        matched_soft = [s for s in soft_skills if s.lower() in full_text_lower]
        soft_score = int((len(matched_soft) / len(soft_skills)) * 5) if soft_skills else 5

        # H. Career Objective Score (2%)
        obj_score = 0
        if any(kw in full_text_lower for kw in ["objective", "summary", "profile"]):
            obj_score = 2

        # I. Industry classified boost (10%)
        domain_boost = 0
        if occ.industry in classified_industries:
            domain_boost = 10
            
        final_score = min(100, skills_score + exp_score + edu_score + proj_score + cert_score + ach_score + soft_score + obj_score + domain_boost)
        
        missing_reqs = [s for s in req_skills if s.lower() not in [rm.lower() for rm in req_matched]]
        missing_prefs = [s for s in pref_skills if s.lower() not in [pm.lower() for pm in pref_matched]]
        all_missing_skills = missing_reqs + missing_prefs
        
        # Roadmap construction
        roadmap = []
        if all_missing_skills:
            roadmap_levels = ["Beginner", "Intermediate", "Advanced"]
            for i, skill in enumerate(all_missing_skills[:3]):
                level = roadmap_levels[i % len(roadmap_levels)]
                roadmap.append({
                    "skill": skill,
                    "level": level,
                    "steps": [
                        f"Understand basic concepts of {skill}.",
                        f"Follow a hands-on tutorial on {skill}.",
                        f"Build a miniature project implementing {skill} in a real-world scenario."
                    ],
                    "resources": [
                        f"https://www.coursera.org/search?query={skill.replace(' ', '%20')}",
                        f"https://github.com/search?q={skill.replace(' ', '+')}+tutorial"
                    ]
                })
        else:
            roadmap.append({
                "skill": f"Mastery of {occ.title}",
                "level": "Advanced",
                "steps": [
                    "Engage in advanced industrial project designs.",
                    "Acquire senior certifications.",
                    "Participate in technical speaking / leadership workshops."
                ],
                "resources": ["https://roadmap.sh"]
            })

        ranked_careers.append({
            "career": occ.title,
            "industry": occ.industry,
            "subdomain": occ.subdomain,
            "score": final_score,
            "score_breakdown": {
                "skills": skills_score,
                "experience": exp_score,
                "education": edu_score,
                "projects": proj_score,
                "certifications": cert_score,
                "achievements": ach_score,
                "soft_skills": soft_score,
                "objective": obj_score
            },
            "required_skills": req_skills,
            "preferred_skills": pref_skills,
            "degrees": occ_degrees,
            "certifications": occ_certs,
            "salary_entry": f"${occ.salary_entry:,}",
            "salary_avg": f"${occ.salary_avg:,}",
            "salary_senior": f"${occ.salary_senior:,}",
            "future_demand": occ.future_demand,
            "growth_rate": f"{occ.growth_rate}%",
            "career_path": json.loads(occ.career_path),
            "description": occ.description,
            "required_matched": req_matched,
            "preferred_matched": pref_matched,
            "matched_certs": matched_certs,
            "matched_soft_skills": matched_soft,
            "missing_skills": all_missing_skills,
            "learning_roadmap": roadmap
        })

    # Sort top candidates by compatibility metrics
    ranked_careers.sort(key=lambda x: (
        -x["score"], 
        -len(x["required_matched"]), 
        -x["score_breakdown"]["experience"], 
        -x["score_breakdown"]["education"], 
        x["career"].lower()
    ))
    
    unique_ranks = []
    seen_titles = set()
    for item in ranked_careers:
        if item["career"].lower() not in seen_titles:
            seen_titles.add(item["career"].lower())
            unique_ranks.append(item)
            
    top_20 = unique_ranks[:20]
    top_match = top_20[0]
    
    # Calculate resume scores
    quality_indicators = [
        bool(resume_profile["name"]),
        bool(resume_profile["email"]),
        bool(resume_profile["phone"]),
        resume_profile["location"] != "N/A",
        resume_profile["summary"] != "N/A",
        len(resume_profile["education"]) > 0,
        len(resume_profile["experience"]) > 0,
        len(resume_profile["projects"]) > 0,
        len(resume_profile["certifications"]) > 0,
        len(resume_profile["languages"]) > 0,
        len(resume_profile.get("achievements", [])) > 0
    ]
    quality_score = int((sum(quality_indicators) / len(quality_indicators)) * 100)
    skills_score_norm = int((top_match["score_breakdown"]["skills"] / 30) * 100) if top_match["score_breakdown"]["skills"] > 0 else 0
    edu_score_norm = int((top_match["score_breakdown"]["education"] / 15) * 100) if top_match["score_breakdown"]["education"] > 0 else 0
    exp_score_norm = int((top_match["score_breakdown"]["experience"] / 25) * 100) if top_match["score_breakdown"]["experience"] > 0 else 0
    proj_score_norm = int((top_match["score_breakdown"]["projects"] / 10) * 100) if top_match["score_breakdown"]["projects"] > 0 else 0
    ach_score_norm = 100 if len(resume_profile.get("achievements", [])) > 0 else (50 if len(resume_profile.get("volunteer_work", [])) > 0 else 0)
    cert_score_norm = int((top_match["score_breakdown"]["certifications"] / 8) * 100) if top_match["score_breakdown"]["certifications"] > 0 else 0

    action_verbs = ["developed", "led", "managed", "designed", "optimized", "monitored", "coordinated", "analyzed", "conducted", "restructured", "implemented"]
    verb_count = sum(1 for v in action_verbs if v in full_text_lower)
    comm_score = min(100, 40 + (verb_count * 8) + (len(resume_profile.get("soft_skills", [])) * 6))

    ats_score = 70
    if resume_profile["email"]: ats_score += 10
    if resume_profile["phone"]: ats_score += 10
    if resume_profile["linkedin"]: ats_score += 10
    ats_score = min(100, ats_score)

    readiness_score = top_match["score"]
    overall_score = int(
        (quality_score * 0.15) +
        (skills_score_norm * 0.20) +
        (edu_score_norm * 0.10) +
        (exp_score_norm * 0.20) +
        (proj_score_norm * 0.10) +
        (ach_score_norm * 0.05) +
        (cert_score_norm * 0.05) +
        (comm_score * 0.05) +
        (ats_score * 0.05) +
        (readiness_score * 0.05)
    )

    resume_strength = quality_score
    suggestions = []
    
    if len(resume_profile["experience"]) > 0:
        resume_strength += 10
    else:
        suggestions.append("Add structured work experience or internships to demonstrate practical capabilities.")

    if len(resume_profile["projects"]) > 0:
        resume_strength += 10
    else:
        suggestions.append("Add key projects detailing technical decisions and methodologies.")

    if len(resume_profile["certifications"]) > 0:
        resume_strength += 10
    else:
        suggestions.append(f"Consider acquiring certifications like: {', '.join(top_match['certifications'][:2])}")

    if len(top_match["missing_skills"]) > 3:
        suggestions.append(f"Acquire missing core skills like: {', '.join(top_match['missing_skills'][:2])} to match industry standards.")
        
    resume_strength = min(100, resume_strength)

    result_payload = {
        "classified_domains": classified_industries,
        "career_readiness_score": readiness_score,
        "top_careers": top_20,
        "resume_strength": resume_strength,
        "improvement_suggestions": suggestions,
        "learning_roadmap": top_match["learning_roadmap"],
        "career_timeline": top_match["career_path"],
        "resume_scores": {
            "Resume Quality": quality_score,
            "Skills": skills_score_norm,
            "Education": edu_score_norm,
            "Experience": exp_score_norm,
            "Projects": proj_score_norm,
            "Achievements": ach_score_norm,
            "Certifications": cert_score_norm,
            "Communication": comm_score,
            "ATS Compatibility": ats_score,
            "Career Readiness": readiness_score,
            "Overall Score": overall_score
        },
        "detected_skills": detected_skills,
        "projects": resume_profile["projects"],
        "experience": resume_profile["experience"],
        "top_career": top_match["career"],
        "missing_skills": top_match["missing_skills"],
        "resume_score": overall_score,
        "career_explanation": f"Based on your profile, you have a {readiness_score}% compatibility with the role of {top_match['career']} in the {top_match['industry']} industry. Your profile matches {top_match['industry']} requirements strongly.",
        "best_domain": top_match["industry"],
        "domain_scores": {c["industry"]: c["score"] for c in top_20[:5]}
    }

    # Save to fingerprint cache
    db = SessionLocal()
    try:
        exists = db.query(AnalysisCache).filter(AnalysisCache.fingerprint == fingerprint).first()
        if not exists:
            new_cache = AnalysisCache(fingerprint=fingerprint, payload=json.dumps(result_payload))
            db.add(new_cache)
            db.commit()
            print(f"[Matching Engine] Cached new analysis for fingerprint: {fingerprint}")
    except Exception as e:
        db.rollback()
        print(f"[Matching Engine] Caching query error: {e}")
    finally:
        db.close()

    return result_payload
