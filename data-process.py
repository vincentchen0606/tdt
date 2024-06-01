# load raw data from taipei-attractions.json and save toMySQL db.
#For the image URLs of each attractions.filter out URLs which without JPG/jpg or PNG/png
import json
import mysql.connector
# 建立與 MySQL 資料庫的連接
cnx = mysql.connector.connect(user='root', password='abc123456', host='127.0.0.1', port=3306, database='taipei_attraction', autocommit=False)
cursor = cnx.cursor()
# 讀取 JSON 檔案
with open('data/taipei-attractions.json', 'r', encoding='utf-8') as file:
    data = json.load(file)

# 遍歷 JSON 資料中的每個景點
for attraction in data['result']['results']:
    name = attraction['name']
    description = attraction['description']
    address = attraction['address']
    mrt = attraction.get('MRT', '')  # 如果 'MRT' 欄位不存在，則使用空字串作為預設值
    category = attraction['CAT']
    transport = attraction['direction']
    images = [url for url in attraction['file'].split('https://') if url.lower().endswith(('.jpg', '.png'))]
    images = ['https://' + url for url in images]
    lat = attraction['latitude']
    lng = attraction['longitude']

    # 將資料插入到 MySQL 資料庫中
    images_json = json.dumps(images)
    query = "INSERT INTO attractions (name, description, address, transport, mrt, category, lat, lng, images) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)"
    values = (name, description, address, transport, mrt, category, lat, lng, images_json)
    cursor.execute(query, values)

# 提交資料庫變更並關閉連接
cnx.commit()
cursor.close()
cnx.close()



