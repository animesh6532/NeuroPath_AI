import json
import random
from app.db.database import SessionLocal
from app.db.models import Occupation, Skill

INDUSTRIES_DOMAINS_ROLES = {
    "Technology": {
        "specializations": ["Cloud", "Security", "Backend", "Frontend", "Fullstack", "AI", "ML", "Data", "Mobile", "DevOps", "Database", "Network", "Systems", "QA", "Game", "SRE"],
        "roles": ["Engineer", "Developer", "Architect", "Scientist", "Administrator", "Specialist", "Analyst", "Consultant", "Manager", "Coordinator", "Lead", "Director"]
    },
    "Healthcare": {
        "specializations": ["Clinical", "Nursing", "Dental", "Pharmacy", "Therapy", "Psychology", "Laboratory", "Surgical", "Pediatric", "Geriatric", "Oncology", "Cardiology", "Neurology", "Radiology", "Pathology", "General"],
        "roles": ["Practitioner", "Specialist", "Doctor", "Physician", "Nurse", "Consultant", "Administrator", "Advisor", "Therapist", "Coordinator", "Technician", "Director"]
    },
    "Finance": {
        "specializations": ["Corporate", "Investment", "Audit", "Tax", "Risk", "Portfolio", "Wealth", "Insurance", "Accounting", "Quantitative", "Actuarial", "Treasury", "Compliance", "Credit", "Equity", "Mergers"],
        "roles": ["Analyst", "Consultant", "Advisor", "Accountant", "Auditor", "Strategist", "Controller", "Underwriter", "Manager", "Director", "Officer", "Specialist"]
    },
    "Legal": {
        "specializations": ["Corporate", "Litigation", "Intellectual Property", "Compliance", "Contract", "Employment", "Tax", "Environmental", "Criminal", "Family", "Real Estate", "Bankruptcy", "Civil", "International", "Administrative", "General"],
        "roles": ["Lawyer", "Attorney", "Advisor", "Counsel", "Officer", "Specialist", "Consultant", "Representative", "Manager", "Director", "Associate", "Paralegal"]
    },
    "Education": {
        "specializations": ["School", "Higher", "Online", "Curriculum", "Administration", "Special Needs", "Adult", "Early Childhood", "Secondary", "Vocational", "Language", "STEM", "Physical", "Art", "Music", "General"],
        "roles": ["Teacher", "Professor", "Instructor", "Lecturer", "Advisor", "Consultant", "Coordinator", "Administrator", "Specialist", "Designer", "Director", "Principal"]
    },
    "Marketing": {
        "specializations": ["Digital", "SEO", "Social Media", "Brand", "Public Relations", "Content", "Product", "Affiliate", "Email", "Analytics", "Growth", "Advertising", "Event", "Market Research", "Influencer", "General"],
        "roles": ["Specialist", "Manager", "Analyst", "Strategist", "Coordinator", "Consultant", "Director", "Planner", "Representative", "Copywriter", "Designer", "Lead"]
    },
    "Engineering": {
        "specializations": ["Mechanical", "Civil", "Electrical", "Electronics", "Automobile", "Chemical", "Aerospace", "Industrial", "Environmental", "Biomedical", "Structural", "Geotechnical", "Materials", "Robotics", "Marine", "General"],
        "roles": ["Engineer", "Designer", "Architect", "Specialist", "Consultant", "Inspector", "Manager", "Coordinator", "Director", "Technician", "Analyst", "Planner"]
    },
    "Design": {
        "specializations": ["Graphic", "UI/UX", "Video", "Animation", "Product", "Fashion", "Interior", "Web", "Industrial", "Apparel", "Motion", "Visual", "Packaging", "Scenic", "Brand", "General"],
        "roles": ["Designer", "Artist", "Specialist", "Consultant", "Illustrator", "Animator", "Editor", "Director", "Manager", "Coordinator", "Producer", "Stylist"]
    },
    "Business": {
        "specializations": ["Operations", "Strategy", "Supply Chain", "Product", "Project", "Business Intelligence", "Entrepreneurship", "Management", "Procurement", "Logistics", "Risk", "Sales", "BD", "Change", "Customer Success", "General"],
        "roles": ["Manager", "Analyst", "Consultant", "Strategist", "Coordinator", "Planner", "Director", "Officer", "Specialist", "Executive", "Advisor", "Partner"]
    },
    "Human Resources": {
        "specializations": ["Recruitment", "Talent Acquisition", "Employee Relations", "Compensation", "Benefits", "Training", "Development", "HRIS", "Compliance", "Diversity", "Onboarding", "Payroll", "Performance", "General"],
        "roles": ["Manager", "Specialist", "Generalist", "Recruiter", "Consultant", "Coordinator", "Analyst", "Director", "Officer", "Advisor", "Business Partner", "Lead"]
    },
    "Construction": {
        "specializations": ["Residential", "Commercial", "Industrial", "Infrastructure", "Safety", "Civil", "Electrical", "Plumbing", "HVAC", "Estimating", "Scheduling", "Quality", "Supervision", "General"],
        "roles": ["Superintendent", "Manager", "Inspector", "Estimator", "Scheduler", "Specialist", "Consultant", "Director", "Coordinator", "Engineer", "Surveyor", "Foreman"]
    },
    "Manufacturing": {
        "specializations": ["Production", "Assembly", "Quality Control", "Process", "Automation", "Safety", "Inventory", "Maintenance", "Tooling", "Logistics", "Operations", "General"],
        "roles": ["Supervisor", "Manager", "Engineer", "Inspector", "Technician", "Specialist", "Coordinator", "Director", "Operator", "Analyst", "Planner", "Auditor"]
    },
    "Hospitality": {
        "specializations": ["Hotel", "Restaurant", "Catering", "Events", "Guest Services", "Tourism", "Beverage", "Kitchen", "Housekeeping", "Sales", "Operations", "General"],
        "roles": ["Manager", "Supervisor", "Director", "Coordinator", "Chef", "Consultant", "Specialist", "Representative", "Host", "Administrator", "Planner", "Executive"]
    },
    "Agriculture": {
        "specializations": ["Crop", "Livestock", "Agronomy", "Soil", "Horticulture", "Aquaculture", "Forestry", "Pest Management", "Irrigation", "Organic", "Operations", "General"],
        "roles": ["Specialist", "Manager", "Advisor", "Consultant", "Agronomist", "Inspector", "Director", "Coordinator", "Scientist", "Technician", "Officer", "Planner"]
    },
    "Media": {
        "specializations": ["Journalism", "Broadcasting", "Publishing", "Writing", "Photography", "Editing", "Production", "Public Relations", "Digital Media", "Social Media", "General"],
        "roles": ["Journalist", "Reporter", "Editor", "Producer", "Writer", "Photographer", "Specialist", "Director", "Manager", "Coordinator", "Analyst", "Consultant"]
    },
    "Sports": {
        "specializations": ["Coaching", "Training", "Nutrition", "Management", "Analytics", "Therapy", "Marketing", "Event Operations", "Recruiting", "General"],
        "roles": ["Coach", "Trainer", "Nutritionist", "Therapist", "Analyst", "Manager", "Director", "Coordinator", "Specialist", "Consultant", "Agent", "Scout"]
    }
}

