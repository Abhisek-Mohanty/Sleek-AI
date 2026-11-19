
from app.agents.mail.sendWelcome import welcome_email_agent
from app.db.repositories.base import BaseRepository
from app.core.config import MSG91
import httpx


class WelcomeMailService(BaseRepository):

    def __init__(self):
        self.url = "https://control.msg91.com/api/v5/email/send"

        self.headers = {
            "accept": "application/json",
            "authkey": MSG91,
            "content-type": "application/json"
        }

    async def sendWelcomeMail(self, enquiry):

        try:
            name = enquiry.get("firstName")
            email = enquiry.get("email")

            loan_type = enquiry.get("loanType", "Loan")
            loan_amount = enquiry.get("loanAmount", "Not specified")

            # Step 1: Generate personalized email using Gemini
            prompt = f"""
            Generate a personalized welcome email for this applicant.

            Customer name: {name}
            Loan type: {loan_type}
            Loan amount: {loan_amount}

            Purpose:
            Welcome the customer to Sleek_ai.
            Explain the benefits of free loan insights.
            Encourage the customer to submit PAN securely.
            Never ask the customer to send PAN by email.

            Return subject, body and CTA text.
            """

            result = welcome_email_agent.run(prompt)
            mail = result.content

            # Step 2: Prepare MSG91 template variables
            payload = {
                "recipients": [
                    {
                        "to": [
                            {
                                "name": name,
                                "email": email
                            }
                        ],
                        "variables": {
                            "Client_Name": name,
                            "Email_Subject": mail.subject,
                            "Email_Body": mail.body,
                            "CTA_Text": mail.cta_text
                        }
                    }
                ],
                "from": {
                    "name": "Sleek AI",
                    "email": "info@08w1b4.mailer91.com"
                },
                "domain": "08w1b4.mailer91.com",
                "template_id": "welcome_mail_31"
            }

            # Step 3: Send through MSG91
            async with httpx.AsyncClient(timeout=20) as client:

                response = await client.post(
                    self.url,
                    json=payload,
                    headers=self.headers
                )

                response.raise_for_status()

                return {
                    "status": True,
                    "message": "Welcome email submitted",
                    "response": response.json()
                }

        except httpx.HTTPStatusError as error:
            return {
                "status": False,
                "message": "MSG91 email sending failed",
                "error": error.response.text
            }

        except Exception as error:
            return {
                "status": False,
                "message": "Welcome email generation or sending failed",
                "error": str(error)
            }
