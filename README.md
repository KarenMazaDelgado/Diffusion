# Diffusion: The Intelligent "Invisible" Study Planner

**Diffusion** is an AI-powered academic assistant designed to mitigate academic dishonesty by solving its root cause: poor time management and cognitive overload. By automating the logistics of student life—scraping assignments, tracking grades, and monitoring lecture uploads—Diffusion creates a "Liquid Schedule" that prevents the panic that often leads to cheating.

---

## 🏗️ System Architecture

Diffusion operates as a distributed system:
1. **Omni-Parser (Chrome Extension):** Injects into the LMS (e.g., Brightspace/D2L) to scrape data via recursive Shadow DOM traversal and event-driven monitoring.
2. **Data Transport:** Data is validated and sent via asynchronous POST requests to a central API.
3. **Diffusion Backend (FastAPI):** A high-performance Python engine that handles data ingestion, schema validation, and prepares data for the scheduling algorithm.

---

## 🚀 Key Engineering Features

* **Shadow DOM Traversal:** Uses a recursive algorithm to bypass the encapsulation of modern LMS web components, ensuring 100% data coverage.
* **Event-Driven Automation:** Implemented a `MutationObserver` with a 2000ms debounce "throttle" to monitor UI changes and sync data automatically as a student navigates courses.
* **Context-Aware Status Logic:** Employs "Context Window" scanning to intelligently determine if an assignment is `TODO`, `MISSING`, or `DONE` based on grade presence and submission timestamps.
* **Syllabus Weight Extraction:** Includes a heuristic-based regex engine that scans syllabus text to identify grading weights (e.g., "Final Exam: 30%") for grade projection.
* **Deep File Discovery:** Intercepts iFrame sources and hidden links to identify lecture slides and PDFs for future RAG-based (Retrieval-Augmented Generation) study tools.

---

## 🛠️ Setup and Installation

### Backend (Python/FastAPI)
```bash
# Navigate to the backend directory
cd backend/diffusionBackend

# Create and activate a virtual environment
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On Mac/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the server
python main.py


Browser Extension
1. Open **Chrome** and navigate to `chrome://extensions/`.
2. Toggle **Developer mode** (top right) to **ON**.
3. Click **Load unpacked**.
4. Select the `extension/nyu-scraper-test` folder from this repository.

---

## 📈 How to Use
1. **Log in** to your University LMS (e.g., Brightspace/D2L).
2. **Open the Browser Console** (`F12` or `Right Click` > `Inspect` > `Console`).
3. **Navigate** to your Assignments or Syllabus page.
4. You will see the `--- DIFFUSION OMNI-PARSER ---` logs appear in the console.
5. Check your **Python terminal** to see the data arriving at the `/sync` endpoint in real-time.

---

## ⚖️ Business Logic & Impact
* **Passive Sync:** Data is gathered while the student simply browses their course, creating a "zero-effort" user experience.
* **Panic Prevention:** By identifying `MISSING` vs `TODO` status in real-time, the system can re-prioritize a student's week before they reach a breaking point.
* **Academic Integrity:** Diffusion replaces the need for generative cheating with a structured path to mastery by organizing the "What, When, and How" of studying.

---

## ⚠️ Disclaimer
This project was developed as a technical proof-of-concept for educational automation. It is intended for use in compliance with university data privacy policies and terms of service.
