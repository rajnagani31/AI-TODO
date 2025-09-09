from django.shortcuts import render,redirect
from django.http import HttpResponse
from django.contrib import messages
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password ,check_password
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from .models import Task,User_Register
from django.core.mail import send_mail
from django.conf import settings
import random
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from .serializers import TaskCreateSerializer ,UserRegisterSerializer , LoginSerializer
from .forms import task_form
from django.db.models import Q
from rest_framework.response import Response 
from rest_framework import status
from util.utils import SerializerValidation
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
import re
# from .signal  import call


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
    def post(self,request):
        try:
            serializer = LoginSerializer(data = request.data)
            serializer.is_valid(raise_exception=True)
            email = serializer.data.get('email')
            password = serializer.data.get('password')

            user = User_Register.objects.filter(email=email).first()
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
        

def after_loging_home(request):
    return render(request,'Auth/after_log_home.html')

def add_task(request):
    return render(request,'todo/sidebar.html')

@login_required
def task_forms(request):
    if request.method == "POST":
        form=task_form(request.POST)
        if form.is_valid():
            task=form.save(commit=False)
            task.user=request.user
            task.save()
            print('yes')
            return redirect('today_task')
            

    else:        
        form=task_form()

    return render (request,'todo/task_form.html',{'form':form})

def today_task(request):
    
    # if Task.objects.filter(status=['today']).exists():
    data=Task.objects.filter(user=request.user)
    tasks=data.all().filter(complete='uncomplete')

    return render(request,'todo/today_task.html',{'tasks':tasks})

from django.shortcuts import redirect, get_object_or_404
def task_true(request,task_id):
    user=Task.objects.filter(user=request.user,id=task_id)

    task_update=user.update(complete='complete')
    return redirect ('today_task')


def complete_task(request):
    """ 
        this is treak and changr task mode into complete
    """
    data=Task.objects.filter(user=request.user)
    complete_task=data.all().filter(complete='complete')
    return render(request,'todo/complite.html',{'tasks':complete_task})

def advance_task(request):
    data=Task.objects.filter(user=request.user)
    advance_task=data.all().filter(Q(status="Advance") & Q(complete="uncomplete"))
    return render(request,'todo/advance_task.html',{'advance':advance_task})


def task_delete(request,task_id):
    """ Task Delete on complete task page(on ui)"""

    data=Task.objects.filter(user=request.user)
    complete_task_delete=data.filter(id=task_id).delete()
    print('yes')    
    return complete_task(request)
    # return render(request,'Auth/complite.html',{'tasks':complete_task_delete})
    # return redirect("Auth/complite.html")

class CreateTaskAPI(APIView):
    def post(self,request):
        if not request.user.is_authenticated:
            return Response({"message": "Please log in to create a task"}, status=status.HTTP_401_UNAUTHORIZED)
        # print(serializer)
        # user = request.user
        # user_id =user.id
        # request.data["user_id"] = user_id
        # print('user',user_id)
        serializer = TaskCreateSerializer(data=request.data)
        # if user:
        serializer.is_valid()
        serializer.save(user = request.user)

        return Response({"data":serializer.data,"status":status.HTTP_201_CREATED})
        # return Response({"Message":"first login to create task"})






#
#rkngbruifb
#trgrt,hmriuhj
##jhiwp t894y9vemcnveytier
#656368784165467989799ytr8y/7y8yu+y7u7y
#+y95u+9tyu+9ety7u*/ey/79eyt7i98e7y

# dev
#mklcmoejfoe
#kmvegon
#m3kfjo ugv9uybnu

        
# dev jfnef
# dejkewjebibfibfbu foiwhfiohfihfweihfiwehief


# iuhiuweh
# iofoiwhf# 
