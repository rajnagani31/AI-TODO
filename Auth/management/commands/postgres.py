from django.core.management.base import BaseCommand,CommandError
from django.core.validators import validate_email
from django.db import connections
from django.core.management import call_command

""" Also make db router file in python in your application and Ensure define this path (router) in settings"""
class Command(BaseCommand):
    """ Main function Inherits baseCommand Class"""

    help=" Run PostqreSql data base during This Command : python manage.py postgres"
    def handle(self, *args, **options):

        """
            This function django run your Any custom command 
            Executed all custom command

            call_command --> calls django internal 'makemigrations' and 'migrate command from inside your python code

            NOTICE and Success massage use for information
        """
        db="cpostgreSql"

        try:
            self.stdout.write(self.style.NOTICE(" Runing Makemigrations.."))
            call_command('makemigrations')

            self.stdout.write(self.style.NOTICE("Runing migrate..."))
            call_command('migrate',database=db)

            self.stdout.write(self.style.SUCCESS(f" Successfully migrated to {db}"))
        except Exception as e:
            raise CommandError(f" ERROR : {e}")
        

