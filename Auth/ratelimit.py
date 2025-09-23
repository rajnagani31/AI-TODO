import time
from django.http import JsonResponse

class RateLimitMiddleware:
    """
    Limit requests per IP to 3 per minute on all endpoints.
    """
    def __init__(self, get_response):
        self.get_response = get_response
        self.requests = {}  # {ip: [(timestamp1, timestamp2, ...)]}
        self.limit = 3       # allowed requests
        self.window = 60     # time window in seconds (1 minute)

    def __call__(self, request):
        ip = self.get_client_ip(request)
        print(f"Client IP: {ip}")


        now = time.time()
        timestamps = self.requests.get(ip, [])

        # keep only timestamps within the last minute
        timestamps = [t for t in timestamps if now - t < self.window]

        if len(timestamps) >= self.limit:
            return JsonResponse(
                {"detail": "Too many requests, please try again later."},
                status=429
            )

        # record new request timestamp
        timestamps.append(now)
        self.requests[ip] = timestamps

        return self.get_response(request)

    def get_client_ip(self, request):
        """Get real client IP even behind proxies."""
        x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
        print(x_forwarded_for)
        if x_forwarded_for:
            return x_forwarded_for.split(",")[0]
        return request.META.get("REMOTE_ADDR")
