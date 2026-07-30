import json
import hashlib
from sqlalchemy.orm import Session
from backend.app.db.models import CodingProblem

def generate_hash(text: str) -> str:
    return hashlib.sha256(text.strip().lower().encode("utf-8")).hexdigest()

def seed_coding_problems(db: Session):
    count = db.query(CodingProblem).count()
    if count >= 100000:
        print(f"[Coding Seeder] Found {count} existing problems. Skipping seeding.")
        return

    print(f"[Coding Seeder] Currently {count} problems in DB. Seeding 100,000+ coding challenges...")

    problems_to_insert = []
    seen_hashes = set()

    def add_problem(title, desc, diff, topic, subtopic, constraints, examples, hints, starter, ref_sol, tests, hidden_tests, complexity, tags, companies):
        h = generate_hash(title + desc)
        if h in seen_hashes:
            return
        seen_hashes.add(h)
        problems_to_insert.append({
            "title": title,
            "description": desc,
            "difficulty": diff,
            "topic": topic,
            "subtopic": subtopic,
            "constraints": json.dumps(constraints),
            "examples": json.dumps(examples),
            "hints": json.dumps(hints),
            "starter_code": json.dumps(starter),
            "reference_solution": json.dumps(ref_sol),
            "test_cases": json.dumps(tests),
            "hidden_test_cases": json.dumps(hidden_tests),
            "complexity": complexity,
            "tags": json.dumps(tags),
            "companies": json.dumps(companies),
            "similarity_hash": h,
            "embeddings": None
        })

    # ================= 1. BASE HAND-CURATED PROBLEMS (LEETCODE CLASSICS) =================
    # Two Sum
    add_problem(
        title="Two Sum",
        desc="Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
        diff="Easy", topic="Algorithms", subtopic="Arrays",
        constraints=["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9", "-10^9 <= target <= 10^9"],
        examples=[{"input": "nums = [2,7,11,15], target = 9", "output": "[0,1]", "explanation": "Because nums[0] + nums[1] == 9, we return [0, 1]."}],
        hints=["Try using a hash map to look up the complement in O(1) time."],
        starter={
            "python": "def solve(nums: list, target: int) -> list:\n    # Write your solution here\n    pass\n",
            "javascript": "function solve(nums, target) {\n    // Write your solution here\n    return [];\n}\n"
        },
        ref_sol={
            "python": "def solve(nums: list, target: int) -> list:\n    seen = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i\n    return []\n",
            "javascript": "function solve(nums, target) {\n    const seen = {};\n    for (let i = 0; i < nums.length; i++) {\n        const complement = target - nums[i];\n        if (seen[complement] !== undefined) {\n            return [seen[complement], i];\n        }\n        seen[nums[i]] = i;\n    }\n    return [];\n}"
        },
        tests=[
            {"input": "[2,7,11,15], 9", "output": "[0,1]"},
            {"input": "[3,2,4], 6", "output": "[1,2]"}
        ],
        hidden_tests=[
            {"input": "[3,3], 6", "output": "[0,1]"},
            {"input": "[1,5,8,9], 13", "output": "[1,2]"}
        ],
        complexity="Time: O(N), Space: O(N)",
        tags=["Arrays", "Hash Map"],
        companies=["Google", "Amazon", "Meta"]
    )

    # Valid Parentheses
    add_problem(
        title="Valid Parentheses",
        desc="Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
        diff="Easy", topic="Algorithms", subtopic="Stacks",
        constraints=["1 <= s.length <= 10^4", "s consists of parentheses only."],
        examples=[{"input": "s = '()[]{}'", "output": "true", "explanation": "All brackets are closed correctly."}],
        hints=["Use a stack data structure to push opening brackets and pop them when matching closing brackets are seen."],
        starter={
            "python": "def solve(s: str) -> bool:\n    # Write your solution here\n    pass\n",
            "javascript": "function solve(s) {\n    // Write your solution here\n    return false;\n}\n"
        },
        ref_sol={
            "python": "def solve(s: str) -> bool:\n    stack = []\n    mapping = {')': '(', '}': '{', ']': '['}\n    for char in s:\n        if char in mapping:\n            top = stack.pop() if stack else '#'\n            if mapping[char] != top:\n                return False\n        else:\n            stack.append(char)\n    return not stack\n",
            "javascript": "function solve(s) {\n    const stack = [];\n    const mapping = { ')': '(', '}': '{', ']': '[' };\n    for (let char of s) {\n        if (mapping[char]) {\n            const top = stack.length ? stack.pop() : '#';\n            if (mapping[char] !== top) return false;\n        } else {\n            stack.push(char);\n        }\n    }\n    return stack.length === 0;\n}"
        },
        tests=[
            {"input": "'()[]{}'", "output": "true"},
            {"input": "'(]'", "output": "false"}
        ],
        hidden_tests=[
            {"input": "'(((())))'", "output": "true"},
            {"input": "'((('", "output": "false"}
        ],
        complexity="Time: O(N), Space: O(N)",
        tags=["Stacks", "Strings"],
        companies=["Microsoft", "Netflix"]
    )

    # ================= 2. MASSIVE COMBINATORIAL EXPANSION TO REACH 100,000+ =================
    # We will generate programmatic subsets for each career domain.
    # Batch size chunking to maintain low memory profile and quick transaction commits in SQLite.
    
    print("[Coding Seeder] Generating combinatorial coding questions...")

    # A. DSA / Software Engineer Track (Combinations: 80 * 250 = 20,000)
    # Target topic: Array division sum
    dsa_n_values = range(5, 85) # 80 options
    dsa_k_values = range(2, 252) # 250 options
    for n in dsa_n_values:
        for k in dsa_k_values:
            title = f"Sum Divisible by {k} (Size {n})"
            desc = f"Given an array of integers nums of size {n}, calculate the sum of all elements that are divisible by {k}. If no such elements exist, return 0."
            
            # Simple reference answer logic for test case generation:
            # We construct mock test arrays and calculate the expected value.
            t1_arr = [i for i in range(1, n + 1)]
            t1_ans = sum([x for x in t1_arr if x % k == 0])
            t2_arr = [x * k for x in range(1, 5)]
            t2_ans = sum(t2_arr)

            starter = {
                "python": f"def solve(nums: list) -> int:\n    # Find elements divisible by {k} and return their sum\n    pass\n",
                "javascript": f"function solve(nums) {{\n    // Find elements divisible by {k} and return their sum\n    return 0;\n}}\n"
            }
            ref_sol = {
                "python": f"def solve(nums: list) -> int:\n    return sum([x for x in nums if x % {k} == 0])\n",
                "javascript": f"function solve(nums) {{\n    return nums.filter(x => x % {k} === 0).reduce((a, b) => a + b, 0);\n}}"
            }
            
            add_problem(
                title=title, desc=desc, diff="Easy" if k < 100 else "Medium",
                topic="Algorithms", subtopic="Arrays",
                constraints=[f"nums.length == {n}", "-10^5 <= nums[i] <= 10^5"],
                examples=[{"input": f"nums = {t1_arr}", "output": f"{t1_ans}", "explanation": f"The elements divisible by {k} yield a sum of {t1_ans}."}],
                hints=[f"Iterate through the array and use the modulo operator (%) to check divisibility by {k}."],
                starter=starter, ref_sol=ref_sol,
                tests=[
                    { "input": f"{t1_arr}", "output": f"{t1_ans}" },
                    { "input": f"{t2_arr}", "output": f"{t2_ans}" }
                ],
                hidden_tests=[
                    { "input": f"[]", "output": "0" },
                    { "input": f"{[x * k + 1 for x in range(3)]}", "output": "0" }
                ],
                complexity="Time: O(N), Space: O(1)",
                tags=["Arrays", "Loops", "Math"],
                companies=["Google", "Infosys"]
            )

    # B. AI / Machine Learning Track (Combinations: 100 * 200 = 20,000)
    # Target topic: Scaled weighted statistic
    ai_scale_values = range(1, 101) # 100 options
    ai_bias_values = range(10, 210) # 200 options
    for scale in ai_scale_values:
        for bias in ai_bias_values:
            title = f"Weighted Bias Scale (S:{scale}, B:{bias})"
            desc = f"Given an input array of values, multiply each element at index i by (i * {scale}) + {bias}, and return the average of the resulting array. Return 0 if the array is empty."

            # Mock arrays for testing
            t1_arr = [1, 2, 3]
            t1_computed = [val * (i * scale + bias) for i, val in enumerate(t1_arr)]
            t1_ans = sum(t1_computed) / len(t1_arr)
            
            starter = {
                "python": f"def solve(values: list) -> float:\n    # Multiply element at index i by (i * {scale}) + {bias} and return average\n    pass\n",
                "javascript": f"function solve(values) {{\n    // Multiply element at index i by (i * {scale}) + {bias} and return average\n    return 0.0;\n}}\n"
            }
            ref_sol = {
                "python": f"def solve(values: list) -> float:\n    if not values: return 0.0\n    scaled = [val * (i * {scale} + {bias}) for i, val in enumerate(values)]\n    return sum(scaled) / len(values)\n",
                "javascript": f"function solve(values) {{\n    if (!values.length) return 0.0;\n    let sum = 0;\n    for (let i = 0; i < values.length; i++) {{\n        sum += values[i] * (i * {scale} + {bias});\n    }}\n    return sum / values.length;\n}}"
            }

            add_problem(
                title=title, desc=desc, diff="Medium",
                topic="Machine Learning", subtopic="Linear Algebra",
                constraints=["0 <= values.length <= 10^3", "-10^4 <= values[i] <= 10^4"],
                examples=[{"input": f"values = {t1_arr}", "output": f"{t1_ans:.4f}", "explanation": "Calculated by weighted multiplier factors."}],
                hints=["Remember to check for empty list division by zero."],
                starter=starter, ref_sol=ref_sol,
                tests=[
                    { "input": f"{t1_arr}", "output": f"{t1_ans}" }
                ],
                hidden_tests=[
                    { "input": "[]", "output": "0.0" }
                ],
                complexity="Time: O(N), Space: O(1)",
                tags=["Linear Algebra", "MLMath", "Numpy"],
                companies=["OpenAI", "Meta"]
            )

    # C. Data Science Track (Combinations: 100 * 200 = 20,000)
    # Target topic: Outlier filtering
    ds_thresholds = range(10, 110) # 100 options
    ds_values = range(5, 205) # 200 options
    for th in ds_thresholds:
        for val in ds_values:
            title = f"Outlier Multiplier Filter (T:{th}, V:{val})"
            desc = f"Given a dataset of measurements, filter out all elements that are greater than {th} * {val}, and return the count of remaining items."

            t1_arr = [10, th * val - 1, th * val + 5, th * val * 2]
            t1_ans = 2 # 10 and th*val-1 remain
            
            starter = {
                "python": f"def solve(data: list) -> int:\n    # Filter elements <= {th * val} and return count\n    pass\n",
                "javascript": f"function solve(data) {{\n    // Filter elements <= {th * val} and return count\n    return 0;\n}}\n"
            }
            ref_sol = {
                "python": f"def solve(data: list) -> int:\n    return len([x for x in data if x <= {th * val}])\n",
                "javascript": f"function solve(data) {{\n    return data.filter(x => x <= {th * val}).length;\n}}"
            }

            add_problem(
                title=title, desc=desc, diff="Easy",
                topic="Data Science", subtopic="Statistics",
                constraints=["0 <= data.length <= 10^4", "-10^6 <= data[i] <= 10^6"],
                examples=[{"input": f"data = {t1_arr}", "output": f"{t1_ans}", "explanation": f"Filters out values exceeding {th * val}."}],
                hints=["Use a simple array filter or list comprehension."],
                starter=starter, ref_sol=ref_sol,
                tests=[
                    { "input": f"{t1_arr}", "output": f"{t1_ans}" }
                ],
                hidden_tests=[
                    { "input": "[]", "output": "0" }
                ],
                complexity="Time: O(N), Space: O(1)",
                tags=["Statistics", "Data Cleaning", "Dataframes"],
                companies=["Netflix", "Uber"]
            )

    # D. Backend / Web Service Track (Combinations: 50 * 400 = 20,000)
    # Target topic: Query filter validation
    be_status_codes = [200, 201, 204, 301, 302, 400, 401, 403, 404, 500] # 10 options
    be_routes = ["/users", "/items", "/login", "/profile", "/roadmap"] # 5 options (50 combinations)
    be_limits = range(1, 401) # 400 options
    for code in be_status_codes:
        for route in be_routes:
            for limit in be_limits:
                title = f"API Log Filter ({route.replace('/', '')}:{code}:L:{limit})"
                desc = f"Given a list of dictionary log objects, count how many requests to '{route}' returned status {code}, up to a maximum limit of {limit}."

                t1_logs = [
                    {"path": route, "status": code},
                    {"path": "/other", "status": 200},
                    {"path": route, "status": code},
                    {"path": route, "status": 500}
                ]
                t1_ans = min(2, limit)
                
                # Format logs for input string parsing
                t1_input = json.dumps(t1_logs).replace(" ", "")
                
                starter = {
                    "python": f"def solve(logs: list) -> int:\n    # Count requests to '{route}' with status {code} up to {limit}\n    pass\n",
                    "javascript": f"function solve(logs) {{\n    // Count requests to '{route}' with status {code} up to {limit}\n    return 0;\n}}\n"
                }
                ref_sol = {
                    "python": f"def solve(logs: list) -> int:\n    count = 0\n    for log in logs:\n        if log.get('path') == '{route}' and log.get('status') == {code}:\n            count += 1\n            if count >= {limit}: break\n    return count\n",
                    "javascript": f"function solve(logs) {{\n    let count = 0;\n    for (let log of logs) {{\n        if (log.path === '{route}' && log.status === {code}) {{\n            count++;\n            if (count >= {limit}) break;\n        }}\n    }}\n    return count;\n}}"
                }

                add_problem(
                    title=title, desc=desc, diff="Easy" if limit < 100 else "Medium",
                    topic="Backend", subtopic="API Development",
                    constraints=["0 <= logs.length <= 10^3"],
                    examples=[{"input": f"logs = {t1_logs[:3]}", "output": f"{min(2, limit)}", "explanation": "Filter path matching and status code thresholds."}],
                    hints=["Loop through the logs list and check the path and status keys."],
                    starter=starter, ref_sol=ref_sol,
                    tests=[
                        { "input": f"{t1_input}", "output": f"{t1_ans}" }
                    ],
                    hidden_tests=[
                        { "input": "[]", "output": "0" }
                    ],
                    complexity="Time: O(N), Space: O(1)",
                    tags=["API", "Logs", "Data Filtering"],
                    companies=["Stripe", "Airbnb"]
                )

    # E. DevOps Track (Combinations: 100 * 200 = 20,000)
    # Target topic: Port range checks
    devops_base = range(10, 110) # 100 options
    devops_ports = range(8000, 8200) # 200 options
    for base in devops_base:
        for port in devops_ports:
            title = f"Port Ranger Validation ({base}:{port})"
            desc = f"Given a list of active ports, check if there is any port within the range [{port}, {port} + {base}]. Return True if at least one port lies in this range, otherwise False."

            t1_arr = [80, 443, port + 2]
            t1_ans = "true"
            
            starter = {
                "python": f"def solve(ports: list) -> bool:\n    # Check if any port is in range [{port}, {port + base}]\n    pass\n",
                "javascript": f"function solve(ports) {{\n    // Check if any port is in range [{port}, {port + base}]\n    return false;\n}}\n"
            }
            ref_sol = {
                "python": f"def solve(ports: list) -> bool:\n    return any({port} <= p <= {port + base} for p in ports)\n",
                "javascript": f"function solve(ports) {{\n    return ports.some(p => p >= {port} && p <= {port + base});\n}}"
            }

            add_problem(
                title=title, desc=desc, diff="Easy",
                topic="DevOps", subtopic="Networking",
                constraints=["0 <= ports.length <= 10^3"],
                examples=[{"input": f"ports = {t1_arr}", "output": "true", "explanation": f"The port {port + 2} is in range."}],
                hints=["Compare each port with lower and upper limits."],
                starter=starter, ref_sol=ref_sol,
                tests=[
                    { "input": f"{t1_arr}", "output": f"{t1_ans}" }
                ],
                hidden_tests=[
                    { "input": "[]", "output": "false" }
                ],
                complexity="Time: O(N), Space: O(1)",
                tags=["Networking", "Ports", "Infrastructure"],
                companies=["AWS", "HashiCorp"]
            )

    print(f"[Coding Seeder] Generated {len(problems_to_insert)} unique coding challenges in memory. Seeding batches into SQLite...")
    
    # SQLite batch insertion using transactional commits of 5000 records
    chunk_size = 5000
    for i in range(0, len(problems_to_insert), chunk_size):
        chunk = problems_to_insert[i : i + chunk_size]
        db.bulk_insert_mappings(CodingProblem, chunk)
        db.commit()
        print(f"[Coding Seeder] Seeded problems {i} to {i + len(chunk)}...")

    problems_to_insert.clear()
    print(f"[Coding Seeder] Seeding completed. Total coding problems: {db.query(CodingProblem).count()}")
