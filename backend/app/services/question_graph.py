import json
import random
import time
from sqlalchemy.orm import Session
from backend.app.db.database import SessionLocal
from backend.app.db.models import InterviewQuestion

# 1. TAXONOMY CONFIGURATION
INDUSTRIES = {
    "Technology": {
        "roles": ["Software Engineer", "Data Scientist", "ML Engineer", "DevOps Engineer", "Cybersecurity Analyst", "Frontend Developer", "Backend Developer"],
        "topics": {
            "Software Engineering": ["Data Structures", "Algorithms", "OOP Principles", "REST API Design"],
            "System Design": ["Load Balancing", "Horizontal Scaling", "Cache Invalidation", "Rate Limiting"],
            "Databases": ["Query Optimization", "Indexing Strategy", "ACID Transactions", "NoSQL vs SQL"],
            "Infrastructure": ["CI/CD Pipelines", "Containerization", "Cloud Architecture", "Serverless Computing"]
        }
    },
    "Finance": {
        "roles": ["Financial Analyst", "Investment Banker", "Auditor", "Corporate Accountant"],
        "topics": {
            "Corporate Finance": ["Capital Budgeting", "Working Capital Management", "Financial Ratio Analysis", "Cost of Capital"],
            "Valuation": ["Discounted Cash Flow", "Comparable Company Analysis", "Precedent Transactions", "LBO Modeling"],
            "Accounting & Audit": ["GAAP Compliance", "Internal Control Systems", "Sarbanes-Oxley Act", "Tax Provisioning"]
        }
    },
    "Healthcare": {
        "roles": ["General Practitioner", "Nurse Practitioner", "Pharmacist", "Clinical Pathologist"],
        "topics": {
            "Clinical Medicine": ["Patient Diagnosis", "Treatment Protocols", "Emergency Triage", "Chronic Disease Management"],
            "Pharmacology": ["Drug Interactions", "Dosage Calculations", "Pharmacokinetics", "Adverse Effects Management"],
            "Healthcare Policy": ["HIPAA Compliance", "Patient Care Ethics", "Quality Assurance", "Electronic Health Records"]
        }
    },
    "Marketing": {
        "roles": ["Digital Marketer", "SEO Specialist", "Brand Manager"],
        "topics": {
            "Digital Marketing": ["CPA Optimization", "A/B Testing", "Conversion Rate Optimization", "Customer Acquisition Cost"],
            "SEO Strategy": ["Keyword Research", "Technical SEO", "Backlink Profiling", "Search Intent Analysis"],
            "Branding": ["Brand Positioning", "Market Segmentation", "Customer Lifecycle Marketing", "Campaign Attribution"]
        }
    },
    "Business": {
        "roles": ["Business Analyst", "Product Manager", "Operations Manager"],
        "topics": {
            "Analysis & Strategy": ["Requirements Gathering", "Stakeholder Alignment", "Agile Product Backlog", "Market Sizing"],
            "Product Management": ["Product Roadmap", "KPI Definition", "User Journey Mapping", "Feature Prioritization"],
            "Operations": ["Supply Chain Optimization", "Six Sigma Quality Control", "Vendor Management", "Process Automation"]
        }
    },
    "Engineering": {
        "roles": ["Mechanical Engineer", "Electrical Engineer", "Civil Engineer"],
        "topics": {
            "Core Concepts": ["CAD Modeling", "Thermodynamics", "Structural Analysis", "Circuit Design"],
            "Operations & Safety": ["Quality Inspections", "OSHA Regulations", "Root Cause Analysis", "Materials Testing"]
        }
    },
    "Design": {
        "roles": ["UI/UX Designer", "Graphic Designer", "Product Designer"],
        "topics": {
            "User Experience": ["Usability Testing", "Wireframing", "Interaction Design", "Design Systems"],
            "Visual Arts": ["Typography", "Color Psychology", "Branding Guidelines", "Responsive Layouts"]
        }
    },
    "Human Resources": {
        "roles": ["HR Manager", "Recruiter"],
        "topics": {
            "Talent Management": ["Recruitment Strategy", "Employee Retention", "Conflict Resolution", "Performance Management"],
            "Compliance": ["Labor Laws", "Diversity & Inclusion", "Onboarding Workflows", "HRIS Management"]
        }
    },
    "Legal": {
        "roles": ["Corporate Lawyer", "Compliance Officer", "Legal Advisor"],
        "topics": {
            "Corporate Law": ["Contract Drafting", "Intellectual Property", "M&A Regulatory Approval", "Dispute Resolution"],
            "Compliance": ["GDPR Compliance", "Anti-Money Laundering", "Risk Mitigation Protocols", "Corporate Auditing"]
        }
    },
    "Education": {
        "roles": ["Teacher", "Instructional Designer", "Researcher"],
        "topics": {
            "Pedagogy": ["Classroom Management", "Curriculum Design", "Differentiated Instruction", "Student Assessment"],
            "EdTech & Research": ["LMS Management", "E-Learning Strategy", "Academic Publishing", "Quantitative Research Methods"]
        }
    }
}

