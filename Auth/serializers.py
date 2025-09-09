from rest_framework import serializers
from .models import User_Register ,Task
import re , logging
logger = logging.getLogger(__name__)

class TaskCreateSerializer(serializers.ModelSerializer):
    status = serializers.CharField(required = True)
    Task = serializers.CharField(required = True)
    class Meta:
        model = Task
        fields = ['Task', 'status', 'descri']
        # fields = '__all__'
        

class UserRegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True)
    class Meta:
        model = User_Register
        fields = ['email', 'password']

    def validate_email(self, data):
        if User_Register.objects.filter(email=data['email'] , is_delete=False).exists():
            raise serializers.ValidationError("Email is already in use.")
        
        password_pattern = re.compile(r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&#^~+=\(\)\-]{8,25}$")
        if not password_pattern.match(data['password']):
            logger.error('Register API Error : Password must be 8 to 25 characters long and must contain at least one uppercase letter, one lowercase letter, one numeric digit, and one special character.')
            raise Exception("Password must be 8 to 25 characters long and must contain at least one uppercase letter, one lowercase letter, one numeric digit, and one special character.")
        data['is_active'] = True
        return data