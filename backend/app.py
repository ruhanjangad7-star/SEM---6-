import json
import os
import random
from datetime import datetime

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import inspect, text
from sqlalchemy.dialects.mysql import LONGTEXT
from werkzeug.security import check_password_hash, generate_password_hash

load_dotenv()

app = Flask(__name__)

mysql_user = os.getenv("MYSQL_USER", "root")
mysql_password = os.getenv("MYSQL_PASSWORD", "")
mysql_host = os.getenv("MYSQL_HOST", "localhost")
mysql_port = os.getenv("MYSQL_PORT", "3306")
mysql_db = os.getenv("MYSQL_DB", "flask_app")
admin_email = os.getenv("ADMIN_EMAIL", "admin@nlapy.com").strip().lower()
admin_password = os.getenv("ADMIN_PASSWORD", "admin123")

app.config["SQLALCHEMY_DATABASE_URI"] = (
    f"mysql+pymysql://{mysql_user}:{mysql_password}@{mysql_host}:{mysql_port}/{mysql_db}"
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)


def ensure_product_schema():
    inspector = inspect(db.engine)
    tables = set(inspector.get_table_names())

    if "product" not in tables:
        return

    columns = {column["name"] for column in inspector.get_columns("product")}

    try:
        db.session.execute(text("ALTER TABLE product MODIFY COLUMN image_urls LONGTEXT"))
        db.session.commit()
    except Exception:
        db.session.rollback()

    if "quantity" not in columns:
        try:
            db.session.execute(
                text("ALTER TABLE product ADD COLUMN quantity INT NOT NULL DEFAULT 0")
            )
            db.session.commit()
        except Exception:
            db.session.rollback()

    if "position" not in columns:
        try:
            db.session.execute(
                text("ALTER TABLE product ADD COLUMN position INT NOT NULL DEFAULT 0")
            )
            db.session.commit()
        except Exception:
            db.session.rollback()


def ensure_user_schema():
    inspector = inspect(db.engine)
    tables = set(inspector.get_table_names())

    if "user" not in tables:
        return

    columns = {column["name"] for column in inspector.get_columns("user")}

    if "password_hash" not in columns:
        try:
            db.session.execute(
                text("ALTER TABLE user ADD COLUMN password_hash VARCHAR(255) NOT NULL DEFAULT ''")
            )
            db.session.commit()
        except Exception:
            db.session.rollback()


def ensure_order_schema():
    inspector = inspect(db.engine)
    tables = set(inspector.get_table_names())

    if "order" not in tables:
        return

    columns = {column["name"] for column in inspector.get_columns("order")}

    try:
        db.session.execute(text("ALTER TABLE `order` MODIFY COLUMN order_items LONGTEXT"))
        db.session.commit()
    except Exception:
        db.session.rollback()

    if "order_code" not in columns:
        try:
            db.session.execute(text("ALTER TABLE `order` ADD COLUMN order_code VARCHAR(5) NULL"))
            db.session.commit()
        except Exception:
            db.session.rollback()

    try:
        db.session.execute(text("ALTER TABLE `order` ADD UNIQUE INDEX uq_order_order_code (order_code)"))
        db.session.commit()
    except Exception:
        db.session.rollback()

    try:
        missing_codes = Order.query.filter(
            (Order.order_code.is_(None)) | (Order.order_code == "")
        ).all()
        for order in missing_codes:
            order.order_code = generate_unique_order_code()
        if missing_codes:
            db.session.commit()
    except Exception:
        db.session.rollback()


def ensure_admin_alert_schema():
    inspector = inspect(db.engine)
    tables = set(inspector.get_table_names())

    if "admin_alert" not in tables:
        try:
            db.create_all()
        except Exception:
            db.session.rollback()


def ensure_contact_message_schema():
    inspector = inspect(db.engine)
    tables = set(inspector.get_table_names())

    if "contact_message" not in tables:
        try:
            db.create_all()
        except Exception:
            db.session.rollback()


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False, default="")

    def to_dict(self):
        return {"id": self.id, "name": self.name, "email": self.email}


