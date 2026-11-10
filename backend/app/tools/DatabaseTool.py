from phi.tools import Toolkit
from app.db.repositories.base import BaseRepository
from starlette.exceptions import HTTPException
from app.resources.helper.moment import Moment
from app.resources.helper.common import *
from typing import Any, Optional
from app.resources.constant import USER_CONTEXT



class DataBaseTool(Toolkit):
    """

    DataBaseTool is a toolkit for update database by model

    """

    def __init__(self,
               Create:bool = True,
               Update:bool = True,
               oModel:str = "",
               Payload:dict = None,
               base_repo:Any = None
                 ):
        super().__init__(name = "databasetool")
        self.payload = Payload
        self.oModel = oModel
        self.br = base_repo
        if Create:
            self.register(self.create_database)
        if Update:
            self.register(self.update_database)
    def update_database(self, id:int):
        try:
            oModel = globals().get(self.oModel)
            if not oModel:
                return False
            oLog = self.br.db_session.query(
                        oModel
                    ).filter(
                        oModel.id == id 
                    ).first()
            if oLog:
                oLog = self.mapDataToModel(oLog,self.payload)
                oLog.updatedAt = Moment().now
                oLog = self.br.save(oLog)
                self.br.db_session.commit()
                return True
            else:
                self.br.db_session.rollback()
                return False
            
        except Exception as error:
            self.br.db_session.rollback()
            print("update_database------> ToolKit",error)
            return False

    def create_database(self):
        try:
            oModel = globals().get(self.oModel)
            if not oModel:
                return False
            oLog = self.mapDataToModel(oModel(),self.payload)
            oLog.createdAt = Moment().now
            oLog.updatedAt = Moment().now
            oLog = self.br.save(oLog)
            self.br.db_session.commit()
            return True
            
        except Exception as error:
            self.br.db_session.rollback()
            print("create_database------> ToolKit",error)
            return False

    def mapDataToModel(self, oModel, oData, user = None, fieldList = []) -> Any:
        now = Moment().now
        if(len(fieldList) > 0):
            for key  in fieldList:
                # if oData.get(key) and hasattr(oModel,key) and key != "id" and ( type(oData.get(key)) is not dict and type(oData.get(key)) is not list ):
                if hasattr(oModel,key) and key != "id" and ( type(oData.get(key)) is not dict and type(oData.get(key)) is not list ):
                    setattr(oModel, key , oData.get(key))
        else:
            for key  in oData:
                if hasattr(oModel,key) and key != "id" and ( type(oData.get(key)) is not dict and type(oData.get(key)) is not list ):
                    # if(type(getattr(oModel, key)) == type(None)):
                    try:
                        setattr(oModel, key , oData.get(key))
                    except:
                        pass
        if oModel:
            oModel.updatedBy   = user.id if user and user.context == USER_CONTEXT.AGENT.value else None
            oModel.updatedAt   = now
            if oModel.createdBy == None:
                oModel.createdBy   = user.id  if user and user.context == USER_CONTEXT.AGENT.value else None
            if oModel.createdAt is None:
                oModel.createdAt   = now

        return oModel


