# train_model.py

import pandas as pd
from sklearn.preprocessing import OneHotEncoder
from sklearn.ensemble import RandomForestRegressor
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
import joblib

# Load dataset
df = pd.read_csv('fine_dataset.csv')
 # Your generated dataset filename

# Features and target
X = df.drop('Fine', axis=1)
y = df['Fine']

# Categorical and numerical columns
categorical_features = ['Vehicle_Type', 'Location_Risk', 'Road_Condition']
numerical_features = ['Speed_Exceeded', 'Previous_Violations']

# Preprocessor
preprocessor = ColumnTransformer(transformers=[
    ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features),
], remainder='passthrough')  # Pass numerical as is

# Model pipeline
pipeline = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('model', RandomForestRegressor(n_estimators=100, random_state=42))
])

# Train model
pipeline.fit(X, y)

# Save model
joblib.dump(pipeline, 'fine_predictor_model.joblib')
print("✅ Model trained and saved as fine_predictor_model.joblib")
