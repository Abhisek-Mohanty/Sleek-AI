import io
import secrets
from typing import Any
from sqlalchemy import or_
from starlette.exceptions import HTTPException
from sqlalchemy.orm import load_only, contains_eager, joinedload
import re

from app.api.response.http_response import SendErrorResponse, SendExportResponse, SendSuccessResponse

from app.resources.helper.common import *
from app.db.repositories.base import BaseRepository
from app.resources.helper.moment import Moment
from fastapi.encoders import jsonable_encoder

from app.models.domain.db import *

class EnquiryRepository(BaseRepository):  
    async def getList(self,paggination,filter):
        try:
            oData = self.db_session.query(
                Enquiry
            ).all()

            return SendSuccessResponse(
                data = oData
            )
        except HTTPException as error:
            raise error

    async def enquiryCreate(self,payload):
        try:
            oEnquiry = self.db_session.query(
                    Enquiry
                ).filter( 
                    Enquiry.mobile == getAttr(payload,"mobile",None) 
                ).first()
                
            if (oEnquiry):
                 return SendErrorResponse(
                            message = "Enquiry with same mobile number already exist."
                        ).send()
                     
            mobile_number = payload.get("mobile", None)
            
            if mobile_number and len(str(mobile_number)) < 10:
                return SendErrorResponse(
                    message = "Mobile number must be at least 10 digits long."
                ).send() 
            
            oEnquiry = self.mapDataToModel(Enquiry( ),payload)
            oEnquiry = self.save(oEnquiry)
            
            oEnquiry.enquiryNumber = "EQ-" + str(oEnquiry.id).rjust(9, '0')
                
            oResEnquiry = jsonable_encoder(oEnquiry)
            
            self.db_session.commit()
            return SendSuccessResponse(
                message = "Enquiry detail saved.",
                data = oResEnquiry
            ).send()
        except HTTPException as error:
                    raise error
    async def pushAgent(self, payload):
        try:
            enquiries = getAttr(payload,"enquiries",[])
            
            if len(enquiries) <= 0:
                  return SendErrorResponse(
                        message = "Please select enquiry(s) push to pipeline."
                    ).send()
                 
                   
        except HTTPException as error:
            raise error