from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime, text
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, RedirectResponse, HTMLResponse


password = '2aoySvGG=18!s9oNE}PB'
engine = create_engine(f"mysql+mysqlconnector://root:{password}@localhost/inventory")
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

app = FastAPI()
app.mount("/app", StaticFiles(directory="app"), name="app")

# Enable CORS for all origins (you might want to restrict this in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@app.get("/")
def read_root():
    return FileResponse("app/index.html")

@app.get("/product_types")
async def get_product_types():
    all_types = []
    db = SessionLocal()
    query = text("SELECT type_id, type_name FROM product_types")
    all_types_query = db.execute(query).fetchall()
    db.commit()
    for p_type in all_types_query:
        all_types.append({"type_name": p_type[1]})
    return all_types

@app.get("/product_names/{productType}")
async def get_productsNames(productType: str):
    all_products = []
    db = SessionLocal()
    meta = {"product_type": productType}
    query_type = text("SELECT products.product_name, products.product_size, stock.stock_count  FROM products JOIN stock on products.product_id = stock.product_id WHERE products.product_typename = :product_type")
    all_types_query = db.execute(query_type, meta).fetchall()
    db.commit()
    for product in all_types_query:
        all_products.append({"product_name": product[0], "product_size": product[1], "quantity": product[2]})
    return all_products

@app.put("/updateStock/{productType}/{productName}/{quantity}")
async def update_stock(productType: str, productName: str, quantity: int):
    db = SessionLocal()
    meta = {"product_type": productType, "product_name": productName, "quantity": quantity}
    query = text("SELECT product_id FROM products WHERE product_typename = :product_type and product_name = :product_name")
    product_id_value = db.execute(query, meta).fetchall()
    db.commit()
    for piv in product_id_value:
        x = piv[0]
    meta = {"quantity": quantity, "product_id": x}
    query = text("UPDATE stock SET stock_count = stock_count + :quantity WHERE product_id = :product_id")
    db.execute(query, meta)
    db.commit()