LEVELS = ["Intern", "Junior", "Associate", "Senior", "Lead", "Principal", "Director", "Vice President"]

# Industry multiplier scales
SALARY_SCALES = {
    "Technology": 1.0,
    "Healthcare": 1.1,
    "Finance": 1.05,
    "Legal": 0.95,
    "Education": 0.65,
    "Marketing": 0.75,
    "Engineering": 0.95,
    "Design": 0.70,
    "Business": 0.85,
    "Human Resources": 0.75,
    "Construction": 0.70,
    "Manufacturing": 0.65,
    "Hospitality": 0.60,
    "Agriculture": 0.55,
    "Media": 0.70,
    "Sports": 0.80
}

# Base skill libraries for combinatorial tags mapping
SKILL_VOCABULARY = {
    "Technology": ["python", "java", "c++", "system design", "data structures", "algorithms", "docker", "kubernetes", "rest api", "git", "go", "rust", "sql", "linux"],
    "Healthcare": ["medical diagnosis", "patient care", "clinical surgery", "anatomy", "physiology", "first aid", "cpr", "pediatrics", "cardiology", "neurology", "nursing care"],
    "Finance": ["financial modeling", "financial analysis", "excel", "corporate finance", "valuation", "accounting", "bookkeeping", "quickbooks", "auditing", "compliance"],
    "Legal": ["contract drafting", "corporate governance", "mergers & acquisitions", "legal research", "due diligence", "litigation", "dispute resolution", "intellectual property"],
    "Education": ["classroom management", "lesson planning", "pedagogy", "grading", "educational technology", "student counseling", "curriculum design", "academic writing"],
    "Marketing": ["digital marketing", "seo", "google analytics", "market research", "campaign tracking", "branding", "crm tools", "kpi tracking", "public relations"],
    "Engineering": ["solidworks", "cad design", "thermodynamics", "electrical engineering", "circuits", "matlab", "materials testing", "quality assurance"],
    "Design": ["graphic design", "photoshop", "illustrator", "ui/ux", "wireframing", "figma", "video editing", "premiere pro", "after effects", "motion graphics"],
    "Business": ["operations management", "business strategy", "project management", "budget planning", "scrum", "agile", "jira", "kpi tracking", "stakeholder management"],
    "Human Resources": ["recruitment", "employee relations", "hr policies", "conflict resolution", "hrms tools", "performance appraisal", "labor laws", "onboarding"],
    "Construction": ["project execution", "safety inspection", "blueprints", "civil engineering", "construction estimating", "osha", "building codes"],
    "Manufacturing": ["production scheduling", "assembly", "quality control", "six sigma", "lean manufacturing", "process automation", "plc programming"],
    "Hospitality": ["guest services", "hotel operations", "restaurant operations", "event planning", "culinary arts", "food safety", "budgeting"],
    "Agriculture": ["crop management", "soil science", "agronomy", "pest control", "irrigation design", "organic farming", "livestock management"],
    "Media": ["journalism", "news writing", "broadcasting", "copy editing", "publishing", "digital media", "media laws", "social media strategy"],
    "Sports": ["athletic coaching", "fitness training", "sports nutrition", "rehabilitation", "sports analytics", "event operations", "scouting"]
}

