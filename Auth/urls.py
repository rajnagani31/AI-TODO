from django.urls import path
from .views import (register,
                    login_view,
                    home,
                    add_task,
                    after_loging_home,
                    task_forms,
                    today_task,
                    complete_task,
                    task_true,
                    advance_task,
                    task_delete
                    )
urlpatterns = [
    path('',home,name='home'),
    path('register/',register,name='register'),
    path('login/',login_view,name='login'),
    path('task/',add_task,name='add_task'),
    path("after_home/",after_loging_home,name="after_login_home"),
    path("task_form/",task_forms,name='task_form'),
    path("today/",today_task,name='today_task'),
    path("complite/",complete_task,name="complite"),
    path("task_update_complete/<int:task_id>/",task_true,name='task_update_complete'),
    path("advance_task/",advance_task,name='advance_task'),
    path("delete/<int:task_id>/",task_delete,name='delete')
]
