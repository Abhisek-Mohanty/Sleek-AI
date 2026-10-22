from typing import Optional

from app.models.domain.rwmodel import Base

from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, DateTime
from sqlalchemy.orm import relationship

class ActionLog(Base):
    __tablename__ = "ActionLogs"
    id = Column("id", Integer, primary_key=True, index=True, autoincrement=True)
    enquiryId = Column("enquiryId", Integer, ForeignKey("enquiries.id")  ) 
    agentName       = Column("agentName", String)
    comment       = Column("comment", String)
    actionType      = Column("actionType", Integer) 
    createdAt = Column("createdAt", DateTime ) 
    updatedAt = Column("updatedAt", DateTime ) 


    Enquiry = relationship("Enquiry", back_populates="ActionLog")
    
    