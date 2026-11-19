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
    def __init__(self):
        self.url = "https://control.msg91.com/api/v5/email/send"
        self.headers = {
                    "accept": "application/json",
                    "authkey": MSG91,
                    "content-type": "application/json"
                    }
    async def sendWelcomeMail(self,enquiry):
        try:
            name = enquiry.get('firstName')
            email = enquiry.get('email')

            payload = {
                        "recipients": [
                            {
                            "to": [
                                {
                                "name": name,
                                "email": email
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

            response = requests.post(self.url, data=payload, headers=self.headers)

            print(response.json())
            
            
        except HTTPException as error:
            raise error