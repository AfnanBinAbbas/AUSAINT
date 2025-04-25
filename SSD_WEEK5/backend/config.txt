# config.py
import os
from urllib.parse import quote_plus
from dotenv import load_dotenv

load_dotenv()

USE_SUPABASE = os.getenv("USE_SUPABASE", "false").lower() == "true"

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "supersecret")

    if USE_SUPABASE:
        db_user = os.getenv("SUPABASE_USER")
        db_pass = quote_plus(os.getenv("SUPABASE_PASSWORD"))
        db_host = os.getenv("SUPABASE_HOST")
        db_name = os.getenv("SUPABASE_DB")
    else:
        db_user = os.getenv("LOCAL_DB_USER", "postgres")
        db_pass = quote_plus(os.getenv("LOCAL_DB_PASS", "password"))
        db_host = os.getenv("LOCAL_DB_HOST", "localhost")
        db_name = os.getenv("LOCAL_DB_NAME", "mydb")

    SQLALCHEMY_DATABASE_URI = f"postgresql://{db_user}:{db_pass}@{db_host}/{db_name}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
