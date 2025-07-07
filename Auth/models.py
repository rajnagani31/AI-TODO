from django.db import models
from datetime import date
from django.contrib.auth.models import AbstractUser
from django.conf import settings
# Create your models here.
class user_register(AbstractUser):
    # username=models.CharField(max_length=50)
    # email=models.EmailField(max_length=50)
    # password=models.CharField(max_length=10)

    pass


class Task(models.Model):
    # add task form
    choices=(
        ('Today',"Today"),
        ('Tomorrow',"Tomorrow"),
        ("Advance","Advance")
    )
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    titel=models.CharField(max_length=50,default=None)
    status=models.CharField(choices=choices,max_length=20,default='Today')
    descri=models.CharField(blank=True,max_length=100)
    date_time=models.DateField(default=date.today)
    
    complete_choice=(
        ("uncomplete","uncomplete"),
        ("complete","complete"),

    )
    complete=models.CharField(blank=False,choices=complete_choice)