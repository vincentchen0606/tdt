from fastapi import *
from fastapi.responses import FileResponse, JSONResponse

from fastapi import FastAPI, HTTPException
from mysql.connector import connect
from pydantic import BaseModel
from typing import List, Optional
class ErrorResponse(BaseModel):
    error: bool = True
    message: str
class Attraction(BaseModel):
    id: int
    name: str
    category: str
    description: str
    address: str
    transport: str
    mrt: str
    lat: float
    lng: float
    images: List[str]

class AttractionsResponse(BaseModel):
	data: List[Attraction]
	nextPage: Optional[int]
app=FastAPI()

#connect to MySQL

#MRT station
#/api/mrts　取得捷運站名稱列表　按照週邊景點數量由大到小
@app.get("/api/mrts", response_model=dict, responses={
    200: {"description": "正常運作"},
    500: {
        "description": "伺服器內部錯誤",
        "model": ErrorResponse,
        "content": {
            "application/json": {
                    "error": True,
                    "message": "請按照情境提供對應的錯誤訊息"
            }
        }
    }
})
async def get_mrts():
    try:
        # 連接資料庫
        db = connect(
            host="35.95.173.135", #Elastic IP
            user="root",
            password="abc123456",
            database="taipei_attraction"
        )
        
        # 建立游標
        cursor = db.cursor()
        
        # 執行SQL查詢，統計每個捷運站的景點數量，並按數量降序排列
        query = """
            SELECT mrt, COUNT(*) AS attraction_count
            FROM attractions
            GROUP BY mrt
            ORDER BY attraction_count DESC
        """
        cursor.execute(query)
        
        # 取得查詢結果
        results = cursor.fetchall()
        
        # 提取捷運站名稱，組成列表
        mrts = [result[0] for result in results]
        
        # 關閉游標和資料庫連接
        cursor.close()
        db.close()
        
        # 回傳符合規格的JSON格式結果
        return {"data": mrts}
    
    except Exception as e:
    # 處理異常情況，回傳符合規格的錯誤訊息
    	return {"error": True, "message": str(e)}

#Attraction
#/api/attractions　取得景點資料列表　並可以query sting
@app.get("/api/attractions", response_model=AttractionsResponse, responses={
    200: {"description": "正常運作"},
    500: {
        "description": "伺服器內部錯誤",
        "model": ErrorResponse,
        "content": {
            "application/json": {
                    "error": True,
                    "message": "請按照情境提供對應的錯誤訊息"
            }
        }
    }
})
async def get_attractions(
    page: int = Query(0, ge=0, description="要取得的分頁，每一頁 12 筆資料"),
    keyword: Optional[str] = Query(None, description="用來完全比對 mrt、或模糊比對 name 的關鍵字，沒有給定則不做篩選")
):
    try:
        db = connect(
            host="127.0.0.1",
            user="root",
            password="abc123456",
            database="taipei_attraction"
        )
        cursor = db.cursor()
        
        # 建立 SQL 查詢語句
        query = """
            SELECT id, name, category, description, address, transport, mrt, lat, lng, images
            FROM attractions
        """
        
        # 根據關鍵字建立篩選條件
        if keyword:
            query += " WHERE mrt = %s OR name LIKE %s"
            params = (keyword, f"%{keyword}%")
        else:
            params = ()
        
        # 添加分頁條件
        offset = page * 12
        query += " LIMIT %s, 12"
        params += (offset,)
        
        cursor.execute(query, params)
        results = cursor.fetchall()
        
        # 將結果轉換為 Attraction 物件列表
        attractions = []
        for result in results:
            
            attraction = Attraction(
                id=result[0],
                name=result[1],
                category=result[2],
                description=result[3],
                address=result[4],
                transport=result[5],
                mrt=result[6],
                lat=result[7],
                lng=result[8],
                images=result[9].strip("[]").replace("\"", "").split(", ")
            )
            attractions.append(attraction)
        
        # 計算下一頁的頁碼
        next_page = page + 1 if len(attractions) == 12 else None
        
        cursor.close()
        db.close()
        
        return AttractionsResponse(data=attractions,nextPage=next_page)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=ErrorResponse(message=str(e)).dict())

#/api/attraction/{attractionId} 根據景點編號取得景點資料
@app.get("/api/attraction/{attractionId}", response_model=dict, responses={
    200: {"description": "正常運作"},
    400: {
        "description": "景點編號不正確",
        "model": ErrorResponse,
        "content": {
            "application/json": {
                    "error": True,
                    "message": "請按照情境提供對應的錯誤訊息"
            }
        }
    },
    500: {
        "description": "伺服器內部錯誤",
        "model": ErrorResponse,
        "content": {
            "application/json": {
                "example": {
                    "error": True,
                    "message": "請按照情境提供對應的錯誤訊息"
                }
            }
        }
    }
})
async def get_attraction(attractionId: int):
    try:
        db = connect(
            host="127.0.0.1",
            user="root",
            password="abc123456",
            database="taipei_attraction"
        )
        cursor = db.cursor()
        
        query = """
            SELECT id, name, category, description, address, transport, mrt, lat, lng, images
            FROM attractions
            WHERE id = %s
        """
        cursor.execute(query, (attractionId,))
        result = cursor.fetchone()
        
        if result is None:
            return JSONResponse(
				status_code=400,
				content={
					"error": True,
					"message": "請按照情境提供對應的錯誤訊息"
				}
			)
        
        attraction = Attraction(
            id=result[0],
            name=result[1],
            category=result[2],
            description=result[3],
            address=result[4],
            transport=result[5],
            mrt=result[6],
            lat=result[7],
            lng=result[8],
            images=result[9].strip("[]").replace("\"", "").split(", ")
        )
        
        cursor.close()
        db.close()
        
        return {"data":attraction}
    
    except Exception as e:
        return JSONResponse(status_code=500, content=ErrorResponse(message=str(e)).dict())

# Static Pages (Never Modify Code in this Block)
@app.get("/", include_in_schema=False)
async def index(request: Request):
	return FileResponse("./static/index.html", media_type="text/html")
@app.get("/attraction/{id}", include_in_schema=False)
async def attraction(request: Request, id: int):
	return FileResponse("./static/attraction.html", media_type="text/html")
@app.get("/booking", include_in_schema=False)
async def booking(request: Request):
	return FileResponse("./static/booking.html", media_type="text/html")
@app.get("/thankyou", include_in_schema=False)
async def thankyou(request: Request):
	return FileResponse("./static/thankyou.html", media_type="text/html")