import uvicorn
import os
from typing import List, Dict, Any, Optional
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from dotenv import load_dotenv
import gradio as gr
from utils.inference import predict_rag

load_dotenv()

app = FastAPI(title="Chatbot about Bharat")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(BASE_DIR, "static")

# Mount static files for modern ChatGPT-like UI
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


class ChatRequest(BaseModel):
    message: str
    history: Optional[List[Dict[str, Any]]] = []


class ChatResponse(BaseModel):
    response: str


# Legacy schemas for backwards compatibility
class Request(BaseModel):
    prompt: str


class Response(BaseModel):
    response: str


# Modern frontend home route
@app.get("/")
async def serve_index():
    return FileResponse(os.path.join(STATIC_DIR, "index.html"))


# API route with conversation history context
@app.post("/api/chat", response_model=ChatResponse)
def chat_api(req: ChatRequest):
    reply = predict_rag(req.message, history=req.history)
    return {"response": reply}


# Legacy API route
@app.post("/predict", response_model=Response)
def predict_api(prompt: Request):
    reply = predict_rag(prompt.prompt)
    return {"response": reply}


# Optional: Gradio interface mounted at /gradio
demo = gr.ChatInterface(
    fn=predict_rag,
    textbox=gr.Textbox(
        placeholder="Ask a question",
        container=False,
        lines=1,
        scale=8
    ),
    title="Chatbot about Bharat",
)

app = gr.mount_gradio_app(app, demo, path="/gradio")


if __name__ == "__main__":
    uvicorn.run(
        app="main:app",
        host=os.getenv("UVICORN_HOST", "127.0.0.1"),
        port=int(os.getenv("UVICORN_PORT", 7860))
    )
