
from enum import Enum
from pydantic import BaseModel


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


class LeadState(BaseModel):
    enquiry_id: str
    status: str


class ManagerDecision(BaseModel):
    specialist: str
    action: Action
    reason: str


def decisionMaker(state: LeadState) -> ManagerDecision:

    status = state.status

    if status in {"OPTED_OUT", "CLOSED"}:
        return ManagerDecision(
            specialist="none",
            action=Action.COMPLETE,
            reason="Enquiry is closed",
        )

    if status == "NEW_ENQUIRY":
        return ManagerDecision(
            specialist="validation",
            action=Action.VALIDATE,
            reason="Validate enquiry details",
        )

    if status == "VALIDATED":
        return ManagerDecision(
            specialist="communication",
            action=Action.SEND_WELCOME,
            reason="Initiate permitted first contact",
        )

    if status == "PAN_PENDING":
        return ManagerDecision(
            specialist="pan_crif",
            action=(
                Action.WAIT if state.pan_collected
                else Action.REQUEST_PAN
            ),
            reason="Secure PAN collection",
        )

    if status == "PAN_RECEIVED":
        return ManagerDecision(
            specialist="pan_crif",
            action=Action.REQUEST_CRIF,
            reason="Authorized CRIF request",
        )

    if status == "CRIF_REQUESTED":
        return ManagerDecision(
            specialist="pan_crif",
            action=Action.CHECK_CRIF,
            reason="Check pending report status",
        )

    if status == "CRIF_RECEIVED":
        return ManagerDecision(
            specialist="categorization",
            action=Action.CATEGORIZE,
            reason="Apply approved category rules",
        )

    if status == "CATEGORIZED":
        return ManagerDecision(
            specialist="communication",
            action=Action.ASK_PRODUCT,
            reason="Request customer's product interest",
        )

    if status == "PRODUCT_SELECTED":
        return ManagerDecision(
            specialist="sales",
            action=Action.SALES_REVIEW,
            reason="Explain product and next steps",
        )

    if status == "PAYMENT_ELIGIBLE":
        if not state.fee_collection_approved:
            return ManagerDecision(
                specialist="human",
                action=Action.HUMAN_REVIEW,
                reason="Fee collection not approved",
            )
        return ManagerDecision(
            specialist="payment",
            action=Action.REQUEST_PAYMENT,
            reason="Issue permitted payment request",
        )

    if status == "PAYMENT_PENDING":
        return ManagerDecision(
            specialist="payment",
            action=Action.VERIFY_PAYMENT,
            reason="Check authoritative payment result",
        )

    if status == "APPLICANT":
        return ManagerDecision(
            specialist="none",
            action=Action.COMPLETE,
            reason="Applicant created",
        )

    return ManagerDecision(
        specialist="none",
        action=Action.WAIT,
        reason="Await a new event or scheduled follow-up",
    )
