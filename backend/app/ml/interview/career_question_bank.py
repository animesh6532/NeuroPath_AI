career_names = [
    "Software Developer", "Frontend Developer", "Backend Developer", "Full Stack Developer", "Mobile App Developer",
    "Data Scientist", "AI Engineer", "Machine Learning Engineer", "Cybersecurity Analyst", "DevOps Engineer", "Cloud Engineer",
    "Blockchain Developer", "Business Analyst", "Product Manager", "Project Manager", "Entrepreneur", "Operations Manager",
    "Supply Chain Manager", "Financial Analyst", "Accountant", "Investment Banker", "Auditor", "Tax Consultant", "Doctor",
    "Nurse", "Pharmacist", "Physiotherapist", "Medical Lab Technician", "Graphic Designer", "UI/UX Designer", "Video Editor",
    "Content Writer", "Animator", "Photographer", "Teacher", "Professor", "Researcher", "Tutor", "Civil Services Officer",
    "Police Officer", "Defense Officer", "Public Policy Analyst", "Mechanical Engineer", "Civil Engineer", "Electrical Engineer",
    "Electronics Engineer", "Automobile Engineer", "Lawyer", "Legal Advisor", "Corporate Lawyer", "Digital Marketer", "SEO Specialist",
    "Social Media Manager", "Brand Manager", "HR Manager", "Sales Manager", "Customer Support Executive", "Hotel Manager", "Chef",
    "Farmer", "Sports Coach", "Journalist"
]

base_technical_templates = [
    "What are the key technical responsibilities you handle as a {career}?",
    "Describe a core tool, technology, or methodology critical to your work as a {career}.",
    "How do you approach requirement analysis in {career} activities?",
    "What is your workflow for reviewing {career} deliverables?",
    "Explain a standard process step for a {career} in your industry.",
    "How would you validate quality in a typical {career} assignment?",
    "Describe how you prioritize tasks for a {career} under a tight deadline.",
    "What metrics do you monitor to gauge success as a {career}?",
    "How do you adapt to new regulations or standards in {career} work?",
    "Walk me through an end-to-end procedure you own as a {career}.",
    "Describe a specific technology stack used by experienced {career}s.",
    "How do you contribute to documentation practices in {career} projects?",
    "What are the common compliance or safety checks for {career} work?",
    "How do you integrate stakeholder feedback into your {career} technical plans?",
    "What is the most important tradeoff to manage as a {career}?",
    "How do you diagnose a recurring issue in your {career} field?",
    "How do you evaluate a new skill or technique for relevance in {career}?",
    "Describe a time you implemented a best practice specific to a {career} responsibility.",
    "What is the most challenging part of technical execution for a {career}?",
    "How do you establish priority between urgent and important tasks as a {career}?",
    "What balance do you strike between speed and accuracy in {career} output?",
    "How do you collaborate with peers on quality assurance in {career}?",
    "How do you approach cross-disciplinary handoffs relevant to {career} work?",
    "Explain how you maintain subject matter knowledge as a {career}.",
    "Describe a typical risk mitigation plan in your {career} practice.",
    "How do you handle versioning or changes in ongoing {career} tasks?",
    "What tools do you use for communication and alignment in {career}?",
    "How do you evaluate a candidate solution from a {career} perspective?",
    "Describe your approach to mentoring juniors in a {career} context.",
    "What is your typical method for root cause analysis as a {career}?",
    "How do you set performance goals for your {career} function?",
    "How do you verify compliance with industry standards in {career}?",
    "How do you prepare for a major handover in a {career} engagement?",
    "What business case do you build to justify a technical decision as a {career}?",
    "How do you balance innovation and repeatability as a {career}?",
    "Describe how you keep customer/end-user focus in {career} activities.",
    "How do you manage time and multitasking as a {career}?",
    "What sequence of checks do you follow before finalizing a {career} deliverable?"
]

base_scenario_templates = [
    "In a real-world day, what is your first action when starting work as a {career}?",
    "How would you respond if a critical {career} task suddenly loses priority?",
    "Describe your approach to handling a last-minute change requested by a stakeholder in {career} work.",
    "What do you do when a colleague asks for help on a high-impact {career} issue?",
    "How would you manage an urgent escalation affecting your {career} responsibilities?",
    "How do you handle an ambiguous brief in a {career} assignment?",
    "What is your process for onboarding a new tool for {career} assignments?",
    "How do you determine when to raise an issue to leadership in {career}?",
    "How do you stabilize operations when a key {career} process fails?",
    "What communication style do you use when sharing progress in {career} tasks?",
    "How do you keep track of deadlines and deliverables in {career} projects?",
    "Describe a situation where you had to re-prioritize multiple {career} commitments.",
    "How do you ensure quality when completing repetitive {career} tasks?",
    "What process do you follow for peer review of {career} work?",
    "How do you safeguard data and privacy in everyday {career} decisions?",
    "How do you handle cross-functional tensions in {career} collaborations?",
    "Describe your crisis response when a {career}-specific system breaks down.",
    "How would you tackle a budget cut that impacts your {career} deliverables?",
    "How do you support junior staff in high-pressure {career} scenarios?",
    "What is your action plan when you see a quality gap in {career} outcomes?"
]

base_project_templates = [
    "Describe a project where you took ownership as a {career}.",
    "What steps did you take to scope a {career}-related project?",
    "How did you define success for a project aligned with the {career} domain?",
    "What technical hurdles did you overcome in a typical {career} project?",
    "How do you gather requirements and translate them into {career} deliverables?",
    "Describe a time you changed direction mid-project as a {career} and why.",
    "How do you involve stakeholders in project checkpoints for {career}?",
    "What metrics did you use to assess progress in a {career} project?",
    "How do you ensure knowledge transfer after completing a {career} project?",
    "Describe a cost-saving decision you made during a {career} project.",
    "How did you integrate user feedback into a project as a {career}?",
    "What process did you use for post-project evaluation in {career}?",
    "How do you balance ambition and feasibility in {career} projects?",
    "How did you manage a timeline slip in a {career} project?",
    "What is your method for selecting vendors or partners on a {career} project?"
]

base_advanced_templates = [
    "Describe an advanced technical problem in {career} that you solved end-to-end.",
    "How do you build a strategy for scaling {career} capabilities across teams?",
    "What latest industry trend are you implementing as an advanced {career}?",
    "How do you mentor others in advanced methods for your {career}?",
    "Describe a framework you built to optimize {career} outcomes.",
    "How do you evaluate long-term risks in {career} projects?",
    "What leadership challenge have you faced in a senior {career} role?",
    "How do you influence cross-functional roadmaps as an experienced {career}?",
    "Describe a technical debt paydown strategy you led as a {career}.",
    "How do you align advanced {career} initiatives with business goals?"
]

CAREER_QUESTION_BANK = {}
for career in career_names:
    technical = [template.format(career=career) for template in base_technical_templates]
    scenario = [template.format(career=career) for template in base_scenario_templates]
    project = [template.format(career=career) for template in base_project_templates]
    advanced = [template.format(career=career) for template in base_advanced_templates]
    CAREER_QUESTION_BANK[career] = technical + scenario + project + advanced
