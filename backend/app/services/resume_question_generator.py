import json
import hashlib
import re
from backend.app.routes.profile import _load_profiles

# ================= PHASE 3: DOMAIN DETECTION TAXONOMY =================
DOMAINS_KEYWORD_TAXONOMY = {
    "AI/ML Engineer": ["machine learning", "deep learning", "tensorflow", "pytorch", "keras", "transformers", "nlp", "computer vision", "scikit-learn", "pandas", "numpy", "embeddings", "sentence transformers", "artificial intelligence", "ml", "ai"],
    "Backend Developer": ["fastapi", "django", "flask", "express", "node.js", "nodejs", "spring boot", "postgresql", "postgres", "mysql", "redis", "mongodb", "rest api", "backend", "databases", "grpc", "graphql"],
    "Frontend Developer": ["react", "reactjs", "next.js", "nextjs", "vue", "angular", "javascript", "typescript", "css", "html", "figma", "tailwind", "frontend", "redux", "virtual dom", "accessibility"],
    "Full Stack Developer": ["full stack", "fullstack", "react", "next.js", "node.js", "express", "fastapi", "postgresql", "mongodb"],
    "DevOps / Cloud Engineer": ["docker", "kubernetes", "aws", "azure", "gcp", "terraform", "ci/cd", "jenkins", "ansible", "cloud", "devops", "nginx", "github actions"],
    "Database Developer": ["sql", "database", "query optimization", "normalization", "indexing strategy", "acid transactions", "stored procedures", "oracle", "sql server", "postgres", "db admin", "nosql"],
    "Data Scientist / Analyst": ["pandas", "numpy", "tableau", "power bi", "data analysis", "data analyst", "r language", "matplotlib", "seaborn", "statistics", "sql"],
    "Mobile Developer": ["react native", "flutter", "swift", "kotlin", "android", "ios", "mobile app", "xcode"]
}

# Skill extraction categories (Phase 1)
SKILL_CATEGORIES = {
    "programming_languages": ["python", "javascript", "typescript", "c++", "c#", "java", "ruby", "go", "rust", "php", "swift", "kotlin", "scala", "r", "sql", "html", "css"],
    "frameworks": ["fastapi", "django", "flask", "react", "next.js", "nextjs", "vue", "angular", "express", "spring boot", "laravel", "rails", "asp.net", "flutter", "react native"],
    "libraries": ["jquery", "redux", "pandas", "numpy", "scikit-learn", "scipy", "tensorflow", "pytorch", "keras", "transformers", "matplotlib", "seaborn", "nltk", "spacy", "opencv"],
    "databases": ["postgresql", "postgres", "mysql", "sqlite", "mongodb", "redis", "cassandra", "dynamodb", "mariadb", "oracle", "sql server", "neo4j", "elasticsearch"],
    "cloud_platforms": ["aws", "azure", "gcp", "heroku", "digitalocean", "vercel", "netlify", "firebase"],
    "tools": ["git", "docker", "kubernetes", "jenkins", "terraform", "ansible", "prometheus", "grafana", "postman", "jira", "figma", "webpack", "vite", "npm", "pip", "tesseract"]
}

# ================= PHASE 4: SKILL MAPPING =================
SKILL_MAPS = {
    "python": ["OOP", "Decorators", "Generators", "Memory Management", "Threading", "Multiprocessing", "Async"],
    "fastapi": ["Dependency Injection", "Middleware", "Background Tasks", "JWT", "Async APIs"],
    "sql": ["Normalization", "Transactions", "Indexes", "Execution Plans", "Optimization"],
    "react": ["Hooks", "Virtual DOM", "Lifecycle", "Rendering", "Performance"],
    "machine learning": ["Statistics", "Bias-Variance", "Feature Engineering", "Overfitting", "Ensemble Models"],
    "deep learning": ["Backpropagation", "Activation Functions", "CNNs", "LSTMs", "Transformers", "PyTorch", "TensorFlow"],
    "docker": ["Images vs Containers", "Multi-stage builds", "Volumes", "Networking", "Docker Compose"],
    "kubernetes": ["Pods", "Deployments", "Services", "ConfigMaps", "Secrets", "Ingress", "Rolling Updates"],
    "aws": ["EC2 Instances", "Load Balancers", "S3 Storage", "IAM Roles", "Auto Scaling", "Multi-AZ"],
    "system design": ["Load Balancers", "Caching", "Sharding", "Message Queues", "Rate Limiters", "DNS", "CAP Theorem"]
}