class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(180), nullable=False)
    description = db.Column(db.Text, nullable=True)
    category = db.Column(db.String(120), nullable=False)
    category_key = db.Column(db.String(120), index=True, nullable=False)
    price = db.Column(db.Float, nullable=False, default=0)
    discount_percentage = db.Column(db.Float, nullable=False, default=0)
    discount_type = db.Column(db.String(30), nullable=False, default="None")
    quantity = db.Column(db.Integer, nullable=False, default=0)
    position = db.Column(db.Integer, nullable=False, default=0)
    image_urls = db.Column(LONGTEXT, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def to_dict(self):
        try:
            image_urls = json.loads(self.image_urls) if self.image_urls else []
            if not isinstance(image_urls, list):
                image_urls = []
        except Exception:
            image_urls = []

        return {
            "id": self.id,
            "name": self.name,
            "description": self.description or "",
            "category": self.category,
            "categoryKey": self.category_key,
            "price": self.price,
            "discountPercentage": self.discount_percentage,
            "discountType": self.discount_type,
            "quantity": self.quantity,
            "position": self.position,
            "imageUrls": image_urls,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }


class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(150), nullable=False)
    phone = db.Column(db.String(40), nullable=True)
    address = db.Column(db.String(255), nullable=False)
    city = db.Column(db.String(100), nullable=False)
    zip_code = db.Column(db.String(30), nullable=True)
    payment_method = db.Column(db.String(40), nullable=False, default="cod")
    subtotal = db.Column(db.Float, nullable=False, default=0)
    shipping = db.Column(db.Float, nullable=False, default=0)
    total = db.Column(db.Float, nullable=False, default=0)
    status = db.Column(db.String(40), nullable=False, default="placed")
    order_items = db.Column(LONGTEXT, nullable=False, default="[]")
    order_code = db.Column(db.String(5), unique=True, index=True, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def to_dict(self):
        try:
            items = json.loads(self.order_items) if self.order_items else []
            if not isinstance(items, list):
                items = []
        except Exception:
            items = []

        return {
            "id": self.id,
            "orderCode": self.order_code,
            "fullName": self.full_name,
            "email": self.email,
            "phone": self.phone or "",
            "address": self.address,
            "city": self.city,
            "zipCode": self.zip_code or "",
            "paymentMethod": self.payment_method,
            "subtotal": self.subtotal,
            "shipping": self.shipping,
            "total": self.total,
            "status": self.status,
            "items": items,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }


def generate_unique_order_code(max_attempts=500):
    for _ in range(max_attempts):
        candidate = f"{random.randint(10000, 99999)}"
        exists = Order.query.filter_by(order_code=candidate).first()
        if not exists:
            return candidate
    raise RuntimeError("Could not generate unique 5-digit order code")


def seed_real_life_products():
    seed_products = [
        {
            "name": "Apple MacBook Air 13 (M3, 2024)",
            "description": "Lightweight macOS laptop with excellent battery life for students and developers.",
            "category": "Macbook",
            "price": 114900,
            "discount_percentage": 8,
            "quantity": 18,
            "image_urls": [
                "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=1200&q=80"
            ],
        },
        {
            "name": "Apple MacBook Pro 14 (M3 Pro)",
            "description": "High-performance MacBook for professional workloads, video editing, and coding.",
            "category": "Macbook",
            "price": 199900,
            "discount_percentage": 6,
            "quantity": 10,
            "image_urls": [
                "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=1200&q=80"
            ],
        },
        {
            "name": "Lenovo ThinkPad E14 Gen 5",
            "description": "Reliable business and coding laptop with strong keyboard and performance.",
            "category": "Coding",
            "price": 78990,
            "discount_percentage": 12,
            "quantity": 24,
            "image_urls": [
                "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80"
            ],
        },
        {
            "name": "Dell XPS 13 (9340)",
            "description": "Premium compact ultrabook for developers and productivity users.",
            "category": "Coding",
            "price": 139990,
            "discount_percentage": 10,
            "quantity": 12,
            "image_urls": [
                "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=1200&q=80"
            ],
        },
        {
            "name": "ASUS ROG Strix G16",
            "description": "Gaming-focused laptop with high refresh display and strong GPU options.",
            "category": "Gaming",
            "price": 149990,
            "discount_percentage": 14,
            "quantity": 14,
            "image_urls": [
                "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=1200&q=80"
            ],
        },
        {
            "name": "Acer Nitro V 15",
            "description": "Budget gaming laptop for esports titles and student gaming use.",
            "category": "Gaming",
            "price": 79990,
            "discount_percentage": 11,
            "quantity": 20,
            "image_urls": [
                "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=1200&q=80"
            ],
        },
        {
            "name": "ASUS Zenbook 14 OLED",
            "description": "Intel Core Ultra 7, 16GB RAM, 1TB SSD, 75Wh battery, OLED display for premium all-day productivity.",
            "category": "Battery Backup",
            "price": 89990,
            "discount_percentage": 9,
            "quantity": 16,
            "image_urls": [
                "https://m.media-amazon.com/images/I/41sNgNeF5dL._SY300_SX300_QL70_ML2_.jpg"
            ],
        },
        {
            "name": "Apple MacBook Air 15 (M3, 2024)",
            "description": "Apple M3 chip, 16GB unified memory, 512GB SSD, up to 18-hour battery life, lightweight premium build.",
            "category": "Battery Backup",
            "price": 154900,
            "discount_percentage": 6,
            "quantity": 12,
            "image_urls": [
                "https://m.media-amazon.com/images/I/61mljwKGHPL._AC_SL1200_.jpg"
            ],
        },
        {
            "name": "LG Gram 16 (2024)",
            "description": "Intel Core Ultra 7, 16GB RAM, 1TB SSD, 77Wh battery, ultra-light 16-inch design for long work sessions.",
            "category": "Battery Backup",
            "price": 169990,
            "discount_percentage": 8,
            "quantity": 10,
            "image_urls": [
                "https://m.media-amazon.com/images/I/61QaMK-F6vL._AC_SL1200_.jpg"
            ],
        },
        {
            "name": "Dell Latitude 9440 2-in-1",
            "description": "Intel Core i7 vPro, 32GB RAM, 1TB SSD, enterprise-grade battery life, premium convertible for business.",
            "category": "Battery Backup",
            "price": 214990,
            "discount_percentage": 7,
            "quantity": 8,
            "image_urls": [
                "https://m.media-amazon.com/images/I/61DBct67E8L._AC_SL1200_.jpg"
            ],
        },
        {
            "name": "HP Spectre x360 14 (2024)",
            "description": "Intel Core Ultra 7, 16GB RAM, 1TB SSD, OLED touch display, long battery backup for hybrid workflows.",
            "category": "Battery Backup",
            "price": 164990,
            "discount_percentage": 9,
            "quantity": 11,
            "image_urls": [
                "https://m.media-amazon.com/images/I/61TeDfrVmsL._AC_SL1200_.jpg"
            ],
        },
        {
            "name": "Microsoft Surface Laptop 7 (13.8)",
            "description": "Snapdragon X Elite, 16GB RAM, 512GB SSD, AI-ready performance with exceptional all-day battery endurance.",
            "category": "Battery Backup",
            "price": 149990,
            "discount_percentage": 5,
            "quantity": 14,
            "image_urls": [
                "https://m.media-amazon.com/images/I/71xlXzGX9aL._AC_SL1500_.jpg"
            ],
        },
        {
            "name": "Samsung Galaxy Book4 Pro 14",
            "description": "Intel Core Ultra 7, 16GB RAM, 1TB SSD, AMOLED display, long battery life for creators and professionals.",
            "category": "Battery Backup",
            "price": 146990,
            "discount_percentage": 8,
            "quantity": 13,
            "image_urls": [
                "https://m.media-amazon.com/images/I/61Z3tkc4m6L._AC_SL1500_.jpg"
            ],
        },
        {
            "name": "Lenovo Yoga Slim 7i (2024)",
            "description": "Intel Core Ultra 7, 16GB RAM, 1TB SSD, optimized thermals and strong battery backup in a sleek chassis.",
            "category": "Battery Backup",
            "price": 124990,
            "discount_percentage": 10,
            "quantity": 15,
            "image_urls": [
                "https://m.media-amazon.com/images/I/71d6b0nRESL._AC_SL1500_.jpg"
            ],
        },
        {
            "name": "Acer Swift Go 14 (2024)",
            "description": "Intel Core Ultra 7, 16GB LPDDR5X RAM, 1TB SSD, efficient platform tuned for long unplugged usage.",
            "category": "Battery Backup",
            "price": 98990,
            "discount_percentage": 11,
            "quantity": 18,
            "image_urls": [
                "https://m.media-amazon.com/images/I/41asYt8aXyL._SL500_.jpg"
            ],
        },
        {
            "name": "ASUS Zenbook S 13 OLED",
            "description": "Intel Core Ultra 7, 32GB RAM, 1TB SSD, ultra-portable premium OLED machine with excellent battery longevity.",
            "category": "Battery Backup",
            "price": 139990,
            "discount_percentage": 9,
            "quantity": 9,
            "image_urls": [
                "https://m.media-amazon.com/images/I/51nk2eOZuyL._SL500_.jpg"
            ],
        },
        {
            "name": "Lenovo ThinkPad X1 Carbon Gen 12",
            "description": "Intel Core Ultra 7 vPro, 32GB RAM, 1TB SSD, enterprise security and long battery life in a premium ultralight body.",
            "category": "Battery Backup",
            "price": 189990,
            "discount_percentage": 7,
            "quantity": 10,
            "image_urls": [
                "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=1200&q=80"
            ],
        },
        {
            "name": "HP Dragonfly G4",
            "description": "Intel Core i7 vPro, 32GB RAM, 1TB SSD, premium business ultrabook engineered for all-day battery endurance.",
            "category": "Battery Backup",
            "price": 198990,
            "discount_percentage": 6,
            "quantity": 9,
            "image_urls": [
                "https://m.media-amazon.com/images/I/41LvVaZiq5L._SL500_.jpg"
            ],
        },
        {
            "name": "Dell XPS 13 (Snapdragon X Elite)",
            "description": "Snapdragon X Elite platform, 16GB RAM, 1TB SSD, AI-ready ultraportable with strong battery life for mobile productivity.",
            "category": "Battery Backup",
            "price": 159990,
            "discount_percentage": 8,
            "quantity": 11,
            "image_urls": [
                "https://m.media-amazon.com/images/I/41knRylQG3L._SL500_.jpg"
            ],
        },
        {
            "name": "Lenovo IdeaPad Slim 3",
            "description": "Affordable student laptop for classes, coding basics, and assignments.",
            "category": "Student",
            "price": 52990,
            "discount_percentage": 13,
            "quantity": 28,
            "image_urls": [
                "https://images.unsplash.com/photo-1537498425277-c283d32ef9db?auto=format&fit=crop&w=1200&q=80"
            ],
        },
        {
            "name": "ASUS Vivobook S 14 OLED",
            "description": "Thin and light laptop with OLED screen for daily portability.",
            "category": "Thin & Light",
            "price": 84990,
            "discount_percentage": 10,
            "quantity": 22,
            "image_urls": [
                "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1200&q=80"
            ],
        },
        {
            "name": "HP EliteBook 840 G10",
            "description": "Professional-grade laptop for office productivity and business workflows.",
            "category": "Professional",
            "price": 124990,
            "discount_percentage": 7,
            "quantity": 11,
            "image_urls": [
                "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&w=1200&q=80"
            ],
        },
    ]

    try:
        existing_names = {name for (name,) in db.session.query(Product.name).all()}
        inserted = 0

        for item in seed_products:
            if item["name"] in existing_names:
                continue

            product = Product(
                name=item["name"],
                description=item["description"],
                category=item["category"],
                category_key=item["category"].strip().lower(),
                price=float(item["price"]),
                discount_percentage=float(item["discount_percentage"]),
                discount_type="Percentage",
                quantity=max(0, int(item["quantity"])),
                position=max(0, int(item.get("position", 0))),
                image_urls=json.dumps(item["image_urls"]),
            )
            db.session.add(product)
            inserted += 1

        if inserted > 0:
            db.session.commit()

        return inserted
    except Exception:
        db.session.rollback()
        return 0


class AdminAlert(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String(50), nullable=False, default="inventory")
    message = db.Column(db.String(255), nullable=False)
    product_id = db.Column(db.Integer, nullable=True)
    is_read = db.Column(db.Boolean, nullable=False, default=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "type": self.type,
            "message": self.message,
            "productId": self.product_id,
            "isRead": self.is_read,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }


class ContactMessage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(150), nullable=False)
    phone = db.Column(db.String(40), nullable=True)
    subject = db.Column(db.String(180), nullable=False)
    message = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), nullable=False, default="new")
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "phone": self.phone or "",
            "subject": self.subject,
            "message": self.message,
            "status": self.status,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }


