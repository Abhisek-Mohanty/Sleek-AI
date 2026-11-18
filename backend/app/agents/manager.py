from phi.agent import Agent
from phi.model.google import Gemini
from app.core.config import GEMINI_API_KEY, GEMINI_MODEL
from app.agents.agents import *
from app.agents.validator.validateEnquires import validate_enquiry
import json
import re
from app.services.validator import ValidatorService
from app.api.dependencies.database import get_repository
from app.db.repositories.base import BaseRepository





import os
os.environ["GOOGLE_API_KEY"] = GEMINI_API_KEY

class Action(str, Enum):
    VALIDATE = "validate_enquiry"
    SEND_WELCOME = "send_welcome"
    WAIT = "wait_for_customer"
    REQUEST_PAN = "request_pan"
    REQUEST_CRIF = "request_crif"
    CHECK_CRIF = "check_crif"
    CATEGORIZE = "categorize_customer"
    ASK_PRODUCT = "ask_product"
    SALES_REVIEW = "sales_review"
    REQUEST_PAYMENT = "request_payment"
    VERIFY_PAYMENT = "verify_payment"
    COMPLETE = "complete"
    HUMAN_REVIEW = "human_review"

class ManagerDecision(BaseModel):
    specialist: str
    action: Action
    reason: str
class ManagerRepositories(BaseRepository):
    async def mangerWork(self, enquiry:dict):
        try:
            manager = Agent(
                name="Sleek_ai Supervisor",
                model=Gemini(id=GEMINI_MODEL),
                instructions=[
                    "You are the central supervisor for Sleek_ai.",
                    "Identify the customer's status.",
                    "Route enquiries to the correct specialist.",
                    "Do not invent missing customer information.",
                    "Do not approve loans or verify payments.",
                    "Escalate uncertain cases to human review.",
                    "Return concise and structured decisions."
                ],
                tools=[DecisionMaker(enquiry)],
                response_model=ManagerDecision,
                markdown=True,
                show_tool_calls=True,
                add_datetime_to_instructions=True,
            )
            messages = manager.get_messages_for_run()
            print("\n\n\n\n\n",messages)
            print("\n\n\n\n\n",manager)
            result = manager.run(f"Analyze this customer enquiry and return the routing decision:\n{enquiry}")
            print("\n\n\n\n\n\n",result)
            content = result.content
            # content = re.sub(r"^```(?:json)?\s*|\s*```$","",content,flags=re.IGNORECASE)
            # print("\n\n\n\n\n\n",json.loads(content))
            # content = json.loads(content)
            action = content.action
            print("\n\n\n\n\n",action,"action")
            if action == 'validate_enquiry':
                actionTaken = await ValidatorService.ValidateEnquiries(self,enquiry)
                print("\n\n\n\n\n\n",actionTaken,"validate_enquiry")
                # return manager
        except Exception as error:
            raise error