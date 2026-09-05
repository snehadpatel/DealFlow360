"""Chat request and response schemas."""
from typing import Dict, List, Optional
from pydantic import BaseModel


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    active_screen: Optional[str] = None
    entity_id: Optional[str] = None


class ModelInfo(BaseModel):
    classifier: bool = True
    generator: bool = True


class ChatResponse(BaseModel):
    reply: str
    intent: str
    confidence: float
    suggestions: List[str] = []
    entities: Dict[str, str] = {}
    session_id: Optional[str] = None
    model_used: Optional[ModelInfo] = None
