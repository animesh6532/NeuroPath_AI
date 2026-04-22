# project_knowledge.py

PROJECT_KNOWLEDGE = [
    {
        "intent": "project_overview",
        "keywords": ["what is", "about", "overview", "explain project", "purpose", "what does it do", "neuropath", "tell me about"],
        "answer": "NeuroPath AI is an AI-powered career intelligence and interview preparation platform. It's designed to help candidates improve their hiring readiness by combining resume analysis, career domain mapping, AI-generated questions, voice-based mock interviews, placement predictions, and personalized learning roadmaps into one seamless ecosystem."
    },
    {
        "intent": "problem_statement",
        "keywords": ["problem", "solve", "why build", "why created", "use case", "why make"],
        "answer": "NeuroPath AI solves several key problems for job seekers: users often don't know how strong their resume is, they feel underprepared for real technical interviews, and they don't know what specific skills they are missing for their target roles. By providing a personalized, automated feedback loop, NeuroPath simulates a real interview pipeline and guides users on exact improvements."
    },
    {
        "intent": "architecture_flow",
        "keywords": ["architecture", "flow", "how it works", "data flow", "pipeline", "backend flow", "frontend flow"],
        "answer": "The platform architecture is highly modular. It starts with the user uploading a resume on the React frontend. The FastAPI backend extracts text via pdfminer, identifies skills/projects, and maps a career. This data goes into the Interview Engine to dynamically generate questions. The user then takes a Voice-based interview (using Web Speech API), answers are evaluated, and passed to the Placement and Roadmap ML logic to generate final intelligence reports."
    },
    {
        "intent": "tech_stack",
        "keywords": ["tech stack", "technologies", "built with", "framework", "what technology", "libraries"],
        "answer": "The project uses a modern tech stack. The frontend is built with React.js, Vite, React Router, custom dark futuristic CSS, and Browser Media/Speech APIs. The backend utilizes Python, FastAPI, Uvicorn, Pydantic, and custom ML heuristic logic, including pdfminer for text extraction."
    },
    {
        "intent": "why_fastapi",
        "keywords": ["why fastapi", "choose fastapi", "reason for fastapi", "python framework"],
        "answer": "FastAPI was chosen because of its exceptional performance, native asynchronous support, and automatic OpenAPI generation. Since this project requires CPU-heavy data processing (resume parsing, text NLP scoring, and concurrent audio/interview workflows), FastAPI handles these non-blocking I/O operations elegantly."
    },
    {
        "intent": "why_react",
        "keywords": ["why react", "choose react", "frontend choice"],
        "answer": "React was chosen for the frontend because it allows for building a highly modular and reactive user interface. Features like the live recording timer, realtime speech transcriptions, and interactive proctoring components benefit heavily from React's state management and component lifecycle hooks."
    },
    {
        "intent": "resume_analysis",
        "keywords": ["resume analysis", "parse cv", "how resume works", "resume intelligence", "extract skills"],
        "answer": "The resume analysis module accepts a PDF, uses `pdfminer` to extract the raw text, and implements an NLP pipeline to identify skills, projects, experience, education, and certifications. This extracted intelligence is then scored against predefined career clusters to give the user a baseline resume score and skill gap snapshot."
    },
    {
        "intent": "career_mapping",
        "keywords": ["career mapping", "domain mapping", "target role", "how is role chosen"],
        "answer": "Career mapping works by taking the extracted skills from your resume and semantically matching them against a large internal dataset of career profiles (like Data Scientist, Full Stack Developer, etc.). It calculates an overlap score, determines the most likely domain, and tailors the rest of the interview specifically to that role."
    },
    {
        "intent": "ai_interview_logic",
        "keywords": ["interview engine", "how questions are generated", "different questions", "question generation"],
        "answer": "The AI interview logic is intelligent and context-aware. Instead of asking static questions, it generates an interview blueprint consisting of HR, technical, situational, and project-based questions. It bases these on your specific detected skills. Anti-repetition logic ensures that even if you upload the same CV twice, the phrasing and exact technical questions will rotate to simulate a fresh interviewer."
    },
    {
        "intent": "voice_interview_system",
        "keywords": ["voice", "speech synthesis", "speech recognition", "speak", "audio"],
        "answer": "The voice interview system is built entirely on native browser APIs. We use `window.speechSynthesis` for the AI to read questions aloud, and the `SpeechRecognition` API to transcribe the user's spoken answers in real time. This enforces a 'voice-first' experience, matching the stress and flow of a real human interview rather than a simple typing test."
    },
    {
        "intent": "proctoring_module",
        "keywords": ["proctoring", "webcam", "cheat", "monitor", "integrity"],
        "answer": "The proctoring module focuses on mock-interview integrity rather than hardcore exam enforcement. The frontend requests webcam access, monitors tab-switching, and checks fullscreen exit events. We send this behavior data to the backend. It's built to give you a realistic idea of how remote proctoring behaves, while acknowledging that true lockdown is impossible from just a web browser."
    },
    {
        "intent": "placement_prediction",
        "keywords": ["placement prediction", "job readiness", "predict score", "readiness"],
        "answer": "Placement prediction takes a holistic look at your performance. It combines your baseline resume score, any missing core skills, and your communicative/technical score from the mock interview. By aggregating these metrics, we output a 'Placement Probability' percentage along with identified strengths and weaknesses."
    },
    {
        "intent": "learning_roadmap",
        "keywords": ["learning roadmap", "roadmap", "what to study", "missing skills"],
        "answer": "The learning roadmap module acts as the final feedback loop. By cross-referencing your target career against your extracted skills, it finds 'skill gaps'. It then dynamically generates actionable recommendations, telling you exactly what topics to revise and suggesting real-world projects to build before your actual interview."
    },
    {
        "intent": "future_enhancements",
        "keywords": ["future", "enhancements", "improve", "add later", "next steps", "scalability"],
        "answer": "Future enhancements for NeuroPath AI include integrating a full LLM (like OpenAI or Gemini) for deeply dynamic conversational replies, adding adaptive interviewing (where the next question gets harder if you answer correctly), a dedicated recruiter dashboard for universities, semantic speech emotion analysis, and robust deep-learning-based facial tracking for advanced proctoring."
    },
    {
        "intent": "strengths",
        "keywords": ["strength", "best feature", "why is it good", "advantages"],
        "answer": "The biggest strength of NeuroPath AI is that it's a complete ecosystem. It doesn't just do resume parsing or just a simple chatbot. It links resume intelligence to dynamic career mapping, creates a voice-first interview, and finishes with a placement score and actionable roadmap. It is an end-to-end career guidance platform."
    },
    {
        "intent": "limitations",
        "keywords": ["limitations", "weakness", "drawbacks", "shortcomings"],
        "answer": "A primary limitation is that browser-based proctoring cannot fully secure against cheating. Also, currently, our career matching and question generation rely on strong heuristics and keyword-density mapping. Integrating a huge commercial LLM would make it more conversational, though our current rule-based approach ensures fast processing and zero hallucination."
    },
    {
        "intent": "debugging",
        "keywords": ["debug", "how to debug", "issue", "bug", "404", "microphone not working"],
        "answer": "Common issues during development included 404 errors due to mismatched frontend and backend routes (e.g., frontend hitting `/login` instead of `/auth/login`), CORS rejections, and browser microphone permissions defaulting to the wrong device or blocking the Web Speech API on unsecure origins. To debug, always check the Uvicorn terminal logs and the browser DevTools console."
    },
    {
        "intent": "deployment",
        "keywords": ["deploy", "host", "cloud", "production", "where to host"],
        "answer": "For deployment, the FastAPI backend is designed to be easily containerized via Docker and can be hosted on Render, Railway, or AWS EC2. The React Vite frontend can be deployed statically via Vercel, Netlify, or AWS S3. We ensure CORS origins are properly updated for the production domain."
    },
    {
        "intent": "unique",
        "keywords": ["unique", "different", "why not chatgpt", "special"],
        "answer": "NeuroPath AI is unique because it forces a realistic voice-first pacing. Unlike ChatGPT where you can take 10 minutes to formulate a typed prompt, NeuroPath starts a timer, asks a question aloud, listens to your voice, and moves on—forcing you to train under pressure, just like a real interview. It also aggregates the entire flow into a calculated placement metric."
    },
    {
        "intent": "api_design",
        "keywords": ["api", "endpoints", "routes"],
        "answer": "The API is RESTful and designed logically. Main endpoints include `/analyze-resume`, `/start-ai-interview`, `/submit-interview`, `/placement-analysis`, and `/learning-roadmap`. They pass JSON payloads or `multipart/form-data` (for PDFs) to modular Python services that handle the heavy lifting, keeping the endpoints thin and fast."
    },
    {
        "intent": "viva_questions",
        "keywords": ["viva", "explain project", "interviewer", "how should i explain"],
        "answer": "To explain this in a viva: Define it as an 'AI-powered Career Intelligence Ecosystem.' Emphasize the modular pipelining (Resume -> Engine -> Voice Interview -> Roadmap). If asked about the most challenging part, highlight handling real-time browser APIs for voice recognition or the NLP logic required to map unstructured resume text to specific career profiles."
    }
]

REFUSAL_RESPONSE = "I'm the NeuroPath AI Copilot. I'm designed specifically to answer questions about the NeuroPath AI project, including its architecture, modules, workflow, implementation details, future enhancements, and viva-related explanations. I cannot assist with unrelated topics."