# ================= PHASE 7 & 8: CORE SUBJECT QUESTIONS TEMPLATES =================
CS_SUBJECTS_TEMPLATES = {
    "Software Engineer": {
        "Object Oriented Programming (OOP)": {
            "question_text": "As a Software Engineer, how do you implement OOP principles like polymorphism, inheritance, and encapsulation inside {project}? How do these concepts prevent tight component coupling?",
            "expected_answer": "Inheritance allows subclasses to reuse parent structures, while polymorphism enables runtime behavior overrides. Encapsulation hides private members behind public accessors. This reduces coupling by programming to interfaces instead of concrete classes.",
            "rubric": ["Defines encapsulation and public interface bounds", "Differentiates static vs dynamic polymorphism", "Explains composition over inheritance tradeoffs", "Applies decoupling principles to {project}"],
            "follow_ups": ["Can you describe how abstract classes differ from interfaces?", "How does this apply to system-level modules?"],
            "concept_tags": ["oop", "polymorphism", "encapsulation"]
        },
        "Database Management Systems (DBMS)": {
            "question_text": "Describe the main architecture of a Database Management System. How do relational constraints and database locks safeguard data integrity under concurrent transactions?",
            "expected_answer": "A DBMS manages physical storage, page caching, and query parsing. Relational constraints (FKs, unique constraints) enforce logical validity, while transaction isolation levels using lock protocols prevent anomalies like dirty or non-repeatable reads.",
            "rubric": ["Differentiates logical vs physical schemas", "Explains foreign key constraint validations", "Mentions shared vs exclusive lock boundaries", "Identifies concurrency anomaly anomalies"],
            "follow_ups": ["Explain how WAL (Write-Ahead Logging) guarantees durability.", "How does concurrency control impact index performance?"],
            "concept_tags": ["dbms", "locks", "concurrency"]
        },
        "Operating Systems (OS)": {
            "question_text": "Detail the differences between operating system processes and threads. How do you diagnose and resolve deadlocks in multi-threaded application pipelines?",
            "expected_answer": "A process has its own virtual memory space, whereas threads share the heap of their parent process. Deadlocks occur when circular wait conditions are met. They are prevented by acquiring locks in a strict global ordering, using timeout limits, or utilizing lock-free data structures.",
            "rubric": ["Differentiates process vs thread memory spaces", "Identifies Coffman deadlock conditions", "Details circular wait prevention", "Proposes timeout or ordered lock strategies"],
            "follow_ups": ["Describe virtual memory paging and thrashing.", "What is context switching overhead?"],
            "concept_tags": ["operating_systems", "threads", "deadlocks"]
        },
        "Computer Networks (CN)": {
            "question_text": "Walk me through what happens when a client makes an HTTP request to {project} backend. Trace the network flows down to OSI layers and TCP handshakes.",
            "expected_answer": "The client resolves DNS via UDP. A TCP connection is established using a 3-way handshake (SYN, SYN-ACK, ACK) at the transport layer. The application layer sends the HTTP payload, which is routed via IP packets at the network layer, frame-encapsulated at the data link layer, and sent over physical media.",
            "rubric": ["Traces DNS UDP lookup", "Details TCP 3-way handshake flags", "Maps Application/Transport/Network layers of TCP/IP", "Explains packet routing and MAC framing"],
            "follow_ups": ["Explain HTTP keep-alive and connection pooling.", "How does TLS handshake secure HTTP requests?"],
            "concept_tags": ["networking", "osi_model", "tcp"]
        },
        "SQL & Querying": {
            "question_text": "Explain the differences between indexing scans and index seeks in SQL. Write a quick mental query matching how you would retrieve record sets using group filters.",
            "expected_answer": "An index seek directly navigates the B-Tree index structure using search keys, returning matching rows in O(log N) time. An index scan traverses the entire leaf level of the index, which is slower. Group filtering uses the HAVING clause after GROUP BY.",
            "rubric": ["Differentiates B-Tree seek vs leaf scan", "Explains O(log N) seek complexity", "Identifies HAVING vs WHERE clause order", "Shows query optimization metrics"],
            "follow_ups": ["When does a seek convert into a sequential scan?", "Describe composite index sorting order."],
            "concept_tags": ["sql", "indexing", "seeking"]
        },
        "REST APIs & JSON": {
            "question_text": "How do you design high-availability RESTful API endpoints? Compare HTTP state methods and version control paradigms.",
            "expected_answer": "REST APIs utilize stateless HTTP verbs (GET, POST, PUT, DELETE) representing resources. High-availability is achieved through load balancing and caching. Versioning is handled via request headers (Accept) or URL path prefixing (/v1/api).",
            "rubric": ["Defines HTTP idempotent verbs", "Explains stateless server designs", "Compares URL path versioning vs Header versioning", "Mentions HTTP caching validation headers"],
            "follow_ups": ["Describe REST security validations.", "How does GraphQL reduce REST payload over-fetching?"],
            "concept_tags": ["rest_apis", "http", "versioning"]
        },
        "Version Control & Git": {
            "question_text": "Explain Git rebase versus merge operations. How do you resolve complex conflict histories in concurrent team environments?",
            "expected_answer": "Git merge creates a new merge commit, preserving historical timeline splits. Git rebase reapplies commits on top of another branch base, yielding a linear commit history. Conflict resolution involves manually editing conflicting files, staging changes, and committing.",
            "rubric": ["Differentiates linear rebase history vs split merge commit", "Warns about rebasing shared public branches", "Explains manual marker conflict updates", "Outlines git status/add staging flow"],
            "follow_ups": ["Explain how Git refs and HEAD pointer works.", "What is git cherry-pick?"],
            "concept_tags": ["git", "version_control", "rebase"]
        },
        "Data Structures & Algorithms": {
            "question_text": "Detail the runtime complexity (Big O) of sorting algorithms like quicksort and merge sort. When is a hash map preferred over a binary tree for lookups?",
            "expected_answer": "Quicksort has average O(N log N) and worst O(N^2) complexity. Merge sort has guaranteed O(N log N) complexity but requires O(N) extra space. Hash maps offer O(1) average lookups but lose key order, whereas binary search trees keep sorted order in O(log N) lookups.",
            "rubric": ["Identifies average vs worst sort cases", "Cites merge sort auxiliary space requirements", "Compares O(1) hash map vs O(log N) tree sorting", "Explains hash collision resolutions"],
            "follow_ups": ["Describe balanced BST systems like AVL or Red-Black trees.", "How does quicksort pivot selection avoid worst-case runtime?"],
            "concept_tags": ["algorithms", "sorting", "hashmaps"]
        }
    },
    "AI/ML Engineer": {
        "Python Programming": {
            "question_text": "As an AI/ML Engineer, how do you optimize memory allocations and list operations in Python when processing large dataset vectors? Compare generators against in-memory lists.",
            "expected_answer": "Generators evaluate items lazily using yield, consuming minimal memory (O(1)) by yielding one item at a time. In-memory lists load all elements at once (O(N) memory). For ML vectors, we use numpy arrays to leverage contiguous C-level memory allocations and vectorized operations.",
            "rubric": ["Explains lazy yield generators memory", "Contrasts O(1) generator vs O(N) list footprint", "Cites numpy contiguous C-arrays vectorization", "Addresses Python GIL limits in multi-threading data load"],
            "follow_ups": ["Explain Python garbage collection and reference counting.", "How does memory profiling help trace leaks in ML loaders?"],
            "concept_tags": ["python", "generators", "numpy"]
        },
        "Applied Statistics": {
            "question_text": "Explain hypothesis testing, p-values, and the Central Limit Theorem. How do you check if your machine learning features are normally distributed?",
            "expected_answer": "The CLT states that the sample mean distribution approaches normal as sample size increases, regardless of population shape. Hypothesis testing compares null and alternate hypotheses; p-values measure the probability of observing data under the null. We check feature distributions using Q-Q plots, histogram checks, or Shapiro-Wilk tests.",
            "rubric": ["Defines null hypothesis and p-value boundary", "Explains CLT sample mean normalization", "Suggests Q-Q plots or Shapiro-Wilk test checks", "Addresses skewness corrections"],
            "follow_ups": ["What is Type I vs Type II error?", "Explain covariance and correlation differences."],
            "concept_tags": ["statistics", "hypothesis_testing", "distributions"]
        },
        "Machine Learning Algorithms": {
            "question_text": "Explain the differences between bagging and boosting ensemble models. Contrast Random Forest against XGBoost/LightGBM.",
            "expected_answer": "Bagging builds independent models in parallel on bootstrapped samples, averaging predictions to reduce variance (e.g. Random Forest). Boosting builds sequential models, where each tree minimizes residual errors of previous steps, reducing bias (e.g. XGBoost, LightGBM).",
            "rubric": ["Differentiates parallel bagging vs sequential boosting", "Bagging reduces variance, Boosting reduces bias", "Cites bootstrapping sample splits", "Identifies decision tree weak learners in boosting"],
            "follow_ups": ["How does gradient boosting compute residuals?", "Compare L1 vs L2 regularization in boosting weights."],
            "concept_tags": ["machine_learning", "bagging", "boosting"]
        },
        "Deep Learning Architectures": {
            "question_text": "Walk me through how backpropagation calculates gradients in deep neural networks. Cite common activation functions and how they avoid vanishing gradients.",
            "expected_answer": "Backpropagation uses the chain rule to compute gradients of the loss function with respect to weights, propagating errors backward from output to input. Vanishing gradients occur when activations like sigmoid or tanh compress inputs, leading to tiny gradients. ReLU avoids this by keeping constant gradient 1 for positive inputs.",
            "rubric": ["Explains chain rule derivative splits", "Details vanishing gradient effect of sigmoid/tanh", "Proposes ReLU/Leaky ReLU constant positive gradient", "Mentions gradient clipping or skip connections"],
            "follow_ups": ["Explain batch normalization scaling benefits.", "Describe weight initialization strategies (Xavier/He)."],
            "concept_tags": ["deep_learning", "backpropagation", "activations"]
        },
        "NLP": {
            "question_text": "Explain TF-IDF and word embeddings. How do SentenceTransformers vectorize text documents compared to bag-of-words methods?",
            "expected_answer": "TF-IDF scores word importance based on document frequency, but loses semantic context. Word embeddings capture similarity in dense vectors. SentenceTransformers use transformer self-attention to generate context-aware sentence embeddings, encoding complete semantics instead of individual word tokens.",
            "rubric": ["Defines term frequency vs inverse document frequency", "Explains token vector context loss in bag-of-words", "Identifies self-attention semantic encoding", "Compares sparse TF-IDF vs dense embeddings"],
            "follow_ups": ["Describe cosine similarity calculations.", "How does tokenization handle out-of-vocabulary terms?"],
            "concept_tags": ["nlp", "embeddings", "tf-idf"]
        },
        "Transformers": {
            "question_text": "Detail the self-attention formula in the Transformer architecture. How does it resolve the sequential bottlenecks of RNNs?",
            "expected_answer": "Self-attention computes Attention(Q, K, V) = softmax(Q K^T / sqrt(d_k)) V. Q, K, V are Query, Key, Value matrices. It calculates weights between all tokens concurrently, enabling parallel training. RNNs must process tokens sequentially, creating gradient and scheduling bottlenecks.",
            "rubric": ["Writes attention softmax equation", "Defines Q, K, V matrix projections", "Explains parallel tokens computation over recurrent steps", "Mentions scaling factor sqrt(d_k) role"],
            "follow_ups": ["What is multi-head attention?", "Explain positional encodings necessity in Transformers."],
            "concept_tags": ["transformers", "self_attention", "nlp"]
        },
        "Model Evaluation": {
            "question_text": "Differentiate between precision, recall, and F1-score. When would you optimize for recall over precision in a real-world system?",
            "expected_answer": "Precision measures true positives out of all predicted positives. Recall measures true positives out of all actual positives. F1-score is their harmonic mean. Optimize recall when missing a positive case has high cost (e.g. medical diagnosis, fraud detection). Optimize precision when false alarms are costly (e.g. spam filters).",
            "rubric": ["Defines precision and recall formulas", "F1 is harmonic mean", "Cites high-cost positive misses for recall optimization", "Cites high-cost false alarms for precision optimization"],
            "follow_ups": ["What is AUC-ROC curve?", "Explain cross-validation strategies."],
            "concept_tags": ["model_evaluation", "precision", "recall"]
        },
        "Feature Engineering": {
            "question_text": "Detail feature scaling normalization and dimensional reduction (PCA) strategies. When is normalization preferred over standardization?",
            "expected_answer": "Normalization (MinMax) scales values to [0,1]. Standardization transforms data to zero mean and unit variance. PCA reduces dimensions by projecting data onto orthogonal directions of maximum variance. MinMax scaling is preferred when bounds are strict, whereas standardization is robust to outliers.",
            "rubric": ["MinMax scales to 0-1, Standardization is Z-score", "Standardization handles outliers better", "PCA projects onto principal component eigenvectors", "Mentions variance conservation metrics in PCA"],
            "follow_ups": ["How does feature correlation impact linear models?", "Describe missing value imputation approaches."],
            "concept_tags": ["feature_engineering", "pca", "scaling"]
        }
    },
    "Database Developer": {
        "SQL & Query Execution": {
            "question_text": "Explain SQL query compiling and execution plans. How does indexing affect transaction speeds in write-heavy environments?",
            "expected_answer": "A query compiler parses, checks semantics, and optimizes the SQL string into an execution tree. An index speeds up reads but slows down writes because the index B-Tree must be updated (split/balanced) for every insert, update, or delete transaction.",
            "rubric": ["Outlines SQL parser, optimizer, execution path stages", "Reads B-Tree update overhead in writes", "Differentiates scan vs index seek", "Cites transaction log logs"],
            "follow_ups": ["What are catalog statistics?", "How do you identify duplicate indexes?"],
            "concept_tags": ["sql", "query_plan", "indexes"]
        },
        "Database Normalization (1NF, 2NF, 3NF)": {
            "question_text": "Detail 1NF, 2NF, and 3NF database normalization boundaries. Under what production scenarios would you denormalize?",
            "expected_answer": "1NF requires atomic values. 2NF removes partial key dependencies. 3NF removes transitive dependencies. Denormalize in read-heavy analytics platforms or dashboard engines to eliminate expensive multi-table JOINs, caching pre-computed fields.",
            "rubric": ["Defines 1NF atomic limits", "Defines 2NF partial key dependency", "Defines 3NF transitive dependency", "Justifies denormalization joins optimization"],
            "follow_ups": ["Explain BCNF (Boyce-Codd Normal Form).", "What is update anomaly danger in denormalized tables?"],
            "concept_tags": ["databases", "normalization", "denormalization"]
        },
        "SQL Joins & Performance": {
            "question_text": "Compare nested loops, hash joins, and merge joins. How do you optimize large table joins in database queries?",
            "expected_answer": "Nested loop join is O(M*N) and fits small tables. Hash join builds a hash table in memory for the smaller table and probes with the larger. Merge sort join requires both tables sorted by the join key. Optimize by adding indexes on join keys and filtering tables early.",
            "rubric": ["Compares nested loop M*N cost", "Explains hash join memory hash table probe", "Explains merge join sorting precondition", "Applies index filters to key joins"],
            "follow_ups": ["What is disk-spilling in hash joins?", "Explain inner vs outer join optimizer selections."],
            "concept_tags": ["sql", "joins", "optimization"]
        },
        "Database Indexes Strategy": {
            "question_text": "Explain B-Trees indexing storage. What is the overhead of composite indexes in write-heavy schemas?",
            "expected_answer": "B-Trees store index records in sorted balanced tree pages, providing O(log N) operations. Composite indexes contain multiple columns in sorted hierarchy order. Every write splits leaves, requiring rebalancing overhead, degrading transaction throughput.",
            "rubric": ["Defines B-Tree balanced node paths", "O(log N) lookup path description", "Composite index column ordering constraints", "Write page-splitting overhead"],
            "follow_ups": ["Compare clustered vs non-clustered indexes.", "Explain partial indexes benefit."],
            "concept_tags": ["indexing", "b-trees", "databases"]
        },
        "ACID Transactions": {
            "question_text": "Detail ACID database transactions properties. Differentiate between isolation levels and concurrency anomalies.",
            "expected_answer": "Atomicity (all or nothing), Consistency (preserves rules), Isolation (independent transactions), Durability (persisted writes). Isolation levels: Read Uncommitted, Read Committed, Repeatable Read, Serializable. Anomalies: Dirty Reads, Non-repeatable Reads, Phantom Reads.",
            "rubric": ["Defines ACID components", "Compares Read Committed vs Repeatable Read vs Serializable", "Connects levels to Dirty/Non-repeatable/Phantom anomalies", "Mentions pessimistic serial lock mechanisms"],
            "follow_ups": ["Explain write skew anomaly in Repeatable Read isolation.", "How does two-phase commit guarantee distributed consistency?"],
            "concept_tags": ["databases", "acid", "isolation_levels"]
        },
        "Locks": {
            "question_text": "Explain database locks (shared, exclusive) and lock escalation. How do you prevent deadlocks in highly concurrent environments?",
            "expected_answer": "Shared locks allow concurrent reads. Exclusive locks block other transactions for writes. Lock escalation converts many fine-grained row locks to table locks. Prevent deadlocks by ordering lock acquisitions globally, using timeouts, or using MVCC.",
            "rubric": ["Shared reads vs Exclusive writes", "Lock escalation row-to-table criteria", "Deadlock resolution via wait-for graphs detection", "Global ordered locking strategy"],
            "follow_ups": ["What is pessimistic locking syntax in SQL?", "Describe latching versus locking."],
            "concept_tags": ["databases", "locks", "deadlocks"]
        },
        "PostgreSQL": {
            "question_text": "Describe Multiversion Concurrency Control (MVCC) in PostgreSQL. How does it handle write concurrency and vacuuming?",
            "expected_answer": "MVCC allows readers not to block writers, and vice versa, by maintaining multiple row versions (tuples). Old tuple versions are marked deleted. The VACUUM command reclaims space occupied by dead tuples, preventing table bloat.",
            "rubric": ["Explain readers do not block writers in MVCC", "Tuple versioning identifiers (xmin, xmax)", "Identifies dead tuples space accumulation", "Explains VACUUM/Auto-vacuum tasks"],
            "follow_ups": ["What is transaction ID wraparound in Postgres?", "Describe WAL replication in PostgreSQL."],
            "concept_tags": ["postgresql", "mvcc", "vacuum"]
        },
        "Stored Procedures": {
            "question_text": "Detail stored procedures versus SQL triggers. What are the performance and architectural tradeoffs?",
            "expected_answer": "Stored procedures are compiled SQL routines executed on demand. Triggers run automatically on database events (insert, update, delete). Tradeoffs: stored procedures reduce network roundtrips but trigger actions are hard to debug and split business logic.",
            "rubric": ["Compiles stored procedures on demand", "Event-driven trigger invocation bounds", "Reduces network I/O payload roundtrips", "Addresses maintenance and debugging challenges"],
            "follow_ups": ["Explain SQL injection vulnerability in dynamic stored procedure queries.", "Describe security definer vs security invoker rights."],
            "concept_tags": ["stored_procedures", "triggers", "databases"]
        }
    },
    "Backend Developer": {
        "Python & Backend Languages": {
            "question_text": "How do you implement asynchronous programming and event loops in Python backend architectures?",
            "expected_answer": "Asynchronous Python utilizes `asyncio` to run non-blocking tasks. An event loop schedules coroutines. Coroutines yield control back using `await` during I/O blockages, allowing single-threaded systems to handle high I/O throughput.",
            "rubric": ["Explains asyncio single-threaded scheduler model", "Defines coroutines using async/await", "Contrasts asynchronous non-blocking I/O vs multi-threading thread pool", "GIL thread scheduling context constraints"],
            "follow_ups": ["Describe ASGI servers (Uvicorn) performance.", "How does event loop starvation occur?"],
            "concept_tags": ["python", "asyncio", "event_loop"]
        },
        "FastAPI Framework": {
            "question_text": "Explain Dependency Injection in FastAPI. How does it manage database session lifecycles using Depends()?",
            "expected_answer": "Dependency Injection passes dependencies as parameters. FastAPI uses Depends() to resolve database sessions. It handles lifecycle cleaning: yields DB session, FastAPI runs path function, then executes post-yield close commands.",
            "rubric": ["Explains Depends() injection", "Details yield session instantiation lifecycle", "Addresses close cleanup", "Mocking database interfaces in testing"],
            "follow_ups": ["How does FastAPI compile Pydantic models?", "Describe custom middleware implementation in FastAPI."],
            "concept_tags": ["fastapi", "dependency_injection", "pydantic"]
        },
        "Authentication & JWT": {
            "question_text": "Detail JWT authentication security. How do you handle token invalidation after a candidate logs out?",
            "expected_answer": "JWT tokens are stateless and signed using HMAC-SHA256. For logout invalidation, you must blacklist the token in Redis with a TTL matching the token's remaining lifespan, or maintain session tracking keys.",
            "rubric": ["Stateless nature of JWT security", "HMAC-SHA256 signatures validity", "Redis blacklisting strategy with TTL", "Refresh tokens rotation benefits"],
            "follow_ups": ["What goes in a JWT payload?", "How does CSRF attack target JWT stored in cookies?"],
            "concept_tags": ["jwt", "authentication", "redis"]
        },
        "RESTful API Architecture": {
            "question_text": "Explain resource-oriented routing, stateless REST rules, and caching headers implementation in backend APIs.",
            "expected_answer": "REST organizes endpoints around nouns (resources). Requests must carry all state. Caching headers like Cache-Control, ETag, and Last-Modified let clients cache responses, reducing server queries.",
            "rubric": ["Defines resource URI mappings", "Explains REST stateless constraints", "Cites ETags validation flows", "Outlines Cache-Control directives"],
            "follow_ups": ["Describe HTTP response status code families.", "What is HATEOAS constraint in REST?"],
            "concept_tags": ["rest_apis", "caching", "http"]
        },
        "Caching & Redis": {
            "question_text": "Detail cache eviction policies and Redis setups for API request caching.",
            "expected_answer": "API caching stores database query results in Redis. Eviction policies determine how keys are cleared when memory limits are hit (e.g. Least Recently Used - LRU, LFU). Set key TTLs to prevent serving stale data.",
            "rubric": ["Explains Redis key-value cache layer", "Compares LRU vs LFU eviction algorithms", "Addresses TTL setting boundaries", "Mentions cache stampede or cache penetration mitigations"],
            "follow_ups": ["Describe Redis persistent storage models (RDB and AOF).", "What is Redis cluster sharding?"],
            "concept_tags": ["caching", "redis", "lru"]
        },
        "PostgreSQL & SQL Databases": {
            "question_text": "Explain relational schema constraints, migrations, and index tracking in PostgreSQL.",
            "expected_answer": "PostgreSQL enforces constraint structures. Migrations (e.g. Alembic) apply incremental schema updates. We track indexes using system catalogs (pg_stat_user_indexes) to monitor scan hits and drop unused indexes.",
            "rubric": ["Outlines migrations version history tracking", "Enforces foreign key constraint checks", "Tracks pg_stat_user_indexes catalog usage", "Drop unused index write overhead reduction"],
            "follow_ups": ["What is transactional DDL in PostgreSQL?", "Explain connection pooling PgBouncer benefits."],
            "concept_tags": ["postgresql", "migrations", "indexes"]
        },
        "Containerization & Docker": {
            "question_text": "Explain Docker images versus containers. How do multi-stage Docker builds reduce image footprints in production?",
            "expected_answer": "An image is a static read-only template; a container is a running instance. Multi-stage builds compile code in an intermediate image containing heavy SDKs, copying only compiled binaries to a final lightweight image, discarding build dependencies.",
            "rubric": ["Differentiates image vs container", "Explains multi-stage copy files instruction", "Outlines build dependencies removal", "Final production image footprint reduction"],
            "follow_ups": ["Explain Docker container network bridging.", "What is docker-compose role?"],
            "concept_tags": ["docker", "containers", "devops"]
        },
        "System Scalability & Load Balancing": {
            "question_text": "How would you scale a backend from 1,000 to one million concurrent connections? Detail microservice and message broker design.",
            "expected_answer": "Scale by deploying stateless service replicas behind an ALB/Nginx load balancer. Use message brokers like RabbitMQ or Redis Celery queues to offload heavy operations asynchronously. Shard databases and add read replicas.",
            "rubric": ["Stateless app horizontal replication", "Reverse proxy load balancing", "Asynchronous message broker offloading (RabbitMQ/Celery)", "Database sharding and read replicas"],
            "follow_ups": ["Explain CAP theorem tradeoffs in distributed databases.", "What is rate limiting role in high scale?"],
            "concept_tags": ["scalability", "load_balancers", "microservices"]
        }
    }
}

