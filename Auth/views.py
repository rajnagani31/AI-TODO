from django.shortcuts import render,redirect
from django.http import HttpResponse
from django.contrib import messages
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password ,check_password
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from .models import AddTask,User_Register
from django.core.mail import send_mail
from django.conf import settings
import random
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from .serializers import TaskCreateSerializer ,UserRegisterSerializer , LoginSerializer
from django.db.models import Q
from rest_framework.response import Response 
from rest_framework import status
from util.utils import SerializerValidation
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
import re 
from datetime import date
from django.db.models import Q
# from .signal  import call

query = Q()
query = query & Q(is_delete = False)

def home(request):
    return render (request,'Auth/home.html')

class UserRegister(APIView , SerializerValidation):
    " user register API"
    def post(self,request):
        try:
            serializer = UserRegisterSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                access_token = AccessToken.for_user(serializer.instance)
                refresh_token = RefreshToken.for_user(serializer.instance)
                data =({
                    "token":{
                        "access": str(access_token),
                        "refresh": str(refresh_token)
                    }
                })
                return self.return_response(status.HTTP_201_CREATED , "User registered successfully" , data)
            return self.return_response(status.HTTP_400_BAD_REQUEST , "Data is not valid" , serializer.errors)
        except Exception as e:
            print(e)
            return Response({"ERROR":str(e)},status=status.HTTP_400_BAD_REQUEST)

class LoginAPI(APIView , SerializerValidation):
    def post(self,request) -> int:
        try:
            serializer = LoginSerializer(data = request.data)
            serializer.is_valid(raise_exception=True)
            email = serializer.data.get('email')
            password = serializer.data.get('password')

            user = User_Register.objects.filter(email=email).first()
            # user = User_Register.objects.filter(email=email).distinct()

            if not user:
                return self.return_response(status.HTTP_404_NOT_FOUND , "First register to login")
            if not check_password(password , user.password):
                return self.return_response(status.HTTP_400_BAD_REQUEST , "Password is incorrect")
            
            access_token = AccessToken.for_user(user)
            refresh_token = RefreshToken.for_user(user)
            data =({
                "token":{
                    "access": str(access_token),
                    "refresh": str(refresh_token)
                }
            })

            return self.return_response(status.HTTP_200_OK , "Login successfully" , data)

        except Exception as e:
            print(e)
            return Response({"ERROR":str(e)},status=status.HTTP_400_BAD_REQUEST)    


