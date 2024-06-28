from fastapi import *
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi import FastAPI, HTTPException
from mysql.connector import connect
from pydantic import BaseModel
from typing import List, Optional

# 
from datetime import datetime, timedelta

# 在檔案開頭導入所需的模組
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
import jwt
import json
from pydantic import BaseModel


# 
#for static file
from fastapi.staticfiles import StaticFiles
class ErrorResponse(BaseModel):
    error: bool = True
    message: str
# fastapi參數驗證
class Attraction(BaseModel): 
    id: int
    name: str
    category: str
    description: str
    address: str
    transport: str
    mrt: Optional[str]  # 允許 mrt 為 Null
    lat: float
    lng: float
    images: List[str]

class AttractionsResponse(BaseModel):
	data: List[Attraction]
	nextPage: Optional[int]
class UserSignUp(BaseModel):
    # 因nullable:true 故Optional[str]表可以為null
    name: Optional[str]
    email: Optional[str]
    password: Optional[str]
class User(BaseModel):
     id: Optional[int]
     name: Optional[str]
     email: Optional[str]

app=FastAPI()
# 註冊靜態文件，讓程式可以從static檔案偵測到CSS檔
app.mount("/static", StaticFiles(directory="static"), name="static")
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
            host="127.0.0.1", 
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

# USER POST /api/user
@app.post("/api/user", responses={
    200: {"description": "註冊成功",
          "content": {
            "application/json": {
                    "ok": True,
            }
        }},
    400: {
        "description": "註冊失敗，重複的 Email 或其他原因",
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
                    "error": True,
                    "message": "請按照情境提供對應的錯誤訊息"
            }
        }
    }
})
async def signup(user: UserSignUp):
    try:
        db = connect(
            host="127.0.0.1",
            user="root",
            password="abc123456",
            database="taipei_attraction"
        )
        cursor = db.cursor()

        # 檢查 email 是否已經存在
        query = "SELECT * FROM member_system WHERE email = %s"
        cursor.execute(query, (user.email,))
        result = cursor.fetchone()

        if result:
            cursor.close()
            db.close()
            return JSONResponse(
                status_code=400,
                content={
                    "error": True,
                    "message": "該 Email 已經被註冊過了"
                }
            )

        # 將用戶資料插入資料庫
        query = "INSERT INTO member_system (name, email, password) VALUES (%s, %s, %s)"
        cursor.execute(query, (user.name, user.email, user.password))
        db.commit()

        cursor.close()
        db.close()

        return JSONResponse(
            status_code=200,
            content={
                "ok": True
            }
        )

    

    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "error": True,
                "message": f"伺服器內部錯誤：{str(e)}"
            }
        )



# USER GET /api/user/auth 每一頁的登入狀態驗證
JWT_SECRET = "your_jwt_secret_key"  # 要另外弄個檔案去存放，不要上到版控
JWT_ALGORITHM = "HS256"

def get_current_user(authorization: str = Header(None)):
    if not authorization:
        return None
    try:
        token = authorization.split(" ")[1]
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return {
            "id": payload["id"],
            "name": payload["name"],
            "email": payload["email"]
        }
    except:
        return None
@app.get("/api/user/auth")
# 依賴注入
async def get_user_auth(user_data: dict = Depends(get_current_user)):
    if user_data is None:
        return JSONResponse(content={"data": None})
    return JSONResponse(content={"data": user_data})

# USER PUT /api/user/auth
# 定義 OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/user/auth")

class UserSignIn(BaseModel):
    email: str
    password: str

@app.put("/api/user/auth", response_model=dict, responses={
    200: {"description": "登入成功"},
    400: {
        "description": "登入失敗,帳號或密碼錯誤",
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
                "error": True,
                "message": "請按照情境提供對應的錯誤訊息"
            }
        }
    }
})
async def signin(user: UserSignIn):
    try:
        db = connect(
            host="127.0.0.1",
            user="root",
            password="abc123456",
            database="taipei_attraction"
        )
        cursor = db.cursor()

        query = "SELECT id, name, email, password FROM member_system WHERE email = %s"
        cursor.execute(query, (user.email,))
        result = cursor.fetchone()

        if not result:
            cursor.close()
            db.close()
            return JSONResponse(
                status_code=400,
                content={
                    "error": True,
                    "message": "帳號或密碼錯誤"
                }
            )

        user_id, name, email, hashed_password = result

        if user.password != hashed_password:
            cursor.close()
            db.close()
            return JSONResponse(
                status_code=400,
                content={
                    "error": True,
                    "message": "帳號或密碼錯誤"
                }
            )


        # 生成 JWT token
        expiration = datetime.utcnow() + timedelta(days=7)
        token = jwt.encode(
            {"id": user_id, "name": name, "email": email, "exp": expiration},
            JWT_SECRET,
            algorithm=JWT_ALGORITHM
        )

        cursor.close()
        db.close()

        return {"token": token}

    except HTTPException as e:
        raise e

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"伺服器內部錯誤：{str(e)}",
            headers={"WWW-Authenticate": "Bearer"}
        )

