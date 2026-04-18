from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File, Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import requests
from passlib.context import CryptContext
from twilio.rest import Client
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key')
JWT_ALGORITHM = "HS256"

# Object Storage Configuration
STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")
APP_NAME = "rtgroups"
storage_key: Optional[str] = None


def init_storage():
    global storage_key
    if storage_key:
        return storage_key
    try:
        resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_KEY}, timeout=30)
        resp.raise_for_status()
        storage_key = resp.json()["storage_key"]
        return storage_key
    except Exception as e:
        logging.error(f"Storage init failed: {e}")
        return None


def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    if not key:
        raise HTTPException(status_code=503, detail="Storage service unavailable")
    resp = requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data, timeout=120
    )
    resp.raise_for_status()
    return resp.json()


def get_object(path: str) -> tuple:
    key = init_storage()
    if not key:
        raise HTTPException(status_code=503, detail="Storage service unavailable")
    resp = requests.get(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key}, timeout=60
    )
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")

try:
    twilio_client = Client(
        os.environ.get('TWILIO_ACCOUNT_SID'),
        os.environ.get('TWILIO_AUTH_TOKEN')
    )
    TWILIO_VERIFY_SERVICE = os.environ.get('TWILIO_VERIFY_SERVICE')
except:
    twilio_client = None
    TWILIO_VERIFY_SERVICE = None

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    phone: str
    password_hash: Optional[str] = None
    favorites: List[str] = Field(default_factory=list)
    role: str = "user"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    phone: str
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class PhoneOTPRequest(BaseModel):
    phone_number: str

class VerifyOTPRequest(BaseModel):
    phone_number: str
    code: str

