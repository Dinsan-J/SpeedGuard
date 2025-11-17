#!/usr/bin/env python3
# fine_prediction.py
# Load fine_model.pkl and predict fine amount from JSON input

import os
import sys
import json
import joblib
import pandas as pd

# Path to the trained model (in the same folder as this script)
MODEL_PATH = os.path.join(os.path.dirname(__file__), "fine_model.pkl")

# Load model
try:
    model = joblib.load(MODEL_PATH)
except Exception as e:
    print(json.dumps({"error": f"Model not loaded from {MODEL_PATH}. Run model_training.py first. {e}"}))
    sys.exit(1)

def predict_from_payload(payload: dict) -> int:
    # Required keys
    keys = ['SpeedOverLimit', 'LocationType', 'TimeOfDay', 'PastViolations']
    for k in keys:
        if k not in payload:
            raise ValueError(f"Missing required key: {k}")

    # Build DataFrame (order/names must match training)
    df = pd.DataFrame([{
        'SpeedOverLimit': float(payload['SpeedOverLimit']),
        'LocationType': str(payload['LocationType']),
        'TimeOfDay': str(payload['TimeOfDay']),
        'PastViolations': int(payload['PastViolations'])
    }])

    pred = model.predict(df)[0]
    return int(round(pred))

def main():
    # Read JSON from argument or stdin
    if len(sys.argv) > 1:
        raw = sys.argv[1]
    else:
        raw = sys.stdin.read().strip()

    if not raw:
        print(json.dumps({"error": "Provide a JSON payload as an argument or via stdin"}))
        sys.exit(2)

    try:
        payload = json.loads(raw)
    except json.JSONDecodeError as e:
        print(json.dumps({"error": f"Invalid JSON input: {e}"}))
        sys.exit(1)

    try:
        predicted = predict_from_payload(payload)
        print(json.dumps({"predicted_fine": predicted}))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()
