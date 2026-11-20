from app.agents.mail.sendWelcome import welcome_email_agent
from app.db.repositories.base import BaseRepository
from starlette.exceptions import HTTPException
from app.api.response.http_response import SendErrorResponse, SendExportResponse, SendSuccessResponse
from app.resources.helper.common import *
from app.resources.constant import *
from app.models.domain.db import *
from fastapi.encoders import jsonable_encoder
import requests
from app.core.config import MSG91

class WelcomeMailService(BaseRepository):
    # def __init__(self):
    #     self.url = "https://control.msg91.com/api/v5/email/send"
    #     self.headers = {
    #                 "accept": "application/json",
    #                 "authkey": MSG91,
    #                 "content-type": "application/json"
    #                 }
    async def sendWelcomeMail(self,enquiry):
        try:
            url = "https://control.msg91.com/api/v5/email/send"
            headers = {
                        "accept": "application/json",
                        "authkey": MSG91,
                        "content-type": "application/json"
                        }
            name = enquiry.get('firstName')
            email = enquiry.get('email')

            payload = {
                        "recipients": [
                            {
                            "to": [
                                {
                                "name": name,
                                "email": "abhisek.course@gmail.com"
                                }
                            ],
                            "variables": {
                                "Client_Name": name,
                            }
                            }
                        ],
                        "from": {
                            "name": "Sleek AI",
                            "email": "info@08w1b4.mailer91.com"
                        },
                        "domain": "08w1b4.mailer91.com",
                        "template_id": "welcome_mail_31",
                        }

            response = requests.post(url, json=payload, headers=headers)
            result = response.json()
            oEnquiry = self.db_session.query(Enquiry).filter(Enquiry.id == enquiry['id']).first()
            if result.get('status') == "success":
                oEnquiry.status = ENQUIRY_STATUS.PAN_PENDING.value
                oEnquiry.updatedAt = Moment().now
                now = Moment().now
                oCommunication = CommunicationLog(
                    enquiryId = enquiry.get('id'),
                    communicationType = COMMUNICATION_TYPE.WELCOME_INITIAL.value,
                    message = json.dumps(payload),
                    status = STATUS.SUCCESS.value,
                    updatedAt = now,
                    createdAt = now
                )
                oCommunication = self.save(oCommunication)
                self.db_session.commit()
                next_followup = now + timedelta(hours=5)
                oNextFollowup = Followup(
                    enquiryId = enquiry.get('id'),
                    dateOfAction = next_followup,
                    comment = "Welcome Followup",
                    actionType = FOLLOWUP_ACTION.REQUEST_PAN.value,
                    status = FOLLOWUP_STATUS.ACTIVE.value,
                    updatedAt = now,
                    createdAt = now
                )
                oNextFollowup = self.save(oNextFollowup)
                self.db_session.commit()
            else:
                raise result

        except HTTPException as error:
            raise error