# ================= PHASE 2: PROJECT UNDERSTANDING ENGINE =================
def extract_project_knowledge_graph(project: dict) -> dict:
    """
    Parses project descriptions to extract a detailed engineering Project Graph (Phase 2).
    """
    name = project.get("name", "Project Instance")
    desc = project.get("description", "").lower()
    
    # Heuristics
    fe = "Vanilla JS / CSS"
    if "react" in desc: fe = "React Single-Page Application (SPA)"
    elif "next.js" in desc or "nextjs" in desc: fe = "Next.js (Server-Side Rendering)"
    elif "vue" in desc: fe = "Vue.js"
    elif "angular" in desc: fe = "Angular"
    
    be = "Python"
    if "fastapi" in desc: be = "FastAPI (async events ASGI)"
    elif "django" in desc: be = "Django (monolithic framework)"
    elif "flask" in desc: be = "Flask"
    elif "node" in desc or "express" in desc: be = "Node.js/Express ASGI"
    
    db = "SQLite"
    if "postgres" in desc or "postgresql" in desc: db = "PostgreSQL"
    elif "mysql" in desc: db = "MySQL"
    elif "mongodb" in desc: db = "MongoDB"
    elif "redis" in desc: db = "Redis Cache"
    
    auth = "Session Cookies"
    if "jwt" in desc or "token" in desc: auth = "JWT stateless token auth"
    elif "oauth" in desc: auth = "OAuth2 provider"
    
    deploy = "Local host VM"
    if "docker" in desc: deploy = "Docker containerization"
    elif "kubernetes" in desc or "k8s" in desc: deploy = "Kubernetes orchestration"
    elif "aws" in desc: deploy = "AWS Multi-AZ deployment"
    
    ai = "None"
    if "transformer" in desc or "nlp" in desc: ai = "SentenceTransformers (all-MiniLM-L6-v2)"
    elif "tensorflow" in desc: ai = "TensorFlow ANN"
    elif "pytorch" in desc: ai = "PyTorch weights"
    
    # NeuroPath AI specific override (Phase 8 details)
    if "neuropath" in name.lower() or "neuropath" in desc:
        return {
            "name": "NeuroPath AI",
            "problem_statement": "Redesign template-based stateful interview engines into dynamic, resume-aware simulators.",
            "purpose": "Simulate high-fidelity technical interviews using speech synthesis and NLP similarity evaluations.",
            "architecture": "Decoupled Single-Page-Application React frontend interacting with FastAPI ASGI backend.",
            "frontend": "React SPA, Web Speech API, Tailwind, Custom State Machine timers.",
            "backend": "FastAPI async ASGI backend, Uvicorn, SQLAlchemy ORM.",
            "database": "SQLite for configuration schemas and metadata; schema-less JSON for session logs.",
            "ai_models": "SentenceTransformers (all-MiniLM-L6-v2) for response cosine similarity scoring.",
            "deployment": "Dockerized container deployment behind an Nginx proxy gateway.",
            "authentication": "JWT stateless token auth using SHA-256 password hashing.",
            "apis": "RESTful endpoints with Depends authentication verification.",
            "algorithms": "Cosine similarity NLP matching, rule-based keyword extraction, and heuristic resume parse.",
            "challenges": "Managing low-latency speech recognition response thresholds and background camera proctoring.",
            "engineering_decisions": "FastAPI async event loop chosen over Django for non-blocking database queries and lightweight execution.",
            "scalability": "Horizontal load expansion utilizing Redis Celery task queues for asynchronous PDF compiles.",
            "future_scope": "Integrating real-time speech diarization and multi-agent developer whiteboard collaborations."
        }
        
    return {
        "name": name,
        "problem_statement": f"Optimize operational pipelines and implement clean data models in {name}.",
        "purpose": f"Facilitate resource access and reduce latency bottlenecks.",
        "architecture": f"Decoupled web architecture using {fe} and {be}.",
        "frontend": fe,
        "backend": be,
        "database": db,
        "ai_models": ai,
        "deployment": deploy,
        "authentication": auth,
        "apis": "RESTful HTTP API endpoints",
        "algorithms": "Standard validations and key mappings",
        "challenges": "Handling query latencies and payload serializations under concurrently spiked loads",
        "engineering_decisions": f"Selected {be} over alternative frameworks due to lower runtime memory footprint and faster I/O processing.",
        "scalability": "Asynchronous event queues and database read-replicas configuration.",
        "future_scope": "Transition to microservice orchestrations and expand container metrics collection."
    }

