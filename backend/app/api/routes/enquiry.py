from typing import Optional
from fastapi import APIRouter, Body, Depends, HTTPException, Form
from starlette.status import HTTP_400_BAD_REQUEST

from app.api.response.http_response import SendResponse
from app.api.dependencies.database import get_repository
from app.core import config
from loguru import logger
from app.resources.helper.common import *
from app.db.repositories.enquiry import EnquiryRepository

router = APIRouter()

logger.info("Enquiry router loaded")


@router.get("", 
    response_model = SendResponse, 
    name = "enquiry:get-enquiries")
@router.get("/", 
    response_model = SendResponse, 
    name = "enquiry:get-enquiries-slash")
async def get_enquiries(
    oRepository: EnquiryRepository = Depends(get_repository(EnquiryRepository)),
    limit           : Optional[int] = None,
    page            : Optional[int] = None,
    type            : Optional[str] = None,
    name            : Optional[str] = None,
    email           : Optional[str] = None,
    mobile          : Optional[str] = None,
    status          : Optional[str] = None,
    q               : Optional[str] = None,
    qf              : Optional[str] = None
) -> SendResponse:    
    oResult = await oRepository.getList( 
        paggination = { 
            "limit" : limit, 
            "offset" : page 
        }, 
        filter = {    
            "type"         : type,
            "name"         : name,
            "email"        : email,
            "mobile"       : mobile,
            "status"       : status,    
            "search"       : q, 
            "searchField"  : qf
        })
    
    return SendResponse(
        data = oResult
    ).send()

@router.post("/create", 
    response_model = SendResponse, 
    name = "enquiry:create-enquiry")
async def create_enquiry(
    payload = Body(...),
    oEnquiry: EnquiryRepository = Depends(get_repository(EnquiryRepository))
) -> SendResponse:
    oResult = await oEnquiry.enquiryCreate(payload = payload)
    
    return SendResponse(
        data = oResult
    ).send()

@router.post("/pushPipeline", 
    response_model = SendResponse, 
    name = "enquiry:push-pipeline")
async def push_pipeline(
    payload = Body(...),
    oEnquiry: EnquiryRepository = Depends(get_repository(EnquiryRepository))
) -> SendResponse:
    oResult = await oEnquiry.pushAgent(payload = payload)
    
    return SendResponse(
        data = oResult
    ).send()