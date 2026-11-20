from app.agents.mail.panFollowup import pan_followup_email_agent
from app.db.repositories.base import BaseRepository
from starlette.exceptions import HTTPException
from app.api.response.http_response import SendErrorResponse, SendExportResponse, SendSuccessResponse
from app.resources.helper.common import *
from app.resources.constant import *
from app.models.domain.db import *
from fastapi.encoders import jsonable_encoder
import requests
from app.core.config import MSG91

class PANFollowupMailService(BaseRepository):
    async def sendPanFollowupMail(self,enquiry):
        try:
            url = "https://control.msg91.com/api/v5/email/send"
            headers = {
                        "accept": "application/json",
                        "authkey": MSG91,
                        "content-type": "application/json"
                        }
            name = enquiry.get('firstName')
            email = enquiry.get('email')

            oFollowup = self.db_session.query(
                            Followup
                        ).filter(
                            Followup.enquiryId == enquiry.get('id'),
                            Followup.status == FOLLOWUP_STATUS.ACTIVE.value
                        ).first()
            if oFollowup.dateOfAction <= Moment().now:
                agent_mail = pan_followup_email_agent.run(f"write an followup sales pitch mail for:\n{enquiry}")
                print("\n\n\n\n\n\n\n",agent_mail,"pan_followup_email_agent")
                print("\n\n\n\n\n\n\n",agent_mail.content,"pan_followup_email_agent")
                print("\n\n\n\n\n\n\n",agent_mail.content.email_body,"pan_followup_email_agent")

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
                                    "Custom_Email_Body":agent_mail.content.email_body
                                }
                                }
                            ],
                            "from": {
                                "name": "Sleek AI",
                                "email": "info@08w1b4.mailer91.com"
                            },
                            "domain": "08w1b4.mailer91.com",
                            "template_id": "follow_up_mail_2",
                            }

                response = requests.post(url, json=payload, headers=headers)
                result = response.json()
                oEnquiry = self.db_session.query(Enquiry).filter(Enquiry.id == enquiry['id']).first()
                if result.get('status') == "success":
                    # oEnquiry.status = ENQUIRY_STATUS.PAN_PENDING.value
                    # oEnquiry.updatedAt = Moment().now
                    # now = Moment().now
                    # oCommunication = CommunicationLog(
                    #     enquiryId = enquiry.get('id'),
                    #     communicationType = COMMUNICATION_TYPE.WELCOME_INITIAL.value,
                    #     message = json.dumps(payload),
                    #     status = STATUS.SUCCESS.value,
                    #     updatedAt = now,
                    #     createdAt = now
                    # )
                    # oCommunication = self.save(oCommunication)
                    # self.db_session.commit()
                    # next_followup = now + timedelta(hours=5)
                    # oNextFollowup = Followup(
                    #     enquiryId = enquiry.get('id'),
                    #     dateOfAction = next_followup,
                    #     comment = "Welcome Followup",
                    #     actionType = FOLLOWUP_ACTION.REQUEST_PAN.value,
                    #     status = FOLLOWUP_STATUS.ACTIVE.value,
                    #     updatedAt = now,
                    #     createdAt = now
                    # )
                    # oNextFollowup = self.save(oNextFollowup)
                    self.db_session.commit()
                else:
                    raise result
            else:
                return False

        except HTTPException as error:
            raise error