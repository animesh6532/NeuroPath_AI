def generate_interview_blueprint(career_profile: dict, resume_profile: dict) -> list:
    """
    Generates a highly structured, level-appropriate, and role-aligned interview
    blueprint consisting of exactly 22 rounds to match the Phase 6 distribution.
    
    Phases 5, 6 & 7:
    - Introduction (1 Question)
    - Resume Walkthrough (1 Question)
    - Projects (2 Questions - Architecture, Engineering Decision)
    - Core CS Subjects (8 Questions)
    - Role Specific Technologies (4 Questions)
    - Scenario Based Questions (2 Questions)
    - Behavioural Questions (2 Questions)
    - Candidate Questions (1 Question)
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
            ("Computer Networks (CN)", "TCP/IP models, OSI layers, DNS resolution protocols, socket flows, and TLS handshakes."),
            ("SQL & Querying", "Writing optimized query joins, filters, grouping aggregate constraints, and standard query execution."),
            ("REST APIs & JSON", "RESTful communication states, HTTP verbs payload mapping, response codes, and pagination constraints."),
            ("Version Control & Git", "Branching workflows, staging environments, conflict resolution, rebase operations, and repository lifecycle."),
            ("Data Structures & Algorithms", "Algorithmic complexity (Big O), lists, hash maps, trees, binary searches, and recursive structures.")
        ],
        "AI/ML Engineer": [
            ("Python Programming", "Python decorators, memory allocations, generators, multiprocessing limits, and async event models."),
            ("Applied Statistics", "Hypothesis testing, probability distributions, central limit theorem, and variance analysis details."),
            ("Machine Learning Algorithms", "Ensemble bagging vs boosting, decision bounds, gradient descents, bias-variance trade-offs."),
            ("Deep Learning Architectures", "Neural network layer configurations, backpropagation gradients, activation weights, and loss bounds."),
            ("Natural Language Processing (NLP)", "Tokenizations, TF-IDF representations, word embeddings, similarity weights, and token parsers."),
            ("Transformers & LLMs", "Attention projections, self-attention equations, QKV weights, RNN recurrence limitations, and fine-tuning."),
            ("Model Evaluation Metrics", "Precision, recall, F1-scores, AUC-ROC bounds, confusion matrix metrics, and validation structures."),
            ("Feature Engineering & Scaling", "Data scaling normalization, vectorization arrays, dimensional reduction (PCA), and missing value imputation.")
        ],
        "Database Developer": [
            ("SQL & Query Execution", "Query compilers, query plans, data definition languages, and data manipulation optimizations."),
            ("Database Normalization (1NF, 2NF, 3NF)", "Functional dependencies, transitive relationship resolution, normal forms boundaries, and denormalization."),
            ("SQL Joins & Performance", "Nested loops, hash joins, merge joins, execution plan details, and index lookup comparisons."),
            ("Database Indexes Strategy", "B-Trees, Hash indexes, composite or partial index tradeoffs, and scan cost analytics."),
            ("ACID Transactions", "Atomicity, Consistency, Isolation levels (Read Committed, Repeatable Read, Serializable), and Durability."),
            ("Locks & Concurrency Control", "Shared vs exclusive locks, deadlock resolutions, lock escalations, and optimistic vs pessimistic concurrency."),
            ("PostgreSQL Features", "MVCC concurrency, window functions, CTE tables, execution logs, and configuration performance tuning."),
            ("Stored Procedures & Triggers", "Procedural SQL, database trigger constraints, stored functions lifecycle, and transactional boundaries.")
        ],
        "Backend Developer": [
            ("Python & Backend Languages", "Async backend models, event loop operations, typing classes, and memory profiling methods."),
            ("FastAPI Framework", "ASGI servers, Dependency Injection models, middleware interceptions, and auto OpenAPI configurations."),
            ("Authentication & JWT", "HMAC-SHA256 signatures, stateless tokens payload, Authorization Bearer verification, and key rotations."),
            ("RESTful API Architecture", "Resource-oriented routing, HTTP code mapping, payload schema bindings, and versioning pipelines."),
            ("Caching & Redis", "In-memory caching architectures, Redis key-value store configurations, TTL expiries, and eviction algorithms."),
            ("PostgreSQL & SQL Databases", "Relational schema structures, database migrations, connection poolers (PgBouncer), and index optimizations."),
            ("Containerization & Docker", "Docker layers caching, multi-stage compilation builds, network bridging, and volume configurations."),
            ("System Scalability & Load Balancing", "Horizontal vs vertical scaling, reverse proxies (Nginx), load balancing algorithms, and read replicas.")
        ],
        "Frontend Developer": [
            ("JavaScript & ES6", "Event loops, call stacks, closures, promise states, prototypes, and asynchronous JavaScript engines."),
            ("React Framework", "Component life cycles, React virtual DOM comparison, hooks, context API, and global state managers."),
            ("CSS & Responsive Design", "Flexbox layouts, CSS grids, media queries, UI accessibility guidelines, and box models."),
            ("Frontend Performance Optimization", "Code splitting, lazy loading, resource prefetching, reflow reduction, and bundle optimizations."),
            ("Web APIs & DOM", "DOM manipulation hooks, local storages, cookies lifecycle, browser rendering stages, and security."),
            ("API Consumption & REST", "Fetch client configurations, Axios header injections, CORS preflights, and request states management."),
            ("State Management", "Prop drilling resolution, Context API, Redux Toolkit slices, Zustand state stores, and rendering performance."),
            ("Web Security & CORS", "Cross-site scripting (XSS) prevention, CSRF tokens, secure cookies, and CORS header configs.")
        ]
    }

    role_tech_topics = {
        "Software Engineer": [
            ("Software Engineering Principles", "SOLID design principles, clean code architectures, and technical debt mitigations."),
            ("Code Refactoring & Testing", "Unit test designs, mock assertions, test-driven development (TDD), and integration testing."),
            ("Basic System Design", "Load balancing configurations, vertical vs horizontal partitions, and microservice decoupling."),
            ("Dynamic Programming & Logic", "Complex conditional controls, loop optimizations, hash tracking, and space/time tradeoffs.")
        ],
        "AI/ML Engineer": [
            ("TensorFlow & PyTorch", "Tensor mathematical operations, autograd backpropagation, custom loss functions, and model class builders."),
            ("Model Training & Tuning", "Learning rate decays, hyperparameter grids, early stopping criteria, and dropout regularization overrides."),
            ("FastAPI for ML Serving", "Async API endpoint bindings, ML model preloading, Pydantic arrays serialization, and inference loops."),
            ("Model Deployment & MLOps", "Model version control (DVC), Triton inference servers, containerized serving, and input telemetry.")
        ],
        "Database Developer": [
            ("Query Optimization & Profiling", "Parsing EXPLAIN ANALYZE logs, detecting sequential scans, optimizing nested filters, and query rewriting."),
            ("Database Backup & Replication", "Write-Ahead Logging (WAL), physical vs logical backups, primary-standby replication, and failovers."),
            ("NoSQL vs Relational Databases", "Document stores (MongoDB) vs relational postgres, CAP theorem constraints, and eventual consistency."),
            ("High Availability & Sharding", "Horizontal table partitioning, shard keys distribution, cross-shard joins reduction, and read poolers.")
        ],
        "Backend Developer": [
            ("Database Indexing & Optimizations", "Analyzing execution paths, setting composite indices, avoiding scan bottlenecks, and database tuning."),
            ("Message Queues & Background Workers", "Redis brokers configurations, Celery task workers, asynchronous worker pools, and DLQ retries."),
            ("API Security & CORS", "Strict CORS origins policies, rate limiter middlewares, SQL injection filters, and CSRF validations."),
            ("Deployments & CI/CD Pipelines", "Docker image registries, Git actions automated pipelines, blue-green deployment strategies, and health-checks.")
        ],
        "Frontend Developer": [
            ("Vite & Packaging", "Vite production asset builds, rollups bundling, source maps caching, and asset minifications."),
            ("React Hooks Tuning", "useMemo value memorizations, useCallback functions ref caching, and performance memoization wrappers."),
            ("Context & State Performance", "Context selector splits, reducing top-level state updates, and slice optimizations."),
            ("Accessibility & UX Design", "WAI-ARIA semantic elements, tab-focus indicators, keyboard navigations, and color contrast ratios.")
        ]
    }

    # Retrieve lists for target role
    cs_list = role_cs_subjects.get(target_role, role_cs_subjects["Software Engineer"])
    tech_list = role_tech_topics.get(target_role, role_tech_topics["Software Engineer"])

    projects_list = resume_profile.get("structured_projects", [])
    proj_name = projects_list[0].get("name", "Key Project") if projects_list else "Recent Project"

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

    # 3. Projects (2 rounds - Architecture, Engineering Decision)
    blueprint_rounds.append({
        "name": f"Project Architecture: {proj_name}",
        "category": "Projects",
        "focus": "Systems Architecture",
        "description": f"Explaining the systems architecture and components of project '{proj_name}'.",
        "duration": 120,
        "difficulty": "Medium" if level == "Entry" else "Hard"
    })
    blueprint_rounds.append({
        "name": f"Project Decisions: {proj_name}",
        "category": "Projects",
        "focus": "Engineering Decisions",
        "description": f"Diving into major challenges, engineering choices, and tradeoffs in '{proj_name}'.",
        "duration": 120,
        "difficulty": "Medium" if level == "Entry" else "Hard"
    })

    # 4. Core CS Subjects (8 rounds)
    for topic, desc in cs_list[:8]:
        blueprint_rounds.append({
            "name": f"Core CS: {topic}",
            "category": "Technical",
            "focus": topic,
            "description": desc,
            "duration": 90,
            "difficulty": "Easy" if level == "Entry" else "Medium"
        })

    # 5. Role-Specific Technologies (4 rounds)
    for topic, desc in tech_list[:4]:
        blueprint_rounds.append({
            "name": f"Tech: {topic}",
            "category": "Technical",
            "focus": topic,
            "description": desc,
            "duration": 90,
            "difficulty": "Medium" if level == "Entry" else "Hard"
        })

    # 6. Scenario Based Questions (2 rounds)
    blueprint_rounds.append({
        "name": "Scenario: System Scaling",
        "category": "Scenario",
        "focus": "Scalability under Load",
        "description": "Designing and modifying architectures to handle sudden spikes in request traffic.",
        "duration": 120,
        "difficulty": "Medium" if level == "Entry" else "Hard"
    })
    blueprint_rounds.append({
        "name": "Scenario: Fault Tolerance",
        "category": "Scenario",
        "focus": "Failure Recovery",
        "description": "How to isolate, debug, and recover from partial system outages or data corruption.",
        "duration": 120,
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

    # 8. Candidate Questions & Closing (2 rounds)
    blueprint_rounds.append({
        "name": "Candidate Q&A",
        "category": "Closing",
        "focus": "Candidate Inquiries",
        "description": "Addressing your inquiries about team structure, engineering culture, and roadmap details.",
        "duration": 60,
        "difficulty": "Easy"
    })
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
