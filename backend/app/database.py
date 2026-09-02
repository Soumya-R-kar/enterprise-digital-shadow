from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# If your password is "admin@123", write it like this:
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:chintu@localhost:5432/digital_shadow_db"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()