from fastapi import FastAPI, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from supabase import create_client, Client
import os
import uuid

# ---------------- SUPABASE ----------------
SUPABASE_URL = os.getenv("SUPABASE_URL")  # Set in Render dashboard
SUPABASE_KEY = os.getenv("SUPABASE_KEY")  # Set in Render dashboard
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# ---------------- FASTAPI APP ----------------
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# ---------------- TREE STORAGE ----------------
TREE = []

# ---------------- ROUTES ----------------
@app.get("/", response_class=HTMLResponse)
def home():
    with open("templates/index.html", "r", encoding="utf-8") as f:
        return f.read()

@app.get("/get_tree")
def get_tree():
    try:
        result = supabase.table("nodes").select("*").execute()
        if result.data:
            return {"tree": result.data}
    except Exception:
        pass
    return {"tree": TREE}

@app.post("/add_node")
def add_node(label: str = Form(...), question: str = Form(...), role_id: str = Form(None)):
    node_id = str(uuid.uuid4())
    node = {"id": node_id, "label": label, "question": question, "role_id": role_id}
    TREE.append(node)
    try:
        supabase.table("nodes").insert(node).execute()
    except Exception:
        pass
    return {"status": "success", "node": node}

@app.post("/update_node")
def update_node(node_id: str = Form(...), label: str = Form(...), role_id: str = Form(None)):
    for node in TREE:
        if node["id"] == node_id:
            node["label"] = label
            node["role_id"] = role_id
            break
    try:
        supabase.table("nodes").update({"label": label, "role_id": role_id}).eq("id", node_id).execute()
    except Exception:
        pass
    return {"status": "success"}

@app.post("/delete_node")
def delete_node(node_id: str = Form(...)):
    global TREE
    TREE = [node for node in TREE if node["id"] != node_id]
    try:
        supabase.table("nodes").delete().eq("id", node_id).execute()
    except Exception:
        pass
    return {"status": "success"}

# ---------------- START SERVER ----------------
import uvicorn
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=10000)
