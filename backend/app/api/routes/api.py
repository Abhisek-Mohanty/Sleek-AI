from fastapi import APIRouter
from app.api.routes import enquiry

router = APIRouter()
router.include_router(enquiry.router, tags=["enquiry"], prefix="/enquiry")