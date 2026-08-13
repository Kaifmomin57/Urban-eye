from typing import Optional, List
from pydantic import BaseModel, EmailStr

class UserRegisterSchema(BaseModel):
    uid: Optional[str] = None
    name: str
    email: str
    password: Optional[str] = None
    city: Optional[str] = "Mumbai"

class UserLoginSchema(BaseModel):
    email: str
    password: Optional[str] = None
    uid: Optional[str] = None

class AdminLoginSchema(BaseModel):
    admin_id: str
    password: str

class IssueCreateSchema(BaseModel):
    title: str
    description: str
    category: str
    location: str
    lat: Optional[float] = None
    lng: Optional[float] = None
    city: Optional[str] = "Mumbai"
    reporter_id: Optional[str] = None
    reporter_name: Optional[str] = "Anonymous Citizen"
    image_url: Optional[str] = None

class IssueStatusUpdateSchema(BaseModel):
    status: str # new, in_progress, resolved

class IssueAssignTeamSchema(BaseModel):
    team_name: str
    officer_names: List[str]
    sla_hours: Optional[int] = 24

class IssueFlagSchema(BaseModel):
    reason: str

class UserProfileUpdateSchema(BaseModel):
    name: Optional[str] = None
    photo_url: Optional[str] = None

class ProofSubmitSchema(BaseModel):
    image_url: str
    lat: Optional[float] = None
    lng: Optional[float] = None
    location_name: Optional[str] = None
    submitted_by: Optional[str] = "Field Officer"

class CitizenApprovalSchema(BaseModel):
    approved: bool
    citizen_id: Optional[str] = None
