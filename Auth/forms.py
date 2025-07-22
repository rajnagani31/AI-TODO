from django import forms
from .models import Task


class task_form(forms.ModelForm):
    class Meta:
        model=Task
        fields=['Task','status','descri','date_time','complete']
        widgets = {
            'date_time': forms.DateInput(attrs={'type': 'date'}),
        }
        labels = {
            'title': 'Task',   # label on form
            'status': 'Status',
            'descri':"Discription",
            'date_time':"Date",

        }