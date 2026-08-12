import os
import uuid
import shutil
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from database import get_db
from models import DBIssue, DBNotification, DBActivity
from schemas import IssueStatusUpdateSchema, IssueAssignTeamSchema, IssueFlagSchema, ProofSubmitSchema, CitizenApprovalSchema
from services.ai_service import analyze_issue_with_ai
from services.websocket_manager import ws_manager

router = APIRouter(prefix="/issues", tags=["Issues"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("")
async def get_all_issues(city: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    query = select(DBIssue).order_by(DBIssue.created_at.desc())
    if city:
        query = query.where(DBIssue.city == city)
    result = await db.execute(query)
    issues = result.scalars().all()
    
    # Format issues list
    output = []
    for i in issues:
        output.append({
            "id": i.id,
            "title": i.title,
            "description": i.description,
            "category": i.category,
            "priority": i.priority,
            "status": i.status,
            "location": i.location,
            "lat": i.lat,
            "lng": i.lng,
            "city": i.city or "Mumbai",
            "imageUrl": i.image_url,
            "reporterId": i.reporter_id,
            "reporterName": i.reporter_name or "Anonymous Citizen",
            "reportedBy": i.reporter_id or i.reporter_name or "Anonymous Citizen",
            "votes": i.votes or 1,
            "upvotedBy": i.upvoted_by or [],
            "flaggedFake": i.flagged_fake or False,
            "flaggedReason": i.flagged_reason,
            "assignedTeam": i.assigned_team,
            "assignedOfficers": i.assigned_officers or [],
            "slaHours": i.sla_hours or 24,
            "aiScore": i.ai_score or 50,
            "aiSummary": i.ai_summary,
            "aiRiskAssessment": i.ai_risk_assessment,
            "citizenImpactScore": i.citizen_impact_score or 50,
            "recommendedAction": i.recommended_action,
            "siteArrivalProof": i.site_arrival_proof,
            "resolutionProof": i.resolution_proof,
            "createdAt": i.created_at.isoformat() if i.created_at else datetime.utcnow().isoformat(),
            "reportedAt": i.created_at.isoformat() if i.created_at else datetime.utcnow().isoformat()
        })
    return output

@router.post("")
async def create_issue(
    title: str = Form(...),
    description: str = Form(...),
    category: str = Form(...),
    location: str = Form(...),
    lat: Optional[float] = Form(None),
    lng: Optional[float] = Form(None),
    city: str = Form("Mumbai"),
    reporter_id: str = Form(""),
    reporter_name: str = Form("Anonymous Citizen"),
    image: Optional[UploadFile] = File(None),
    db: AsyncSession = Depends(get_db)
):
    image_url = None
    image_bytes = None

    if image:
        image_bytes = await image.read()
        ext = image.filename.split(".")[-1] if "." in image.filename else "jpg"
        filename = f"{uuid.uuid4().hex}.{ext}"
        filepath = os.path.join(UPLOAD_DIR, filename)
        with open(filepath, "wb") as f:
            f.write(image_bytes)
        image_url = f"/uploads/{filename}"

    # Analyze with Gemini Vision AI
    ai_result = await analyze_issue_with_ai(image_bytes, description, category, location)

    issue_id = f"iss-{uuid.uuid4().hex[:8]}"
    new_issue = DBIssue(
        id=issue_id,
        title=title,
        description=description,
        category=ai_result.get("suggested_category", category),
        priority=ai_result.get("priority", "medium"),
        status="Reported",
        location=location,
        lat=lat,
        lng=lng,
        city=city,
        image_url=image_url,
        reporter_id=reporter_id,
        reporter_name=reporter_name,
        votes=1,
        upvoted_by=[reporter_id] if reporter_id else [],
        flagged_fake=False,
        sla_hours=ai_result.get("suggested_sla_hours", 24),
        ai_score=ai_result.get("ai_score", 65),
        ai_summary=ai_result.get("summary", ""),
        ai_risk_assessment=ai_result.get("risk_assessment", ""),
        citizen_impact_score=ai_result.get("citizen_impact_score", 60),
        recommended_action=ai_result.get("recommended_action", "")
    )

    db.add(new_issue)

    # Add Notification
    notif = DBNotification(
        user_id="all",
        type="issue_reported",
        title=f"📍 New Report: {title}",
        message=f"New civic issue reported in {location}, {city}. AI Priority: {new_issue.priority.upper()}.",
        icon="📍",
        issue_id=issue_id
    )
    db.add(notif)

    # Add Activity
    act = DBActivity(
        user_name=reporter_name,
        action="reported",
        target=title,
        city=city
    )
    db.add(act)

    # Credit +50 reward points to user in PostgreSQL database
    if reporter_id:
        from models import DBUser
        user_res = await db.execute(select(DBUser).where(DBUser.uid == reporter_id))
        db_user = user_res.scalars().first()
        if db_user:
            db_user.points = (db_user.points or 0) + 50

    await db.commit()
    await db.refresh(new_issue)

    formatted_issue = {
        "id": new_issue.id,
        "title": new_issue.title,
        "description": new_issue.description,
        "category": new_issue.category,
        "priority": new_issue.priority,
        "status": new_issue.status,
        "location": new_issue.location,
        "lat": new_issue.lat,
        "lng": new_issue.lng,
        "city": new_issue.city,
        "imageUrl": new_issue.image_url,
        "reporterId": new_issue.reporter_id,
        "reporterName": new_issue.reporter_name,
        "reportedBy": new_issue.reporter_id or new_issue.reporter_name or "Anonymous Citizen",
        "votes": new_issue.votes,
        "upvotedBy": new_issue.upvoted_by,
        "flaggedFake": new_issue.flagged_fake,
        "assignedTeam": new_issue.assigned_team,
        "assignedOfficers": new_issue.assigned_officers,
        "slaHours": new_issue.sla_hours,
        "aiScore": new_issue.ai_score,
        "aiSummary": new_issue.ai_summary,
        "aiRiskAssessment": new_issue.ai_risk_assessment,
        "citizenImpactScore": new_issue.citizen_impact_score,
        "recommendedAction": new_issue.recommended_action,
        "createdAt": new_issue.created_at.isoformat()
    }

    # Broadcast real-time issue creation via WebSocket
    await ws_manager.broadcast({
        "type": "issue_created",
        "issue": formatted_issue
    })

    return formatted_issue

@router.delete("/{issue_id}")
async def delete_issue(issue_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DBIssue).where(DBIssue.id == issue_id))
    issue = result.scalars().first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")

    await db.delete(issue)
    await db.commit()

    # Broadcast real-time deletion via WebSocket
    await ws_manager.broadcast({
        "type": "issue_deleted",
        "issue_id": issue_id
    })

    return {"success": True, "message": f"Issue {issue_id} deleted"}

@router.patch("/{issue_id}/upvote")
async def upvote_issue(issue_id: str, user_id: str = Form(""), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DBIssue).where(DBIssue.id == issue_id))
    issue = result.scalars().first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")

    upvoted_list = list(issue.upvoted_by or [])
    if user_id and user_id in upvoted_list:
        upvoted_list.remove(user_id)
        issue.votes = max(0, (issue.votes or 1) - 1)
    else:
        if user_id:
            upvoted_list.append(user_id)
        issue.votes = (issue.votes or 0) + 1

    issue.upvoted_by = upvoted_list
    await db.commit()

    await ws_manager.broadcast({
        "type": "issue_upvoted",
        "issue_id": issue_id,
        "votes": issue.votes,
        "upvotedBy": issue.upvoted_by
    })

    return {"success": True, "votes": issue.votes, "upvotedBy": issue.upvoted_by}

@router.patch("/{issue_id}/status")
async def update_issue_status(issue_id: str, payload: IssueStatusUpdateSchema, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DBIssue).where(DBIssue.id == issue_id))
    issue = result.scalars().first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")

    issue.status = payload.status
    
    # Add notification for status change
    notif = DBNotification(
        user_id=issue.reporter_id or "all",
        type="status_change",
        title=f"🔄 Status Updated: {payload.status}",
        message=f"Issue '{issue.title}' status changed to '{payload.status}'.",
        icon="🔄",
        issue_id=issue_id
    )
    db.add(notif)

    await db.commit()

    await ws_manager.broadcast({
        "type": "issue_status_updated",
        "issue_id": issue_id,
        "status": payload.status
    })

    return {"success": True, "status": payload.status}

