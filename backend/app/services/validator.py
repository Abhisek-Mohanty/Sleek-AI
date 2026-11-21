from app.agents.validator.validateEnquires import validate_enquiry
from app.db.repositories.base import BaseRepository
from starlette.exceptions import HTTPException
from app.api.response.http_response import SendErrorResponse, SendExportResponse, SendSuccessResponse
from app.resources.helper.common import *
from app.resources.constant import *
from app.models.domain.db import *
from fastapi.encoders import jsonable_encoder





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

            print("\n\n\n\n\n","ValidatorService",check_spam)
            print("\n\n\n\n\n","ValidatorService",check_spam.content.is_spam)


            if check_spam and check_spam.content and not check_spam.content.is_spam:
                enquiry['status'] = ENQUIRY_STATUS.VALIDATED.value
            if check_spam and check_spam.content and check_spam.content.is_spam:
                enquiry['status'] = ENQUIRY_STATUS.REJECT.value
            oEnquiry = self.db_session.query(Enquiry).filter(Enquiry.id == enquiry['id']).first()
            oEnquiry = self.mapDataToModel(oEnquiry,enquiry)
            oEnquiry.updatedAt = Moment().now
            print("\n\n\n\n","post",oEnquiry)
            ResEnquiry = jsonable_encoder(oEnquiry)
            self.db_session.commit()
            return ResEnquiry
            
            
        except HTTPException as error:
            raise error