#!/usr/bin/env python3
import sys
import json
import joblib
import pandas as pd
from typing import Dict

MODEL_PATH = 'fine_model.pkl'

# Load model once (so predictions are fast)
try:
    MODEL = joblib.load(MODEL_PATH)
except Exception as e:
    MODEL = None  # handled later with a clear error

def predict_from_payload(payload: Dict) -> int:
    if MODEL is None:
        raise RuntimeError(f"Model not loaded from {MODEL_PATH}. Run model_training.py first.")

    required = ['SpeedOverLimit', 'LocationType', 'TimeOfDay', 'PastViolations']
    for k in required:
        if k not in payload:
            raise ValueError(f"Missing required key: {k}")

    df = pd.DataFrame([{
        'SpeedOverLimit': float(payload['SpeedOverLimit']),
        'LocationType': str(payload['LocationType']),
        'TimeOfDay': str(payload['TimeOfDay']),
        'PastViolations': int(payload['PastViolations'])
    }])

    pred = MODEL.predict(df)[0]
    return int(round(pred))

def load_payload() -> Dict:
    if len(sys.argv) > 1:
        raw = sys.argv[1]
    else:
        raw = sys.stdin.read().strip()
    if not raw:
        raise ValueError("Provide a JSON payload as an argument or via stdin")
    return json.loads(raw)

def main():
    try:
        payload = load_payload()
        predicted = predict_from_payload(payload)
        print(json.dumps({'predicted_fine': predicted}))
    except Exception as e:
        # Print error to stderr as JSON (so callers can parse it)
        print(json.dumps({'error': str(e)}), file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()
