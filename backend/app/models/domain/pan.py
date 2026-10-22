from typing import Optional

from app.models.domain.rwmodel import Base

from sqlalchemy import Boolean, Column, ForeignKey, Integer, String,  Float , DateTime
from sqlalchemy.orm import relationship

class Pan(Base):
    __tablename__ = "Pans"
    id = Column("id", Integer, primary_key=True, index=True, autoincrement=True)
    enquiryId = Column("enquiryId", Integer, ForeignKey("enquiries.id")  ) 
    panNumber       = Column("panNumber", String, ForeignKey("BureauSoftpulls.panNumber"))
    fullName = Column("fullName", String ) 
    firstName = Column("firstName", String ) 
    lastName = Column("lastName", String ) 
    middleName = Column("middleName", String )
    status = Column("status", Boolean ) 
    category            = Column("category", String )
    fatherName          = Column("fatherName", String )
    crifLastChecked = Column("crifLastChecked", DateTime)
    crifScore = Column("cibilScore", Integer)
    creditBureauPath = Column("creditBureauPath", String)
    analyiseReportPath = Column("creditBureauPath", String)

    createdAt = Column("createdAt", DateTime ) 
    updatedAt = Column("updatedAt", DateTime ) 
    
    Enquiry = relationship("Enquiry", back_populates="Pan")
