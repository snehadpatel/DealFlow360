import os
from langchain_google_genai import ChatGoogleGenerativeAI
from app.core.config import settings

def get_llm():
    api_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY")
    if not api_key:
        return None
    return ChatGoogleGenerativeAI(
        model="gemini-1.5-flash",
        google_api_key=api_key,
        temperature=0.2,
    )
