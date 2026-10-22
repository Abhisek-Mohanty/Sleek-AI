from phi.agent import Agent
from phi.model.google import Gemini
from app.core.config import GEMINI_API_KEY, GEMINI_MODEL
from app.agents.agents import *


import os
os.environ["GOOGLE_API_KEY"] = GEMINI_API_KEY

async def checkPoints(oModel):
    update_Agent = Agent(
        name="Logs creator in DataBase",
        model=Gemini(id=GEMINI_MODEL),
        instructions=[
            "You are the Database Manager",
            "Based on the oModel you will generate response and save the data",
        ],
        response_model=oModel,
        markdown=False,
    )
    return update_Agent