@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    return response


@app.route("/")
def home():
    return jsonify({"message": "Flask + MySQL API is running"})


@app.route("/init-db")
def init_db():
    db.create_all()
    ensure_user_schema()
    ensure_product_schema()
    ensure_order_schema()
    ensure_admin_alert_schema()
    ensure_contact_message_schema()
    inserted_products = seed_real_life_products()

    return jsonify(
        {
            "message": "Database tables created",
            "seededProducts": inserted_products,
        }
    )


@app.route("/api/products", methods=["GET", "POST", "OPTIONS"])
def products_collection():
    ensure_user_schema()
    ensure_product_schema()
    ensure_admin_alert_schema()

    if request.method == "OPTIONS":
        return ("", 204)

    if request.method == "GET":
        include_out_of_stock = (
            str(request.args.get("includeOutOfStock", "false")).strip().lower() == "true"
        )
        query = Product.query
        if not include_out_of_stock:
            query = query.filter(Product.quantity > 0)
        products = query.order_by(Product.position.asc(), Product.created_at.desc()).all()
        return jsonify([product.to_dict() for product in products])

    payload = request.get_json(silent=True) or {}

    name = str(payload.get("name", "")).strip()
    category = str(payload.get("category", "")).strip()

    if not name:
        return jsonify({"error": "Product name is required"}), 400

    if not category:
        return jsonify({"error": "Category is required"}), 400

    image_urls = payload.get("imageUrls", [])
    if not isinstance(image_urls, list):
        image_urls = []

    category_key = category.strip().lower()

    product = Product(
        name=name,
        description=str(payload.get("description", "")).strip(),
        category=category,
        category_key=category_key,
        price=float(payload.get("price") or 0),
        discount_percentage=float(payload.get("discountPercentage") or 0),
        discount_type="Percentage",
        quantity=max(0, int(payload.get("quantity") or 0)),
        position=max(0, int(payload.get("position") or 0)),
        image_urls=json.dumps([str(url) for url in image_urls if str(url).strip()]),
    )

    try:
        db.session.add(product)
        db.session.commit()
    except Exception as error:
        db.session.rollback()
        return jsonify({"error": f"Failed to save product: {str(error)}"}), 500

    products = Product.query.order_by(Product.position.asc(), Product.created_at.desc()).all()
    return jsonify([item.to_dict() for item in products]), 201


