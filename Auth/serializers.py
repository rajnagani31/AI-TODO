from .models import Task
from rest_framework import serializers
class TaskCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        # fields = ['title', 'description', 'due_date', 'priority']
        fields = '__all__'
        