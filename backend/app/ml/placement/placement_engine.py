import random

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

def predict_placement_result(interview_result: dict, missing_skills: list, domain: str):
    interview_score = interview_result.get("score", 0)
    confidence = interview_result.get("confidence_score", 0)
    communication = interview_result.get("communication_score", 0)

    placement_score = int(
        interview_score * 0.6 +
        confidence * 0.2 +
        communication * 0.2
    )

    if placement_score >= 80:
        label = "High"
        roles = [f"Senior {domain} Engineer", f"Lead {domain} Developer"] if domain else ["Senior Developer"]
    elif placement_score >= 60:
        label = "Moderate"
        roles = [f"Junior {domain} Engineer", f"{domain} Analyst"] if domain else ["Junior Developer"]
    else:
        label = "Low"
        roles = [f"{domain} Intern", "Trainee"] if domain else ["Intern"]

    # Deduce available skills simply (for mocking job links)
    # Ideally, we should receive 'skills' directly, but we can fake it via missing_skills / domain for the mock
    mock_skills = [domain] if domain else ["Technology"]

    return {
        "placement_score": placement_score,
        "level": label,
        "suggested_roles": roles,
        "job_links": get_mock_jobs(domain, mock_skills)
    }