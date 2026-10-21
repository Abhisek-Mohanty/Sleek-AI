from phi.agent import Agent
from phi.model.google import Gemini
from app.core.config import GEMINI_API_KEY, GEMINI_MODEL


import os
os.environ["GOOGLE_API_KEY"] = GEMINI_API_KEY

manager = Agent(
    team=[],
    model=Gemini(id=GEMINI_MODEL),
    instructions=[
        "Always include sources",
        "Use tables to display data",
    ],
    show_tool_calls=True,
    markdown=True,
)