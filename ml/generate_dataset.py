# generate_dataset.py

import pandas as pd
import numpy as np
import random

# Configurations
vehicle_types = ['Bike', 'Auto', 'Heavy Vehicle', 'Car']
location_risks = ['Low', 'Medium', 'High']
road_conditions = ['Normal', 'Highway', 'School']
previous_violations = [0, 1, 2, 3]  # Number of previous offences

# Speed limits for each vehicle type
speed_limits = {
    'Bike': 80,
    'Auto': 50,
    'Heavy Vehicle': 70,
    'Car': 100
}

# Fine logic based on % exceeded
def calculate_fine(vehicle_type, speed_exceeded, prev_violations):
    speed_limit = speed_limits[vehicle_type]
    
    if speed_exceeded == 0:
        base_fine = 0
    else:
        exceed_percent = (speed_exceeded / speed_limit) * 100

        if exceed_percent <= 20:
            base_fine = 3000
        elif exceed_percent <= 30:
            base_fine = 5000
        elif exceed_percent <= 50:
            base_fine = 10000
        else:
            base_fine = 15000

    # Penalty for previous violations (each violation adds Rs 2000)
    penalty = prev_violations * 2000
    total_fine = base_fine + penalty
    return total_fine

# Generate dataset
data = []
num_samples = 1000000  # 1 million samples

for _ in range(num_samples):
    vehicle = random.choice(vehicle_types)
    location = random.choice(location_risks)
    road = random.choice(road_conditions)
    prev = random.choice(previous_violations)

    # Speed exceeded can be 0 or some random value up to 80
    if random.random() < 0.3:  # 30% chance of no violation
        speed_exceeded = 0
    else:
        speed_exceeded = random.randint(1, int(speed_limits[vehicle] * 0.8))  # up to 80% over limit

    fine = calculate_fine(vehicle, speed_exceeded, prev)

    data.append({
        'Vehicle_Type': vehicle,
        'Location_Risk': location,
        'Road_Condition': road,
        'Speed_Exceeded': speed_exceeded,
        'Previous_Violations': prev,
        'Fine': fine
    })

# Save to CSV
df = pd.DataFrame(data)
df.to_csv('fine_dataset.csv', index=False)

print('✅ Dataset generated and saved as fine_dataset.csv')
