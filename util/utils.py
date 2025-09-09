from rest_framework.response import Response
from django.core.mail import send_mail

class SerializerValidation:
    def return_response(self,status ,massage , data= None):
        response = {
            'status': status,
            'massage': massage,
        }
        if data:
            response['data'] = data
        return Response(response)
    
    def custom_response(self,status, massage , **data):
        response ={
            "status":status,
            "massage":massage,
            **data
        }
        return response