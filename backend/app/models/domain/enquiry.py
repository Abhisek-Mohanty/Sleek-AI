from typing import Optional

from app.models.domain.rwmodel import Base

from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, DateTime
from sqlalchemy.orm import relationship

class Enquiry(Base):
    __tablename__ = "Enquiries"
    id = Column("id", Integer, primary_key=True, index=True, autoincrement=True)
    enquiryNumber   = Column("enquiryNumber", String)
    firstName       = Column("firstName", String)
    lastName        = Column("lastName", String)
    mobile          = Column("mobile", String)
    email           = Column("email", String)
    status          = Column("status", Integer)
    sourceType      = Column("sourceType", Integer)
    createdAt = Column("createdAt", DateTime ) 
    updatedAt = Column("updatedAt", DateTime )

    ActionLog         = relationship("ActionLog", back_populates="Enquiry")
    CommunicationLog         = relationship("CommunicationLog", back_populates="Enquiry")
    Followup         = relationship("Followup", back_populates="Enquiry")
    Pan         = relationship("Pan", back_populates="Enquiry")