@app.route("/api/products/<int:product_id>", methods=["PUT", "DELETE", "OPTIONS"])
def product_item(product_id):
    ensure_product_schema()

    if request.method == "OPTIONS":
        return ("", 204)

    product = Product.query.get(product_id)
    if not product:
        return jsonify({"error": "Product not found"}), 404

    if request.method == "DELETE":
        try:
            db.session.delete(product)
            db.session.commit()
        except Exception as error:
            db.session.rollback()
            return jsonify({"error": f"Failed to delete product: {str(error)}"}), 500

        return jsonify({"message": "Product deleted"}), 200

    payload = request.get_json(silent=True) or {}
    name = str(payload.get("name", product.name)).strip()
    category = str(payload.get("category", product.category)).strip()

    if not name:
        return jsonify({"error": "Product name is required"}), 400
    if not category:
        return jsonify({"error": "Category is required"}), 400

    image_urls = payload.get("imageUrls", None)
    if image_urls is not None and not isinstance(image_urls, list):
        image_urls = []

    product.name = name
    product.description = str(payload.get("description", product.description or "")).strip()
    product.category = category
    product.category_key = category.strip().lower()
    product.price = float(payload.get("price", product.price) or 0)
    product.discount_percentage = float(
        payload.get("discountPercentage", product.discount_percentage) or 0
    )
    product.discount_type = "Percentage"
    product.quantity = max(0, int(payload.get("quantity", product.quantity) or 0))
    product.position = max(0, int(payload.get("position", product.position) or 0))

    if image_urls is not None:
        product.image_urls = json.dumps([str(url) for url in image_urls if str(url).strip()])

    try:
        db.session.commit()
    except Exception as error:
        db.session.rollback()
        return jsonify({"error": f"Failed to update product: {str(error)}"}), 500

    return jsonify({"message": "Product updated", "product": product.to_dict()}), 200


