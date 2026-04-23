from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models, schemas
from auth import get_current_student

router = APIRouter(prefix="", tags=["Student"])


@router.get("/jobs", response_model=List[schemas.JobOut])
def list_jobs(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_student)):
    return db.query(models.Job).filter(models.Job.is_active == True).all()


@router.get("/jobs/{job_id}", response_model=schemas.JobOut)
def get_job(job_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_student)):
    job = db.query(models.Job).filter(models.Job.id == job_id, models.Job.is_active == True).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@router.post("/applications/{job_id}", response_model=schemas.ApplicationOut, status_code=201)
def apply_job(job_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_student)):
    job = db.query(models.Job).filter(models.Job.id == job_id, models.Job.is_active == True).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found or not active")

    already = db.query(models.Application).filter(
        models.Application.student_id == current_user.id,
        models.Application.job_id == job_id
    ).first()
    if already:
        raise HTTPException(status_code=400, detail="Already applied to this job")

    application = models.Application(student_id=current_user.id, job_id=job_id)
    db.add(application)
    db.commit()
    db.refresh(application)
    return application


@router.get("/applications/my", response_model=List[schemas.ApplicationOut])
def my_applications(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_student)):
    apps = (
        db.query(models.Application)
        .filter(models.Application.student_id == current_user.id)
        .all()
    )
    return apps
