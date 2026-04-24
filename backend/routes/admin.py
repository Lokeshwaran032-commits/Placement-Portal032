from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models, schemas
from auth import get_current_admin

router = APIRouter(prefix="/admin", tags=["Admin"])


# ── Jobs ──────────────────────────────────────────────────────────────────────

@router.post("/jobs", response_model=schemas.JobOut, status_code=201)
def create_job(payload: schemas.JobCreate, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    job = models.Job(**payload.model_dump())
    db.add(job)
    db.commit()
    db.refresh(job)
    return job


@router.put("/jobs/{job_id}", response_model=schemas.JobOut)
def update_job(job_id: int, payload: schemas.JobUpdate, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(job, key, value)
    db.commit()
    db.refresh(job)
    return job


@router.delete("/jobs/{job_id}", status_code=204)
def delete_job(job_id: int, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    job.is_active = False
    db.commit()
    return None


# ── Applications ──────────────────────────────────────────────────────────────

@router.get("/applications", response_model=List[schemas.ApplicationOut])
def all_applications(db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    return db.query(models.Application).all()


@router.patch("/applications/{app_id}", response_model=schemas.ApplicationOut)
def update_application_status(
    app_id: int,
    payload: schemas.ApplicationStatusUpdate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin)
):
    app = db.query(models.Application).filter(models.Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    app.status = payload.status
    db.commit()
    db.refresh(app)
    return app


# ── Students ──────────────────────────────────────────────────────────────────

@router.get("/students", response_model=List[schemas.UserOut])
def all_students(db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    return db.query(models.User).filter(models.User.role == "student").all()


@router.delete("/students/{student_id}", status_code=204)
def remove_student(student_id: int, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    student = db.query(models.User).filter(models.User.id == student_id, models.User.role == "student").first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    db.query(models.Application).filter(models.Application.student_id == student_id).delete()
    db.delete(student)
    db.commit()
    return None


# ── Admin: All Jobs (including inactive) ─────────────────────────────────────

@router.get("/jobs", response_model=List[schemas.JobOut])
def admin_all_jobs(db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    return db.query(models.Job).all()
