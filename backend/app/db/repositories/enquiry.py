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
    async def getList(self, paggination=None, filter=None):
        try:
            query = self.db_session.query(
                Enquiry.firstName,
                Enquiry.lastName,
                Enquiry.sourceType,
                Enquiry.status,
                Enquiry.email,
                Enquiry.mobile,
                Enquiry.createdAt
            )

            if filter:
                if filter.get("email"):
                    query = query.filter(Enquiry.email == filter["email"])
                if filter.get("mobile"):
                    query = query.filter(Enquiry.mobile == filter["mobile"])
                if filter.get("status") is not None and filter.get("status") != "":
                    query = query.filter(Enquiry.status == filter["status"])
                if filter.get("type") is not None and filter.get("type") != "":
                    query = query.filter(Enquiry.sourceType == filter["type"])
                if filter.get("name"):
                    name_term = f"%{filter['name']}%"
                    query = query.filter(
                        or_(
                            Enquiry.firstName.ilike(name_term),
                            Enquiry.lastName.ilike(name_term)
                        )
                    )
                if filter.get("search"):
                    search_term = f"%{filter['search']}%"
                    query = query.filter(
                        or_(
                            Enquiry.firstName.ilike(search_term),
                            Enquiry.lastName.ilike(search_term),
                            Enquiry.email.ilike(search_term),
                            Enquiry.mobile.ilike(search_term)
                        )
                    )

            if paggination and paggination.get("limit") is not None:
                limit = int(paggination["limit"])
                offset = int(paggination.get("offset") or 0)
                if offset > 1:
                    offset = (offset - 1) * limit
                elif offset == 1:
                    offset = 0
                query = query.offset(offset).limit(limit)

            rows = query.all()

            enquiries = [
                {
                    "firstName": row.firstName,
                    "lastName": row.lastName,
                    "sourceType": row.sourceType,
                    "status": row.status,
                    "email": row.email,
                    "mobile": row.mobile,
                    "createdAt":row.createdAt
                }
                for row in rows
            ]

            print("\n\n\n\n\n",enquiries)

            return SendSuccessResponse(
                message="Enquiries fetched successfully.",
                data=enquiries
            )
        
        except Exception as error:
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
            enquiries = getAttr(payload, "enquiries", [])
            
            if len(enquiries) <= 0:
                return SendErrorResponse(
                    message = "Please select enquiry(s) push to pipeline."
                ).send()
            
            return SendSuccessResponse(
                message = f"{len(enquiries)} enquiry(s) pushed to pipeline successfully.",
                data = {"enquiries": enquiries}
            ).send()
        except HTTPException as error:
            raise error