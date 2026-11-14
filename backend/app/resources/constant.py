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