from django.urls import path
from .views import *


urlpatterns = [
    # path('',home,name='home'),
    # User Auth
    path('register/',UserRegister.as_view(),name='register'),
    path('login/',LoginAPI.as_view(),name='login'),
    path("change-password/",ChangePasswordAPI.as_view(),name="change_password"),

    # Task APIS
    path("Add-task/",CreateTaskAPI.as_view(),name="add_task"),
    path("get-tasks/", GetAllTaskAPI.as_view(), name="get_all_task"),
    path("update-task/<int:id>/", TaskEditAPI.as_view(), name="update_task"),
]
