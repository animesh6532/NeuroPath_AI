from pydantic import BaseModel, EmailStr, constr

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: constr(min_length=6, max_length=72)  

class UserLogin(BaseModel):
    email: EmailStr
    password: constr(min_length=6, max_length=72)
