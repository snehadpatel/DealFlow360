"""Safe LLM runtime for the narration layer.

The single choke-point through which every agent talks to Gemini. Guarantees
the live demo can never hang or crash on the model:

* **Never required** — returns ``None`` the instant the model is unavailable
  (no package, no key, construction error). Callers render a deterministic
  template on ``None``; the numbers never depend on the network.
* **Hard wall-clock timeout** — the call runs on a worker thread and is
  abandoned after ``LLM_TIMEOUT_SECONDS`` even if the SDK ignores its own
  timeout. A slow model degrades to the template instead of freezing the UI.
* **Bounded response cache** — sha256 of (task, model, inputs, schema) keys an
  LRU of ``AI_CACHE_SIZE`` entries, so repeated demo clicks are instant and
  free.
* **Two-path structured output** — prefer ``with_structured_output`` (native
  tool/JSON schema); fall back to a ``PydanticOutputParser`` when the model or
  version doesn't support it. Either way you get a validated pydantic object.

The prose the model writes is merged by the caller *around* the pre-computed
numbers — this module has no idea what a discount is, which keeps the "LLM
never owns a number" boundary structural, not just a convention.
"""
from __future__ import annotations

import hashlib
import json
import logging
from collections import OrderedDict
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FutureTimeout
from typing import Optional, Type, TypeVar

from pydantic import BaseModel

from app.core.config import settings
from app.core.llm import get_llm

logger = logging.getLogger("dealflow.ai")

try:  # optional — guarded like everything else in this layer
    from langchain_core.prompts import ChatPromptTemplate
    from langchain_core.output_parsers import PydanticOutputParser
except Exception:  # pragma: no cover - import guard
    ChatPromptTemplate = None
    PydanticOutputParser = None

T = TypeVar("T", bound=BaseModel)

_CACHE: "OrderedDict[str, BaseModel]" = OrderedDict()
_EXECUTOR = ThreadPoolExecutor(max_workers=2, thread_name_prefix="llm")


def _cache_key(task: str, variables: dict, model_name: str, schema: str) -> str:
    blob = json.dumps({"t": task, "v": variables, "m": model_name, "s": schema},
                      sort_keys=True, default=str)
    return hashlib.sha256(blob.encode("utf-8")).hexdigest()


def _cache_get(key: str) -> Optional[BaseModel]:
    if key in _CACHE:
        _CACHE.move_to_end(key)
        return _CACHE[key]
    return None


def _cache_put(key: str, value: BaseModel) -> None:
    _CACHE[key] = value
    _CACHE.move_to_end(key)
    while len(_CACHE) > max(1, settings.AI_CACHE_SIZE):
        _CACHE.popitem(last=False)


def _build_and_invoke(llm, system: str, human: str, variables: dict, output_model: Type[T]) -> T:
    """Path A: native structured output. Path B: PydanticOutputParser fallback."""
    # Path A — with_structured_output (preferred).
    try:
        prompt = ChatPromptTemplate.from_messages([("system", system), ("human", human)])
        chain = prompt | llm.with_structured_output(output_model)
        result = chain.invoke(variables)
        if isinstance(result, output_model):
            return result
        if isinstance(result, dict):
            return output_model(**result)
    except Exception as exc:  # fall through to path B
        logger.debug("structured-output path failed (%s); trying parser", exc)

    # Path B — explicit parser with format instructions.
    parser = PydanticOutputParser(pydantic_object=output_model)
    prompt = ChatPromptTemplate.from_messages([
        ("system", system + "\n\nReturn ONLY valid JSON matching this schema:\n{format_instructions}"),
        ("human", human),
    ]).partial(format_instructions=parser.get_format_instructions())
    chain = prompt | llm | parser
    return chain.invoke(variables)


def run_structured(task: str, system: str, human: str, variables: dict,
                   output_model: Type[T]) -> Optional[T]:
    """Run a narration prompt and return a validated ``output_model`` or ``None``.

    ``None`` is the universal "use your deterministic fallback" signal: it means
    no model, no langchain, a timeout, or a parse/validation failure — the
    caller must not care which.
    """
    if ChatPromptTemplate is None or PydanticOutputParser is None:
        return None
    llm = get_llm()
    if llm is None:
        return None

    key = _cache_key(task, variables, getattr(settings, "GEMINI_MODEL", "?"), output_model.__name__)
    cached = _cache_get(key)
    if cached is not None:
        return cached

    future = _EXECUTOR.submit(_build_and_invoke, llm, system, human, variables, output_model)
    try:
        result = future.result(timeout=settings.LLM_TIMEOUT_SECONDS)
    except FutureTimeout:
        future.cancel()
        logger.warning("LLM task '%s' timed out after %ss; using fallback", task, settings.LLM_TIMEOUT_SECONDS)
        return None
    except Exception as exc:
        logger.warning("LLM task '%s' failed (%s); using fallback", task, exc)
        return None

    if result is not None:
        _cache_put(key, result)
    return result


def llm_available() -> bool:
    """True if a live model can be constructed right now (for /health & basis)."""
    return ChatPromptTemplate is not None and get_llm() is not None
