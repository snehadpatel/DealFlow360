"""Train a response generator by fine-tuning DistilGPT-2.

Reads   : backend/app/ml/data/response_training_data.json
Writes  : backend/app/ml/models/response_generator/

Run     : cd backend && python -m app.ml.train_response_generator
"""
from __future__ import annotations

import json
import os
import torch
from torch.utils.data import Dataset, DataLoader
from transformers import (
    GPT2TokenizerFast,
    GPT2LMHeadModel,
    get_linear_schedule_with_warmup,
)

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
BASE_MODEL = "distilgpt2"
EPOCHS = 12
BATCH_SIZE = 4
LR = 3e-5
MAX_LEN = 256
SEED = 42

DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "response_training_data.json")
MODEL_DIR = os.path.join(os.path.dirname(__file__), "models", "response_generator")

SPECIAL_TOKENS = {
    "pad_token": "<|pad|>",
    "additional_special_tokens": ["[INTENT]", "[CONTEXT]", "[USER]", "[RESPONSE]"],
}


# ---------------------------------------------------------------------------
# Dataset
# ---------------------------------------------------------------------------
class ResponseDataset(Dataset):
    def __init__(self, samples: list[dict], tokenizer, max_len: int):
        self.input_ids = []
        self.attention_masks = []
        self.labels = []

        for s in samples:
            full_text = s["prompt"] + " " + s["response"] + tokenizer.eos_token
            encoding = tokenizer(
                full_text,
                truncation=True,
                max_length=max_len,
                padding="max_length",
                return_tensors="pt",
            )
            input_ids = encoding["input_ids"].squeeze()
            attn_mask = encoding["attention_mask"].squeeze()

            # Labels: mask the prompt portion so loss is only on the response
            prompt_enc = tokenizer(
                s["prompt"],
                truncation=True,
                max_length=max_len,
                return_tensors="pt",
            )
            prompt_len = prompt_enc["input_ids"].shape[1]

            labels = input_ids.clone()
            labels[:prompt_len] = -100  # ignore prompt in loss
            labels[attn_mask == 0] = -100  # ignore padding

            self.input_ids.append(input_ids)
            self.attention_masks.append(attn_mask)
            self.labels.append(labels)

    def __len__(self):
        return len(self.input_ids)

    def __getitem__(self, idx):
        return {
            "input_ids": self.input_ids[idx],
            "attention_mask": self.attention_masks[idx],
            "labels": self.labels[idx],
        }


# ---------------------------------------------------------------------------
# Train
# ---------------------------------------------------------------------------
def main():
    torch.manual_seed(SEED)

    # ── Load data ──
    with open(DATA_PATH) as f:
        samples = json.load(f)
    print(f"Training on {len(samples)} prompt→response pairs")

    # ── Tokenizer & model ──
    tokenizer = GPT2TokenizerFast.from_pretrained(BASE_MODEL)
    tokenizer.add_special_tokens(SPECIAL_TOKENS)

    model = GPT2LMHeadModel.from_pretrained(BASE_MODEL)
    model.resize_token_embeddings(len(tokenizer))

    dataset = ResponseDataset(samples, tokenizer, MAX_LEN)
    dataloader = DataLoader(dataset, batch_size=BATCH_SIZE, shuffle=True)

    # ── Optimiser ──
    optimizer = torch.optim.AdamW(model.parameters(), lr=LR, weight_decay=0.01)
    total_steps = len(dataloader) * EPOCHS
    scheduler = get_linear_schedule_with_warmup(
        optimizer,
        num_warmup_steps=int(0.1 * total_steps),
        num_training_steps=total_steps,
    )

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model.to(device)
    print(f"Device: {device}")

    # ── Training loop ──
    model.train()
    for epoch in range(1, EPOCHS + 1):
        total_loss = 0
        for batch in dataloader:
            batch = {k: v.to(device) for k, v in batch.items()}
            outputs = model(**batch)
            loss = outputs.loss
            total_loss += loss.item()
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
            optimizer.step()
            scheduler.step()
            optimizer.zero_grad()

        avg_loss = total_loss / len(dataloader)
        print(f"Epoch {epoch}/{EPOCHS}  |  Loss: {avg_loss:.4f}")

    # ── Save ──
    os.makedirs(MODEL_DIR, exist_ok=True)
    model.save_pretrained(MODEL_DIR)
    tokenizer.save_pretrained(MODEL_DIR)
    print(f"\n✅ Response generator saved to {MODEL_DIR}")

    # ── Quick sanity test ──
    model.eval()
    test_prompt = "[INTENT] general\n[CONTEXT] \n[USER] Hello\n[RESPONSE]"
    inputs = tokenizer(test_prompt, return_tensors="pt").to(device)
    with torch.no_grad():
        output = model.generate(
            **inputs,
            max_new_tokens=80,
            do_sample=True,
            temperature=0.7,
            top_p=0.9,
            pad_token_id=tokenizer.pad_token_id,
        )
    generated = tokenizer.decode(output[0], skip_special_tokens=False)
    # Extract only the response part
    if "[RESPONSE]" in generated:
        response_part = generated.split("[RESPONSE]")[-1].strip()
        response_part = response_part.split("<|endoftext|>")[0].strip()
    else:
        response_part = generated
    print(f"\n🧪 Test: 'Hello' → {response_part[:200]}")


if __name__ == "__main__":
    main()
