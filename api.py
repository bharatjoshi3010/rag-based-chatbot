# pip install fastapi uvicorn

from fastapi import FastAPI
import uvicorn
import os
from dotenv import load_dotenv
from enum import Enum
from pydantic import BaseModel


load_dotenv()

app = FastAPI()

# @app.get("/hello")    #our endpoint url
# async def hello():
#     return 'Hello World'    #we get this on the screen

# @app.get("/hello/{name}")      #dynamic route
# async def hello(name:str):
#     return f"Hello {name} "

models = {
    'LLMs' : ['OpenAI', 'Mistral'],
    'NLP' : ['Bert', 'RoBerta'],
    'ML' : ['Xgboost', 'Catboost']
}

# @app.get("/get_models/{usecase}")
# async def get_items(usecase:str):
#     return models.get(usecase)     #here if we enter a usecase which not exist then it returns null

### Validation:

class AvailableModel(str, Enum):       #kinda typesafety validation of typescript
    LLMs = "LLMs"
    NLP = "NLP"
    ML = "ML"
    
@app.get("/get_models/{usecase}")
async def get_items(usecase: AvailableModel):
    return models.get(usecase)          #it checks the given use case is valid or not, if not then give a error

#### working of post method

class Item(BaseModel):     ##type validation(paydantic), get the response in following format onlyy
    name: str
    description: str | None = None
    price: float
    tax: float | None = None

@app.post("/items/")
async def create_item(item: Item):
    return item

#### http://127.0.0.1:7860/docs   go here and click on post method and you can see validation is working fine


if __name__ == "__main__":
    # mounting at the root path
    uvicorn.run(
        app="api:app",
        host=os.getenv("UVICORN_HOST"),  
        port=int(os.getenv("UVICORN_PORT"))
    )