@app.route("/api/auth/signup", methods=["POST", "OPTIONS"])
def signup():
    ensure_user_schema()

    if request.method == "OPTIONS":
        return ("", 204)

    payload = request.get_json(silent=True) or {}
    name = str(payload.get("name", "")).strip()
    email = str(payload.get("email", "")).strip().lower()
    password = str(payload.get("password", ""))

    if not name:
        return jsonify({"error": "Name is required"}), 400
    if not email:
        return jsonify({"error": "Email is required"}), 400
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400

    existing = User.query.filter_by(email=email).first()
    if existing:
        return jsonify({"error": "Email already exists"}), 409

    user = User(name=name, email=email, password_hash=generate_password_hash(password))
    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "Account created", "user": user.to_dict()}), 201


@app.route("/api/auth/login", methods=["POST", "OPTIONS"])
def login():
    ensure_user_schema()

    if request.method == "OPTIONS":
        return ("", 204)

    payload = request.get_json(silent=True) or {}
    email = str(payload.get("email", "")).strip().lower()
    password = str(payload.get("password", ""))

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.password_hash or not check_password_hash(user.password_hash, password):
        return jsonify({"error": "Invalid email or password"}), 401

    return jsonify({"message": "Login successful", "user": user.to_dict()}), 200


@app.route("/api/auth/admin-login", methods=["POST", "OPTIONS"])
def admin_login():
    if request.method == "OPTIONS":
        return ("", 204)

    payload = request.get_json(silent=True) or {}
    email = str(payload.get("email", "")).strip().lower()
    password = str(payload.get("password", ""))

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    if email != admin_email or password != admin_password:
        return jsonify({"error": "Invalid admin credentials"}), 401

    return (
        jsonify(
            {
                "message": "Admin login successful",
                "admin": {
                    "email": admin_email,
                    "name": "Admin",
                },
            }
        ),
        200,
    )


