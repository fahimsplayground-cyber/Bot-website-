# main.py
from fastapi import FastAPI, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from supabase import create_client, Client
import os
import uuid
import json

# ---------------- SUPABASE ----------------
SUPABASE_URL = os.getenv("SUPABASE_URL")  # Set in Render dashboard
SUPABASE_KEY = os.getenv("SUPABASE_KEY")  # Set in Render dashboard
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# ---------------- FASTAPI APP ----------------
app = FastAPI()

# CORS (if website is called from another domain)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# ---------------- TREE DATA ----------------
# Simple in-memory storage for testing; you can move to Supabase
TREE = []

# ---------------- ROUTES ----------------
@app.get("/", response_class=HTMLResponse)
def home():
    with open("templates/index.html", "r", encoding="utf-8") as f:
        return f.read()

@app.post("/add_node")
def add_node(label: str = Form(...), parent_id: str = Form(None)):
    node_id = str(uuid.uuid4())
    node = {"id": node_id, "label": label, "parent_id": parent_id}
    TREE.append(node)

    # Optional: save to Supabase
    try:
        supabase.table("nodes").insert(node).execute()
    except Exception as e:
        print("Supabase insert failed:", e)

    return {"status": "success", "node": node}

@app.get("/get_tree")
def get_tree():
    # Optional: fetch from Supabase
    try:
        result = supabase.table("nodes").select("*").execute()
        if result.data:
            return {"tree": result.data}
    except Exception as e:
        print("Supabase fetch failed:", e)
    return {"tree": TREE}

@app.post("/update_node")
def update_node(node_id: str = Form(...), label: str = Form(...)):
    for node in TREE:
        if node["id"] == node_id:
            node["label"] = label
            break
    try:
        supabase.table("nodes").update({"label": label}).eq("id", node_id).execute()
    except Exception as e:
        print("Supabase update failed:", e)
    return {"status": "success"}

@app.post("/delete_node")
def delete_node(node_id: str = Form(...)):
    global TREE
    TREE = [node for node in TREE if node["id"] != node_id]
    try:
        supabase.table("nodes").delete().eq("id", node_id).execute()
    except Exception as e:
        print("Supabase delete failed:", e)
    return {"status": "success"}

# ---------------- START SERVER ----------------
import uvicorn

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=10000)
