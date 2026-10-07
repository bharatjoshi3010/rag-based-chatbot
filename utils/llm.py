import os,time
from datetime import datetime
from dotenv import load_dotenv
from langchain_community.llms import CTransformers
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_ollama import ChatOllama


load_dotenv()           #loading the .env file

class LLM:
    def __init__(self) -> None:
        self.local_model_path = os.getenv('model_path')
        self.ollama_model =os.getenv('OLLAMA_MODEL', 'mistral')       #for ollama
        self.ollama_base_url = os.getenv('OLLAMA_BASE_URL', 'http://localhost:11434')    #for ollama

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
    

    #for faster Inference
    def get_llm_ollama(self) -> ChatOllama:
        """Fast local inference via Ollama."""
        llm = ChatOllama(
            model=self.ollama_model,
            base_url=self.ollama_base_url,
            temperature=0.0,
            num_ctx=4096,
            num_predict=300,
            repeat_penalty=1.15,
            stop=[
                "<|im_end|>",
                "<|im_start|>",
                "</s>",
                "\nUser:",
                "\nQuestion:",
                "Question:"
            ]
        )
        return llm