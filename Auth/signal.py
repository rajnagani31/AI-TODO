from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.sessions.models import Session
from django.contrib.auth import get_user_model
 # Use your AbstractUser model
import random

User=get_user_model()
@receiver(post_save, sender=User)
def send_otp_on_register(sender, instance, created, **kwargs):
    if created:
        otp = str(random.randint(100000, 999999))
        print(f"OTP for {instance.email}: {otp}")

        # Send email
        send_mail(
            subject="Your OTP Code",
            message=f"Hello {instance.username}, your OTP is: {otp}",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[instance.email],
            fail_silently=False,
        )

        # ⚠️ No session in signals, so store OTP in cache or ask to store in view (see below)
