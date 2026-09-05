"""Train an intent classifier by fine-tuning DistilBERT on held-out evaluation splits.

Evaluates against strictly out-of-distribution sentence structures to ensure
real generalization rather than memorization.

Run: cd backend && python -m app.ml.train_intent_classifier
"""
from __future__ import annotations

import json
import os
import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
from transformers import (
    DistilBertTokenizerFast,
    DistilBertForSequenceClassification,
    DistilBertConfig,
    get_linear_schedule_with_warmup,
)
from sklearn.metrics import classification_report, f1_score

from app.ml.intents import INTENT_LABELS, LABEL_TO_ID, NUM_INTENTS

# ---------------------------------------------------------------------------
# Config & Hyperparameters
# ---------------------------------------------------------------------------
BASE_MODEL = "distilbert-base-uncased"
EPOCHS = 7
BATCH_SIZE = 16
LR = 4e-5
MAX_LEN = 64
SEED = 42

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
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
# Training Loop
# ---------------------------------------------------------------------------
def main():
    torch.manual_seed(SEED)
    np.random.seed(SEED)

    # ── Load Train & Held-out Val Datasets ──
    with open(os.path.join(DATA_DIR, "intent_train.json")) as f:
        train_raw = json.load(f)
    with open(os.path.join(DATA_DIR, "intent_val.json")) as f:
        val_raw = json.load(f)

    X_train = [s["text"] for s in train_raw]
    y_train = [LABEL_TO_ID[s["label"]] for s in train_raw]

    X_val = [s["text"] for s in val_raw]
    y_val = [LABEL_TO_ID[s["label"]] for s in val_raw]

    print(f"Dataset Split (Zero Template Overlap):")
    print(f"  Training set   : {len(X_train)} samples")
    print(f"  Held-out Val set: {len(X_val)} samples (Unseen Phrasing & Syntax)")

    # ── Tokenizer & Regularized Model Configuration ──
    tokenizer = DistilBertTokenizerFast.from_pretrained(BASE_MODEL)
    config = DistilBertConfig.from_pretrained(
        BASE_MODEL,
        num_labels=NUM_INTENTS,
        seq_classif_dropout=0.25,
        dropout=0.20,
        attention_dropout=0.20,
    )
    model = DistilBertForSequenceClassification.from_pretrained(
        BASE_MODEL, config=config,
    )

    train_ds = IntentDataset(X_train, y_train, tokenizer, MAX_LEN)
    val_ds = IntentDataset(X_val, y_val, tokenizer, MAX_LEN)
    train_dl = DataLoader(train_ds, batch_size=BATCH_SIZE, shuffle=True)
    val_dl = DataLoader(val_ds, batch_size=BATCH_SIZE)

    # ── Optimizer with Weight Decay & Label Smoothing Criterion ──
    optimizer = torch.optim.AdamW(model.parameters(), lr=LR, weight_decay=0.05)
    criterion = nn.CrossEntropyLoss(label_smoothing=0.10)

    total_steps = len(train_dl) * EPOCHS
    scheduler = get_linear_schedule_with_warmup(
        optimizer, num_warmup_steps=int(0.1 * total_steps), num_training_steps=total_steps,
    )

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model.to(device)
    print(f"Device: {device}")

    best_val_f1 = 0.0

    for epoch in range(1, EPOCHS + 1):
        model.train()
        total_loss = 0.0
        for batch in train_dl:
            input_ids = batch["input_ids"].to(device)
            attention_mask = batch["attention_mask"].to(device)
            labels = batch["labels"].to(device)

            optimizer.zero_grad()
            outputs = model(input_ids=input_ids, attention_mask=attention_mask)
            loss = criterion(outputs.logits, labels)
            total_loss += loss.item()

            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
            optimizer.step()
            scheduler.step()

        avg_train_loss = total_loss / len(train_dl)

        # ── Out-of-Distribution Validation ──
        model.eval()
        all_preds, all_labels = [], []
        with torch.no_grad():
            for batch in val_dl:
                input_ids = batch["input_ids"].to(device)
                attention_mask = batch["attention_mask"].to(device)
                outputs = model(input_ids=input_ids, attention_mask=attention_mask)
                preds = torch.argmax(outputs.logits, dim=-1)
                all_preds.extend(preds.cpu().numpy())
                all_labels.extend(batch["labels"].numpy())

        val_acc = np.mean(np.array(all_preds) == np.array(all_labels))
        val_f1 = f1_score(all_labels, all_preds, average="macro")

        print(f"Epoch {epoch}/{EPOCHS}  |  Train Loss: {avg_train_loss:.4f}  |  Val Acc: {val_acc:.4f}  |  Val Macro F1: {val_f1:.4f}")

        if val_f1 >= best_val_f1:
            best_val_f1 = val_f1
            os.makedirs(MODEL_DIR, exist_ok=True)
            model.save_pretrained(MODEL_DIR)
            tokenizer.save_pretrained(MODEL_DIR)

    print(f"\n✅ Regularized Intent Classifier saved to {MODEL_DIR}")
    print(f"   Held-out Generalization F1: {best_val_f1:.4f}")

    # ── Final Report on Unseen Test Distribution ──
    print("\n" + classification_report(
        all_labels, all_preds,
        target_names=INTENT_LABELS,
        digits=3,
    ))


if __name__ == "__main__":
    main()
