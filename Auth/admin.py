from django.contrib import admin
from .models import user_register,Task

# Register your models here.
@admin.register(user_register)
class adminuser(admin.ModelAdmin):
    list_display=('id','username','email','password','is_superuser','is_staff')


@admin.register(Task)
class tasklist(admin.ModelAdmin):
    list_display=('id','Task','status','descri','date_time')    