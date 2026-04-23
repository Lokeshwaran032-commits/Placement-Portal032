from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List
from datetime import datetime


# ── Auth ──────────────────────────────────────────────────────────────────────

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    college: Optional[str] = None
    branch: Optional[str] = None
    cgpa: Optional[float] = None

    @field_validator("cgpa")
    @classmethod
    def cgpa_range(cls, v):
        if v is not None and not (0.0 <= v <= 10.0):
            raise ValueError("CGPA must be between 0 and 10")
        return v

    @field_validator("password")
    @classmethod
    def password_length(cls, v):
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters")
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    name: str


# ── User ──────────────────────────────────────────────────────────────────────

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str
    college: Optional[str]
    branch: Optional[str]
    cgpa: Optional[float]

    model_config = {"from_attributes": True}


# ── Job ───────────────────────────────────────────────────────────────────────

class JobCreate(BaseModel):
    title: str
    company: str
    description: str
    location: str
    salary: Optional[str] = None
    deadline: str
    skills: Optional[str] = None

    @field_validator("title", "company", "description", "location", "deadline")
    @classmethod
    def not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError("Field cannot be empty")
        return v


class JobUpdate(BaseModel):
    title: Optional[str] = None
    company: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    salary: Optional[str] = None
    deadline: Optional[str] = None
    skills: Optional[str] = None
    is_active: Optional[bool] = None


class JobOut(BaseModel):
    id: int
    title: str
    company: str
    description: str
    location: str
    salary: Optional[str]
    deadline: str
    skills: Optional[str]
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Application ───────────────────────────────────────────────────────────────

class ApplicationOut(BaseModel):
    id: int
    student_id: int
    job_id: int
    status: str
    applied_at: datetime
    student: Optional[UserOut] = None
    job: Optional[JobOut] = None

    model_config = {"from_attributes": True}


class ApplicationStatusUpdate(BaseModel):
    status: str

    @field_validator("status")
    @classmethod
    def valid_status(cls, v):
        allowed = {"Pending", "Shortlisted", "Rejected", "Selected"}
        if v not in allowed:
            raise ValueError(f"Status must be one of {allowed}")
        return v