# ================= PHASE 1: RESUME UNDERSTANDING =================
def extract_candidate_profile(email: str, name: str, payload_skills: list, payload_exp: list, payload_projs: list) -> dict:
    """
    Performs deep resume understanding, returning a structured Candidate Profile (Phases 1-4).
    """
    profiles = _load_profiles()
    profile_data = profiles.get(email, {})

    target_role = profile_data.get("career_title") or "Software Engineer"
    career_objective = profile_data.get("career_objective") or "Professional development in software systems."
    cgpa = profile_data.get("cgpa") or "N/A"
    education = profile_data.get("education") or [{"institution": "N/A", "degree": "N/A", "duration": "N/A", "detail": "N/A"}]
    achievements = profile_data.get("achievements") or []
    soft_skills = profile_data.get("soft_skills") or ["Communication", "Problem Solving"]
    research_papers = profile_data.get("research_papers") or []
    open_source_contributions = profile_data.get("open_source_contributions") or []
    github_technologies = profile_data.get("github_technologies") or []

    skills_list = []
    if profile_data.get("custom_skills"):
        skills_list.extend(profile_data["custom_skills"])
    if payload_skills:
        skills_list.extend(payload_skills)
    skills_list = list(set([s.strip() for s in skills_list if s]))
    if not skills_list:
        skills_list = ["Software Engineering", "Programming"]

    # Work experience
    experience_list = []
    if profile_data.get("work_experience"):
        experience_list.extend(profile_data["work_experience"])
    else:
        for exp in payload_exp:
            experience_list.append({
                "role": "Software Engineer Intern" if "intern" in exp.lower() else "Software Engineer",
                "company": exp,
                "duration": "N/A",
                "responsibilities": [exp]
            })

    # Projects
    projects_list = []
    if profile_data.get("projects"):
        projects_list.extend(profile_data["projects"])
    else:
        for proj in payload_projs:
            projects_list.append({
                "name": proj,
                "description": proj,
                "technologies": []
            })

    # Group skills into strict categories
    categorized = {
        "programming_languages": [],
        "frameworks": [],
        "libraries": [],
        "databases": [],
        "cloud_platforms": [],
        "tools": []
    }
    for skill in skills_list:
        skill_lower = skill.lower()
        matched = False
        for cat, items in SKILL_CATEGORIES.items():
            if any(item in skill_lower for item in items):
                categorized[cat].append(skill)
                matched = True
        if not matched:
            categorized["tools"].append(skill)

    # Domain Classification (Phase 3)
    text_corpus = f"{name} {target_role} " + " ".join(skills_list) + " " + " ".join([exp.get("role", "") + " " + " ".join(exp.get("responsibilities", [])) for exp in experience_list])
    text_corpus = text_corpus.lower()
    domain_scores = {}
    for domain, terms in DOMAINS_KEYWORD_TAXONOMY.items():
        overlap = sum(1 for t in terms if t in text_corpus)
        domain_scores[domain] = overlap

    sorted_domains = sorted(domain_scores.items(), key=lambda x: x[1], reverse=True)
    primary_domain = sorted_domains[0][0] if sorted_domains and sorted_domains[0][1] > 0 else "Backend Developer"
    secondary_domain = sorted_domains[1][0] if len(sorted_domains) > 1 and sorted_domains[1][1] > 0 else None

    # Calculate years of experience
    years_of_experience = 0.0
    for exp in experience_list:
        duration = exp.get("duration", "")
        years = re.findall(r'\b(19|20)\d{2}\b', duration)
        if len(years) == 2:
            try:
                y1, y2 = int(years[0]), int(years[1])
                years_of_experience += max(1.0, float(y2 - y1))
            except:
                years_of_experience += 1.0
        else:
            years_of_experience += 1.0

    # Build Project Graphs (Phase 2)
    project_graphs = [extract_project_knowledge_graph(p) for p in projects_list]

    # Build Candidate Knowledge Graph (Phase 11: Skills -> Subjects -> Technologies -> Projects)
    knowledge_graph = {
        "nodes": [],
        "edges": []
    }
    for s in skills_list[:5]:
        knowledge_graph["nodes"].append({"id": s, "type": "Skill"})
        s_lower = s.lower()
        if s_lower in SKILL_MAPS:
            for sub in SKILL_MAPS[s_lower]:
                knowledge_graph["nodes"].append({"id": sub, "type": "Subject"})
                knowledge_graph["edges"].append({"source": s, "target": sub, "relation": "covers"})
    for pg in project_graphs[:2]:
        p_name = pg["name"]
        knowledge_graph["nodes"].append({"id": p_name, "type": "Project"})
        for s in skills_list:
            if s.lower() in pg["problem_statement"].lower() or s.lower() in pg["frontend"].lower() or s.lower() in pg["backend"].lower():
                knowledge_graph["edges"].append({"source": p_name, "target": s, "relation": "uses"})

    return {
        "name": name,
        "email": email,
        "years_of_experience": years_of_experience,
        "target_role": target_role,
        "primary_domain": primary_domain,
        "secondary_domain": secondary_domain,
        "education": education,
        "cgpa": cgpa,
        "programming_languages": list(set(categorized["programming_languages"])),
        "frameworks": list(set(categorized["frameworks"])),
        "libraries": list(set(categorized["libraries"])),
        "databases": list(set(categorized["databases"])),
        "cloud_platforms": list(set(categorized["cloud_platforms"])),
        "tools": list(set(categorized["tools"])),
        "projects": projects_list,
        "project_graphs": project_graphs,
        "achievements": achievements,
        "certifications": profile_data.get("certifications") or [],
        "internships": [exp for exp in experience_list if "intern" in exp.get("role", "").lower()],
        "soft_skills": soft_skills,
        "research_papers": research_papers,
        "open_source_contributions": open_source_contributions,
        "github_technologies": github_technologies,
        "career_objective": career_objective,
        "all_skills": skills_list,
        "experience": experience_list,
        "knowledge_graph": knowledge_graph
    }