@app.route("/api/users", methods=["GET", "OPTIONS"])
def users_collection():
    ensure_user_schema()

    if request.method == "OPTIONS":
        return ("", 204)

    users = User.query.order_by(User.id.asc()).all()
    return jsonify([user.to_dict() for user in users])


@app.route("/api/users/<int:user_id>", methods=["PUT", "OPTIONS"])
def user_item(user_id):
    ensure_user_schema()

    if request.method == "OPTIONS":
        return ("", 204)

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    payload = request.get_json(silent=True) or {}
    name = str(payload.get("name", user.name)).strip()
    email = str(payload.get("email", user.email)).strip().lower()
    password = str(payload.get("password", "")).strip()

    if not name:
        return jsonify({"error": "Name is required"}), 400
    if not email:
        return jsonify({"error": "Email is required"}), 400

    existing = User.query.filter(User.email == email, User.id != user.id).first()
    if existing:
        return jsonify({"error": "Email already exists"}), 409

    user.name = name
    user.email = email
    if password:
        if len(password) < 6:
            return jsonify({"error": "Password must be at least 6 characters"}), 400
        user.password_hash = generate_password_hash(password)

    try:
        db.session.commit()
    except Exception as error:
        db.session.rollback()
        return jsonify({"error": f"Failed to update user: {str(error)}"}), 500

    return jsonify({"message": "Profile updated", "user": user.to_dict()}), 200