class Property(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    price: float
    location: str
    type: str
    images: List[str] = Field(default_factory=list)
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    area: Optional[float] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PropertyCreate(BaseModel):
    title: str
    description: str
    price: float
    location: str
    type: str
    images: List[str] = Field(default_factory=list)
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    area: Optional[float] = None

class Booking(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: Optional[str] = None
    name: str
    phone: str
    email: EmailStr
    service: str
    date: str
    time: str
    message: Optional[str] = None
    status: str = "pending"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BookingCreate(BaseModel):
    name: str
    phone: str
    email: EmailStr
    service: str
    date: str
    time: str
    message: Optional[str] = None

class Inquiry(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: Optional[str] = None
    name: str
    email: EmailStr
    phone: str
    message: str
    status: str = "new"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class InquiryCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    message: str

class ChatMessage(BaseModel):
    text: str
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    session_id: str

class AnalyticsStats(BaseModel):
    total_users: int
    total_inquiries: int
    total_bookings: int
    successful_conversions: int

def create_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(days=7)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

@api_router.get("/")
async def root():
    return {"message": "Real Estate API"}


@api_router.post("/upload/image")
async def upload_image(file: UploadFile = File(...), token_data: dict = Depends(verify_token)):
    if token_data['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    if not file.content_type or not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    ext = file.filename.split(".")[-1].lower() if "." in file.filename else "jpg"
    if ext not in ['jpg', 'jpeg', 'png', 'gif', 'webp']:
        raise HTTPException(status_code=400, detail="Invalid image format")
    
    file_id = str(uuid.uuid4())
    path = f"{APP_NAME}/properties/{file_id}.{ext}"
    data = await file.read()
    
    if len(data) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 10MB)")
    
    try:
        result = put_object(path, data, file.content_type)
    except Exception as e:
        logging.error(f"Upload failed: {e}")
        raise HTTPException(status_code=500, detail="Upload failed")
    
    await db.files.insert_one({
        "id": file_id,
        "storage_path": result["path"],
        "original_filename": file.filename,
        "content_type": file.content_type,
        "size": result["size"],
        "uploaded_by": token_data['user_id'],
        "is_deleted": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {
        "id": file_id,
        "url": f"/api/files/{result['path']}",
        "size": result["size"]
    }


@api_router.get("/files/{path:path}")
async def download_file(path: str):
    record = await db.files.find_one({"storage_path": path, "is_deleted": False}, {"_id": 0})
    if not record:
        raise HTTPException(status_code=404, detail="File not found")
    
    try:
        data, content_type = get_object(path)
    except Exception as e:
        logging.error(f"Download failed: {e}")
        raise HTTPException(status_code=500, detail="Download failed")
    
    return Response(
        content=data,
        media_type=record.get("content_type", content_type),
        headers={"Cache-Control": "public, max-age=3600"}
    )


@api_router.post("/auth/register")
async def register(user_data: UserRegister):
    existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user = User(
        name=user_data.name,
        email=user_data.email,
        phone=user_data.phone,
        password_hash=pwd_context.hash(user_data.password)
    )
    
    doc = user.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.users.insert_one(doc)
    
    token = create_token(user.id, user.email, user.role)
    return {"token": token, "user": {"id": user.id, "name": user.name, "email": user.email, "role": user.role}}

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user_doc = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not pwd_context.verify(credentials.password, user_doc['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user_doc['id'], user_doc['email'], user_doc['role'])
    return {"token": token, "user": {"id": user_doc['id'], "name": user_doc['name'], "email": user_doc['email'], "role": user_doc['role']}}

@api_router.post("/auth/send-otp")
async def send_otp(request: PhoneOTPRequest):
    if not twilio_client or not TWILIO_VERIFY_SERVICE:
        raise HTTPException(status_code=503, detail="SMS service not configured")
    
    try:
        verification = twilio_client.verify.services(TWILIO_VERIFY_SERVICE).verifications.create(
            to=request.phone_number,
            channel="sms"
        )
        return {"status": verification.status, "message": "OTP sent successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.post("/auth/verify-otp")
async def verify_otp(request: VerifyOTPRequest):
    if not twilio_client or not TWILIO_VERIFY_SERVICE:
        raise HTTPException(status_code=503, detail="SMS service not configured")
    
    try:
        check = twilio_client.verify.services(TWILIO_VERIFY_SERVICE).verification_checks.create(
            to=request.phone_number,
            code=request.code
        )
        return {"valid": check.status == "approved"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.get("/users/me")
async def get_current_user(token_data: dict = Depends(verify_token)):
    user_doc = await db.users.find_one({"id": token_data['user_id']}, {"_id": 0, "password_hash": 0})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    return user_doc

@api_router.post("/properties", response_model=Property)
async def create_property(property_data: PropertyCreate, token_data: dict = Depends(verify_token)):
    if token_data['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    property_obj = Property(**property_data.model_dump())
    doc = property_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.properties.insert_one(doc)
    return property_obj

@api_router.get("/properties", response_model=List[Property])
async def get_properties(type: Optional[str] = None, location: Optional[str] = None, min_price: Optional[float] = None, max_price: Optional[float] = None):
    query = {}
    if type:
        query['type'] = type
    if location:
        query['location'] = {"$regex": location, "$options": "i"}
    if min_price is not None or max_price is not None:
        query['price'] = {}
        if min_price is not None:
            query['price']['$gte'] = min_price
        if max_price is not None:
            query['price']['$lte'] = max_price
    
    properties = await db.properties.find(query, {"_id": 0}).to_list(1000)
    for prop in properties:
        if isinstance(prop['created_at'], str):
            prop['created_at'] = datetime.fromisoformat(prop['created_at'])
    return properties

@api_router.get("/properties/{property_id}", response_model=Property)
async def get_property(property_id: str):
    prop = await db.properties.find_one({"id": property_id}, {"_id": 0})
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    if isinstance(prop['created_at'], str):
        prop['created_at'] = datetime.fromisoformat(prop['created_at'])
    return prop

@api_router.post("/users/favorites/{property_id}")
async def toggle_favorite(property_id: str, token_data: dict = Depends(verify_token)):
    user_doc = await db.users.find_one({"id": token_data['user_id']}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    favorites = user_doc.get('favorites', [])
    if property_id in favorites:
        favorites.remove(property_id)
        action = "removed"
    else:
        favorites.append(property_id)
        action = "added"
    
    await db.users.update_one({"id": token_data['user_id']}, {"$set": {"favorites": favorites}})
    return {"message": f"Property {action} to favorites", "favorites": favorites}

@api_router.get("/users/favorites")
async def get_favorites(token_data: dict = Depends(verify_token)):
    user_doc = await db.users.find_one({"id": token_data['user_id']}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    favorite_ids = user_doc.get('favorites', [])
    properties = await db.properties.find({"id": {"$in": favorite_ids}}, {"_id": 0}).to_list(1000)
    for prop in properties:
        if isinstance(prop['created_at'], str):
            prop['created_at'] = datetime.fromisoformat(prop['created_at'])
    return properties

@api_router.post("/bookings", response_model=Booking)
async def create_booking(booking_data: BookingCreate, token_data: dict = Depends(verify_token) if True else None):
    booking = Booking(
        **booking_data.model_dump(),
        user_id=token_data['user_id'] if token_data else None
    )
    doc = booking.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.bookings.insert_one(doc)
    return booking

@api_router.get("/bookings", response_model=List[Booking])
async def get_bookings(token_data: dict = Depends(verify_token)):
    if token_data['role'] == 'admin':
        bookings = await db.bookings.find({}, {"_id": 0}).to_list(1000)
    else:
        bookings = await db.bookings.find({"user_id": token_data['user_id']}, {"_id": 0}).to_list(1000)
    
    for booking in bookings:
        if isinstance(booking['created_at'], str):
            booking['created_at'] = datetime.fromisoformat(booking['created_at'])
    return bookings

@api_router.patch("/bookings/{booking_id}/status")
async def update_booking_status(booking_id: str, status: str, token_data: dict = Depends(verify_token)):
    if token_data['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await db.bookings.update_one({"id": booking_id}, {"$set": {"status": status}})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Booking not found")
    return {"message": "Booking status updated"}

@api_router.post("/inquiries", response_model=Inquiry)
async def create_inquiry(inquiry_data: InquiryCreate):
    inquiry = Inquiry(**inquiry_data.model_dump())
    doc = inquiry.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.inquiries.insert_one(doc)
    return inquiry

@api_router.get("/inquiries", response_model=List[Inquiry])
async def get_inquiries(token_data: dict = Depends(verify_token)):
    if token_data['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    inquiries = await db.inquiries.find({}, {"_id": 0}).to_list(1000)
    for inquiry in inquiries:
        if isinstance(inquiry['created_at'], str):
            inquiry['created_at'] = datetime.fromisoformat(inquiry['created_at'])
    return inquiries

@api_router.post("/chat", response_model=ChatResponse)
async def chat(message: ChatMessage):
    session_id = message.session_id or str(uuid.uuid4())
    
    try:
        chat_client = LlmChat(
            api_key=os.environ.get('EMERGENT_LLM_KEY'),
            session_id=session_id,
            system_message="You are a helpful real estate assistant. Help users understand our services: Property Buying & Selling, Construction Services, and Manpower Supply. Answer questions about real estate, construction, and provide guidance. If users want to talk to a human, tell them to click the WhatsApp button."
        ).with_model("openai", "gpt-5.2")
        
        user_message = UserMessage(text=message.text)
        response = await chat_client.send_message(user_message)
        
        chat_doc = {
            "session_id": session_id,
            "user_message": message.text,
            "ai_response": response,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.chat_history.insert_one(chat_doc)
        
        return ChatResponse(response=response, session_id=session_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")

@api_router.get("/analytics/stats", response_model=AnalyticsStats)
async def get_analytics_stats(token_data: dict = Depends(verify_token)):
    if token_data['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    total_users = await db.users.count_documents({})
    total_inquiries = await db.inquiries.count_documents({})
    total_bookings = await db.bookings.count_documents({})
    successful_conversions = await db.bookings.count_documents({"status": "completed"})
    
    return AnalyticsStats(
        total_users=total_users,
        total_inquiries=total_inquiries,
        total_bookings=total_bookings,
        successful_conversions=successful_conversions
    )

@api_router.get("/analytics/traffic")
async def get_traffic_data(token_data: dict = Depends(verify_token)):
    if token_data['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    return {
        "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        "visitors": [1200, 1900, 1500, 2100, 2500, 2800],
        "inquiries": [45, 67, 52, 78, 89, 95],
        "bookings": [12, 23, 18, 31, 38, 42]
    }

@api_router.get("/users")
async def get_all_users(token_data: dict = Depends(verify_token)):
    if token_data['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(1000)
    for user in users:
        if isinstance(user['created_at'], str):
            user['created_at'] = datetime.fromisoformat(user['created_at'])
    return users

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

@app.on_event("startup")
async def seed_admin():
    # Initialize object storage
    init_storage()
    
    admin = await db.users.find_one({"email": "admin@rtgroups.info"}, {"_id": 0})
    if not admin:
        admin_user = User(
            name="RT Groups Admin",
            email="admin@rtgroups.info",
            phone="+918105854999",
            password_hash=pwd_context.hash("RTGroups@2026"),
            role="admin"
        )
        doc = admin_user.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        await db.users.insert_one(doc)
        logger.info("Admin user created")
    
    property_count = await db.properties.count_documents({})
    if property_count == 0:
        sample_properties = [
            PropertyCreate(
                title="Luxury Villa in Mumbai",
                description="Beautiful 4BHK villa with modern amenities and sea view",
                price=15000000,
                location="Mumbai",
                type="Villa",
                bedrooms=4,
                bathrooms=5,
                area=3500,
                images=["https://images.unsplash.com/photo-1762811054947-605b20298615"]
            ),
            PropertyCreate(
                title="Modern Apartment in Bangalore",
                description="Spacious 3BHK apartment in prime location",
                price=8500000,
                location="Bangalore",
                type="Apartment",
                bedrooms=3,
                bathrooms=3,
                area=2200,
                images=["https://images.unsplash.com/photo-1772475329864-e30a2f1278c0"]
            ),
            PropertyCreate(
                title="Commercial Space in Delhi",
                description="Prime commercial property in business district",
                price=25000000,
                location="Delhi",
                type="Commercial",
                area=5000,
                images=["https://images.unsplash.com/photo-1714562601554-8e3abf94b179"]
            )
        ]
        for prop_data in sample_properties:
            prop = Property(**prop_data.model_dump())
            doc = prop.model_dump()
            doc['created_at'] = doc['created_at'].isoformat()
            await db.properties.insert_one(doc)
        logger.info("Sample properties created")