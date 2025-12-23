from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI(title="Diffusion API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define the schema for your Scraper data
class Assignment(BaseModel):
    title: str
    due_date: str
    status: str

class SyllabusData(BaseModel):
    category: str
    weight: int

@app.post("/sync")
async def sync_assignments(assignments: List[Assignment]):
    """Receives parsed assignments from the Omni-Parser Extension"""
    print(f" Syncing {len(assignments)} assignments...")
    # Logic to save to SQLite/PostgreSQL would go here
    return {"status": "success", "synced_count": len(assignments)}

@app.post("/syllabus")
async def sync_syllabus(data: dict):
    """Receives weight categories from the Syllabus Scraper"""
    print(f"Received Syllabus Weights: {data}")
    return {"status": "success"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)