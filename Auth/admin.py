from django.contrib import admin
from .models import user_register,Task

# Register your models here.
@admin.register(user_register)
class adminuser(admin.ModelAdmin):
    list_display=('id','username','email','password')


@admin.register(Task)
class tasklist(admin.ModelAdmin):
    list_display=('id','titel','status','descri','date_time')    