# ================= PHASE 9: CONTEXT-DEPENDENT FOLLOW-UPS =================
# Dynamic Follow-up Keywords Map (Phase 9 & 11)
FOLLOWUP_KEYWORDS = [
    {
        "keywords": ["jwt", "token", "auth"],
        "follow_up_text": "You mentioned JWT tokens. How would you handle token invalidation or blacklisting on the server side after a candidate logs out?",
        "expected_answer": "Since JWTs are stateless, you cannot invalidate them directly. You must implement a token blacklisting strategy (using Redis with an expiry matching the token's TTL), utilize short expiration times with refresh tokens, or verify active sessions against database flags.",
        "rubric": ["Identifies stateless nature of JWTs", "Suggests Redis blacklist strategy", "Mentions TTL match", "Compares refresh token rotations"]
    },
    {
        "keywords": ["fastapi", "backend", "api", "endpoint"],
        "follow_up_text": "You discussed using FastAPI. How would you adjust your backend architecture to support one million active users concurrent requests?",
        "expected_answer": "To scale FastAPI, deploy multiple instances inside Docker behind a reverse proxy/load balancer (like Nginx or AWS ALB). Implement caching (Redis) for read routes, offload long-running computations to Celery task queues with RabbitMQ, and use DB read replicas.",
        "rubric": ["Mentions load balancing and proxy scaling", "Suggests Redis caching layers", "Mentions Celery/background workers", "Suggests database read replicas"]
    },
    {
        "keywords": ["database", "sql", "postgres", "mysql", "mongodb", "indexing"],
        "follow_up_text": "You noted database operations. What specific indexing strategy would you use to optimize query times for a high-write, high-read schema without degrading transaction speeds?",
        "expected_answer": "Create composite or partial indexes targeting exact filter clauses. Avoid indexing highly volatile columns or columns with low cardinality. Frequently analyze execution plans using EXPLAIN ANALYZE, and implement write-buffering or read replicas.",
        "rubric": ["Suggests partial or composite indexing", "Cites write-overhead on excessive indexes", "Mentions EXPLAIN ANALYZE for query paths", "Addresses column cardinality constraints"]
    },
    {
        "keywords": ["react", "component", "state", "hooks"],
        "follow_up_text": "You mentioned React component state. How would you design state management across deeply nested modules without triggering redundant renders?",
        "expected_answer": "Utilize context selectors, state slice managers (like Redux Toolkit or Zustand), or lift state selectively. Additionally, wrap heavy child components in React.memo and use useCallback/useMemo to prevent reference changes from triggering re-renders.",
        "rubric": ["Suggests state slicing (Redux/Zustand)", "Mentions lifting state selectively", "Explains React.memo wrapper benefits", "Explains useMemo / useCallback hook optimization"]
    },
    {
        "keywords": ["docker", "kubernetes", "container"],
        "follow_up_text": "You noted containerization. How would you manage database credentials and secrets securely in your orchestration container pipelines?",
        "expected_answer": "Never commit credentials to image files. Use secure Secret stores: Kubernetes Secrets mounted as environment variables, AWS Secrets Manager, or HashiCorp Vault. Ensure strict access role permissions (IAM/RBAC) are configured.",
        "rubric": ["Explicitly forbids hardcoding secrets in images", "Suggests secure mounting (K8s Secrets)", "Mentions enterprise secret managers (Vault/AWS)", "Addresses RBAC/IAM configurations"]
    }
]

