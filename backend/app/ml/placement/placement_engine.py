import random

def is_technical_domain(domain: str) -> bool:
    if not domain:
        return False
    tech_keywords = [
        "software", "ai", "ml", "machine learning", "backend", "frontend", 
        "full stack", "fullstack", "data engineer", "devops", "cloud", 
        "cybersecurity", "technology", "engineering", "coding", "developer"
    ]
    domain_lower = domain.lower()
    return any(kw in domain_lower for kw in tech_keywords)

def get_mock_jobs(domain, skills):
    platforms = ["LinkedIn", "Indeed", "Glassdoor", "Internshala"]
    companies = ["Google", "Microsoft", "Amazon", "Meta", "TCS", "Infosys", "Wipro", "Accenture", "StartUp Inc."]
    
    jobs = []
    for _ in range(random.randint(2, 4)):
        role_type = "Intern" if random.random() > 0.5 else "Junior Developer"
        title = f"{domain} {role_type}" if domain else f"Software {role_type}"
        
        # Randomly inject a skill into the title if available
        if skills and random.random() > 0.5:
            skill = random.choice(skills)
            title = f"{skill} {role_type}"

        company = random.choice(companies)
        platform = random.choice(platforms)
        
        query = title.replace(" ", "%20")
        url = f"https://www.linkedin.com/jobs/search/?keywords={query}" if platform == "LinkedIn" else f"https://www.google.com/search?q={query}+jobs"

        jobs.append({
            "title": title,
            "company": company,
            "platform": platform,
            "url": url
        })
    
    return jobs

def predict_placement_result(
    resume_score: float,
    interview_score: float,
    coding_score: float,
    aptitude_score: float,
    profile_completeness: float,
    domain: str,
    missing_skills: list
):
    is_tech = is_technical_domain(domain)
    
    if is_tech:
        # Technical Weighted Scoring:
        # Resume Quality = 20%
        # Interview Performance = 35%
        # Coding Test = 30%
        # Aptitude = 10%
        # Profile Completeness = 5%
        placement_score = int(
            resume_score * 0.20 +
            interview_score * 0.35 +
            coding_score * 0.30 +
            aptitude_score * 0.10 +
            profile_completeness * 0.05
        )
    else:
        # Non-Technical Weighted Scoring:
        # Resume Quality = 30%
        # Interview Performance = 40%
        # Aptitude = 25%
        # Profile Completeness = 5%
        # Coding Test is skipped
        placement_score = int(
            resume_score * 0.30 +
            interview_score * 0.40 +
            aptitude_score * 0.25 +
            profile_completeness * 0.05
        )
    
    placement_score = max(0, min(100, placement_score))

    if placement_score >= 80:
        label = "High"
        roles = [f"Senior {domain} Engineer", f"Lead {domain} Developer"] if is_tech else [f"Senior {domain} Specialist", f"Lead {domain} Manager"]
    elif placement_score >= 60:
        label = "Moderate"
        roles = [f"Junior {domain} Developer", f"{domain} Analyst"] if is_tech else [f"Junior {domain} Associate", f"{domain} Analyst"]
    else:
        label = "Low"
        roles = [f"{domain} Intern", f"Associate {domain}"] if is_tech else [f"{domain} Intern", "Trainee"]

    # Deduce available skills simply (for mocking job links)
    mock_skills = [domain] if domain else ["Technology"]

    return {
        "placement_score": placement_score,
        "level": label,
        "suggested_roles": roles,
        "job_links": get_mock_jobs(domain, mock_skills),
        "is_technical": is_tech
    }
