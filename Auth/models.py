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

    


class Task(models.Model):
    # add task form
    choices=(
        ('Today',"Today"),
        ('Tomorrow',"Tomorrow"),
        ("Advance","Advance"),
        
    )
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE ,blank=True ,null=True)
    Task=models.CharField(max_length=50,default=None)
    status=models.CharField(choices=choices,max_length=20,default='Today')
    descri=models.CharField(blank=True,max_length=100 , null=True)
    date_time=models.DateField(auto_created=True) 
    complete_choice=(
        ("uncomplete","uncomplete"),
        ("complete","complete"),

    )
    complete=models.CharField(choices=complete_choice,default="uncomplete",auto_created=True )

