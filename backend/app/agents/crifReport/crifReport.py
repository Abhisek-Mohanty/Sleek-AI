
from phi.agent import Agent
from phi.model.google import Gemini
from pydantic import BaseModel, Field
from typing import Literal, Optional
from datetime import datetime

from app.core.config import GEMINI_API_KEY, GEMINI_MODEL
import os

os.environ["GOOGLE_API_KEY"] = GEMINI_API_KEY


class CrifDummyReportResult(BaseModel):
    generation_status: Literal["READY", "HUMAN_REVIEW"]
    panNumber: Optional[str] = None
    fullName: Optional[str] = None
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    middleName: Optional[str] = None
    fatherName: Optional[str] = None

    status: bool = True
    category: Optional[str] = None
    crifLastChecked: Optional[datetime] = None
    crifScore: Optional[int] = Field(default=None, ge=300, le=900)
    creditBureauPath: Optional[str] = None
    analyiseReportPath: Optional[str] = None
    html_content: Optional[str] = None


crif_dummy_report_agent = Agent(
    name="crif_dummy_report_generator",
    role="Simulated CRIF credit report generation specialist",
    model=Gemini(id=GEMINI_MODEL),

    instructions=[
        "You are Sleek AI's simulated credit report generator.",

        "Your task is to generate a professional HTML-based "
        "DUMMY credit report for demonstration purposes.",

        "IMPORTANT REPORT DISCLAIMER:",
        "- This is a simulated demonstration report.",
        "- Never claim that the report was fetched from CRIF.",
        "- Never represent simulated information as actual bureau data.",
        "- Display a prominent SIMULATED REPORT / DEMO watermark.",
        "- Clearly label all generated financial information as illustrative.",

        "CUSTOMER INFORMATION:",
        "- Use only the supplied customer identity details.",
        "- Never invent PAN, name, or father's name.",
        "- Do not expose the complete PAN in the HTML report.",
        "- Mask PAN in HTML, for example ABCDE****F.",
        "- If PAN or customer identity is missing, return HUMAN_REVIEW.",

        "DUMMY CREDIT DATA:",
        "- Generate illustrative credit score between 300 and 900.",
        "- Generate sample credit profile information.",
        "- Include illustrative loan account summaries.",
        "- Include sample payment history.",
        "- Include illustrative credit utilization.",
        "- Include sample credit enquiries.",
        "- Clearly mark every generated financial metric as DEMO DATA.",
        "- Never imply that generated information is the customer's "
        "actual credit history.",

        "HTML REPORT REQUIREMENTS:",
        "- Generate complete, valid HTML5 content.",
        "- Use professional financial dashboard styling.",
        "- Use inline CSS only.",
        "- Do not include JavaScript.",
        "- Do not use external CSS, images, or fonts.",
        "- Make the report responsive and printable.",
        "- Include a header with Sleek AI branding.",
        "- Include customer profile information.",
        "- Include a prominent simulated credit score section.",
        "- Include credit profile summary.",
        "- Include account summary table.",
        "- Include payment history summary.",
        "- Include credit utilization section.",
        "- Include recent enquiries section.",
        "- Include recommendations for improving credit health.",
        "- Include a prominent disclaimer at the bottom.",

        "OUTPUT RULES:",
        "- Return structured Pydantic output only.",
        "- Return READY when the report can be generated.",
        "- Return HUMAN_REVIEW when required identity information is missing.",
        "- Set next_action to HUMAN_REVIEW otherwise.",
        "- Set status to true for an active generated report.",
        "- Set crifLastChecked to the current report generation date.",
        "- Do not generate creditBureauPath or analyiseReportPath.",
        "- Backend will populate report file paths.",
        "- Put the complete HTML document inside html_content.",
        "- Do not wrap HTML content in Markdown code fences."
    ],

    response_model=CrifDummyReportResult,
    markdown=False,
    show_tool_calls=False,
)