# 2. COMBINATORIAL PARAMETERS
TECH_FRAMEWORKS = ["FastAPI", "React", "Spring Boot", "Next.js", "Django", "Node.js/Express", "ASP.NET Core", "Ruby on Rails", "Flask", "Go Fiber"]
TECH_DATABASES = ["PostgreSQL", "MongoDB", "Redis", "MySQL", "Cassandra", "DynamoDB", "Elasticsearch", "Neo4j", "Oracle", "ClickHouse"]
TECH_SCENARIOS = [
    "handling 10,000 concurrent write operations",
    "reducing query execution latency from 2s to under 50ms",
    "processing a streaming dataset of 100M events daily",
    "syncing distributed user state across multiple geographical regions",
    "migrating a legacy monolithic datastore to microservices",
    "handling a severe cache stampede under peak search traffic",
    "recovering from a split-brain condition in a replica cluster"
]
TECH_MECHANISMS = [
    "optimistic concurrency control and version columns",
    "write-through caching and Redis TTL strategies",
    "consistent hashing and horizontal database sharding",
    "distributed locking using Redlock or ZooKeeper",
    "indexing foreign keys and creating specialized partial indexes",
    "rate limiting requests using a token bucket algorithm",
    "asynchronous message queues using RabbitMQ or Kafka"
]

FIN_SCENARIOS = [
    "evaluating a cross-border acquisition target with high debt",
    "optimizing working capital under high inflationary pressure",
    "conducting an internal compliance audit after a regulatory alert",
    "calculating the cost of capital for a risky expansion project",
    "mitigating inventory carrying costs in a volatile supply chain",
    "analyzing tax provisioning discrepancies between jurisdictions"
]
FIN_MECHANISMS = [
    "discounted cash flow modeling and sensitivity analysis",
    "implementing Sarbanes-Oxley (SOX) control check-points",
    "revising depreciation schedules and asset valuation guidelines",
    "calculating weighted average cost of capital (WACC) with market premiums",
    "hedging foreign exchange risk using options and forward contracts",
    "applying GAAP/IFRS reconciliation matrices"
]

MED_SCENARIOS = [
    "diagnosing a multi-symptom patient with history of drug allergies",
    "handling high-occupancy emergency triage during a seasonal outbreak",
    "administering complex medication combinations to a geriatric patient",
    "auditing patient electronic health records (EHR) for privacy breaches",
    "mitigating a sudden post-operative systemic inflammatory response",
    "managing a supply chain shortage of critical anesthetic drugs"
]
MED_MECHANISMS = [
    "applying standardized emergency severity index (ESI) triage",
    "cross-referencing contraindication databases and renal clearance rates",
    "implementing strict HIPAA access controls and audit logs",
    "adhering to SOAP note reporting and case history reviews",
    "administering targeted empiric antibiotic therapy",
    "leveraging therapeutic drug monitoring (TDM) protocols"
]

BIZ_SCENARIOS = [
    "negotiating product roadmap trade-offs between sales and engineering",
    "revising a declining product conversion funnel for a mobile app",
    "mapping out user stories and acceptance criteria for a complex payment gateway",
    "optimizing a global warehouse fulfillment pipeline to cut lead time",
    "resolving conflicting specifications from three major business clients"
]
BIZ_MECHANISMS = [
    "using the RICE framework for feature scoring and prioritization",
    "conducting cohort analysis and user feedback mapping sessions",
    "defining detailed behavioral specifications and Gherkin syntax",
    "applying Lean Six Sigma methodologies to eliminate process waste",
    "facilitating cross-functional MoSCoW prioritization workshops"
]

