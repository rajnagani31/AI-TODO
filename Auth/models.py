from django.db import models
from datetime import date
from django.contrib.auth.models import AbstractUser
from django.conf import settings

# Create your models here.
class User_Register(AbstractUser):
    id = models.BigAutoField(primary_key=True)
    email = models.EmailField(unique=True , blank=True , null=True)
    username = models.EmailField(unique=True , blank=True , null=True)
    firstname = models.CharField(max_length=50 , blank=True , null=True)
    lastname = models.CharField(max_length=50 , blank=True , null=True)
    is_delete = models.BooleanField(default=False , blank= True , null=True)
    REQUIRED_FIELDS = ['username']
    USERNAME_FIELD = 'email'

    class Meta:
        db_table = 'User_register'

    

class custom(models.Model):
    name=models.CharField(max_length=50)
    email=models.EmailField()
    password=models.CharField(max_length=50)

    class Meta:
        db_table = 'custom_user'        

class AddTask(models.Model):
    # add User_Task form
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(User_Register,on_delete=models.CASCADE ,blank=True ,null=True)
    User_Task=models.CharField(max_length=50,default=None)
    status=models.CharField(max_length=20,blank=True,null=True,default='Today')
    descri=models.CharField(blank=True,max_length=100 , null=True)
    date_time=models.DateField(auto_now_add=True, blank=True , null=True) 
    is_complete=models.BooleanField(default=False ,blank=True , null=True)
    priority = models.CharField(max_length=20, blank=True , null=True)
    is_delete = models.BooleanField(default=False , blank=True , null=True)
    is_active = models.BooleanField(default=True , blank=True , null=True)
    class Meta:
        db_table = 'Add Task'           

class ValidateToken(models.Model):
    user = models.ForeignKey(User_Register,on_delete=models.CASCADE ,blank=True ,null=True)
    token = models.CharField(max_length=500 , blank=True , null=True)
    type = models.CharField(max_length=50 , blank=True , null=True ,default='access token')
    is_delete = models.BooleanField(default=False , blank=True , null=True)

    class Meta:
        db_table = 'Validate Token'