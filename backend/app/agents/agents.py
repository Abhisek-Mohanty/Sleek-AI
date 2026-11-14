
from enum import Enum
from pydantic import BaseModel
from phi.tools import Toolkit
from app.resources.constant import *


class Action(str, Enum):
    VALIDATE = "validate_enquiry"
    SEND_WELCOME = "send_welcome"
    WAIT = "wait_for_customer"
    REQUEST_PAN = "request_pan"
    REQUEST_CRIF = "request_crif"
    CHECK_CRIF = "check_crif"
    CATEGORIZE = "categorize_customer"
    ASK_PRODUCT = "ask_product"
    SALES_REVIEW = "sales_review"
    REQUEST_PAYMENT = "request_payment"
    VERIFY_PAYMENT = "verify_payment"
    COMPLETE = "complete"
    HUMAN_REVIEW = "human_review"


class ManagerDecision(BaseModel):
    specialist: str
    action: Action
    reason: str


class DecisionMaker(Toolkit):

    def __init__(self, enquiry: dict):
        super().__init__(name="DecisionMaker")

        self.enquiry = enquiry

        # Register the tool; do not execute it here.
        self.register(self.takeDecision)

    def takeDecision(self) -> dict:
        enquiry = self.enquiry
        status = enquiry.get("status")

        if status in [
            ENQUIRY_STATUS.REJECT.value,
            ENQUIRY_STATUS.CLOSED.value
        ]:
            decision = ManagerDecision(
                specialist="none",
                action=Action.COMPLETE,
                reason="Enquiry is closed"
            )

        elif status == ENQUIRY_STATUS.NEW.value:
            decision = ManagerDecision(
                specialist="validation",
                action=Action.VALIDATE,
                reason="Validate enquiry details"
            )

        elif status == ENQUIRY_STATUS.VALIDATED.value:
            decision = ManagerDecision(
                specialist="communication",
                action=Action.SEND_WELCOME,
                reason="Initiate permitted first contact"
            )

        elif status == ENQUIRY_STATUS.PAN_PENDING.value:
            decision = ManagerDecision(
                specialist="pan_crif",
                action=(
                    Action.WAIT
                    if enquiry.get("pan_collected")
                    else Action.REQUEST_PAN
                ),
                reason="Secure PAN collection"
            )

        elif status == ENQUIRY_STATUS.PAN_RECEIVED.value:
            decision = ManagerDecision(
                specialist="pan_crif",
                action=Action.REQUEST_CRIF,
                reason="Authorized CRIF request"
            )

        elif status == ENQUIRY_STATUS.CRIF_REQUESTED.value:
            decision = ManagerDecision(
                specialist="pan_crif",
                action=Action.CHECK_CRIF,
                reason="Check pending report status"
            )

        elif status == ENQUIRY_STATUS.CRIF_RECEIVED.value:
            decision = ManagerDecision(
                specialist="categorization",
                action=Action.CATEGORIZE,
                reason="Apply approved category rules"
            )

        elif status == ENQUIRY_STATUS.CATEGORIZED.value:
            decision = ManagerDecision(
                specialist="communication",
                action=Action.ASK_PRODUCT,
                reason="Request customer's product interest"
            )

        elif status == ENQUIRY_STATUS.PRODUCT_SELECTED.value:
            decision = ManagerDecision(
                specialist="sales",
                action=Action.SALES_REVIEW,
                reason="Explain product and next steps"
            )

        elif status == ENQUIRY_STATUS.PAYMENT_ELIGIBLE.value:
            if not enquiry.get("fee_collection_approved", False):
                decision = ManagerDecision(
                    specialist="human",
                    action=Action.HUMAN_REVIEW,
                    reason="Fee collection not approved"
                )
            else:
                decision = ManagerDecision(
                    specialist="payment",
                    action=Action.REQUEST_PAYMENT,
                    reason="Issue permitted payment request"
                )

        elif status == ENQUIRY_STATUS.PAYMENT_PENDING.value:
            decision = ManagerDecision(
                specialist="payment",
                action=Action.VERIFY_PAYMENT,
                reason="Check authoritative payment result"
            )

        elif status == ENQUIRY_STATUS.APPLICANT.value:
            decision = ManagerDecision(
                specialist="none",
                action=Action.COMPLETE,
                reason="Applicant created"
            )

        else:
            decision = ManagerDecision(
                specialist="none",
                action=Action.WAIT,
                reason="Await a new event or scheduled follow-up"
            )

        return decision.model_dump_json()