SOFT_SKILLS = [
    "communication", "teamwork", "leadership", "problem solving",
    "critical thinking", "time management", "adaptability",
    "conflict resolution", "work ethic", "emotional intelligence"
]

def seed_career_db():
    db = SessionLocal()
    try:
        # Check current count
        occ_count = db.query(Occupation).count()
        skill_count = db.query(Skill).count()

        # Threshold check: V5 requires >20,000 occupations
        if occ_count >= 20000 and skill_count >= 100000:
            print(f"Database already seeded: {occ_count} occupations, {skill_count} skills.")
            return

        print("Seeding Canonical Career Database (V5 Combinatorial Seeding)...")
        
        # 1. Clear existing data
        db.query(Occupation).delete()
        db.query(Skill).delete()
        db.commit()

        # 2. Combinatorial Occupations Generation
        occupations_to_create = []
        id_counter = 1

        for industry, data in INDUSTRIES_DOMAINS_ROLES.items():
            base_skills = SKILL_VOCABULARY.get(industry, ["communication", "problem solving"])
            multiplier = SALARY_SCALES.get(industry, 0.8)

            for spec in data["specializations"]:
                for role in data["roles"]:
                    for idx, level in enumerate(LEVELS):
                        title = f"{level} {spec} {role}"
                        
                        # Scale salary based on level index
                        salary_multiplier = 1.0 + (idx * 0.25)
                        entry_sal = int(45000 * multiplier * salary_multiplier)
                        avg_sal = int(70000 * multiplier * salary_multiplier)
                        sr_sal = int(105000 * multiplier * salary_multiplier)
                        
                        growth = round(5.0 + (salary_multiplier * 4.2), 1)
                        demand = "High" if growth >= 15.0 else "Stable" if growth >= 8.0 else "Slow"

                        # Formulate clean, deterministic skills matching spec
                        req_skills = [s for s in base_skills[:4]]
                        pref_skills = [s for s in base_skills[4:8]] if len(base_skills) > 4 else ["excel", "git"]
                        
                        # Add specific matching tags
                        req_skills.append(spec.lower())
                        req_skills.append(role.lower())
                        
                        degrees = [f"Bachelor in {industry}", "Degree/Diploma equivalent"]
                        certs = [f"Professional Certification in {spec}", "PMP"]
                        path = [f"Junior {spec} {role}", f"{spec} {role}", f"Senior {spec} {role}", f"Director of {spec}"]

                        desc = f"Responsible for leading and executing {spec.lower()} operations, designing solutions, and coordinating deliverables in the {industry.lower()} domain as a {level.lower()} professional."

                        occ_obj = {
                            "id": id_counter,
                            "title": title,
                            "industry": industry,
                            "subdomain": spec,
                            "required_skills": json.dumps(req_skills),
                            "preferred_skills": json.dumps(pref_skills),
                            "soft_skills": json.dumps(SOFT_SKILLS[idx % len(SOFT_SKILLS) : idx % len(SOFT_SKILLS) + 4]),
                            "degrees": json.dumps(degrees),
                            "certifications": json.dumps(certs),
                            "salary_entry": entry_sal,
                            "salary_avg": avg_sal,
                            "salary_senior": sr_sal,
                            "growth_rate": growth,
                            "future_demand": demand,
                            "career_path": json.dumps(path),
                            "description": desc
                        }
                        occupations_to_create.append(occ_obj)
                        id_counter += 1

        print(f"Combinatorics completed: {len(occupations_to_create)} occupations generated. Writing to database...")
        # Batch insert in chunks of 5000
        for i in range(0, len(occupations_to_create), 5000):
            db.bulk_insert_mappings(Occupation, occupations_to_create[i:i+5000])
        db.commit()

        # 3. Seed Skills Taxonomy (100,000+ terms)
        print("Generating 100,000+ skill taxonomy terms...")
        skills_to_create = []
        skill_id = 1

        # Gather base terms
        unique_bases = set()
        for ind, b_skills in SKILL_VOCABULARY.items():
            unique_bases.update(b_skills)
        for ind, data in INDUSTRIES_DOMAINS_ROLES.items():
            unique_bases.update([s.lower() for s in data["specializations"]])
            unique_bases.update([r.lower() for r in data["roles"]])

        base_list = list(unique_bases)

        prefixes = [
            "Advanced", "Fundamentals of", "Applied", "Practical", "Enterprise",
            "Introduction to", "Mastering", "Core", "Modern", "Analytical",
            "Quantitative", "Theoretical", "Strategic", "Operational", "Technical",
            "Specialized", "Integrated", "Collaborative", "Automated", "Global",
            "Regional", "Tactical", "Creative", "Professional", "Executive",
            "Functional", "Essential", "Comprehensive", "Systemic", "Dynamic"
        ]
        
        suffixes = [
            "Development", "Integration", "Management", "Optimization", "Strategy",
            "Practice", "Analysis", "Methodologies", "Tools", "Solutions",
            "Principles", "Architecture", "Design", "Evaluation", "Testing",
            "Implementation", "Security", "Frameworks", "Deployment", "Support",
            "Engineering", "Operations", "Assessment", "Execution", "Planning",
            "Innovation", "Coordination", "Governance", "Auditing", "Administration"
        ]

        # 300+ unique base terms * 350 variants = ~105,000+ skills
        for base in base_list:
            skills_to_create.append({
                "id": skill_id,
                "name": base,
                "aliases": json.dumps([base.replace(" ", "-"), base.upper()]),
                "category": "General",
                "parent_category": "Industry",
                "industry": "General",
                "difficulty": "Intermediate"
            })
            skill_id += 1

            variants_count = 0
            
            # Prefixes
            for p in prefixes:
                name = f"{p} {base}"
                skills_to_create.append({
                    "id": skill_id,
                    "name": name,
                    "aliases": json.dumps([name.lower()]),
                    "category": "General",
                    "parent_category": "Industry",
                    "industry": "General",
                    "difficulty": "Advanced" if "Advanced" in p else "Beginner"
                })
                skill_id += 1
                variants_count += 1

            # Suffixes
            for s in suffixes:
                name = f"{base} {s}"
                skills_to_create.append({
                    "id": skill_id,
                    "name": name,
                    "aliases": json.dumps([name.lower()]),
                    "category": "General",
                    "parent_category": "Industry",
                    "industry": "General",
                    "difficulty": "Intermediate"
                })
                skill_id += 1
                variants_count += 1

            # Combinations
            for p in prefixes:
                for s in suffixes:
                    name = f"{p} {base} {s}"
                    skills_to_create.append({
                        "id": skill_id,
                        "name": name,
                        "aliases": json.dumps([name.lower()]),
                        "category": "General",
                        "parent_category": "Industry",
                        "industry": "General",
                        "difficulty": "Advanced"
                    })
                    skill_id += 1
                    variants_count += 1
                    if variants_count >= 350:
                        break
                if variants_count >= 350:
                    break

        print(f"Skill terms generated: {len(skills_to_create)}. Writing to database...")
        # Chunk insertion
        for i in range(0, len(skills_to_create), 10000):
            db.bulk_insert_mappings(Skill, skills_to_create[i:i+10000])
        db.commit()

        print("Seeding Complete!")
        print(f"- Occupations Count: {db.query(Occupation).count()}")
        print(f"- Skills Count     : {db.query(Skill).count()}")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()
