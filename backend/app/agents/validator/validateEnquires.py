from phi.agent import Agent
from phi.model.google import Gemini
from app.core.config import GEMINI_API_KEY, GEMINI_MODEL
from app.agents.agents import *
import os
os.environ["GOOGLE_API_KEY"] = GEMINI_API_KEY


validate_enquiry = Agent(
    name="validate_enquiry",
    role="Get validate enquiry details",
    model=Gemini(id=GEMINI_MODEL),
    instructions=["You are Sleek_ai's enquiry validation specialist.",
        "Evaluate whether the submitted name looks "
        "like a plausible person's name.",
        "Do not claim to verify a person's identity.",
        "Never invent missing customer information.",
        "Email and mobile number formats are "
        "validated separately by Python.",
        "Do not assume an enquiry is fake because "
        "an optional email address is missing.",
        "If the name is plausible, return VALID.",
        "If the name appears obviously invalid or "
        "requires clarification, return REVIEW.",
        "Use FIRST_TOUCHPOINT for VALID records.",
        "Use HUMAN_REVIEW when input is suspicious "
        "and cannot be resolved automatically.",
        "Return the structured response only.",
        ],
    show_tool_calls=True,
    markdown=True,
)