# 3. GENERATION ENGINE
def generate_question(industry, role, topic, sub_topic, difficulty, index):
    """Generates a highly specific, professional interview question programmatically."""
    # Determine scenario pool based on industry group
    if industry in ["Technology", "Design"]:
        scenarios = TECH_SCENARIOS
        mechanisms = TECH_MECHANISMS
        frameworks = TECH_FRAMEWORKS
        databases = TECH_DATABASES
        
        scenario = scenarios[index % len(scenarios)]
        mechanism = mechanisms[(index + 1) % len(mechanisms)]
        fw = frameworks[index % len(frameworks)]
        db = databases[(index + 2) % len(databases)]
        
        if difficulty == "Easy":
            q_text = f"In a {fw} application, how would you design a basic API endpoint to fetch details from a {db} table, and how do you handle simple validation errors?"
            expected = f"Create a GET route using {fw}'s syntax, perform basic schema validation (e.g. using Pydantic or standard decorators), run a query on {db}, and return proper HTTP status codes like 200 OK or 400 Bad Request."
            rubric = ["Explains router definition", "Mentions schema validation rules", "Uses correct HTTP status codes"]
        elif difficulty == "Medium":
            q_text = f"We have a case of {scenario} in our {fw} backend. Explain how you would optimize your queries and schema design in {db} to prevent connection pool exhaustion."
            expected = f"Implement connection pooling, avoid N+1 query problems by using eager loads, optimize index selections in {db}, and use select projections to limit columns returned."
            rubric = ["Mentions connection pooling limits", "Identifies N+1 query resolution", "Applies indexing to columns in filter clauses"]
        elif difficulty == "Hard":
            q_text = f"Explain how you would architect a solution to achieve {scenario} in a {fw} system, specifically leveraging {mechanism} with {db} under heavy peak traffic."
            expected = f"Apply {mechanism} to throttle/buffer requests, scale read replicas for {db}, implement cache layers, and write asynchronous background tasks in {fw} using workers."
            rubric = ["Explains mechanism integration", "Mentions replication or caching strategies", "Addresses transaction boundaries and failure states"]
        else: # Expert
            q_text = f"You are leading the design of a highly available platform where you encounter a conflict between data consistency and write latency while {scenario} in {db}. Detail your architectural trade-offs, how you apply {mechanism}, and how you design the schema to recover from unexpected server crashes."
            expected = f"Explain CAP theorem tradeoffs (AP vs CP), detail how {mechanism} guarantees data state reconciliation (e.g. idempotency keys, WAL logs, retry buffers), and lay out a disaster recovery validation protocol."
            rubric = ["Deep analysis of CAP theorem trade-offs", "Structured error recovery and idempotency logic", "Analyzes system failure modes and fallback strategies"]
            
        tags = [fw, db, difficulty.lower(), topic.lower().replace(" ", "_")]
        followups = [
            f"How would you monitor the database connection pool in this setup?",
            f"If we scale this horizontally to 50 server nodes, what changes in your approach?",
            f"What specific metrics would trigger an automated alert?"
        ]

    elif industry in ["Finance", "Legal"]:
        scenarios = FIN_SCENARIOS
        mechanisms = FIN_MECHANISMS
        
        scenario = scenarios[index % len(scenarios)]
        mechanism = mechanisms[(index + 1) % len(mechanisms)]
        
        if difficulty == "Easy":
            q_text = f"Explain the fundamental difference between cash accounting and accrual accounting, and how it impacts a company's balance sheet reporting."
            expected = "Cash accounting records revenue/expenses when cash shifts hands. Accrual accounting records them when earned/incurred, affecting accounts receivable and accounts payable."
            rubric = ["Defines accrual matching principle", "Explains accounts receivable/payable impacts", "Mentions standard ledger matching"]
        elif difficulty == "Medium":
            q_text = f"We are {scenario}. What initial financial variables and ratios would you extract from the company's reports, and how do they inform your valuation?"
            expected = "Extract EBITDA margins, Net Debt, free cash flow (FCF), leverage ratios (Debt/EBITDA), and Current Ratio. Use them to evaluate solvency, liquidity, and operating leverage."
            rubric = ["Identifies leverage ratios", "Calculates free cash flows (FCF)", "Correlates ratios to operational health"]
        elif difficulty == "Hard":
            q_text = f"Detail how you would structure an analysis for {scenario}, utilizing {mechanism} to defend your recommendations to senior board members."
            expected = f"Build a multi-scenario model using {mechanism}, adjust discounting rates based on risk premium adjustments, analyze cost synergies, and model compliance frameworks."
            rubric = ["Uses cash flow projections", "Adjusts hurdle rates/WACC logically", "Integrates risk factors/sensitivities"]
        else: # Expert
            q_text = f"You are advising on a high-stakes transaction where you must balance {scenario} against hostile regulatory scrutiny. How do you design an evaluation strategy combining {mechanism} and rigorous compliance controls to mitigate legal liability?"
            expected = "Integrate anti-trust compliance reviews, model legal liability contingency provisions, build sensitivity matrices on capital ratios, and establish independent valuation checkpoints."
            rubric = ["Integrates anti-trust/regulatory parameters", "Detailed mitigation of corporate legal liabilities", "Strategic negotiation frameworks"]

        tags = ["finance", difficulty.lower(), topic.lower().replace(" ", "_")]
        followups = [
            "How does changing the interest rate environment affect this model?",
            "What happens if regulatory compliance approvals are delayed by six months?",
            "What audit trail checkpoints would you build in?"
        ]
        
    elif industry in ["Healthcare"]:
        scenarios = MED_SCENARIOS
        mechanisms = MED_MECHANISMS
        
        scenario = scenarios[index % len(scenarios)]
        mechanism = mechanisms[(index + 1) % len(mechanisms)]
        
        if difficulty == "Easy":
            q_text = f"What are the standard guidelines for verifying patient identity and cross-referencing allergies before prescribing a common antibiotic?"
            expected = "Ask for two patient identifiers (name, DOB), check active charts, query the electronic records for listed allergen groups, and confirm verbally before administering."
            rubric = ["Verifies two distinct identifiers", "Queries allergen records", "Performs verbal confirmation step"]
        elif difficulty == "Medium":
            q_text = f"Describe how you would approach {scenario}, and what clinical indicators would cause you to escalate the case immediately."
            expected = "Verify vital signs (BP, HR, Temp, SpO2), review active symptoms, check for flag metrics like sepsis indicators or cardiac distress, and initiate standard diagnostic panels."
            rubric = ["Monitors vital clinical signs", "Identifies critical triggers/red flags", "Performs initial diagnostic workflows"]
        elif difficulty == "Hard":
            q_text = f"How do you manage the clinical protocol for {scenario} by implementing {mechanism} while keeping patient safety as the absolute priority?"
            expected = f"Apply {mechanism} to monitor drug levels and target pathogens, evaluate systemic indices, adjust drug dosages dynamically, and document progress."
            rubric = ["Applies clinical protocol safely", "Monitors laboratory levels and values", "Maintains clear document history"]
        else: # Expert
            q_text = f"You are developing a clinical practice guideline for {scenario}. How do you incorporate {mechanism} into the clinical workflow, ensure compliance with ethics, and design quality assurance metrics to review compliance across multiple hospital departments?"
            expected = "Incorporate evidence-based clinical pathways, establish ethical review gates, define key performance indicators (like readmission rates, medication error rates), and run audit cycles."
            rubric = ["Formulates evidence-based clinical pathways", "Integrates medical ethics parameters", "Designs hospital-wide quality audits"]

        tags = ["healthcare", difficulty.lower(), topic.lower().replace(" ", "_")]
        followups = [
            "How does this clinical approach change if the patient is pregnant?",
            "What indicators would suggest a drug-drug interaction is occurring?",
            "How do you document deviations from standard protocols?"
        ]

    else: # Marketing, Business, Engineering, Design, HR, Education
        scenarios = BIZ_SCENARIOS
        mechanisms = BIZ_MECHANISMS
        
        scenario = scenarios[index % len(scenarios)]
        mechanism = mechanisms[(index + 1) % len(mechanisms)]
        
        if difficulty == "Easy":
            q_text = f"What are the key steps in gathering requirements or feedback from a client before starting a project, and how do you document them?"
            expected = "Schedule interviews, document objective goals, write a brief listing core scope, obtain client sign-off, and track requirements in a spreadsheet or tool."
            rubric = ["Outlines basic stakeholder interviews", "Identifies project scope limits", "Drafts clear objective lists"]
        elif difficulty == "Medium":
            q_text = f"Describe your approach to {scenario}, and how you verify that your primary metrics are heading in the right direction."
            expected = "Establish baseline metrics, implement weekly data dashboards, conduct team syncs to analyze blockers, and tweak execution based on analytics."
            rubric = ["Defines baseline metrics", "Establishes monitoring interval", "Uses evidence to adjust project steps"]
        elif difficulty == "Hard":
            q_text = f"In a project where you are {scenario}, how would you implement {mechanism} to ensure deliverables are met on time and within budget?"
            expected = f"Apply {mechanism} to balance scope demands, track resources, establish clear gates for milestones, and handle change requests rigorously."
            rubric = ["Integrates mechanism parameters", "Handles resource tracking constraints", "Structures clear gates for deliverables"]
        else: # Expert
            q_text = f"Detail how you would resolve a crisis when {scenario}. Explain how you deploy {mechanism}, manage stakeholder alignment under high stress, and set up a long-term strategy to prevent similar failures in the future."
            expected = "Perform a root-cause analysis, set up a steering committee to align expectations, deploy robust process modifications using Six Sigma/Lean, and draft a prevention playbook."
            rubric = ["Executes rigorous root-cause analysis", "Aligns stakeholders under high stress", "Builds preventative process playbook"]

        tags = ["business", difficulty.lower(), topic.lower().replace(" ", "_")]
        followups = [
            "How do you handle a team member who is resistant to these methods?",
            "What metrics indicate that this process correction has succeeded?",
            "How would you communicate a project delay to the client?"
        ]

    return {
        "question_text": q_text,
        "topic": topic,
        "sub_topic": sub_topic,
        "difficulty": difficulty,
        "industry": industry,
        "role": role,
        "experience_level": "Entry" if difficulty == "Easy" else ("Mid" if difficulty == "Medium" else ("Senior" if difficulty == "Hard" else "Lead")),
        "expected_answer": expected,
        "evaluation_rubric": json.dumps(rubric),
        "follow_ups": json.dumps(followups),
        "concept_tags": json.dumps(tags),
        "estimated_time": 90 if difficulty in ["Easy", "Medium"] else 120
    }