@router.patch("/{issue_id}/team")
async def assign_team(issue_id: str, payload: IssueAssignTeamSchema, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DBIssue).where(DBIssue.id == issue_id))
    issue = result.scalars().first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")

    issue.assigned_team = payload.team_name
    issue.assigned_officers = payload.officer_names
    if payload.sla_hours:
        issue.sla_hours = payload.sla_hours

    # Send direct real-time notification to reporting citizen
    notif = DBNotification(
        user_id=issue.reporter_id or "all",
        type="team_assigned",
        title="🛡️ Response Team Assigned!",
        message=f"Admin assigned '{payload.team_name}' to your report '{issue.title}'. Officers: {', '.join(payload.officer_names)}. Target SLA: {issue.sla_hours} Hours.",
        icon="🛡️",
        issue_id=issue_id
    )
    db.add(notif)
    await db.commit()

    # Real-time WebSocket broadcast to updating citizen
    await ws_manager.broadcast({
        "type": "team_assigned",
        "issue_id": issue_id,
        "reporterId": issue.reporter_id,
        "teamName": payload.team_name,
        "officerNames": payload.officer_names,
        "slaHours": issue.sla_hours,
        "notification": {
            "id": notif.id,
            "type": notif.type,
            "title": notif.title,
            "message": notif.message,
            "icon": notif.icon,
            "issueId": notif.issue_id,
            "createdAt": notif.created_at.isoformat(),
            "read": False
        }
    })

    return {"success": True, "assignedTeam": payload.team_name, "assignedOfficers": payload.officer_names}

