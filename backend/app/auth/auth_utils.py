import bcrypt
from jose import jwt
from datetime import datetime, timedelta

# 🔐 Secret key (keep safe)
SECRET_KEY = "your_secret_key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60


# 🔐 Hash password
def hash_password(password: str):
    # Truncate and encode to bytes
    password_bytes = password[:72].encode('utf-8')
    # Generate salt and hash
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')


# 🔐 Verify password
def verify_password(plain_password, hashed_password):
    try:
        # Encode to bytes
        plain_bytes = str(plain_password)[:72].encode('utf-8')
        hashed_bytes = str(hashed_password).encode('utf-8')
        return bcrypt.checkpw(plain_bytes, hashed_bytes)
    except Exception:
        return False


# 🔐 Create JWT token
def create_access_token(data: dict):

    to_encode = data.copy()

    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire})

    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
