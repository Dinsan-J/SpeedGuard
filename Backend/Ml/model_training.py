#!/usr/bin/env python3
# model_training.py
# Train a RandomForestRegressor on sample_data.csv and save a scikit-learn pipeline as fine_model.pkl

import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_absolute_error


def main():
    # Load dataset
    df = pd.read_csv('sample_data.csv')
    df = df.dropna()

    # Features and target
    X = df[['SpeedOverLimit', 'LocationType', 'TimeOfDay', 'PastViolations']]
    y = df['FineAmount']

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
        ('model', RandomForestRegressor(n_estimators=200, random_state=42))
    ])

    # Train/test split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Fit the model
    pipeline.fit(X_train, y_train)

    # Evaluate
    preds = pipeline.predict(X_test)
    mae = mean_absolute_error(y_test, preds)
    print(f"Training done. MAE on test set: {mae:.2f}")

    # Save trained pipeline
    joblib.dump(pipeline, 'fine_model.pkl')
    print("Saved trained pipeline to fine_model.pkl")


if __name__ == '__main__':
    main()
