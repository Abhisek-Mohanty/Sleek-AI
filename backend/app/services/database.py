from app.agents.commit_worker.updateLogs import checkPoints
from app.db.repositories.base import BaseRepository
from starlette.exceptions import HTTPException



class DatabaseService(BaseRepository):
    async def databaseCommit(enquiry, actions):
        try:
            pass
            
        except HTTPException as error:
            raise error