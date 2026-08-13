import os
import json
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.future import select

from database import engine, Base, AsyncSessionLocal, init_postgres_db
from models import DBIssue, DBUser, DBNotification
from routers import auth, issues
from services.websocket_manager import ws_manager

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure urban_eye database exists in PostgreSQL
    await init_postgres_db()

    # Initialize PostgreSQL tables & migrate missing columns
    print("[PostgreSQL] Creating database tables & verifying schema...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        # Auto-migrate columns added after initial deployment
        from sqlalchemy import text
        await conn.execute(text("ALTER TABLE issues ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION;"))
        await conn.execute(text("ALTER TABLE issues ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION;"))
        await conn.execute(text("ALTER TABLE issues ADD COLUMN IF NOT EXISTS yolo_detections JSONB DEFAULT '[]'::jsonb;"))
        await conn.execute(text("ALTER TABLE issues ADD COLUMN IF NOT EXISTS ai_full_report TEXT;"))
        await conn.execute(text("ALTER TABLE issues ADD COLUMN IF NOT EXISTS ai_annotated_image_url VARCHAR;"))
        await conn.execute(text("ALTER TABLE issues ADD COLUMN IF NOT EXISTS site_arrival_proof JSON;"))
        await conn.execute(text("ALTER TABLE issues ADD COLUMN IF NOT EXISTS resolution_proof JSON;"))
    print("[PostgreSQL] Tables & columns verified.")

    # Pre-seed initial sample data if empty
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(DBIssue))
        existing_issues = result.scalars().all()
        if not existing_issues:
            print("[Database Seed] Seeding initial Mumbai/Delhi/Bengaluru issues...")
            initial_data = [
                {
                    "id": "iss-init-1",
                    "title": "Deep Pothole near Andheri Station West",
                    "description": "Hazardous 3-foot wide crater on main road causing severe traffic backup and risk to bikers.",
                    "category": "Infrastructure",
                    "priority": "critical",
                    "status": "In Progress",
                    "location": "S.V. Road, Andheri West",
                    "city": "Mumbai",
                    "image_url": "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop",
                    "reporter_name": "Arun Sharma",
                    "votes": 28,
                    "sla_hours": 12,
                    "assigned_team": "Pothole Quick Response Unit",
                    "assigned_officers": ["Inspector Rajesh Kumar", "Officer Suresh Patil"],
                    "ai_score": 88,
                    "ai_summary": "High risk infrastructure defect located on primary arterial route. Immediate road repair required.",
                    "ai_risk_assessment": "CRITICAL HAZARD: Bikers at risk of severe accidents during night hours.",
                    "citizen_impact_score": 92,
                    "recommended_action": "Deploy asphalt compaction squad within 12 hours."
                },
                {
                    "id": "iss-init-2",
                    "title": "Water Pipeline Breach & Street Flooding",
                    "description": "Clean drinking water bursting out from underground pipe near Worli Sea Link junction.",
                    "category": "Utilities",
                    "priority": "high",
                    "status": "Reported",
                    "location": "Worli Naka, Ward G-South",
                    "city": "Mumbai",
                    "image_url": "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?w=600&auto=format&fit=crop",
                    "reporter_name": "Priya Deshmukh",
                    "votes": 42,
                    "sla_hours": 8,
                    "ai_score": 79,
                    "ai_summary": "Major municipal water loss detected. High volume flow risking local foundation erosion.",
                    "ai_risk_assessment": "HIGH RISK: Utility wastage and roadway sub-base softening.",
                    "citizen_impact_score": 85,
                    "recommended_action": "Isolate pipeline valve and dispatch Hydraulic Engineer team."
                },
                {
                    "id": "iss-init-3",
                    "title": "Broken Streetlights in Connaught Place Outer Ring",
                    "description": "Block C streetlights flicking and completely dark after 8 PM, safety hazard for pedestrians.",
                    "category": "Safety",
                    "priority": "high",
                    "status": "Reported",
                    "location": "Connaught Place Block C",
                    "city": "Delhi",
                    "image_url": "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=600&auto=format&fit=crop",
                    "reporter_name": "Rohan Gupta",
                    "votes": 19,
                    "sla_hours": 24,
                    "ai_score": 72,
                    "ai_summary": "Illumination loss in high-footfall commercial corridor. Increased night-time vulnerability.",
                    "ai_risk_assessment": "HIGH SAFETY RISK: Inadequate visibility for women and late commuters.",
                    "citizen_impact_score": 78,
                    "recommended_action": "Replace blown transformer module and LED bulbs."
                }
            ]

            for item in initial_data:
                iss = DBIssue(**item)
                db.add(iss)
            await db.commit()
            print("[Database Seed] Seed completed.")

    yield
    print("[Shutdown] Closing server...")

app = FastAPI(
    title="Urban Eye Backend API",
    description="Real-time Python FastAPI + PostgreSQL + Gemini Vision AI Backend for Urban Eye Civic Governance",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file serving for issue uploaded images
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Include API Routers
app.include_router(auth.router)
app.include_router(issues.router)

@app.get("/")
async def root():
    return {
        "status": "online",
        "app": "Urban Eye Real-time Backend",
        "database": "PostgreSQL",
        "ai_engine": "Google Gemini Vision",
        "websocket": "ws://localhost:8000/ws/{user_id}"
    }

@app.get("/notifications")
async def get_notifications(user_id: str = "all"):
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(DBNotification).order_by(DBNotification.created_at.desc()))
        notifs = result.scalars().all()
        output = []
        for n in notifs:
            output.append({
                "id": n.id,
                "type": n.type,
                "title": n.title,
                "message": n.message,
                "icon": n.icon,
                "issueId": n.issue_id,
                "createdAt": n.created_at.isoformat(),
                "read": n.read
            })
        return output

# Real-time WebSocket Endpoint
@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await ws_manager.connect(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_text()
            # Handle incoming ping / messages if needed
            try:
                parsed = json.loads(data)
                if parsed.get("type") == "ping":
                    await websocket.send_text(json.dumps({"type": "pong"}))
            except Exception:
                pass
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, user_id)
    except Exception as e:
        print(f"[WebSocket Error] Exception in connection: {e}")
        ws_manager.disconnect(websocket, user_id)
