from sentence_transformers import SentenceTransformer, util


# Load embedding model
model = SentenceTransformer('all-MiniLM-L6-v2')

# Career descriptions
CAREER_TEXT = {

# ================= TECH =================
"Software Developer": """
backend development, APIs, system design, Java, Python, databases,
cloud computing, software engineering, microservices
""",

"Frontend Developer": """
HTML, CSS, JavaScript, React, UI/UX, responsive design,
web development, user interface
""",

"Data Scientist": """
machine learning, statistics, python, pandas, numpy,
data visualization, predictive modeling, analytics
""",

"AI Engineer": """
deep learning, neural networks, NLP, computer vision,
tensorflow, pytorch, transformers, AI systems
""",

"Cybersecurity Analyst": """
network security, ethical hacking, penetration testing,
cyber defense, encryption, security protocols
""",

"DevOps Engineer": """
CI/CD, Docker, Kubernetes, cloud infrastructure,
automation, deployment pipelines
""",

# ================= BUSINESS =================
"Business Analyst": """
business analysis, requirement gathering, stakeholder management,
data analysis, reporting, process improvement
""",

"Product Manager": """
product strategy, roadmap planning, agile, user research,
market analysis, product lifecycle
""",

"Entrepreneur": """
startup, business development, innovation, strategy,
funding, leadership, risk management
""",

"Digital Marketer": """
SEO, social media marketing, content marketing,
branding, campaign management, advertising
""",

# ================= FINANCE =================
"Financial Analyst": """
financial modeling, accounting, excel, investment analysis,
budgeting, forecasting, corporate finance
""",

"Accountant": """
accounting, taxation, auditing, bookkeeping,
financial statements, compliance
""",

"Investment Banker": """
investment analysis, mergers, acquisitions,
capital markets, finance strategy
""",

# ================= HEALTHCARE =================
"Doctor": """
medical diagnosis, patient care, clinical knowledge,
healthcare, surgery, treatment planning
""",

"Nurse": """
patient care, clinical support, healthcare services,
medical assistance, hospital work
""",

"Pharmacist": """
medication, drug knowledge, prescriptions,
pharmacy, healthcare support
""",

# ================= CREATIVE =================
"Graphic Designer": """
design, photoshop, illustrator, creativity,
branding, visual communication
""",

"Video Editor": """
video editing, premiere pro, after effects,
storytelling, media production
""",

"Content Writer": """
writing, blogging, content creation,
SEO writing, storytelling
""",

# ================= EDUCATION =================
"Teacher": """
teaching, mentoring, subject knowledge,
education, communication skills
""",

"Professor": """
research, teaching, academic writing,
higher education, publications
""",

# ================= GOVERNMENT =================
"Civil Services": """
government exams, public administration,
policy making, governance, UPSC
""",

"Defense Services": """
army, navy, airforce, discipline,
physical training, national security
""",

# ================= CORE ENGINEERING =================
"Mechanical Engineer": """
mechanical systems, manufacturing,
CAD, thermodynamics, production
""",

"Civil Engineer": """
construction, infrastructure, structural design,
site management, civil projects
""",

"Electrical Engineer": """
circuits, power systems, electronics,
electrical design, control systems
""",

# ================= OTHERS =================
"Lawyer": """
law, legal advice, court, litigation,
contracts, legal research
""",

"HR Manager": """
recruitment, employee management,
HR policies, talent acquisition
""",

"Sales Manager": """
sales, negotiation, client handling,
business growth, revenue generation
""",

"UI/UX Designer": """
user experience design, user interface, wireframing,
figma, usability testing, prototyping
""",

"Cloud Engineer": """
aws, azure, cloud infrastructure, deployment,
virtual machines, networking, scalability
""",

"Game Developer": """
game design, unity, unreal engine, c++, graphics,
game mechanics, interactive systems
""",

"Data Analyst": """
excel, sql, data visualization, reporting,
business insights, dashboards, analytics
""",

"SEO Specialist": """
search engine optimization, keyword research,
google analytics, content ranking
""",

"Mobile App Developer": """
android, ios, flutter, react native,
mobile development, app deployment
""",
}

# Function to get model
def get_model():
    return model

# Convert careers to embeddings
career_embeddings = {
    career: model.encode(desc, convert_to_tensor=True)
    for career, desc in CAREER_TEXT.items()
}

def semantic_match(resume_text):

    model = get_model()

    resume_embedding = model.encode(resume_text, convert_to_tensor=True)

    similarities = []

    # Calculate similarity
    for career, emb in career_embeddings.items():
        sim = util.cos_sim(resume_embedding, emb).item()
        similarities.append((career, sim))

    # Normalize scores (VERY IMPORTANT)
    scores = [s for _, s in similarities]
    min_s, max_s = min(scores), max(scores)

    results = []

    for career, sim in similarities:
        norm_score = (sim - min_s) / (max_s - min_s + 1e-5)

        results.append({
            "career": career,
            "score": round(norm_score, 2)
        })

    results.sort(key=lambda x: x["score"], reverse=True)

    return results[:5]
