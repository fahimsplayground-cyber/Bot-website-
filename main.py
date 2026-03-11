from fastapi import FastAPI, Request, Form
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from supabase import create_client
import os

# ---------------- CONFIG ----------------
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# ---------------- ROUTES ----------------
@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    # Fetch all nodes from Supabase
    nodes = supabase.table("roles").select("*").execute()
    return templates.TemplateResponse("index.html", {"request": request, "nodes": nodes.data})

@app.post("/add_node")
async def add_node(parent_id: int = Form(...), name: str = Form(...), role_id: str = Form(...)):
    data = supabase.table("roles").insert({
        "parent_id": parent_id,
        "name": name,
        "role_id": role_id
    }).execute()
    return JSONResponse({"status": "ok", "node": data.data})

@app.post("/edit_node")
async def edit_node(node_id: int = Form(...), name: str = Form(...), role_id: str = Form(...)):
    data = supabase.table("roles").update({
        "name": name,
        "role_id": role_id
    }).eq("id", node_id).execute()
    return JSONResponse({"status": "ok", "node": data.data})