"""Train an intent classifier by fine-tuning DistilBERT.

Reads   : backend/app/ml/data/intent_training_data.json
Writes  : backend/app/ml/models/intent_classifier/

Run     : cd backend && python -m app.ml.train_intent_classifier
"""
from __future__ import annotations

import json
import os
import numpy as np
import torch
from torch.utils.data import Dataset, DataLoader
from transformers import (
    DistilBertTokenizerFast,
    DistilBertForSequenceClassification,
    get_linear_schedule_with_warmup,
)
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

from app.ml.intents import INTENT_LABELS, LABEL_TO_ID, NUM_INTENTS

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
BASE_MODEL = "distilbert-base-uncased"
EPOCHS = 8
BATCH_SIZE = 16
LR = 2e-5
MAX_LEN = 64
SEED = 42

DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "intent_training_data.json")
MODEL_DIR = os.path.join(os.path.dirname(__file__), "models", "intent_classifier")


# ---------------------------------------------------------------------------
# Dataset
# ---------------------------------------------------------------------------
class IntentDataset(Dataset):
    def __init__(self, texts, labels, tokenizer, max_len):
        self.encodings = tokenizer(
            texts, truncation=True, padding="max_length",
            max_length=max_len, return_tensors="pt",
        )
        self.labels = torch.tensor(labels, dtype=torch.long)

    def __len__(self):
        return len(self.labels)

    def __getitem__(self, idx):
        return {
            "input_ids": self.encodings["input_ids"][idx],
            "attention_mask": self.encodings["attention_mask"][idx],
            "labels": self.labels[idx],
        }


# ---------------------------------------------------------------------------
# Train
# ---------------------------------------------------------------------------
def main():
    torch.manual_seed(SEED)
    np.random.seed(SEED)

    # ── Load data ──
    with open(DATA_PATH) as f:
        raw = json.load(f)
    texts = [s["text"] for s in raw]
    labels = [LABEL_TO_ID[s["label"]] for s in raw]

    X_train, X_val, y_train, y_val = train_test_split(
        texts, labels, test_size=0.2, random_state=SEED, stratify=labels,
    )
    print(f"Train: {len(X_train)}  |  Val: {len(X_val)}")

    # ── Tokenizer & model ──
    tokenizer = DistilBertTokenizerFast.from_pretrained(BASE_MODEL)
    model = DistilBertForSequenceClassification.from_pretrained(
        BASE_MODEL, num_labels=NUM_INTENTS,
    )

    train_ds = IntentDataset(X_train, y_train, tokenizer, MAX_LEN)
    val_ds = IntentDataset(X_val, y_val, tokenizer, MAX_LEN)
    train_dl = DataLoader(train_ds, batch_size=BATCH_SIZE, shuffle=True)
    val_dl = DataLoader(val_ds, batch_size=BATCH_SIZE)

    # ── Optimiser & scheduler ──
    optimizer = torch.optim.AdamW(model.parameters(), lr=LR, weight_decay=0.01)
    total_steps = len(train_dl) * EPOCHS
    scheduler = get_linear_schedule_with_warmup(
        optimizer, num_warmup_steps=int(0.1 * total_steps), num_training_steps=total_steps,
    )

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model.to(device)
    print(f"Device: {device}")

    # ── Training loop ──
    best_acc = 0.0
    for epoch in range(1, EPOCHS + 1):
        model.train()
        total_loss = 0
        for batch in train_dl:
            batch = {k: v.to(device) for k, v in batch.items()}
            outputs = model(**batch)
            loss = outputs.loss
            total_loss += loss.item()
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
            optimizer.step()
            scheduler.step()
            optimizer.zero_grad()

        avg_loss = total_loss / len(train_dl)

        # ── Validation ──
        model.eval()
        all_preds, all_labels = [], []
        with torch.no_grad():
            for batch in val_dl:
                batch = {k: v.to(device) for k, v in batch.items()}
                outputs = model(**batch)
                preds = torch.argmax(outputs.logits, dim=-1)
                all_preds.extend(preds.cpu().numpy())
                all_labels.extend(batch["labels"].cpu().numpy())

        acc = np.mean(np.array(all_preds) == np.array(all_labels))
        print(f"Epoch {epoch}/{EPOCHS}  |  Loss: {avg_loss:.4f}  |  Val Acc: {acc:.4f}")

        if acc > best_acc:
            best_acc = acc

    # ── Save ──
    os.makedirs(MODEL_DIR, exist_ok=True)
    model.save_pretrained(MODEL_DIR)
    tokenizer.save_pretrained(MODEL_DIR)
    print(f"\n✅ Model saved to {MODEL_DIR}")
    print(f"   Best val accuracy: {best_acc:.4f}")

    # ── Final classification report ──
    print("\n" + classification_report(
        all_labels, all_preds,
        target_names=INTENT_LABELS,
        digits=3,
    ))


if __name__ == "__main__":
    main()
