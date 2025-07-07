from django.shortcuts import HttpResponse

class TodoInUc:
    def __init__(self,get_response):
        self.get_response=get_response

    def __call__(self,request):
        response=self.get_response(request)

        print("yes")
        return HttpResponse("Web sit is undercunstruction")
