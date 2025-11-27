from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from time_provider import *
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from bson import ObjectId
import os
import datetime
import jwt
from functools import wraps
from werkzeug.security import generate_password_hash, check_password_hash

#just a test to make sure that its getting updated to the right repository

load_dotenv()
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)
uri = "mongodb+srv://JH3617:StudySpace@studyspace.yb9yb.mongodb.net/?retryWrites=true&w=majority&appName=StudySpace"
#if not uri:
    #uri = input(Enter your MongoDB URI:

SECRET_KEY = "open-access-secret"

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            parts = request.headers['Authorization'].split()
            if len(parts) == 2 and parts[0] == 'Bearer':
                token = parts[1]
        if not token:
            return jsonify({"message": "Token missing"}), 401
        try:
            jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            return jsonify({"message": "Token expired"}), 401
        except Exception:
            return jsonify({"message": "Token invalid"}), 401
        return f(*args, **kwargs)
    return decorated

@app.route('/')
def hello_world():
    try:
        with MongoClient(uri, server_api=ServerApi('1')) as client:
            client.admin.command('ping')
            return "Connected to MongoDB!"
    except Exception as e:
        return str(e)

@app.route('/bookings', methods=['GET'])
@token_required
def get_bookings():
    try:
        with MongoClient(uri, server_api=ServerApi('1')) as client:
            db = client["study_room_booking"]
            collection = db["bookings"]
            bookings_cursor = collection.find({})
            bookings = []
            for b in bookings_cursor:
                b['_id'] = str(b['_id'])
                bookings.append(b)
            return jsonify({"bookings": bookings})
    except Exception as e:
        return jsonify({"error": str(e)})

@app.route('/bookings', methods=['POST'])
@token_required
def add_booking():
    try:
        with MongoClient(uri, server_api=ServerApi('1')) as client:
            db = client["study_room_booking"]
            bookings_collection = db["bookings"]
            data = request.get_json()
            daily_count = bookings_collection.count_documents(
                {"userName": data.get("userName"), "bookingDate": data.get("bookingDate")}
            )
            if daily_count >= 4:
                return jsonify({"error": "Daily booking limit reached (4)."}), 400
            booking_result = bookings_collection.insert_one(data)
            return jsonify({
                "message": "Booking added and room updated successfully!",
                "booking_id": str(booking_result.inserted_id)
            })
    except Exception as e:
        return jsonify({"error": str(e)})

@app.route('/register', methods=['POST'])
def register_user():
    try:
        with MongoClient(uri, server_api=ServerApi('1')) as client:
            db = client["Login"]
            users_collection = db["Login credentials"]
            data = request.get_json()
            email = data.get("email")
            username = data.get("username")
            raw_password = data.get("password")
            if not email or not username or not raw_password:
                return jsonify({"message": "All fields are required to be filled!"}), 400
            existing_user = users_collection.find_one({"$or": [{"email": email}, {"username": username}]})
            if existing_user:
                return jsonify({"message": "Email or Username already exists!"}), 400
            hashed = generate_password_hash(raw_password)
            users_collection.insert_one({
                "first_name": data.get("first_name"),
                "last_name": data.get("last_name"),
                "username": username,
                "email": email,
                "password": hashed
            })
        return jsonify({"message": "User registered!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/login', methods=['POST'])
def login_user():
    try:
        with MongoClient(uri, server_api=ServerApi('1')) as client:
            db = client["Login"]
            users_collection = db["Login credentials"]
            data = request.get_json()
            user_identify = data.get("usernameOrEmail")
            password = data.get("password")
            user = users_collection.find_one({"$or": [{"email": user_identify}, {"username": user_identify}]})
            if not user or not check_password_hash(user["password"], password):
                return jsonify({"message": "Invalid credentials!"}), 401
            fullName = f"{user.get('first_name', '')} {user.get('last_name', '')}".strip()
            token = jwt.encode(
                {"username": user.get("username"), "exp": datetime.datetime.utcnow() + datetime.timedelta(minutes=5)},
                SECRET_KEY,
                algorithm="HS256"
            )
            return jsonify({
                "message": "Login successful!",
                "username": user.get("username"),
                "fullName": fullName,
                "token": token
            }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/rooms', methods=['GET'])
def get_rooms():
    floor = request.args.get('floor')
    time_slot = request.args.get('time')
    booking_date = request.args.get('date')
    if floor == "1":
        return jsonify({"rooms": []})
    if not floor or not time_slot or not booking_date:
        return jsonify({"error": "Missing floor, time, or date!"}), 400
    try:
        with MongoClient(uri, server_api=ServerApi('1')) as client:
            db = client["study_room_booking"]
            rooms_collection = db["study_rooms"]
            bookings_collection = db["bookings"]
            rooms = list(rooms_collection.find({"floor": floor}, {"_id": 0}))
            available_rooms = []
            for room in rooms:
                default_slots = room.get("available_slots", [])
                booked_slots_cursor = bookings_collection.find(
                    {"room": room.get("room"), "floor": floor, "bookingDate": booking_date},
                    {"bookingTime": 1, "_id": 0}
                )
                booked_slots = [booking["bookingTime"] for booking in booked_slots_cursor]
                available_slots = [slot for slot in default_slots if slot not in booked_slots]
                room["available_slots"] = available_slots
                if time_slot in available_slots:
                    available_rooms.append(room)
            return jsonify({"rooms": available_rooms})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/bookings/<booking_id>', methods=['DELETE'])
@token_required
def delete_booking(booking_id):
    try:
        with MongoClient(uri, server_api=ServerApi('1')) as client:
            db = client["study_room_booking"]
            bookings_collection = db["bookings"]
            booking = bookings_collection.find_one({"_id": ObjectId(booking_id)})
            if not booking:
                return jsonify({"error": "Booking not found!"}), 404
            bookings_collection.delete_one({"_id": ObjectId(booking_id)})
            return jsonify({"message": "Booking deleted!"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/user_bookings', methods=['GET'])
@token_required
def get_user_bookings():
    userName = request.args.get("userName")
    if not userName:
        return jsonify({"error": "Missing userName!"}), 400
    try:
        with MongoClient(uri, server_api=ServerApi('1')) as client:
            db = client["study_room_booking"]
            bookings_collection = db["bookings"]
            bookings = list(bookings_collection.find({"userName": userName}))
            for booking in bookings:
                booking['_id'] = str(booking['_id'])
            return jsonify({"bookings": bookings})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
