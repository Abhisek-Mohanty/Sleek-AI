from enum import Enum

class USER_CONTEXT(Enum):
    AGENT    = 0 

class ENQUIRY_STATUS(Enum):
    NEW             = 1
    VALIDATED       = 2
    PAN_PENDING     = 3
    PAN_RECEIVED    = 4
    CRIF_REQUESTED  = 5
    CRIF_RECEIVED   = 6
    CATEGORIZED     = 7
    PRODUCT_SELECTED = 8
    PAYMENT_PENDING = 9
    APPLICANT       = 10
    REJECT          = 11
    CLOSED          = 12
    PAYMENT_ELIGIBLE = 99

class COMMUNICATION_TYPE(Enum):
    WELCOME_INITIAL = 1
class STATUS(Enum):
    SUCCESS = 1
    FAILED = 2

class FOLLOWUP_ACTION(Enum):
    VALIDATE = 1
    SEND_WELCOME = 2
    WAIT = 3
    REQUEST_PAN = 4
    REQUEST_CRIF = 5
    CHECK_CRIF = 6
    CATEGORIZE = 7
    ASK_PRODUCT = 8
    SALES_REVIEW = 9
    REQUEST_PAYMENT = 10
    VERIFY_PAYMENT = 11
    COMPLETE = 12
    HUMAN_REVIEW = 13
class FOLLOWUP_STATUS(Enum):
    ACTIVE = 1
    CLOSED = 2
    



ENQUIRY_STATUS_LIST = {
    1: "New",
    2: "Validated",
    3: "Pan Pending",
    4: "Pan Received",
    5: "Crif Requested",
    6: "Crif Received",
    7: "Categorized",
    8: "Product Selected",
    9: "Payament Pending",
    10: "Applicant"
}