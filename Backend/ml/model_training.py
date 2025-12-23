#!/usr/bin/env python3
# model_training.py
# Train a RandomForestRegressor to predict risk scores and save as risk_model.pkl

import os
import pandas as pd
import joblib
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_absolute_error, r2_score


def generate_expanded_dataset(original_df, target_rows=900):
    """Generate an expanded dataset with risk scores based on traffic violation patterns"""
    np.random.seed(42)  # For reproducible results
    
    # Define realistic ranges and patterns
    location_types = ['Highway', 'SchoolZone', 'Residential', 'Urban']
    time_of_day = ['Morning', 'Day', 'Evening', 'Night']
    
    # Generate synthetic data
    data = []
    for _ in range(target_rows):
        speed_over = np.random.randint(1, 35)  # 1-34 km/h over limit
        location = np.random.choice(location_types)
        time = np.random.choice(time_of_day)
        past_violations = np.random.randint(0, 6)  # 0-5 past violations
        
        # Calculate risk score (0-100 scale)
        base_risk = min(speed_over * 2, 60)  # Speed contributes up to 60 points
        
        # Location risk factors
        location_risk = {
            'SchoolZone': 25,    # Highest risk - children present
            'Residential': 15,   # High risk - pedestrians
            'Urban': 10,         # Medium risk - traffic density
            'Highway': 5         # Lower risk - designed for speed
        }[location]
        
        # Time risk factors
        time_risk = {
            'Night': 10,     # Higher risk - reduced visibility
            'Evening': 5,    # Medium risk - rush hour
            'Morning': 5,    # Medium risk - rush hour
            'Day': 0         # Lower risk - optimal conditions
        }[time]
        
        # Past violations risk (exponential increase)
        violation_risk = past_violations * 3 if past_violations <= 2 else past_violations * 5
        
        # Calculate total risk score
        risk_score = base_risk + location_risk + time_risk + violation_risk
        
        # Add some random variation and cap at 100
        risk_score = risk_score * (0.85 + np.random.random() * 0.3)  # ±15% variation
        risk_score = min(100, max(10, int(risk_score)))  # Keep between 10-100
        
        data.append({
            'SpeedOverLimit': speed_over,
            'LocationType': location,
            'TimeOfDay': time,
            'PastViolations': past_violations,
            'RiskScore': risk_score
        })
    
    return pd.DataFrame(data)


def main():
    # Generate expanded dataset with risk scores
    print("Generating expanded dataset with 900 rows and risk scores...")
    df = generate_expanded_dataset(None, target_rows=900)
    
    # Save the risk score dataset
    risk_data_path = os.path.join(os.path.dirname(__file__), 'risk_score_data.csv')
    df.to_csv(risk_data_path, index=False)
    print(f"Saved risk score dataset to {risk_data_path}")
    
    df = df.dropna()

    # Features and target (now predicting RiskScore instead of FineAmount)
    X = df[['SpeedOverLimit', 'LocationType', 'TimeOfDay', 'PastViolations']]
    y = df['RiskScore']
    
    print(f"Training with {len(df)} rows of data")
    print(f"Dataset statistics:")
    print(f"- Speed over limit: {X['SpeedOverLimit'].min()}-{X['SpeedOverLimit'].max()} km/h")
    print(f"- Risk scores: {y.min()}-{y.max()}")
    print(f"- Location types: {X['LocationType'].unique()}")
    print(f"- Time periods: {X['TimeOfDay'].unique()}")

    # Preprocessing: one-hot encode categorical columns
    cat_cols = ['LocationType', 'TimeOfDay']
    preprocessor = ColumnTransformer(
        transformers=[
            ('cat', OneHotEncoder(handle_unknown='ignore'), cat_cols),
        ],
        remainder='passthrough'  # keep numeric columns
    )

    # Pipeline with preprocessor + RandomForest model
    pipeline = Pipeline([
        ('pre', preprocessor),
        ('model', RandomForestRegressor(n_estimators=300, random_state=42, max_depth=10))
    ])

    # Train/test split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Fit the model
    pipeline.fit(X_train, y_train)

    # Evaluate
    preds = pipeline.predict(X_test)
    mae = mean_absolute_error(y_test, preds)
    r2 = r2_score(y_test, preds)
    print(f"Training done. MAE on test set: {mae:.2f} risk score points")
    print(f"R² Score: {r2:.4f} ({r2*100:.2f}% of variance explained)")

    # Save trained pipeline as risk model
    model_path = os.path.join(os.path.dirname(__file__), 'risk_model.pkl')
    joblib.dump(pipeline, model_path)
    print(f"Saved trained risk prediction pipeline to {model_path}")
    
    # Show some example predictions
    print("\nExample risk predictions:")
    examples = [
        [5, 'Residential', 'Day', 0],
        [15, 'SchoolZone', 'Night', 2],
        [25, 'Highway', 'Morning', 1],
        [30, 'Urban', 'Evening', 4]
    ]
    
    for example in examples:
        example_df = pd.DataFrame([example], columns=['SpeedOverLimit', 'LocationType', 'TimeOfDay', 'PastViolations'])
        risk = pipeline.predict(example_df)[0]
        print(f"  {example[0]}km/h over in {example[1]} at {example[2]}, {example[3]} past violations → Risk: {risk:.1f}")


if __name__ == '__main__':
    main()
