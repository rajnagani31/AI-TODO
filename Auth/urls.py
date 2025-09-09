from django.urls import path
from .views import (home,
                    add_task,
                    after_loging_home,
                    task_forms,
                    today_task,
                    complete_task,
                    task_true,
                    advance_task,
                    task_delete
                    )
from .views import *
from .views import CreateTaskAPI
urlpatterns = [
    path('',home,name='home'),
    # User Auth
    path('register/',UserRegister.as_view(),name='register'),
    path('login/',LoginAPI.as_view(),name='login'),
    path("change-password/",ChangePasswordAPI.as_view(),name="change_password"),

    path('task/',add_task,name='add_task'),
    path("after_home/",after_loging_home,name="after_login_home"),
    path("task_form/",task_forms,name='task_form'),
    path("today/",today_task,name='today_task'),
    path("complite/",complete_task,name="complite"),
    path("task_update_complete/<int:task_id>/",task_true,name='task_update_complete'),
    path("advance_task/",advance_task,name='advance_task'),
    path("delete/<int:task_id>/",task_delete,name='delete'),
    ## Task Create API

    path('create_task/', CreateTaskAPI.as_view(), name='create_task_api'),
]
