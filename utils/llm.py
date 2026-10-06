import os,time
from datetime import datetime
from dotenv import load_dotenv
from langchain_community.llms import CTransformers
from langchain_together import Together
from langchain_google_genai import ChatGoogleGenerativeAI


load_dotenv()           #loading the .env file

class LLM:
    def __init__(self) -> None:
        self.local_model_path = os.getenv('model_path')

    def get_llm(self) -> CTransformers:           #for cpu capable inference
        
        start = time.time()

        llm = CTransformers(model=self.local_model_path,
                            config={'max_new_tokens': 4096,
                                'temperature': 0.00,
                                'context_length': 4096})
        end = time.time()
        print('Time to load the model:',end-start)
        return llm

    def get_llm_gemini(self) -> ChatGoogleGenerativeAI:       #for fast inference
        llm = ChatGoogleGenerativeAI(
            model=os.getenv("gemini_Model", "gemini-2.0-flash"),  # reads from .env
            api_key=os.getenv("GEMINI_API_KEY"),
            temperature=0.7
        )
        return llm