@app.route("/api/orders", methods=["GET", "POST", "OPTIONS"])
def orders_collection():
    ensure_order_schema()
    ensure_product_schema()
    ensure_admin_alert_schema()

    if request.method == "OPTIONS":
        return ("", 204)

    if request.method == "GET":
        email_filter = str(request.args.get("email", "")).strip().lower()
        query = Order.query
        if email_filter:
            query = query.filter(Order.email == email_filter)
        orders = query.order_by(Order.created_at.asc()).all()
        return jsonify([order.to_dict() for order in orders])

    payload = request.get_json(silent=True) or {}
    full_name = str(payload.get("fullName", "")).strip()
    email = str(payload.get("email", "")).strip().lower()
    address = str(payload.get("address", "")).strip()
    city = str(payload.get("city", "")).strip()
    payment_method = str(payload.get("paymentMethod", "cod")).strip() or "cod"
    items = payload.get("items", [])

    if not full_name or not email or not address or not city:
        return jsonify({"error": "Missing required checkout details"}), 400
    if not isinstance(items, list) or len(items) == 0:
        return jsonify({"error": "Order items are required"}), 400

    try:
        requested_map = {}
        for item in items:
            product_id = int(item.get("id") or 0)
            quantity = max(0, int(item.get("quantity") or 0))
            if product_id <= 0 or quantity <= 0:
                return jsonify({"error": "Invalid product in order items"}), 400
            requested_map[product_id] = requested_map.get(product_id, 0) + quantity

        products = Product.query.filter(Product.id.in_(requested_map.keys())).all()
        products_by_id = {product.id: product for product in products}

        for product_id, quantity in requested_map.items():
            product = products_by_id.get(product_id)
            if not product:
                return jsonify({"error": f"Product #{product_id} not found"}), 400
            if product.quantity < quantity:
                return (
                    jsonify(
                        {
                            "error": (
                                f"Only {product.quantity} item(s) available for {product.name}. "
                                "Please update cart quantity."
                            )
                        }
                    ),
                    400,
                )

        order = Order(
            full_name=full_name,
            email=email,
            phone=str(payload.get("phone", "")).strip(),
            address=address,
            city=city,
            zip_code=str(payload.get("zipCode", "")).strip(),
            payment_method=payment_method,
            subtotal=float(payload.get("subtotal") or 0),
            shipping=float(payload.get("shipping") or 0),
            total=float(payload.get("total") or 0),
            status="placed",
            order_items=json.dumps(items),
            order_code=generate_unique_order_code(),
        )
        db.session.add(order)

        for product_id, quantity in requested_map.items():
            product = products_by_id[product_id]
            product.quantity = max(0, int(product.quantity) - quantity)
            if product.quantity == 0:
                alert = AdminAlert(
                    type="inventory",
                    product_id=product.id,
                    message=f"Stock finished for product: {product.name}",
                )
                db.session.add(alert)

        db.session.commit()
    except Exception as error:
        db.session.rollback()
        return jsonify({"error": f"Failed to save order: {str(error)}"}), 500

    return jsonify({"message": "Order created", "order": order.to_dict()}), 201


