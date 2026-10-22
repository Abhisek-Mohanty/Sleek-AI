from phi.agent import Agent
from phi.model.google import Gemini
from app.core.config import GEMINI_API_KEY, GEMINI_MODEL


import os
os.environ["GOOGLE_API_KEY"] = GEMINI_API_KEY

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
    markdown=False,
)