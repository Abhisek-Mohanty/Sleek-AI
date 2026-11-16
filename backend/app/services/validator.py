from app.agents.validator.validateEnquires import validate_enquiry
from app.db.repositories.base import BaseRepository
from starlette.exceptions import HTTPException
from app.api.response.http_response import SendErrorResponse, SendExportResponse, SendSuccessResponse
from app.resources.helper.common import *



class ValidatorService(BaseRepository):
    async def ValidateEnquiries(self,enquiry):
        try:
            email_regex = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
            valid = bool(enquiry["firstName"].strip()) and len(enquiry["mobile"]) == 10 and  bool(re.fullmatch(email_regex,enquiry["email"]))

            if not valid:
                return {
                        "status": "REJECT",
                        "is_spam": True,
                        "reason": "Validation completed",
                        "next_action": "REJECT_ENQUIRY"
                    }
            check_spam = validate_enquiry.run(f"Validate this customer enquiry:\n{enquiry}")
            return check_spam
            
            
        except HTTPException as error:
            raise error