def get_followup_question(last_answer: str, last_question_topic: str) -> dict:
    """
    Inspects candidate's answer for target keywords to serve a contextually fitting,
    personalized follow-up question (Phase 9 & 11).
    """
    ans_lower = last_answer.lower()
    for item in FOLLOWUP_KEYWORDS:
        if any(kw in ans_lower for kw in item["keywords"]):
            custom_id = -500 - len(item["keywords"])
            return {
                "id": custom_id,
                "question_text": item["follow_up_text"],
                "topic": last_question_topic,
                "sub_topic": "Follow-Up Details",
                "difficulty": "Hard",
                "expected_answer": item["expected_answer"],
                "rubric": json.dumps(item["rubric"]),
                "follow_ups": json.dumps(["How would you monitor this under high CPU usage?"]),
                "concept_tags": json.dumps(["followup", item["keywords"][0]]),
                "estimated_time": 45
            }
    
    # Fallback to general follow-up about missed details
    return {
        "id": -999,
        "question_text": f"You mentioned some interesting points in your last response about {last_question_topic}. Can you dive deeper and explain how you would handle failure recovery and error boundary cases in that exact setup?",
        "topic": last_question_topic,
        "sub_topic": "System Resiliency",
        "difficulty": "Medium",
        "expected_answer": "The candidate should detail transaction rollback strategies, try-catch error logging parameters, database reconnect loops, and failover notifications.",
        "rubric": json.dumps(["Mentions exception logging boundaries", "Explains transactional rollbacks", "Details circuit breakers or retry fallbacks"]),
        "follow_ups": json.dumps(["What metrics would trigger an auto-restart?"]),
        "concept_tags": json.dumps(["followup", last_question_topic.lower()]),
        "estimated_time": 45
    }

