console.log("--- DIFFUSION OMNI-PARSER V6 (EVENT-DRIVEN) ---");

// utilties
function querySelectorAllDeep(selector, root = document) {
    let elements = [...root.querySelectorAll(selector)];
    const itemsWithShadow = [...root.querySelectorAll('*')].filter(el => el.shadowRoot);
    for (const el of itemsWithShadow) {
        elements.push(...querySelectorAllDeep(selector, el.shadowRoot));
    }
    return elements;
}

function scrapeAssignments() {
    const bodyText = document.body.innerText;
    const regex = /(.*?)\nDue on\s+(.*?)\n/g;
    let match;
    const assignments = [];
    const now = new Date(); 

    while ((match = regex.exec(bodyText)) !== null) {
        let title = match[1].trim();
        let dateString = match[2].trim();
        let dueDate = new Date(dateString);
        const contextWindow = bodyText.substring(match.index + match[0].length, match.index + match[0].length + 1500);
        
        // Logic for identifying grades and completion status 
        const explicitlyNotSubmitted = contextWindow.includes("Not Submitted");
        let status = "TODO";

        if (explicitlyNotSubmitted) {
            status = dueDate < now ? "MISSING" : "TODO";
        } else {
            const hasSubmission = contextWindow.includes("Submission") || contextWindow.includes("Feedback: Read");
            const hasScore = /\b\d+\s*\/\s*\d+\b/.test(contextWindow);
            if (hasSubmission || hasScore) status = "DONE";
            else if (dueDate < now) status = "MISSING";
        }

        if (title.length > 3 && !title.includes("No Category")) {
             assignments.push({ title, due_date: dateString, status });
        }
    }

    // table output in console
    if (assignments.length > 0) {
        console.log("%c DIFFUSION SYNC PREVIEW:", "color: #00ff00; font-weight: bold;");
        console.table(assignments); 
        sendToAPI(assignments); 
    }
}

function scrapeMaterials() {
    const materials = [];

    // Capture links that Brightspace tries to hide in iframes
    const allLinks = querySelectorAllDeep('a, iframe'); 
    
    allLinks.forEach(el => {
        const src = el.href || el.src || "";
        const text = el.innerText?.trim() || "External Document";

        // If it's a PDF or a Google Drive link, send the URL to the backend
        if (src.includes("drive.google.com") || src.includes(".pdf") || src.includes("viewContent")) {
            materials.push({
                type: "Remote_File",
                name: text,
                url: src,
                source: "IFrame/Link Scanner"
            });
        }
    });

    if (materials.length > 0) {
        sendToAPI(materials);
    }
}

function getBetterFiles() {
    const files = [];
    const pdfContainers = querySelectorAllDeep('.d2l-fileviewer-pdf-pdfjs-container');
    pdfContainers.forEach(() => {
        files.push({ type: "Active_PDF", name: document.title, url: window.location.href });
    });
    return files;
}

// Network / API Functions
function sendToAPI(data) {
    const API_URL = 'http://127.0.0.1:8000/sync'; 
    fetch(API_URL, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    }).catch(err => console.error("API Sync Failed:", err));
}

// Syllabus Scraping Function for grade prediction and projections

function scrapeSyllabus() {
    const bodyText = document.body.innerText;
    const gradingData = {};
    
    // Regex to find: Category Name + Number + %
    // Example: "Midterm Exam: 20%"
    const gradingRegex = /([A-Za-z\s]+):\s*(\d+)%/g;
    let match;

    console.log("--- SCANNING SYLLABUS FOR WEIGHTS ---");
    
    while ((match = gradingRegex.exec(bodyText)) !== null) {
        let category = match[1].trim();
        let weight = parseInt(match[2]);
        
        // Filter for actual grading categories
        if (category.toLowerCase().includes("exam") || 
            category.toLowerCase().includes("assignment") || 
            category.toLowerCase().includes("quiz") || 
            category.toLowerCase().includes("homework")) {
            
            gradingData[category] = weight;
        }
    }

    if (Object.keys(gradingData).length > 0) {
        console.log("%c SYLLABUS WEIGHTS FOUND:", "color: #ff9900; font-weight: bold;");
        console.table(gradingData);
        
        // Send to a new endpoint on backend
        sendSyllabusToAPI(gradingData);
    }
}

function sendSyllabusToAPI(gradingData) {
    const API_URL = 'http://127.0.0.1:8000/syllabus'; 
    fetch(API_URL, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(gradingData)
    }).catch(err => console.error("Syllabus Sync Failed:", err));
}

// THE AUTOMATION ENGINE (Mutation Observer)
// This watches for the page changing (clicking tabs)
const observer = new MutationObserver((mutations) => {
    // We throttle the calls so we don't spam the API 100 times per second
    clearTimeout(window.diffusionTimeout);
    window.diffusionTimeout = setTimeout(() => {
        scrapeAssignments();
        scrapeMaterials();
    }, 2000); 
});

const targetNode = document.querySelector('body');
if (targetNode) {
    observer.observe(targetNode, { childList: true, subtree: true });
}