@router.post("/{issue_id}/flag-fake")
async def flag_fake_issue(issue_id: str, payload: IssueFlagSchema, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DBIssue).where(DBIssue.id == issue_id))
    issue = result.scalars().first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")

    issue.flagged_fake = True
    issue.flagged_reason = payload.reason
    await db.commit()

    await ws_manager.broadcast({
        "type": "issue_flagged",
        "issue_id": issue_id,
        "reason": payload.reason
    })

    return {"success": True}


# ── Upload image for proof (arrival or resolution) ─────────────────────────────
@router.post("/upload-proof")
async def upload_proof_image(
    image: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    """Upload an image file and return its URL — used by Employee Portal proof forms."""
    image_bytes = await image.read()
    ext = image.filename.split(".")[-1] if image.filename and "." in image.filename else "jpg"
    filename = f"{uuid.uuid4().hex}.{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    with open(filepath, "wb") as f:
        f.write(image_bytes)
    image_url = f"/uploads/{filename}"
    return {"success": True, "imageUrl": image_url, "url": image_url}


# ── Site Arrival Proof ─────────────────────────────────────────────────────────
@router.patch("/{issue_id}/arrival-proof")
async def submit_arrival_proof(issue_id: str, payload: ProofSubmitSchema, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DBIssue).where(DBIssue.id == issue_id))
    issue = result.scalars().first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")

    arrived_at = datetime.utcnow().isoformat()
    proof_data = {
        "imageUrl": payload.image_url,
        "lat": payload.lat,
        "lng": payload.lng,
        "locationName": payload.location_name or issue.location,
        "arrivedAt": arrived_at,
        "arrivedBy": payload.submitted_by or "Field Officer"
    }
    issue.site_arrival_proof = proof_data
    issue.status = "In Progress"

    # Notify reporting citizen
    notif = DBNotification(
        user_id=issue.reporter_id or "all",
        type="status_change",
        title="🚛 Field Team Arrived at Site",
        message=f"{payload.submitted_by} has reached the location for '{issue.title}'. Status moved to In Progress.",
        icon="🚛",
        issue_id=issue_id
    )
    db.add(notif)
    await db.commit()

    await ws_manager.broadcast({
        "type": "arrival_proof_submitted",
        "issue_id": issue_id,
        "status": "in_progress",
        "siteArrivalProof": proof_data,
        "notification": {
            "id": notif.id, "type": notif.type, "title": notif.title,
            "message": notif.message, "icon": notif.icon,
            "issueId": issue_id, "createdAt": notif.created_at.isoformat(), "read": False
        }
    })

    return {"success": True, "status": "in_progress", "siteArrivalProof": proof_data}


