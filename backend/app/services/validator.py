from app.agents.validator.validateEnquires import validate_enquiry
from app.db.repositories.base import BaseRepository
from starlette.exceptions import HTTPException
from app.api.response.http_response import SendErrorResponse, SendExportResponse, SendSuccessResponse
from app.resources.helper.common import *



class ValidatorService(BaseRepository):
    async def ValidateEnquiries(enquiry, actions):
        try:
            email_regex = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
            valid = bool(enquiry["name"].strip()) and len(enquiry["mobile"]) == 10 and  bool(re.fullmatch(email_regex,enquiry["email"]))

            if not valid:
                return {
                    "status": "INVALID",
                    "comment": "Validation completed"
                }
            check_spam = validate_enquiry.run(enquiry)
            
            
        except HTTPException as error:
            raise error