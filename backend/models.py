from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from database import Base
import datetime
import enum


class RoleEnum(str, enum.Enum):
    student = "student"
    admin = "admin"


class StatusEnum(str, enum.Enum):
    pending = "Pending"
    shortlisted = "Shortlisted"
    rejected = "Rejected"
    selected = "Selected"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="student")
    college = Column(String, nullable=True)
    branch = Column(String, nullable=True)
    cgpa = Column(Float, nullable=True)

    applications = relationship("Application", back_populates="student")


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    company = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    location = Column(String, nullable=False)
    salary = Column(String, nullable=True)
    deadline = Column(String, nullable=False)
    skills = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    applications = relationship("Application", back_populates="job")


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    status = Column(String, default="Pending")
    applied_at = Column(DateTime, default=datetime.datetime.utcnow)

    student = relationship("User", back_populates="applications")
    job = relationship("Job", back_populates="applications")
