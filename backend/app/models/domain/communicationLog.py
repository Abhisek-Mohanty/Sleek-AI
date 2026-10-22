from typing import Optional

from app.models.domain.rwmodel import Base

from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, DateTime
from sqlalchemy.orm import relationship

class CommunicationLog(Base):
    __tablename__ = "CommunicationLogs"
    id = Column("id", Integer, primary_key=True, index=True, autoincrement=True)
    enquiryId = Column("enquiryId", Integer, ForeignKey("enquiries.id")  ) 
    communicationType      = Column("communicationType", Integer) 
    message = Column("message", String ) 
    status = Column("status", Integer ) 
    createdAt = Column("createdAt", DateTime ) 
    updatedAt = Column("updatedAt", DateTime ) 


    Enquiry = relationship("Enquiry", back_populates="ActionLog")
    
    