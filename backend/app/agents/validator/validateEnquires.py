from phi.agent import Agent
from phi.model.google import Gemini
from app.core.config import GEMINI_API_KEY, GEMINI_MODEL
from app.agents.agents import *
import os
from typing import Literal
os.environ["GOOGLE_API_KEY"] = GEMINI_API_KEY

class EnquiryValidationResult(BaseModel):
    status: Literal["VALIDATED", "REJECT"]
    is_spam: bool | None
    reason: str
    next_action: Literal[ "FIRST_TOUCHPOINT","HUMAN_REVIEW","REJECT_ENQUIRY"]

validate_enquiry = Agent(
    name="validate_enquiry",
    role="Validate enquiries and detect potential spam",

    model=Gemini(id=GEMINI_MODEL),

    instructions=[
        "You are Sleek_ai's enquiry validation and spam detection specialist.",
        "Evaluate submitted enquiry details for spam indicators.",
        "Identify obvious dummy names such as Test123, ABC123, "
        "asdfgh, random keyboard patterns, and meaningless text.",
        "Identify obvious promotional, bot-generated, or "
        "irrelevant enquiry content.",
        "Check whether the submitted name is plausible.",
        "Use provided duplicate, submission frequency, "
        "and contact verification signals when available.",
        "Do not invent missing customer information.",
        "Do not classify a customer as spam solely because "
        "their name is unusual, short, or unfamiliar.",
        "Email and mobile formats are validated separately by Python.",
        "A plausible name or valid phone format does not "
        "prove that an enquiry is genuine.",
        "If no suspicious indicators are present, "
        "return VALID with is_spam=false.",
        "If strong spam indicators are present, "
        "return SPAM_SUSPECTED with is_spam=true.",
        "If information is insufficient or ambiguous, "
        "return REVIEW with is_spam=null.",
        "Use FIRST_TOUCHPOINT for VALID enquiries.",
        "Use HUMAN_REVIEW for uncertain enquiries.",
        "Use REJECT_ENQUIRY for strongly suspicious enquiries.",
        "Never automatically reject a customer based "
        "only on an LLM assessment.",
        "Return structured results only."
    ],

    response_model=EnquiryValidationResult,
    markdown=False,
    show_tool_calls=False,
)

