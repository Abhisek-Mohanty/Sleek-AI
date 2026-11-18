from phi.agent import Agent
from phi.model.google import Gemini
from app.core.config import GEMINI_API_KEY, GEMINI_MODEL
from app.agents.agents import *
from app.models.domain import enquiry
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
    "Validate enquiry details in the following sequence:",
    
    "STEP 1: MOBILE NUMBER VALIDATION",
    "Identify obvious dummy mobile numbers.",
    "Flag numbers containing all repeated digits, such as 9999999999 or 1111111111.",
    "Flag sequential ascending numbers, such as 1234567890.",
    "Flag sequential descending numbers, such as 9876543210.",
    "Flag repeated sequences, such as 1212121212 or 1231231231.",
    "Flag numbers containing mostly repeated or predictable patterns.",
    "Do not assume a mobile number belongs to the applicant just because its format is valid.",
    "Mobile format and OTP verification are handled separately by Python.",

    "STEP 2: NAME VALIDATION",
    "Identify dummy names such as XYZ, ABC, Test, Testing, Demo, Admin, and Unknown.",
    "Identify names containing obvious random text or keyboard patterns such as asdfgh, qwerty, and zxcv.",
    "Identify names containing numbers, such as Test123 or ABC123.",
    "Identify meaningless repeated characters, such as AAAAA or XXXXXX.",
    "Do not reject genuine customers because their names are short, unfamiliar, or culturally uncommon.",

    "STEP 3: ENQUIRY CONTENT VALIDATION",
    "Identify promotional messages, bot-generated content, random text, and irrelevant enquiries.",
    "Check duplicate submissions and submission frequency when those signals are provided.",
    "Do not invent missing customer information.",

    "STEP 4: FINAL DECISION",
    "If obvious dummy or suspicious indicators are found, assess the overall evidence.",
    "If strong spam indicators are present, return REJECT with is_spam=true and next_action=REJECT_ENQUIRY.",
    "If information is suspicious but inconclusive, return REVIEW with is_spam=null and next_action=HUMAN_REVIEW.",
    "If no suspicious indicators are present, return VALIDATED with is_spam=false and next_action=FIRST_TOUCHPOINT.",
    "Never automatically reject a customer based only on an uncertain AI assessment.",
    "Return structured results only."
],

    response_model=EnquiryValidationResult,
    markdown=True,
    show_tool_calls=True,
    add_datetime_to_instructions=True,
)


