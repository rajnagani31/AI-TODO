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
    # Use this endpoint from your React frontend to update a task
    path("update-task/<int:id>/", TaskEditAPI.as_view(), name="update_task"),
    # Get Today Task
    path("today-task/", GetTodayTaskAPI.as_view(), name="today_task"),
    # Get advance Task
    path("Advance-task/", GetAdvanceTaskAPI.as_view(), name="pending_task"),
    # GEt Pending TAsk
    path("pending-task/",GetPedingTaskAPI.as_view(),name= "pending_task"),
    # Get Completed Task
    path("completed-task/",GETCompleteTaskAPI.as_view(),name= "completed_task"),
    # complete and delete
    path("complete/<int:id>/",CompleteTaskAPI.as_view(),name="complete_task"),
    path("delete/<int:id>/",DeleteTaskAPI.as_view(),name="delete_task"),

    path("destroy-token/",DestroyTokenAPI.as_view(),name="destroy_token"),
]