# ================= PHASE 12: QUESTION QUALITY COMPILER =================
def generate_personalized_question(
    email: str,
    name: str,
    skills: list,
    experience: list,
    projects: list,
    category: str,
    difficulty: str,
    round_number: int,
    history: list,
    focus: str = None,
    round_name: str = None
) -> dict:
    """
    Main orchestrator for generating dynamic, resume-aware questions (Phases 4-13).
    """
    # 1. Compile profile
    profile = extract_candidate_profile(email, name, skills, experience, projects)
    
    # 2. Extract Asked IDs
    asked_ids = [h.get("question_id") for h in history]

    # Helper: Find unused question ID
    def generate_unique_id(prefix):
        idx = round_number
        custom_id = -prefix - idx
        while custom_id in asked_ids:
            idx += 10
            custom_id = -prefix - idx
        return custom_id

    # 3. Category Router
    # A. Intro Round
    if category == "Intro":
        q_text = f"Welcome to your interview, {profile['name']}. You are interviewing for the position of {profile['target_role']} specializing in {profile['primary_domain']}. To start, walk me through your background and explain how your projects and skills align with this specific target role."
        return {
            "id": generate_unique_id(1000),
            "question_text": q_text,
            "topic": "Intro",
            "sub_topic": "Candidate Welcomer",
            "difficulty": difficulty,
            "expected_answer": f"The candidate should introduce themselves, summarizing their education, key internships or projects, and express why they are suitable for {profile['target_role']}.",
            "rubric": json.dumps(["Presents structured background overview", "Directly connects skills to the role requirements", "Expresses professional readiness"]),
            "follow_ups": json.dumps(["What specific aspect of this role excites you most?"]),
            "concept_tags": json.dumps(["intro", "introduction"]),
            "estimated_time": 60
        }

    # B. Projects / Resume Round (Phase 5)
    elif category in ["Projects", "Resume"]:
        # Match for NeuroPath AI project specific questions (Phase 8 details)
        proj_descriptions = " ".join([p.get("name", "") + " " + p.get("description", "") for p in profile["projects"]]).lower()
        
        # If NeuroPath AI is in name, description, or email
        if "neuropath" in proj_descriptions or "neuropath" in email.lower():
            # Pick a NeuroPath question
            q_data = None
            for q in NEUROPATH_QUESTIONS_OVERRIDE:
                q_id = -3000 - NEUROPATH_QUESTIONS_OVERRIDE.index(q)
                if q_id not in asked_ids:
                    q_data = q
                    break
            
            if not q_data:
                q_data = NEUROPATH_QUESTIONS_OVERRIDE[round_number % len(NEUROPATH_QUESTIONS_OVERRIDE)]
            
            return {
                "id": -3000 - NEUROPATH_QUESTIONS_OVERRIDE.index(q_data),
                "question_text": f"Looking at your experience with NeuroPath AI: {q_data['question_text']}",
                "topic": "Projects",
                "sub_topic": q_data["sub_topic"],
                "difficulty": difficulty,
                "expected_answer": q_data["expected_answer"],
                "rubric": json.dumps(q_data["rubric"]),
                "follow_ups": json.dumps(["How did you optimize this?", "What were the design tradeoffs?"]),
                "concept_tags": json.dumps(["neuropath", q_data["sub_topic"].lower()]),
                "estimated_time": 90
            }

        # Match other custom projects (Phase 2 & 8 fallback)
        if profile["projects"]:
            # Pick the first project that has not been deeply discussed
            target_proj = None
            for p in profile["projects"]:
                p_hash = int(hashlib.md5(p.get("name", "").encode()).hexdigest(), 16) % 1000
                custom_id = -4000 - p_hash
                if custom_id not in asked_ids:
                    target_proj = p
                    break
            
            if not target_proj:
                target_proj = profile["projects"][0]

            p_name = target_proj.get("name", "Project Instance")
            pg = extract_project_knowledge_graph(target_proj)
            
            if "decision" in (round_name or "").lower():
                # Engineering decisions question
                q_text = f"In your project '{p_name}', what was the most challenging technical engineering decision or trade-off you faced regarding {pg['backend']} or {pg['database']}? Why did you select this setup?"
                expected = pg["engineering_decisions"]
                rubric = ["Details the trade-off context", "Justifies backend/database tools selection", "Explains the impact of the final choice"]
                sub_topic = "Engineering Decisions"
            else:
                # System architecture question
                q_text = f"Walk me through the system architecture you designed for '{p_name}'. How do the frontend ({pg['frontend']}) and backend ({pg['backend']}) communicate, and how is {pg['authentication']} implemented?"
                expected = pg["architecture"]
                rubric = ["Explains frontend-backend split", "Traces communication channels", "Outlines auth layer details"]
                sub_topic = "Systems Architecture"
            
            p_hash = int(hashlib.md5(p_name.encode()).hexdigest(), 16) % 1000
            return {
                "id": -4000 - p_hash - (1 if sub_topic == "Engineering Decisions" else 0),
                "question_text": q_text,
                "topic": "Projects",
                "sub_topic": p_name,
                "difficulty": difficulty,
                "expected_answer": expected,
                "rubric": json.dumps(rubric),
                "follow_ups": json.dumps(["What options did you reject?", "How does this scale?"]),
                "concept_tags": json.dumps(["projects", p_name.lower().replace(" ", "_")]),
                "estimated_time": 90
            }

        # Fallback to work experience or internships
        if profile["experience"]:
            target_exp = profile["experience"][0]
            role_name = target_exp.get("role", "Engineer")
            comp_name = target_exp.get("company", "Tech Organization")
            resp_str = ", ".join(target_exp.get("responsibilities", ["development work"])[:2])

            q_text = f"In your role as {role_name} at {comp_name}, you worked on {resp_str}. Can you outline the most challenging technical problem you solved, your step-by-step optimization strategy, and the quantifiable outcome?"
            return {
                "id": generate_unique_id(5000),
                "question_text": q_text,
                "topic": "Resume",
                "sub_topic": role_name,
                "difficulty": difficulty,
                "expected_answer": "Candidate should explain the baseline problem, the technical evaluation, standard optimization tools utilized, and clear metrics (like latency decrease, CPU savings).",
                "rubric": json.dumps(["Defines baseline problem metrics", "Details analysis workflows", "Cites measurable results"]),
                "follow_ups": json.dumps(["How did your teammates review this change?"]),
                "concept_tags": json.dumps(["resume", "experience"]),
                "estimated_time": 90
            }

    # C. Technical / Core CS / Role Specific (Phase 7 & 8)
    elif category in ["Technical", "TechFundamentals", "TechAdvanced"]:
        # Resolve target role details
        target_role = "Software Engineer"
        role_lower = profile["target_role"].lower()
        if any(kw in role_lower for kw in ["ai", "ml", "machine learning", "data scientist"]):
            target_role = "AI/ML Engineer"
        elif any(kw in role_lower for kw in ["database", "db"]):
            target_role = "Database Developer"
        elif any(kw in role_lower for kw in ["backend", "full stack", "fullstack", "systems"]):
            target_role = "Backend Developer"
        elif any(kw in role_lower for kw in ["frontend", "react", "ui", "ux"]):
            target_role = "Frontend Developer"

        # Check if focus matches our template subjects
        role_templates = CS_SUBJECTS_TEMPLATES.get(target_role, CS_SUBJECTS_TEMPLATES["Software Engineer"])
        matched_temp = None
        for key, value in role_templates.items():
            if focus and (focus.lower() in key.lower() or key.lower() in focus.lower()):
                matched_temp = value
                break
                
        if matched_temp:
            proj_name = profile["projects"][0].get("name", "your codebase") if profile["projects"] else "your codebase"
            q_text = matched_temp["question_text"].format(project=proj_name)
            return {
                "id": generate_unique_id(6000),
                "question_text": q_text,
                "topic": category,
                "sub_topic": focus,
                "difficulty": difficulty,
                "expected_answer": matched_temp["expected_answer"],
                "rubric": json.dumps(matched_temp["rubric"]),
                "follow_ups": json.dumps(matched_temp["follow_ups"]),
                "concept_tags": json.dumps(matched_temp["concept_tags"]),
                "estimated_time": 90
            }

        # Fallback technical question matching first programming language
        focus_lang = profile["programming_languages"][0] if profile["programming_languages"] else "programming"
        q_text = f"Explain the differences in memory allocation, garbage collection, and variable references in {focus_lang}. How do you write clean unit tests for functions that interact with these modules?"
        return {
            "id": generate_unique_id(9900),
            "question_text": q_text,
            "topic": category,
            "sub_topic": f"{focus_lang} Memory",
            "difficulty": difficulty,
            "expected_answer": f"Detail how {focus_lang} handles heap vs stack allocations, reference counting or tracing garbage collectors, and mock assertions in unit testing frameworks.",
            "rubric": json.dumps(["Explains heap/stack memory configurations", "Details garbage collection operations", "Outlines mock tests implementations"]),
            "follow_ups": json.dumps(["How do you profile memory leaks in this environment?"]),
            "concept_tags": json.dumps([focus_lang.lower(), "memory"]),
            "estimated_time": 90
        }

    # D. Scenario Based
    elif category == "Scenario":
        p_name = profile["projects"][0].get("name", "your application") if profile["projects"] else "your application"
        if "scaling" in (focus or "").lower() or "scale" in (round_name or "").lower():
            q_text = f"Imagine that concurrent request traffic on {p_name} spikes by 50x in under two minutes, causing database execution timeouts. Walk me through your step-by-step diagnostic process and explain how you would configure load balancing, Redis caching, or replicas to mitigate the outage."
        else:
            q_text = f"Suppose a third-party API or service integrated into {p_name} becomes unresponsive, causing connection pool exhaustion and locking up the server. How would you design a circuit-breaker, implement fallback routes, and maintain partial system availability?"
            
        return {
            "id": generate_unique_id(10000),
            "question_text": q_text,
            "topic": "Scenario",
            "sub_topic": focus or "System Outage",
            "difficulty": difficulty,
            "expected_answer": "Candidate should detail error logs checks, thread pools scaling, circuit breaker configurations, fallback defaults, and system telemetry monitors.",
            "rubric": json.dumps(["Details diagnostic tools checks", "Proposes circuit-breaker or cache overrides", "Explains connection pooling recoveries"]),
            "follow_ups": json.dumps(["What telemetry metrics would alert you first?"]),
            "concept_tags": json.dumps(["scenario", "troubleshooting"]),
            "estimated_time": 120
        }

    # E. Behavioural Round
    elif category == "Behavioural":
        p_name = profile["projects"][0].get("name", "major software system") if profile["projects"] else "a complex technical deliverable"
        if "conflict" in (focus or "").lower() or "disagreement" in (round_name or "").lower():
            q_text = f"Technical choices often diverge. Tell me about a time you had a strong disagreement with a colleague or manager while designing {p_name}. What objective data did you collect to advocate for your approach, and how did you resolve the situation?"
        else:
            q_text = f"We all face shifting scopes. Describe a situation where a tight delivery deadline was moved forward suddenly, threatening the stability of {p_name}. How did you prioritize requirements, and what tradeoffs did you negotiate?"
            
        return {
            "id": generate_unique_id(11000),
            "question_text": q_text,
            "topic": "Behavioural",
            "sub_topic": focus or "Collaboration",
            "difficulty": difficulty,
            "expected_answer": "Candidate should show professional communication, using objective benchmarks/tests to prove technical points, compromising, and prioritizing product delivery.",
            "rubric": json.dumps(["Demonstrates empathetic communication", "Utilizes objective tests/benchmarks", "Prioritizes team alignment"]),
            "follow_ups": json.dumps(["What did you learn from that tradeoff?"]),
            "concept_tags": json.dumps(["behavioral", "soft_skills"]),
            "estimated_time": 90
        }

    # E2. Coding Concepts Round
    elif category == "Coding":
        focus_lang = profile["programming_languages"][0] if profile["programming_languages"] else "languages"
        q_text = f"Detail the runtime complexity (Big O) of sorting algorithms like quicksort and merge sort. Under what scenarios is a hash map preferred over a binary tree for lookup performance in {focus_lang}?"
        return {
            "id": generate_unique_id(11500),
            "question_text": q_text,
            "topic": "Coding",
            "sub_topic": "Data Structures & Algorithms",
            "difficulty": difficulty,
            "expected_answer": "Candidate should contrast average/worst Big O of quicksort vs merge sort, and describe O(1) hash map lookup vs O(log N) sorted tree constraints.",
            "rubric": json.dumps(["Differentiates sorting runtimes (quicksort vs merge sort)", "Contrasts hash map O(1) vs binary tree O(log N)", "Details language-specific memory layouts"]),
            "follow_ups": json.dumps(["What positional optimizations does this language make?"]),
            "concept_tags": json.dumps(["coding", "algorithms", "big_o"]),
            "estimated_time": 90
        }

    # E3. HR / Alignment Round
    elif category == "HR":
        q_text = f"Where do you see yourself in 5 years, and how do your career targets align with the role of {profile['target_role']}? What specific technical skills do you plan to master next?"
        return {
            "id": generate_unique_id(11800),
            "question_text": q_text,
            "topic": "HR",
            "sub_topic": "Career Alignment",
            "difficulty": difficulty,
            "expected_answer": "Express clear technical path targets, alignment with target role, and concrete plans for skill expansion (e.g., system design, cloud, specialized ML frameworks).",
            "rubric": json.dumps(["Articulates long-term career progression path", "Demonstrates alignment with target position", "Identifies specific technologies/skills to learn"]),
            "follow_ups": json.dumps(["How do you keep up with industry trends?"]),
            "concept_tags": json.dumps(["hr", "alignment", "career"]),
            "estimated_time": 60
        }

    # F. Closing Round
    elif category == "Closing":
        focus_lang = profile["programming_languages"][0] if profile["programming_languages"] else "software systems"
        q_text = f"To wrap up, looking at your profile career objective: '{profile['career_objective']}', how do you plan to leverage your experience in {focus_lang} to contribute to high-scale platforms? What are your short-term learning goals over the next year?"
        return {
            "id": generate_unique_id(12000),
            "question_text": q_text,
            "topic": "Closing",
            "sub_topic": "Career Objectives",
            "difficulty": difficulty,
            "expected_answer": "Detail structural goals, expressing eagerness to master new cloud technologies or paradigms, and committing to clean, robust engineering practices.",
            "rubric": json.dumps(["Clear description of short-term learning plans", "Expresses interest in scalability details", "Aligns goals with career objectives"]),
            "follow_ups": json.dumps(["Thank you for sharing that."]),
            "concept_tags": json.dumps(["closing", "career_goals"]),
            "estimated_time": 45
        }

    # Catch-all
    return {
        "id": -9999,
        "question_text": f"Walk me through your experience building software solutions. What is your process for writing test cases and reviewing production deployments?",
        "topic": "General",
        "sub_topic": "Software Lifecycle",
        "difficulty": difficulty,
        "expected_answer": "Candidate explains unit, integration, and system tests, utilizing CI/CD verification stages, and code reviews protocols.",
        "rubric": json.dumps(["Mentions testing types", "Details code review benefits", "Explains staging checks"]),
        "follow_ups": json.dumps(["How do you handle rollbacks if a bug hits production?"]),
        "concept_tags": json.dumps(["general", "sdlc"]),
        "estimated_time": 60
    }

