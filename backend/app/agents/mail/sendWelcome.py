
from phi.agent import Agent
from phi.model.google import Gemini
from pydantic import BaseModel
from typing import Literal

from app.core.config import GEMINI_API_KEY, GEMINI_MODEL
import os

os.environ["GOOGLE_API_KEY"] = GEMINI_API_KEY


class SendWelcomeMailResult(BaseModel):
    status: Literal["READY", "HUMAN_REVIEW"]
    subject: str
    email_body: str
    cta_text: str
    next_action: Literal["SEND_EMAIL", "HUMAN_REVIEW"]


welcome_email_agent = Agent(
    name="welcome_email",
    role="Personalized enquiry welcome email specialist",

    model=Gemini(id=GEMINI_MODEL),

    instructions=[
        "You are Sleek_ai's customer onboarding communication specialist.",
        "Your job is to create a personalized welcome email "
        "for a customer who has submitted a loan enquiry.",
        "Use the customer's provided name and enquiry details "
        "to personalize the email.",
        "Start with a warm and professional welcome.",
        "Explain that Sleek_ai can help the customer understand "
        "their loan profile through free loan insights.",
        "Encourage the customer to submit their PAN through "
        "the secure Sleek_ai PAN submission form to receive "
        "their loan insights.",
        "Clearly explain why PAN is requested and how it will "
        "be used, based on the supplied privacy and consent information.",
        "Never ask the customer to reply to the email with their PAN.",
        "Never invent loan eligibility, credit scores, interest rates, "
        "approval chances, or financial benefits.",
        "Do not promise loan approval.",
        "Do not invent customer details or privacy commitments.",
        "Keep the email short, friendly, trustworthy, and professional.",
        "Do not generate or invent a PAN submission URL. "
        "The backend will append the secure form link.",
        "If essential information is missing, return HUMAN_REVIEW.",
        "Return structured results only."
    ],

    response_model=SendWelcomeMailResult,
    markdown=False,
    show_tool_calls=False,
)
