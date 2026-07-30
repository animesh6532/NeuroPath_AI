from backend.app.db.database import engine
from backend.app.db.models import Base

print("Creating database...")

Base.metadata.create_all(bind=engine)

print("Database created successfully!")
