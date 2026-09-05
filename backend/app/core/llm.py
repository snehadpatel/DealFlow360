"""Gemini LLM factory for the narration layer.

Demo-safety: the import of ``langchain_google_genai`` is wrapped so the whole
API still boots if the package is missing from the environment. ``get_llm()``
returns ``None`` whenever the model is unavailable (no package, no key, or
construction error), which every agent treats as the signal to fall back to
its deterministic template. The AI layer never *needs* an LLM to produce a
number — the LLM only writes prose.
"""
import os

from app.core.config import settings

try:  # optional dependency — never crash import if it's absent
    from langchain_google_genai import ChatGoogleGenerativeAI
except Exception:  # ImportError, or partial/broken install
    ChatGoogleGenerativeAI = None


def get_llm():
    """Return a configured Gemini chat model, or ``None`` if unavailable.

    Callers must handle ``None`` by rendering their deterministic fallback.
    """
    if ChatGoogleGenerativeAI is None:
        return None

    api_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY")
    if not api_key:
        return None

    try:
        return ChatGoogleGenerativeAI(
            model=settings.GEMINI_MODEL,
            google_api_key=api_key,
            temperature=0.2,
            max_retries=0,  # fail fast; the caller's timeout + fallback handle it
            timeout=settings.LLM_TIMEOUT_SECONDS,
        )
    except Exception:
        return None
