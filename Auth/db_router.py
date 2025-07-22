"""
Database router for handling multiple databases in Django.
This router ensures that:
- Development database (default) is used for normal operations but migrations are blocked
- Test database is used only when explicitly specified and allows migrations
"""

class DatabaseRouter:
    """
    A router to control all database operations on models
    """
    
    def db_for_read(self, model, **hints):
        """Suggest the database to read from."""
        # Read from default database by default
        return 'cpostgreSql'
    
    def db_for_write(self, model, **hints):
        """Suggest the database to write to."""
        # Write to default database by default
        return 'cpostgreSql'
    
    def allow_relation(self, obj1, obj2, **hints):
        """Allow relations if models are in the same app."""
        db_set = {"cpostgreSql", 'default'}
        if obj1._state.db in db_set and obj2._state.db in db_set:
            return True
        return None
    
    def allow_migrate(self, db, app_label, model_name=None, **hints):
        """Ensure that certain apps' models get created on the right database."""
        # Block migrations on default database
        if db == 'default':
            return False
        
        # Allow migrations only on test database
        if db == "cpostgreSql":
            return True
        
        return None

