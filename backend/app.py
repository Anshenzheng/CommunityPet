import os
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
from config import Config
from models import db, User, Pet

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)
db.init_app(app)

# 创建上传目录
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# 允许的图片类型
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# 初始化数据库和测试数据
@app.before_request
def create_tables():
    db.create_all()
    # 检查是否有管理员用户
    if not User.query.filter_by(role='admin').first():
        admin = User(
            username='admin',
            password='admin123',  # 明文密码
            role='admin',
            name='物业管理员',
            phone='13800138000'
        )
        db.session.add(admin)
        db.session.commit()

# 登录接口
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    user = User.query.filter_by(username=username).first()
    if user and user.password == password:  # 明文密码比较
        return jsonify({
            'success': True,
            'user': user.to_dict()
        })
    return jsonify({'success': False, 'message': '用户名或密码错误'})

# 注册接口（业主注册）
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    
    if User.query.filter_by(username=username).first():
        return jsonify({'success': False, 'message': '用户名已存在'})
    
    user = User(
        username=username,
        password=data.get('password'),  # 明文密码
        role='owner',
        name=data.get('name'),
        building=data.get('building'),
        unit=data.get('unit'),
        room=data.get('room'),
        phone=data.get('phone')
    )
    db.session.add(user)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'user': user.to_dict()
    })

# 上传图片
@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'success': False, 'message': '没有文件'})
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'success': False, 'message': '没有选择文件'})
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        # 加上时间戳避免重名
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        filename = f"{timestamp}_{filename}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        return jsonify({'success': True, 'filename': filename})
    
    return jsonify({'success': False, 'message': '不支持的文件类型'})

# 获取图片
@app.route('/api/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# 业主：添加宠物备案
@app.route('/api/pets', methods=['POST'])
def add_pet():
    data = request.form
    owner_id = data.get('owner_id')
    
    if not owner_id:
        return jsonify({'success': False, 'message': '缺少业主ID'})
    
    # 处理日期
    birth_date = data.get('birth_date')
    if birth_date:
        birth_date = datetime.strptime(birth_date, '%Y-%m-%d').date()
    
    vaccine_date = data.get('vaccine_date')
    if vaccine_date:
        vaccine_date = datetime.strptime(vaccine_date, '%Y-%m-%d').date()
    
    pet = Pet(
        owner_id=int(owner_id),
        name=data.get('name'),
        type=data.get('type'),
        breed=data.get('breed'),
        gender=data.get('gender'),
        birth_date=birth_date,
        color=data.get('color'),
        photo=data.get('photo'),
        vaccine_status=data.get('vaccine_status'),
        vaccine_date=vaccine_date,
        status='pending'
    )
    db.session.add(pet)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'pet': pet.to_dict()
    })

# 业主：获取个人宠物列表
@app.route('/api/pets/owner/<int:owner_id>', methods=['GET'])
def get_owner_pets(owner_id):
    pets = Pet.query.filter_by(owner_id=owner_id).order_by(Pet.created_at.desc()).all()
    return jsonify({
        'success': True,
        'pets': [pet.to_dict() for pet in pets]
    })

# 管理员：获取所有宠物列表（支持按楼栋筛选）
@app.route('/api/admin/pets', methods=['GET'])
def get_all_pets():
    building = request.args.get('building')
    status = request.args.get('status')
    
    query = Pet.query
    
    if building:
        # 关联查询，按业主楼栋筛选
        query = query.join(User).filter(User.building == building)
    
    if status:
        query = query.filter(Pet.status == status)
    
    pets = query.order_by(Pet.created_at.desc()).all()
    return jsonify({
        'success': True,
        'pets': [pet.to_dict() for pet in pets]
    })

# 获取所有楼栋列表
@app.route('/api/admin/buildings', methods=['GET'])
def get_buildings():
    # 查询所有有宠物备案的业主的楼栋
    buildings = db.session.query(User.building).filter(
        User.building.isnot(None),
        User.building != ''
    ).distinct().all()
    
    building_list = [b[0] for b in buildings]
    return jsonify({
        'success': True,
        'buildings': building_list
    })

# 管理员：审核宠物备案
@app.route('/api/admin/pets/<int:pet_id>/review', methods=['PUT'])
def review_pet(pet_id):
    data = request.get_json()
    pet = Pet.query.get(pet_id)
    
    if not pet:
        return jsonify({'success': False, 'message': '宠物不存在'})
    
    pet.status = data.get('status')  # 'approved', 'rejected'
    db.session.commit()
    
    return jsonify({
        'success': True,
        'pet': pet.to_dict()
    })

# 管理员：编辑宠物信息
@app.route('/api/admin/pets/<int:pet_id>', methods=['PUT'])
def edit_pet(pet_id):
    data = request.get_json()
    pet = Pet.query.get(pet_id)
    
    if not pet:
        return jsonify({'success': False, 'message': '宠物不存在'})
    
    # 更新可编辑字段
    if 'name' in data:
        pet.name = data.get('name')
    if 'type' in data:
        pet.type = data.get('type')
    if 'breed' in data:
        pet.breed = data.get('breed')
    if 'gender' in data:
        pet.gender = data.get('gender')
    if 'birth_date' in data and data.get('birth_date'):
        pet.birth_date = datetime.strptime(data.get('birth_date'), '%Y-%m-%d').date()
    if 'color' in data:
        pet.color = data.get('color')
    if 'vaccine_status' in data:
        pet.vaccine_status = data.get('vaccine_status')
    if 'vaccine_date' in data and data.get('vaccine_date'):
        pet.vaccine_date = datetime.strptime(data.get('vaccine_date'), '%Y-%m-%d').date()
    
    db.session.commit()
    return jsonify({
        'success': True,
        'pet': pet.to_dict()
    })

# 管理员：注销宠物备案
@app.route('/api/admin/pets/<int:pet_id>/cancel', methods=['PUT'])
def cancel_pet(pet_id):
    pet = Pet.query.get(pet_id)
    
    if not pet:
        return jsonify({'success': False, 'message': '宠物不存在'})
    
    pet.status = 'cancelled'
    db.session.commit()
    
    return jsonify({
        'success': True,
        'pet': pet.to_dict()
    })

if __name__ == '__main__':
    app.run(debug=False, port=5000)
