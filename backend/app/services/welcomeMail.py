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
    async def ValidateEnquiries(self,enquiry):
        try:
            url = "https://control.msg91.com/api/v5/email/send"

            payload = "{\n  \"recipients\": [\n    {\n      \"to\": [\n        {\n          \"name\": \"Recipient1 name\",\n          \"email\": \"Recipient1 email\"\n        }\n      ],\n      \"variables\": {\n        \"name\": \"Name 1\"\n      }\n    },\n    {\n      \"to\": [\n        {\n          \"name\": \"Recipient2 name\",\n          \"email\": \"Recipient2 email\"\n        }\n      ],\n      \"cc\": [\n        {\n          \"name\": \"Recipient3 name\",\n          \"email\": \"Recipient3 email\"\n        }\n      ],\n      \"bcc\": [\n        {\n          \"name\": \"Recipient4 name\",\n          \"email\": \"Recipient4 email\"\n        }\n      ],\n      \"variables\": {\n        \"name\": \"Name 2\"\n      }\n    }\n  ],\n  \"from\": {\n    \"name\": \"Joe\",\n    \"email\": \"sender@email.address\"\n  },\n  \"domain\": \"The domain which you have registered with us. We sign DKIM with this domain.\",\n  \"reply_to\": [\n    {\n      \"email\": \"reply1@email.com\"\n    },\n    {\n      \"email\": \"reply2@email.com\"\n    }\n  ],\n  \"attachments\": [\n    {\n      \"filePath\": \"Public path for file.\",\n      \"fileName\": \"File Name\"\n    },\n    {\n      \"file\": \"File in Data URI format data:content/type;base64,<data>.\",\n      \"fileName\": \"File Name\"\n    }\n  ],\n  \"template_id\": \"YOUR_UNIQUE_TEMPLATE_NAME\"\n}"
            headers = {
            "accept": "application/json",
            "authkey": MSG91,
            "content-type": "application/json"
            }

            response = requests.post(url, data=payload, headers=headers)

            print(response.json())
            
            
        except HTTPException as error:
            raise error