from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)  # 明文存储
    role = db.Column(db.String(20), nullable=False)  # 'owner' 或 'admin'
    name = db.Column(db.String(80), nullable=False)
    building = db.Column(db.String(20))
    unit = db.Column(db.String(20))
    room = db.Column(db.String(20))
    phone = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    pets = db.relationship('Pet', backref='owner', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'role': self.role,
            'name': self.name,
            'building': self.building,
            'unit': self.unit,
            'room': self.room,
            'phone': self.phone,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Pet(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    owner_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    name = db.Column(db.String(80), nullable=False)
    type = db.Column(db.String(20), nullable=False)  # 'dog', 'cat', 'other'
    breed = db.Column(db.String(80))
    gender = db.Column(db.String(10))  # 'male', 'female'
    birth_date = db.Column(db.Date)
    color = db.Column(db.String(50))
    photo = db.Column(db.String(200))  # 图片路径
    vaccine_status = db.Column(db.String(200))  # 疫苗情况
    vaccine_date = db.Column(db.Date)
    status = db.Column(db.String(20), default='pending')  # 'pending', 'approved', 'rejected', 'cancelled'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'owner_id': self.owner_id,
            'owner_name': self.owner.name if self.owner else None,
            'owner_building': self.owner.building if self.owner else None,
            'owner_unit': self.owner.unit if self.owner else None,
            'owner_room': self.owner.room if self.owner else None,
            'owner_phone': self.owner.phone if self.owner else None,
            'name': self.name,
            'type': self.type,
            'breed': self.breed,
            'gender': self.gender,
            'birth_date': self.birth_date.isoformat() if self.birth_date else None,
            'color': self.color,
            'photo': self.photo,
            'vaccine_status': self.vaccine_status,
            'vaccine_date': self.vaccine_date.isoformat() if self.vaccine_date else None,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
