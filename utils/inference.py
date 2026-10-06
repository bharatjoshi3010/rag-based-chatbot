from utils.llm import LLM
from utils.build_rag import RAG
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough, RunnableLambda

# ── Loaded ONCE at startup ─────────────────────────────────────────────────
_llm       = LLM().get_llm_gemini()          # switch to get_llm_gemini() for Gemini
_retriever = RAG().get_retriever(search_kwargs={"k": 5})

_template = """You are the official AI Representative and Ambassador for Bharat. You possess comprehensive knowledge about Bharat based on his documented portfolio, background, experience, and skills.
The user chatting with you is someone learning or inquiring about Bharat (such as a recruiter, collaborator, or visitor), NOT Bharat himself.

Core Guidelines:
1. Speak confidently as Bharat's representative. Always refer to Bharat in the third person ("Bharat is...", "His experience includes...", "Bharat specializes in...").
2. NEVER ask the user for information about Bharat (e.g., NEVER say "Can you tell me Bharat's favorite places?" or "Could you share more details about Bharat?"). You are the knowledgeable authority on Bharat.
3. You may offer to provide more details (e.g., "Would you like to know more about Bharat's skills or projects?").
4. Use the document context below for factual information about Bharat. If a specific detail is not found in the document, provide a helpful, professional response based on what is available, and never ask the user to fill in missing personal facts.
5. Maintain full memory and context of the ongoing conversation history.

Document Context:
{context}

{chat_history}
Question: {question}

Answer:"""

_prompt = ChatPromptTemplate.from_template(_template)


def _format_history(history) -> str:
    """Convert Gradio history (either list of dicts [{'role': ..., 'content': ...}] or [user, bot] pairs) into a readable string."""
    if not history:
        return ""
    lines = ["Conversation so far:"]
    for turn in history:
        if isinstance(turn, dict):
            role = "User" if turn.get("role") == "user" else "Assistant"
            content = turn.get("content", "")
            if isinstance(content, str) and content.strip():
                lines.append(f"{role}: {content.strip()}")
        elif isinstance(turn, (list, tuple)) and len(turn) == 2:
            user_msg, bot_msg = turn
            if user_msg:
                lines.append(f"User: {user_msg}")
            if bot_msg:
                lines.append(f"Assistant: {bot_msg}")
    return "\n".join(lines) + "\n\n" if len(lines) > 1 else ""


def predict_rag(qns: str, history=None) -> str:
    chat_history_str = _format_history(history)

    # Chain is cheap to build per-call; only LLM & retriever (expensive) are singletons
    chain = (
        {
            "context":      _retriever,
            "question":     RunnablePassthrough(),
            "chat_history": RunnableLambda(lambda _: chat_history_str),
        }
        | _prompt
        | _llm
        | StrOutputParser()
    )
    return chain.invoke(qns)