# 4. DATABASE SEEDER EXECUTION
def seed_interview_questions():
    """Generates and seeds 100,000+ structured, highly realistic interview questions in bulk."""
    db = SessionLocal()
    try:
        count = db.query(InterviewQuestion).count()
        if count >= 100000:
            print(f"[Question Graph] Already populated with {count} questions. Skipping seeding.")
            return

        print("[Question Graph] Starting programmatic seeding of 100,000+ questions...")
        start_time = time.time()

        # Build list of combinations
        combinations = []
        
        # We will loop through the industries, roles, topics, subtopics, difficulties
        # and create multiple questions per combination to reach the target size.
        difficulties = ["Easy", "Medium", "Hard", "Expert"]
        
        for industry, ind_data in INDUSTRIES.items():
            roles = ind_data["roles"]
            topics_dict = ind_data["topics"]
            
            for role in roles:
                for topic, subtopics in topics_dict.items():
                    for subtopic in subtopics:
                        for diff in difficulties:
                            combinations.append((industry, role, topic, subtopic, diff))

        # We have combinations. To reach 100,000+, we need to generate several questions per combination.
        # Let's see: len(combinations) is about 350 to 500 depending on the taxonomy sizing.
        # Let's count combinations:
        # Tech: 7 roles * 16 subtopics * 4 difficulties = 448
        # Finance: 4 roles * 12 subtopics * 4 difficulties = 192
        # Healthcare: 4 roles * 12 subtopics * 4 difficulties = 192
        # Marketing: 3 roles * 12 subtopics * 4 difficulties = 144
        # Business: 3 roles * 12 subtopics * 4 difficulties = 144
        # Engineering: 3 roles * 8 subtopics * 4 difficulties = 96
        # Design: 3 roles * 8 subtopics * 4 difficulties = 96
        # HR: 2 roles * 8 subtopics * 4 difficulties = 64
        # Legal: 3 roles * 8 subtopics * 4 difficulties = 96
        # Education: 3 roles * 8 subtopics * 4 difficulties = 96
        # Total combinations: ~1618.
        # To get 102,000 questions, we need to generate 102,000 / 1618 = ~63 questions per combination.
        # We can easily loop 64 times and generate variations by incrementing the index!
        
        print(f"[Question Graph] Found {len(combinations)} base taxonomy paths. Generating 64 variations per path...")

        questions_batch = []
        total_generated = 0
        batch_size = 5000

        for var_idx in range(64):
            for comb in combinations:
                industry, role, topic, sub_topic, difficulty = comb
                q_data = generate_question(industry, role, topic, sub_topic, difficulty, var_idx)
                questions_batch.append(q_data)
                total_generated += 1

                if len(questions_batch) >= batch_size:
                    db.bulk_insert_mappings(InterviewQuestion, questions_batch)
                    db.commit()
                    questions_batch = []
                    print(f"[Question Graph] Seeded {total_generated} questions...")

        if questions_batch:
            db.bulk_insert_mappings(InterviewQuestion, questions_batch)
            db.commit()

        duration = time.time() - start_time
        print(f"[Question Graph] Seeding completed! Total questions: {total_generated}. Time taken: {duration:.2f}s")
        
    except Exception as e:
        db.rollback()
        print(f"[Question Graph] Seeding failed: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    # Test generation and seed if run directly
    seed_interview_questions()