# V5 specific project questions for NeuroPath AI
NEUROPATH_QUESTIONS_OVERRIDE = [
    {
        "question_text": "Explain the high-level system architecture and data flow of NeuroPath AI, specifically how the React frontend interacts with the FastAPI backend during a live voice interview.",
        "sub_topic": "System Architecture",
        "expected_answer": "NeuroPath AI is built on a split-plane architecture: a React SPA frontend and a FastAPI backend. They communicate via stateless REST endpoints, utilizing JWT tokens in Authorization headers. Heavy ML workloads (e.g. TF-IDF and SentenceTransformers) are run directly in memory on the backend.",
        "rubric": ["Explains React-FastAPI split", "Mentions REST communication", "Mentions JWT security", "Addresses ML resource loading"]
    },
    {
        "question_text": "Why was FastAPI selected as the backend framework for NeuroPath AI instead of traditional frameworks like Django? Focus on async event loops.",
        "sub_topic": "Backend Choice",
        "expected_answer": "FastAPI was selected for its native async event loop, automatic OpenAPI documentation, and fast execution speeds. Django is heavy and monolithic, while FastAPI provides high-performance ASGI endpoints suitable for integration with Python-based ML modules like PyTorch or SentenceTransformers.",
        "rubric": ["Mentions async ASGI event loop", "Highlights auto OpenAPI documentation", "Compares Django or Node.js overhead", "Focuses on Python ML integration compatibility"]
    },
    {
        "question_text": "How did you design the database schemas for NeuroPath AI to handle stateful interview session histories, question knowledge graphs, and final evaluated reports using SQLAlchemy and SQLite?",
        "sub_topic": "Database Schema",
        "expected_answer": "We use a hybrid schema. Canonical database tables in SQLite store occupations and skills. Dynamic state histories and proctoring logs are kept inside SQLAlchemy serialized text fields as JSON structures in the InterviewSession table.",
        "rubric": ["Identifies SQLite tables", "Explains user_profiles.json storage", "Explains JSON field serialization for session history", "Addresses indexing on primary keys"]
    },
    {
        "question_text": "If the number of concurrent candidates taking voice interviews on NeuroPath AI increases to 10,000, how would you scale the ML evaluations and PDF generation pipelines?",
        "sub_topic": "Scalability & Telemetry",
        "expected_answer": "Decouple heavy SentenceTransformer evaluations and ReportLab PDF compilations using Celery task queues backed by a Redis message broker, enabling backend nodes to process requests concurrently without blocking the main event loop.",
        "rubric": ["Decouples CPU-heavy operations", "Introduces Celery worker daemon groups", "Utilizes Redis or RabbitMQ broker", "Addresses database connections load constraints"]
    }
]