class ChangePasswordAPI(APIView , SerializerValidation):
    permission_classes= [IsAuthenticated]

    def post(self,request):
        try:

            user = request.user.id
            print('user id' , user)
            # print(user)
            new_password = request.data.get('new_password')
            confirm_password = request.data.get('confirm_password')

            if not all([new_password , confirm_password]):
                return self.return_response(status.HTTP_400_BAD_REQUEST , "All fields are required")
            
            password_pattern = re.compile(r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&#^~+=\(\)\-]{8,25}$")
            if not password_pattern.match(new_password):
                return self.return_response(status.HTTP_400_BAD_REQUEST , "Password must be 8 to 25 characters long and must contain at least one uppercase letter, one lowercase letter, one numeric digit, and one special character.")
            if new_password != confirm_password:
                return self.return_response(status.HTTP_400_BAD_REQUEST , "New password and confirm password must be same")

            data = User_Register.objects.filter(pk = user , is_delete = False).first()
            print('data',data)
            if not data:
                return self.return_response(status.HTTP_404_NOT_FOUND , "User not found")
            
            user_password = make_password(new_password)
            data.password = user_password
            data.save()

            return self.return_response(status.HTTP_200_OK,"password changed successfully")
        
        except Exception as e:
            print(e)
            return Response({"ERROR":str(e)},status=status.HTTP_400_BAD_REQUEST)
        

class CreateTaskAPI(APIView, SerializerValidation):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            serializer = TaskCreateSerializer(data=request.data, context={'request': request})
            if not serializer.is_valid():
                return self.return_response(
                    status.HTTP_400_BAD_REQUEST,
                    "Data is not valid",
                    serializer.errors
                )
            serializer.save()
            print(serializer.data)

            return self.return_response(
                status.HTTP_201_CREATED,
                "Task created successfully",
                serializer.data
            )
        except Exception as e:
            print(e)
            return Response({"ERROR": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
    
      

class GetAllTaskAPI(ListAPIView ,SerializerValidation):
    permission_classes = [IsAuthenticated]
    serializer_class = TaskCreateSerializer
    def list(self, request , *args, **kwargs):
        try:
            user = request.user.id
            tasks = AddTask.objects.filter(user=user, is_complete=False , is_delete = False).order_by('id')
            serializer = self.get_serializer(tasks, many=True)
            return self.return_response(
                status.HTTP_200_OK,
                "Tasks retrieved successfully",
                serializer.data
            )
        except Exception as e:
            print(e)
            return Response({"ERROR": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        


class TaskEditAPI(APIView, SerializerValidation):

    def put(self, request, id):
        try:
            task = AddTask.objects.filter(id=id, is_delete=False).first()
            if not task:
                return self.return_response(status.HTTP_404_NOT_FOUND, "Task not found")
            
            serializer = TaskCreateSerializer(task, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return self.return_response(
                    status.HTTP_200_OK,
                    "Task updated successfully",
                    serializer.data
                )
            return self.return_response(
                status.HTTP_400_BAD_REQUEST,
                "Data is not valid",
                serializer.errors
            )
        except Exception as e:
            print(e)
            return Response({"ERROR": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class GetTodayTaskAPI(ListAPIView ,SerializerValidation):
    permission_classes = [IsAuthenticated]
    serializer_class = TaskCreateSerializer
    def get(self,request):
        try:
            user = request.user.id
            today_date = date.today()

            tasks = AddTask.objects.filter(user=user, is_complete=False , is_delete = False ,status ='Today' ,date_time = today_date).order_by('id')
            serializer = self.get_serializer(tasks, many=True)
            return self.return_response(
                status.HTTP_200_OK,
                "Today's Tasks retrieved successfully",
                serializer.data
            )
        except Exception as e:
            print(e)
            return Response({"ERROR": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
class GetAdvanceTaskAPI(ListAPIView ,SerializerValidation):
    permission_classes = [IsAuthenticated]
    serializer_class = TaskCreateSerializer

    def get(self,request):
        try:
            user = request.user.id
            today_date = date.today()
            tasks = AddTask.objects.filter(user=user, is_complete=False , status ='Advance',is_delete = False).order_by('id')
            for task_data in tasks:
                if task_data.date_time == today_date:
                    task_data.status = 'Today'
                    task_data.save()
            serializer = self.get_serializer(tasks, many=True)
            return self.return_response(
                status.HTTP_200_OK,
                "Advance Tasks retrieved successfully",
                serializer.data
            )
        except Exception as e:
            print(e)
            return Response({"ERROR": str(e)}, status=status.HTTP_400_BAD_REQUEST)        

class GetPedingTaskAPI(APIView, SerializerValidation):
    """ Pending Task API shows user un-complete tasks, not non-watch tasks """
    permission_classes = [IsAuthenticated]
    def get(self , request):
        try:
            
            user = request.user.id        
            today_date = date.today()
            data = AddTask.objects.filter(user =  user, is_complete = False ,is_delete = False, date_time__lt = today_date).values('id' , 'User_Task' , 'descri' , 'priority' , 'date_time').order_by('-date_time')
            if data:
                # Remove 'complete' button from un-complete list in response
                return self.return_response(status.HTTP_200_OK, {"message": "Un-complete Task retrieved successfully"}, data=data)

            return self.return_response(status.HTTP_200_OK,{"Message":"No more un-complete Task"})
        except Exception as e:
            return Response(f"ERROR :{e}")

class GETCompleteTaskAPI(ListAPIView , SerializerValidation):
    permission_classes = [IsAuthenticated]
    serializer_class = TaskCreateSerializer
    def get(self,request):
        try:
            user = request.user.id
            tasks = AddTask.objects.filter(user=user, is_complete=True , ).order_by('-date_time')[:7]
            if not tasks:
                return self.return_response(
                    status.HTTP_200_OK,
                    "No completed tasks found",
                    []
                )
            serializer = self.get_serializer(tasks, many=True)
            # Remove 'edit' and 'complete' buttons from complete list in response
            # If you send button info in response, exclude them here
            return self.return_response(
                status.HTTP_200_OK,
                "Completed Tasks retrieved successfully",
                serializer.data
            )
        except Exception as e:
            print(e)
            return Response({"ERROR": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
class CompleteTaskAPI(APIView, SerializerValidation):
    permission_classes = [IsAuthenticated]

    def put(self, request, id):
        try:
            if not id:
                return self.return_response(status.HTTP_400_BAD_REQUEST, "Task ID is required")
            task = AddTask.objects.filter(id=id, is_delete=False).first()
            if not task:
                return self.return_response(status.HTTP_404_NOT_FOUND, "Task not found")
            
            task.is_complete = True
            # task.is_delete = True
            task.save()
            serializer = TaskCreateSerializer(task)
            return self.return_response(
                status.HTTP_200_OK,
                "Task marked as complete successfully",
                serializer.data
            )
        except Exception as e:
            print(e)
            return Response({"ERROR": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        

class DeleteTaskAPI(APIView, SerializerValidation):
    permission_classes = [IsAuthenticated]

    def delete(self, request, id):
        try:
            if not id:
                return self.return_response(status.HTTP_400_BAD_REQUEST, "Task ID is required")
            task = AddTask.objects.filter(id=id, is_delete=False).first()
            if not task:
                return self.return_response(status.HTTP_404_NOT_FOUND, "Task not found")
            
            task.is_delete = True
            task.save()
            return self.return_response(
                status.HTTP_200_OK,
                "Task deleted successfully"
            )
        except Exception as e:
            print(e)
            return Response({"ERROR": str(e)}, status=status.HTTP_400_BAD_REQUEST)        
