from django import forms
from .models import Task


class task_form(forms.ModelForm):
    class Meta:
        model=Task
        fields=['titel','status','descri','date_time','complete']
        