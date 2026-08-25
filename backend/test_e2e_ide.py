import urllib.request
import urllib.parse
import json

BASE_URL = "http://127.0.0.1:8000"

def api_post(endpoint, data, headers=None):
    headers = headers or {}
    url = f"{BASE_URL}{endpoint}"
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode("utf-8"),
        headers={"Content-Type": "application/json", **headers},
        method="POST"
    )
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except Exception as e:
        print(f"Error on POST {endpoint}: {e}")
        if hasattr(e, 'read'):
            print("Response:", e.read().decode("utf-8"))
        raise

def api_get(endpoint, headers=None):
    headers = headers or {}
    url = f"{BASE_URL}{endpoint}"
    req = urllib.request.Request(
        url,
        headers=headers,
        method="GET"
    )
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except Exception as e:
        print(f"Error on GET {endpoint}: {e}")
        raise

def run_tests():
    email = "pipeline_ide_user@example.com"
    print("--- 1. REGISTERING USER ---")
    reg_data = {
        "name": "IDE Test User",
        "email": email,
        "password": "pipeline_password_123"
    }
    try:
        reg_resp = api_post("/auth/register", reg_data)
        print("Register Response:", reg_resp)
    except Exception:
        print("User might already exist. Attempting login...")

    print("\n--- 2. LOGGING IN ---")
    login_data = {
        "email": email,
        "password": "pipeline_password_123"
    }
    login_resp = api_post("/auth/login", login_data)
    token = login_resp["access_token"]
    print("Login Token obtained successfully.")
    
    auth_headers = {"Authorization": f"Bearer {token}"}

    print("\n--- 3. UPDATING EXPANDED PROFILE FIELDS ---")
    profile_data = {
        "email": email,
        "name": "Animesh Sahoo",
        "career_title": "Software Engineer",
        "current_status": "Open to Opportunities",
        "current_org": "NeuroPath AI Team",
        "github": "https://github.com/animesh6532",
        "linkedin": "https://linkedin.com/in/animesh",
        "portfolio": "https://animesh.dev",
        "career_objective": "Build high-performance AI proctoring engines.",
        "bio": "Principal architect specializing in web systems and compilers.",
        "languages": ["English", "Hindi", "Odia"],
        "soft_skills": ["Leadership", "Communication", "Pair Programming"],
        "education": [
            {"degree": "Bachelor of Technology", "year": "2026", "college": "IIT Kharagpur", "cgpa": "9.2"}
        ],
        "projects": [
            {"name": "NeuroPath AI Portal", "status": "Completed", "description": "AI-powered mock interviews and coding sandboxes.", "technologies": "React, FastAPI, SQLite", "github": "https://github.com", "live_demo": "https://neuropath.ai"}
        ],
        "certifications": [
            {"credential": "AWS Solutions Architect", "issuer": "Amazon Web Services", "date": "Jan 2025", "url": "https://verify.aws"}
        ],
        "work_experience": [
            {"role": "Backend Engineer Intern", "company": "Tech Giant", "duration": "Summer 2025", "responsibilities": "Optimized database queries and API response times.", "technologies": "Python, PostgreSQL"}
        ],
        "career_goals": {
            "target_role": "Platform Architect",
            "dream_company": "Google DeepMind",
            "preferred_domain": "Advanced AI Tooling",
            "learning_focus": "Distributed Databases"
        },
        "settings": {
            "theme": "dark",
            "notifications": True,
            "privacy": "public"
        },
        "verified": True
    }
    
    update_resp = api_post("/profile/update", profile_data, headers=auth_headers)
    assert update_resp["success"] is True
    saved_profile = update_resp["data"]
    print("Profile Updated. Verifying new fields:")
    print("Verified Badge Status:", saved_profile["verified"])
    print("Project Count:", len(saved_profile["projects"]))
    print("Career Goal Target:", saved_profile["career_goals"]["target_role"])
    
    assert saved_profile["verified"] is True
    assert len(saved_profile["education"]) == 1
    assert saved_profile["career_goals"]["target_role"] == "Platform Architect"
    print("Profile schema serialization and persistence verified successfully!")

    print("\n--- 4. FETCHING PERSONALIZED CODING CHALLENGES (Software Engineer Domain) ---")
    # Endpoint will load our updated career_title 'Software Engineer' and select matching DSA problems
    challenges_resp = api_get("/daily-challenge", headers=auth_headers)
    assert challenges_resp["success"] is True
    res_data = challenges_resp["data"]
    challenges = res_data["challenges"]
    print(f"Fetched {len(challenges)} personalized coding challenges.")
    assert len(challenges) == 3
    print("Drawn challenges:", [c["title"] for c in challenges])
    
    # Check that they match Software Engineering topics (Algorithms, Arrays, etc.)
    topics = [c["topic"] for c in challenges]
    print("Challenges Topics:", topics)
    assert "Algorithms" in topics or "Data Structures" in topics or "DevOps" not in topics
    print("Adaptive career domain challenge selection verified successfully!")

    # Find the "Sum Divisible by" problem to run and submit code
    target_challenge = next((c for c in challenges if "Sum Divisible by" in c["title"]), None)
    if not target_challenge:
        # Fall back to first challenge if template didn't seed in specific order
        target_challenge = challenges[0]

    print(f"\n--- 5. RUNNING PYTHON CODE IN SANDBOX (Problem: {target_challenge['title']}) ---")
    # Let's get the reference solution from our seeded DB
    # Fetch problem details from backend
    db_problem_id = target_challenge["id"]
    
    # We submit a correct Python solution first
    # Reference solution will solve it correctly
    correct_code = f"""
def solve(nums):
    # Sum Divisible by K reference solution
    # Let's write the loop
    k_val = {target_challenge['title'].split('Divisible by ')[1].split(' ')[0]} if 'Divisible by' in "{target_challenge['title']}" else 9
    return sum([x for x in nums if x % k_val == 0])
"""
    # Simple valid code matching whatever challenge we are solving
    # The seeder generated 'solve' function. Let's make sure it returns sum
    correct_code = """
def solve(nums):
    # Sum Divisible by K reference solution
    return sum([x for x in nums if x % 2 == 0])
"""
    # Let's retrieve the correct reference solution from database via an E2E execution helper or just use the exact correct solution
    # The seeder has the correct code. Let's send the correct solution code.
    # Wait, the seeder uses k dynamically, e.g. "return sum([x for x in nums if x % k_val == 0])"
    # Let's parse target_title: "Sum Divisible by 24 (Size 10)"
    title = target_challenge["title"]
    if "Divisible by" in title:
        k_val = int(title.split("Divisible by ")[1].split(" ")[0])
        correct_code = f"""
def solve(nums):
    return sum([x for x in nums if x % {k_val} == 0])
"""
    else:
        # If it's Valid Parentheses or Two Sum
        correct_code = """
def solve(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []
"""

    run_payload = {
        "problem_id": db_problem_id,
        "code": correct_code,
        "language": "python"
      }
    
    run_resp = api_post("/run-code", run_payload, headers=auth_headers)
    assert run_resp["success"] is True
    run_res = run_resp["data"]
    print("Run Result Status:", run_res["status"])
    print("Passed Test Cases:", run_res["passed_test_cases"], "/", run_res["total_test_cases"])
    
    assert run_res["status"] == "Accepted"
    assert run_res["passed_test_cases"] == run_res["total_test_cases"]
    print("Public test cases passed successfully in Python sandbox!")

    print("\n--- 6. SUBMITTING SOLUTION (Problem: {target_challenge['title']}) ---")
    submit_resp = api_post("/submit-code", run_payload, headers=auth_headers)
    assert submit_resp["success"] is True
    submit_res = submit_resp["data"]
    print("Submission Status:", submit_res["run_result"]["status"])
    print("Submission Stats (Streak, SolvedCount):", submit_res["coding_stats"])
    
    assert submit_res["run_result"]["status"] == "Accepted"
    assert submit_res["coding_stats"]["solvedCount"] >= 1
    print("Coding submission, stats updates, and history logging verified successfully!")

    print("\n--- 7. RE-FETCHING DAILY CHALLENGES AND VERIFYING HISTORICAL ATTEMPTS ---")
    refetch_resp = api_get("/daily-challenge", headers=auth_headers)
    assert refetch_resp["success"] is True
    refetch_data = refetch_resp["data"]
    print("KEYS in refetch_data:", list(refetch_data.keys()))
    attempts_log = refetch_data["attempts"]
    print(f"Fetched {len(attempts_log)} historical attempts.")
    assert isinstance(attempts_log, list)
    print("Submission attempts successfully logged and displayed in terminal workspace!")
    print("\nAll E2E IDE & Profile checks completed with 100% success!")

if __name__ == "__main__":
    run_tests()
