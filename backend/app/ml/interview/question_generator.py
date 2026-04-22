import random

def generate_questions_from_skills(skills: list):
    # Ensure exactly 15 questions: 1 intro, 2 soft skill, 8 technical, 4 project/domain
    questions = []
    
    # 1. Intro (1)
    questions.append("Tell me about yourself and your overall background.")
    
    # 2. Soft Skill (2)
    soft_skills_q = [
        "Describe a time you faced a difficult challenge at work and how you overcame it.",
        "How do you prioritize multiple deadlines?",
        "Can you share an experience where you had to learn a new technology quickly?",
        "How do you handle disagreements with team members or management?"
    ]
    questions.extend(random.sample(soft_skills_q, 2))
    
    # 3. Technical (8)
    technical_qs = []
    
    # If no skills are provided (fallback)
    if not skills:
        skills = ["software engineering", "programming", "system design", "databases", "web development", "API design", "algorithms", "data structures"]
    
    # We need exactly 8 technical questions based strictly on skills.
    # We will loop through skills and create a question for each until we hit 8.
    # If we have fewer than 8 skills, we cycle back through the list with a different question template.
    
    templates = [
        "Can you explain the internal working mechanism or advanced concepts of {skill}?",
        "What are the most common performance bottlenecks when working with {skill} and how do you resolve them?",
        "How would you design a scalable system using {skill}?"
    ]
    
    skill_index = 0
    template_index = 0
    
    while len(technical_qs) < 8:
        current_skill = skills[skill_index]
        current_template = templates[template_index]
        
        technical_qs.append(current_template.format(skill=current_skill))
        
        # Move to next skill
        skill_index += 1
        
        # If we exhausted skills, loop back to the first skill but use the next question template
        if skill_index >= len(skills):
            skill_index = 0
            template_index = (template_index + 1) % len(templates)
            
    questions.extend(technical_qs)
        
    # 4. Project/Domain (4)
    domain_qs = [
        "Walk me through the most complex project you have built. What was your role?",
        "What were the key technical decisions you made in your recent projects?",
        "How did you measure the success or impact of the applications you developed?",
        "What was the biggest failure in one of your projects and what did you learn?",
        "If you had to redesign your last project from scratch, what would you do differently?"
    ]
    questions.extend(random.sample(domain_qs, 4))
    
    return questions[:15]