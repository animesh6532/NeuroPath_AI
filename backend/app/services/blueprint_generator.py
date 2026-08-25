def generate_interview_blueprint(career_profile: dict, resume_profile: dict) -> list:
    """
    Generates a highly structured, level-appropriate, and role-aligned interview
    blueprint consisting of sequential rounds matching the Phase 7 flow.
    
    Phases 7:
    - Introduction (1 Question)
    - Resume Walkthrough (1 Question)
    - Projects (up to 2 projects, 2 questions per project: Architecture, Deep Dive)
    - Core CS Subjects (4 Questions: OOP, DBMS, OS, Networks)
    - Role Specific Technologies (2 Questions)
    - Coding Concepts (1 Question)
    - Behavioural Questions (2 Questions)
    - HR / Alignment (1 Question)
    - Closing (1 Question)
    """
    level = career_profile.get("career_level", "Entry")
    role = career_profile.get("primary_role", "Software Developer")
    
    # Resolve target role details
    target_role = "Software Engineer"
    if any(kw in role.lower() for kw in ["ai", "ml", "machine learning", "data scientist"]):
        target_role = "AI/ML Engineer"
    elif any(kw in role.lower() for kw in ["database", "db"]):
        target_role = "Database Developer"
    elif any(kw in role.lower() for kw in ["backend", "full stack", "fullstack", "systems"]):
        target_role = "Backend Developer"
    elif any(kw in role.lower() for kw in ["frontend", "react", "ui", "ux"]):
        target_role = "Frontend Developer"

    # Define role-specific subjects and technologies
    role_cs_subjects = {
        "Software Engineer": [
            ("Object Oriented Programming (OOP)", "Core OOP design patterns, inheritance, polymorphism, encapsulation, and abstraction boundaries."),
            ("Database Management Systems (DBMS)", "Relational database models, data definitions, constraint verification, and normalization logic."),
            ("Operating Systems (OS)", "Processes vs threads, scheduling strategies, memory paging, deadlocks, and virtual memory allocation."),
            ("Computer Networks (CN)", "TCP/IP models, OSI layers, DNS resolution protocols, socket flows, and TLS handshakes.")
        ],
        "AI/ML Engineer": [
            ("Python Programming", "Python decorators, memory allocations, generators, multiprocessing limits, and async event models."),
            ("Applied Statistics", "Hypothesis testing, probability distributions, central limit theorem, and variance analysis details."),
            ("Machine Learning Algorithms", "Ensemble bagging vs boosting, decision bounds, gradient descents, bias-variance trade-offs."),
            ("Deep Learning Architectures", "Neural network layer configurations, backpropagation gradients, activation weights, and loss bounds.")
        ],
        "Database Developer": [
            ("SQL & Query Execution", "Query compilers, query plans, data definition languages, and data manipulation optimizations."),
            ("Database Normalization (1NF, 2NF, 3NF)", "Functional dependencies, transitive relationship resolution, normal forms boundaries, and denormalization."),
            ("SQL Joins & Performance", "Nested loops, hash joins, merge joins, execution plan details, and index lookup comparisons."),
            ("Database Indexes Strategy", "B-Trees, Hash indexes, composite or partial index tradeoffs, and scan cost analytics.")
        ],
        "Backend Developer": [
            ("Python & Backend Languages", "Async backend models, event loop operations, typing classes, and memory profiling methods."),
            ("FastAPI Framework", "ASGI servers, Dependency Injection models, middleware interceptions, and auto OpenAPI configurations."),
            ("Authentication & JWT", "HMAC-SHA256 signatures, stateless tokens payload, Authorization Bearer verification, and key rotations."),
            ("RESTful API Architecture", "Resource-oriented routing, HTTP code mapping, payload schema bindings, and versioning pipelines.")
        ],
        "Frontend Developer": [
            ("JavaScript & ES6", "Event loops, call stacks, closures, promise states, prototypes, and asynchronous JavaScript engines."),
            ("React Framework", "Component life cycles, React virtual DOM comparison, hooks, context API, and global state managers."),
            ("CSS & Responsive Design", "Flexbox layouts, CSS grids, media queries, UI accessibility guidelines, and box models."),
            ("Frontend Performance Optimization", "Code splitting, lazy loading, resource prefetching, reflow reduction, and bundle optimizations.")
        ]
    }

    role_tech_topics = {
        "Software Engineer": [
            ("Software Engineering Principles", "SOLID design principles, clean code architectures, and technical debt mitigations."),
            ("Code Refactoring & Testing", "Unit test designs, mock assertions, test-driven development (TDD), and integration testing.")
        ],
        "AI/ML Engineer": [
            ("TensorFlow & PyTorch", "Tensor mathematical operations, autograd backpropagation, custom loss functions, and model class builders."),
            ("Model Training & Tuning", "Learning rate decays, hyperparameter grids, early stopping criteria, and dropout regularization overrides.")
        ],
        "Database Developer": [
            ("Query Optimization & Profiling", "Parsing EXPLAIN ANALYZE logs, detecting sequential scans, optimizing nested filters, and query rewriting."),
            ("Database Backup & Replication", "Write-Ahead Logging (WAL), physical vs logical backups, primary-standby replication, and failovers.")
        ],
        "Backend Developer": [
            ("Database Indexing & Optimizations", "Analyzing execution paths, setting composite indices, avoiding scan bottlenecks, and database tuning."),
            ("Message Queues & Background Workers", "Redis brokers configurations, Celery task workers, asynchronous worker pools, and DLQ retries.")
        ],
        "Frontend Developer": [
            ("Vite & Packaging", "Vite production asset builds, rollups bundling, source maps caching, and asset minifications."),
            ("React Hooks Tuning", "useMemo value memorizations, useCallback functions ref caching, and performance memoization wrappers.")
        ]
    }

    # Retrieve lists for target role
    cs_list = role_cs_subjects.get(target_role, role_cs_subjects["Software Engineer"])
    tech_list = role_tech_topics.get(target_role, role_tech_topics["Software Engineer"])

    projects_list = [p for p in resume_profile.get("structured_projects", []) if p.get("name") and p.get("name").lower() != "project task"]

    # Construct the sequential rounds blueprint
    blueprint_rounds = []
    
    # 1. Introduction (1 round)
    blueprint_rounds.append({
        "name": "Introduction & Welcomer",
        "category": "Intro",
        "focus": "Welcome Screen",
        "description": "Explaining the interview flow and introducing NeuroPath AI.",
        "duration": 60,
        "difficulty": "Easy"
    })
    
    # 2. Resume Discussion (1 round)
    blueprint_rounds.append({
        "name": "Resume WALKTHROUGH",
        "category": "Resume",
        "focus": "Experience & Career",
        "description": "Walkthrough of your technical background and experience highlights.",
        "duration": 90,
        "difficulty": "Easy" if level == "Entry" else "Medium"
    })

    # 3. Projects (maximum 2 projects, 2 rounds each: Architecture, Deep Dive)
    for p in projects_list[:2]:
        p_name = p.get("name", "Project")
        blueprint_rounds.append({
            "name": f"Project Architecture: {p_name}",
            "category": "Projects",
            "focus": "Systems Architecture",
            "description": f"Explaining the systems architecture and components of project '{p_name}'.",
            "duration": 120,
            "difficulty": "Medium" if level == "Entry" else "Hard"
        })
        blueprint_rounds.append({
            "name": f"Project Decisions: {p_name}",
            "category": "Projects",
            "focus": "Engineering Decisions",
            "description": f"Diving into major challenges, engineering choices, and tradeoffs in '{p_name}'.",
            "duration": 120,
            "difficulty": "Medium" if level == "Entry" else "Hard"
        })

    # 4. Core CS Subjects (4 rounds)
    for topic, desc in cs_list[:4]:
        blueprint_rounds.append({
            "name": f"Core CS: {topic}",
            "category": "Technical",
            "focus": topic,
            "description": desc,
            "duration": 90,
            "difficulty": "Easy" if level == "Entry" else "Medium"
        })

    # 5. Role-Specific Technologies (2 rounds)
    for topic, desc in tech_list[:2]:
        blueprint_rounds.append({
            "name": f"Tech: {topic}",
            "category": "Technical",
            "focus": topic,
            "description": desc,
            "duration": 90,
            "difficulty": "Medium" if level == "Entry" else "Hard"
        })

    # 6. Coding Concepts (1 round)
    blueprint_rounds.append({
        "name": "Coding Concepts: Data Structures & Algorithms",
        "category": "Coding",
        "focus": "Data Structures & Algorithms",
        "description": "Explaining runtime complexities, sorting algorithms, and standard data structure tradeoffs.",
        "duration": 90,
        "difficulty": "Medium" if level == "Entry" else "Hard"
    })

    # 7. Behavioural Questions (2 rounds)
    blueprint_rounds.append({
        "name": "Behavioural: Team Disagreements",
        "category": "Behavioural",
        "focus": "Conflict Resolution",
        "description": "Resolving complex disagreements with colleagues on design implementation paths.",
        "duration": 90,
        "difficulty": "Medium"
    })
    blueprint_rounds.append({
        "name": "Behavioural: Tight Deadlines",
        "category": "Behavioural",
        "focus": "Prioritization & Ownership",
        "description": "How you manage deliverable timelines and make compromises when deadlines shrink.",
        "duration": 90,
        "difficulty": "Medium"
    })

    # 8. HR / Alignment (1 round)
    blueprint_rounds.append({
        "name": "HR: Career Targets & Learning",
        "category": "HR",
        "focus": "Career Alignment",
        "description": "Assessing how your long-term career targets align with the team and your short-term learning goals.",
        "duration": 90,
        "difficulty": "Easy"
    })

    # 9. Closing (1 round)
    blueprint_rounds.append({
        "name": "Closing Comments",
        "category": "Closing",
        "focus": "Wrap Up",
        "description": "Summarizing steps and providing final remarks.",
        "duration": 60,
        "difficulty": "Easy"
    })

    # Enforce round numbers
    for idx, r in enumerate(blueprint_rounds):
        r["round_number"] = idx + 1

    return blueprint_rounds
