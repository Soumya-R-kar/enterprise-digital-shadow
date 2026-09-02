import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

# Load local .env file if it exists (for your local computer)
load_dotenv()

# 1. Get the URL from Render's Environment Variables
DATABASE_URL = os.getenv("DATABASE_URL")

# 2. Fallback to local SQLite if no cloud database is found
if not DATABASE_URL:
    DATABASE_URL = "sqlite:///./local_test.db"

# 3. Fix Neon's connection string format (postgres:// -> postgresql://)
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# 4. Create the database engine
# (We add connect_args for SQLite compatibility locally)
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(DATABASE_URL, connect_args=connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()