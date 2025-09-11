from rest_framework import serializers
from .models import User_Register ,AddTask
import re , logging
from django.contrib.auth.hashers import make_password ,check_password

logger = logging.getLogger(__name__)

class TaskCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = AddTask
        fields = ['id', 'User_Task', 'status', 'descri', 'date_time', 'priority']
        # no `user` here, it’s automatically set

    def create(self, validated_data):
        # Add the logged-in user from context
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
        # titel_task | Description |Due_date | priority | status 
        # fields = '__all__'
        

class UserRegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True)
    class Meta:
        model = User_Register
        fields = ['email', 'password']

    def validate(self, data):
        if User_Register.objects.filter(email=data['email'] , is_delete=False).exists():
            raise serializers.ValidationError("Email is already in use.")
        
        password_pattern = re.compile(r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&#^~+=\(\)\-]{8,25}$")
        if not password_pattern.match(data['password']):
            logger.error('Register API Error : Password must be 8 to 25 characters long and must contain at least one uppercase letter, one lowercase letter, one numeric digit, and one special character.')
            raise Exception("Password must be 8 to 25 characters long and must contain at least one uppercase letter, one lowercase letter, one numeric digit, and one special character.")
        data['is_active'] = True
        data['password'] = make_password(data['password'])
        return data
    
class LoginSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True)
    class Meta:
        model = User_Register
        fields = ['email', 'password']


        