@app.route("/api/orders/<int:order_id>", methods=["PUT", "OPTIONS"])
def order_item(order_id):
    ensure_order_schema()

    if request.method == "OPTIONS":
        return ("", 204)

    order = Order.query.get(order_id)
    if not order:
        return jsonify({"error": "Order not found"}), 404

    payload = request.get_json(silent=True) or {}
    status = str(payload.get("status", "")).strip().lower()
    allowed_statuses = {"confirmed", "shipped", "delivered", "cancelled"}
    current_status = str(order.status or "placed").strip().lower()

    if status not in allowed_statuses:
        return jsonify({"error": "Invalid order status"}), 400

    if current_status == "cancelled":
        return jsonify({"error": "Cancelled order cannot be updated"}), 400

    if current_status in {"shipped", "delivered"} and status == "cancelled":
        return jsonify({"error": "Shipped or delivered order cannot be cancelled"}), 400

    if current_status == "shipped" and status == "confirmed":
        return jsonify({"error": "Shipped order cannot go back to confirmed"}), 400

    if current_status == "delivered" and status in {"confirmed", "shipped", "cancelled"}:
        return jsonify({"error": "Delivered order status cannot be changed"}), 400

    order.status = status

    try:
        db.session.commit()
    except Exception as error:
        db.session.rollback()
        return jsonify({"error": f"Failed to update order: {str(error)}"}), 500

    return jsonify({"message": "Order status updated", "order": order.to_dict()}), 200


@app.route("/api/admin-alerts", methods=["GET", "OPTIONS"])
def admin_alerts_collection():
    ensure_admin_alert_schema()

    if request.method == "OPTIONS":
        return ("", 204)

    alerts = AdminAlert.query.order_by(AdminAlert.created_at.desc()).all()
    return jsonify([alert.to_dict() for alert in alerts])


@app.route("/api/contact-messages", methods=["GET", "POST", "OPTIONS"])
def contact_messages_collection():
    ensure_contact_message_schema()

    if request.method == "OPTIONS":
        return ("", 204)

    if request.method == "GET":
        messages = ContactMessage.query.order_by(ContactMessage.created_at.desc()).all()
        return jsonify([message.to_dict() for message in messages])

    payload = request.get_json(silent=True) or {}
    name = str(payload.get("name", "")).strip()
    email = str(payload.get("email", "")).strip().lower()
    subject = str(payload.get("subject", "")).strip()
    message_text = str(payload.get("message", "")).strip()

    if not name or not email or not subject or not message_text:
        return jsonify({"error": "Name, email, subject, and message are required"}), 400

    item = ContactMessage(
        name=name,
        email=email,
        phone=str(payload.get("phone", "")).strip(),
        subject=subject,
        message=message_text,
        status="new",
    )
    try:
        db.session.add(item)
        db.session.commit()
    except Exception as error:
        db.session.rollback()
        return jsonify({"error": f"Failed to save message: {str(error)}"}), 500

    return jsonify({"message": "Message sent successfully", "contactMessage": item.to_dict()}), 201


@app.route("/api/contact-messages/<int:message_id>", methods=["PUT", "OPTIONS"])
def contact_message_item(message_id):
    ensure_contact_message_schema()

    if request.method == "OPTIONS":
        return ("", 204)

    message = ContactMessage.query.get(message_id)
    if not message:
        return jsonify({"error": "Message not found"}), 404

    payload = request.get_json(silent=True) or {}
    status = str(payload.get("status", "")).strip().lower()
    if status not in {"new", "resolved"}:
        return jsonify({"error": "Invalid status"}), 400

    if str(message.status or "").lower() == "resolved":
        return jsonify({"error": "Resolved message is locked and cannot be changed"}), 400

    message.status = status
    try:
        db.session.commit()
    except Exception as error:
        db.session.rollback()
        return jsonify({"error": f"Failed to update message: {str(error)}"}), 500

    return jsonify({"message": "Message status updated", "contactMessage": message.to_dict()}), 200


if __name__ == "__main__":
    app.run(debug=True)