# ── Resolution Proof ───────────────────────────────────────────────────────────
@router.patch("/{issue_id}/resolution-proof")
async def submit_resolution_proof(issue_id: str, payload: ProofSubmitSchema, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DBIssue).where(DBIssue.id == issue_id))
    issue = result.scalars().first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")

    resolved_at = datetime.utcnow().isoformat()
    proof_data = {
        "imageUrl": payload.image_url,
        "lat": payload.lat,
        "lng": payload.lng,
        "locationName": payload.location_name or issue.location,
        "resolvedAt": resolved_at,
        "resolvedBy": payload.submitted_by or "Field Officer",
        "approvedByCitizen": False
    }
    issue.resolution_proof = proof_data
    issue.status = "Pending Approval"

    notif = DBNotification(
        user_id=issue.reporter_id or "all",
        type="status_change",
        title="⏳ Resolution Proof Submitted — Your Approval Needed",
        message=f"Field Officer {payload.submitted_by} resolved '{issue.title}'. Please review the proof and confirm.",
        icon="📸",
        issue_id=issue_id
    )
    db.add(notif)
    await db.commit()

    await ws_manager.broadcast({
        "type": "resolution_proof_submitted",
        "issue_id": issue_id,
        "status": "pending_approval",
        "resolutionProof": proof_data,
        "notification": {
            "id": notif.id, "type": notif.type, "title": notif.title,
            "message": notif.message, "icon": notif.icon,
            "issueId": issue_id, "createdAt": notif.created_at.isoformat(), "read": False
        }
    })

    return {"success": True, "status": "pending_approval", "resolutionProof": proof_data}


# ── Citizen Approval / Rejection ───────────────────────────────────────────────
@router.patch("/{issue_id}/citizen-approve")
async def citizen_approve(issue_id: str, payload: CitizenApprovalSchema, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DBIssue).where(DBIssue.id == issue_id))
    issue = result.scalars().first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")

    new_status = "Resolved" if payload.approved else "In Progress"
    issue.status = new_status

    # Update approvedByCitizen flag in resolution_proof JSON
    if issue.resolution_proof:
        updated_proof = dict(issue.resolution_proof)
        updated_proof["approvedByCitizen"] = payload.approved
        issue.resolution_proof = updated_proof

    notif = DBNotification(
        user_id="all",
        type="status_change",
        title="✅ Issue Confirmed Resolved" if payload.approved else "⚠️ Resolution Rejected by Citizen",
        message=f"Citizen {'confirmed' if payload.approved else 'rejected'} the resolution for '{issue.title}'.",
        icon="✅" if payload.approved else "⚠️",
        issue_id=issue_id
    )
    db.add(notif)
    await db.commit()

    await ws_manager.broadcast({
        "type": "citizen_approved",
        "issue_id": issue_id,
        "approved": payload.approved,
        "status": "resolved" if payload.approved else "in_progress"
    })

    return {"success": True, "approved": payload.approved, "status": new_status}
