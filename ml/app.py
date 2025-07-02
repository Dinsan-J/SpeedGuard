from flask import Flask, request, jsonify
import joblib
import pandas as pd
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load the trained model (pipeline)
model = joblib.load('fine_predictor_model.joblib')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get data from the request
        data = request.get_json()

        # Ensure data is in a list of dicts
        if isinstance(data, dict):
            data = [data]
        df = pd.DataFrame(data)

        # Validate required columns
        required_columns = ['Vehicle_Type', 'Location_Risk', 'Road_Condition', 'Speed_Exceeded']
        if not all(col in df.columns for col in required_columns):
            return jsonify({'error': f'Missing required columns. Required columns: {required_columns}'}), 400

        # Make prediction directly (pipeline handles preprocessing)
        predictions = model.predict(df)

        return jsonify({'predictions': [round(p, 2) for p in predictions]})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
