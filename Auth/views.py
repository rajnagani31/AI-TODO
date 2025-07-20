from django.shortcuts import render,redirect
from django.http import HttpResponse
from django.contrib import messages
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from .models import Task
from .forms import task_form
from django.db.models import Q


User=get_user_model()
def home(request):
    return render (request,'Auth/home.html')

def register(request):
    if request.method == "POST":
        user=request.POST.get('username')       
        email=request.POST.get('email')
        password=request.POST.get('password')
        confirmpassword=request.POST.get('confirmpassword')
        
        if not all([user, email, password, confirmpassword]):
            messages.error(request, "All fields are required")
            return redirect('register')
        
        if not user:
            messages.error(request,"This username are required")
            return redirect('register')
    
        if not email:
            messages.error(request,"This email are required")
            return redirect('register')
        
        if not password:
            messages.error(request,"This password are required")
            return redirect('register')
        
        if not confirmpassword:
            messages.error(request,"This confirmpassword are required")
            return redirect('register')
        if len(password) <=3:
            messages.error(request,"Plese password Enter more then 3")
            return redirect('register')
        
        if User.objects.filter(username=user).exists():
            messages.error(request, "Username already exists")
            return redirect('register')
        
        if password != confirmpassword:
            messages.error(request, "Passwords do not match")
            return redirect('register')
        
        if User.objects.filter(email =email).exists():
            messages.error(request, "email already exists")
            return redirect('register')

        user = User.objects.create_user(
            username=user,
            email=email,
            password=password  # hash the password manually
        )
        user.save()
        return redirect('login')
        
    return render (request,'Auth/register.html')

def login_view(request):
    if request.method == "POST":
        # print(type(user_input=request.POST.get('email')))
        user_input=request.POST.get('email')
        user_input=request.POST.get('email')
        print(user_input)
        password_=request.POST.get('password')
        print(password_)

        try:
            user_obj=User.objects.get(email=user_input)
            username=user_obj.username
            
            # return redirect("after_login_home")
        except User.DoesNotExist:
            username = user_input
            # messages.error(request,"invalid email or password")
        
        user=authenticate(request, username=username ,password=password_)
        if user is not None:
            login(request,user)
            return redirect('after_login_home')
        else:
            messages.error(request, "Invalid username/email or password")
            return redirect('login')

            
    return render(request,'Auth/login.html')

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


def complite_task(request):
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
    return complite_task(request)
    # return render(request,'Auth/complite.html',{'tasks':complete_task_delete})
    # return redirect("Auth/complite.html")


