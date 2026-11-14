from phi.agent import Agent
from phi.model.google import Gemini
from app.core.config import GEMINI_API_KEY, GEMINI_MODEL
from app.agents.agents import *


import os
os.environ["GOOGLE_API_KEY"] = GEMINI_API_KEY
async def mangerWork(enquiry:dict):
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
            markdown=False,
        )
        messages = manager.get_messages_for_run()
        print("\n\n\n\n\n",messages)
        print("\n\n\n\n\n",manager)
        result = manager.run(f"Analyze this customer enquiry and return the routing decision:\n{enquiry}")
        print("\n\n\n\n\n\n",result)
            # return manager
    except Exception as error:
        raise error