# Booking GET /api/booking 取得尚未確認下單的預定行程
@app.get("/api/booking", response_model=dict, responses={
    200: {"description": "建立成功"},
    403: {
         "description": "未登入系統，拒絕存取",
        "model": ErrorResponse,
        "content": {
            "application/json": {
                "error": True,
                "message": "請按照情境提供對應的錯誤訊息"
            }
        }
    }
})
async def get_booking(user_data: dict = Depends(get_current_user)):
    if user_data is None:
        return JSONResponse(
            status_code=403,
            content={
                "error": True,
                "message": "未登入系統，拒絕存取"
            }
        )
    user_id = user_data["id"]
    try:
        db = connect(
            host="127.0.0.1",
            user="root",
            password="abc123456",
            database="taipei_attraction"
        )
        cursor = db.cursor()

        # 查詢該使用者的預定行程資料
        query = """
            SELECT b.date, b.time, b.price, a.id, a.name, a.address, JSON_EXTRACT(a.images, '$[0]') AS image
            FROM bookings b
            JOIN attractions a ON b.attraction_id = a.id
            WHERE b.user_id = %s
        """
        cursor.execute(query, (user_id,))
        result = cursor.fetchone()

        if result:
            booking_data = {
                "attraction": {
                    "id": result[3],
                    "name": result[4],
                    "address": result[5],
                    "image": result[6].strip('\"').rstrip('\\') #使用strip('\"')去除開頭的雙引號。接著，使用rstrip('\\')去除末尾的反斜線
                },
                "date": result[0].strftime("%Y-%m-%d"),  # 將日期轉換為字串格式,
                "time": result[1],
                "price": int(result[2])  # 將 Decimal 轉換為 整數
            }
            return JSONResponse(
                status_code=200,
                content={
                    "data": booking_data
                }
            )
        else:
            return JSONResponse(
                status_code=200,
                content={
                    "data": None
                }
            )

    except Exception as e:
        if "Incorrect integer value" in str(e) or "Incorrect date value" in str(e):
            return JSONResponse(
                status_code=400,
                content={
                    "error": True,
                    "message": "輸入格式錯誤"
                }
            )
        else:
            return JSONResponse(
                status_code=500,
                content={
                    "error": True,
                    "message": f"伺服器內部錯誤：{str(e)}"
                }
            )
class BookingData(BaseModel):
    attractionId: int
    date: str
    time: str
    price: int
# Booking POST /api/booking 建立新的預定行程
@app.post("/api/booking", response_model=dict, responses={
    200: {"description": "建立成功"},
    400: {
        "description": "建立失敗，輸入不正確或其他原因",
        "model": ErrorResponse,
        "content": {
            "application/json": {
                "error": True,
                "message": "請按照情境提供對應的錯誤訊息"
            }
        }
    },
    403: {
         "description": "未登入系統，拒絕存取",
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
                "error": True,
                "message": "請按照情境提供對應的錯誤訊息"
            }
        }
    }
})
async def create_booking(booking: BookingData, user_data: dict = Depends(get_current_user)):
    if user_data is None:
        return JSONResponse(
            status_code=403,
            content={
                "error": True,
                "message": "未登入系統，拒絕存取"
            }
        )

    user_id = user_data["id"]

    try:
        db = connect(
            host="127.0.0.1",
            user="root",
            password="abc123456",
            database="taipei_attraction"
        )
        cursor = db.cursor()

        # 檢查該使用者是否已有預定行程
        query = "SELECT * FROM bookings WHERE user_id = %s"
        cursor.execute(query, (user_id,))
        result = cursor.fetchone()

        if result:
            # 如果已有預定行程，先刪除舊的行程資料
            delete_query = "DELETE FROM bookings WHERE user_id = %s"
            cursor.execute(delete_query, (user_id,))
            db.commit()

        # 將新的預定行程資料寫入資料庫　
        #因為AUTO_INCREMENT 屬性定義主鍵時，該列的值會自動遞增。
        #當你刪除某些資料並插入新資料時，MySQL 並不會重複使用已刪除的主鍵值，而是繼續遞增主鍵值。
        insert_query = "INSERT INTO bookings (user_id, attraction_id, date, time, price) VALUES (%s, %s, %s, %s, %s)"
        cursor.execute(insert_query, (user_id, booking.attractionId, booking.date, booking.time, booking.price))
        db.commit()

        cursor.close()
        db.close()

        return JSONResponse(
            status_code=200,
            content={
                "ok": True
            }
        )

    except Exception as e:
        if "Incorrect integer value" in str(e) or "Incorrect date value" in str(e):
            return JSONResponse(
                status_code=400,
                content={
                    "error": True,
                    "message": "輸入格式錯誤"
                }
            )
        else:
            return JSONResponse(
                status_code=500,
                content={
                    "error": True,
                    "message": f"伺服器內部錯誤：{str(e)}"
                }
            )

# Booking DELETE /api/booking 刪除目前的預定行程
@app.delete("/api/booking", response_model=dict, responses={
    200: {"description": "建立成功"},
    403: {
        "description": "未登入系統，拒絕存取",
        "model": ErrorResponse,
        "content": {
            "application/json": {
                "error": True,
                "message": "請按照情境提供對應的錯誤訊息"
            }
        }
    }
})
async def delete_booking(user_data: dict = Depends(get_current_user)):
    if user_data is None:
        return JSONResponse(
            status_code=403,
            content={
                "error": True,
                "message": "未登入系統，拒絕存取"
            }
        )

    user_id = user_data["id"]

    try:
        db = connect(
            host="127.0.0.1",
            user="root",
            password="abc123456",
            database="taipei_attraction"
        )
        cursor = db.cursor()

        # 檢查該使用者是否已有預定行程
        query = "SELECT * FROM bookings WHERE user_id = %s"
        cursor.execute(query, (user_id,))
        result = cursor.fetchone()

        if result:
            # 如果已有預定行程，先刪除舊的行程資料
            delete_query = "DELETE FROM bookings WHERE user_id = %s"
            cursor.execute(delete_query, (user_id,))
            db.commit()

        return JSONResponse(
            status_code=200,
            content={
                "ok": True
            }
        )

    except Exception as e:
    # 處理異常情況，回傳符合規格的錯誤訊息
    	return {"error": True, "message": str(e)}


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