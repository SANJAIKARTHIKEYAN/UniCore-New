import pandas as pd
from sklearn.model_selection import train_test_split

# Load our processed dataset
df = pd.read_csv("data/unicore_student_risk.csv")

# Features used by the ML model
features = [
    "Attendance (%)",
    "Midterm_Score",
    "Final_Score",
    "Assignments_Avg",
    "Quizzes_Avg",
    "Participation_Score",
    "Projects_Score"
]

# Input data
X = df[features]

# Target data
y = df["Risk_Level"]

# Split the data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

print("Data preparation successful!")

print("\nTotal records:", len(df))
print("Training records:", len(X_train))
print("Testing records:", len(X_test))

print("\nTraining risk distribution:")
print(y_train.value_counts())

print("\nTesting risk distribution:")
print(y_test.value_counts())

#-------------------------------------
# RAMNDOM FOREST MODEL TRAIN
#-------------------------------------

from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report

# Create the Random Forest model
model = RandomForestClassifier(
    n_estimators=100,
    random_state=42
)

# Train the model
model.fit(X_train, y_train)

# Make predictions on test data
y_pred = model.predict(X_test)

# Calculate accuracy
accuracy = accuracy_score(y_test, y_pred)

print("\nModel Accuracy:", round(accuracy * 100, 2), "%")

# Detailed performance report
print("\nClassification Report:")
print(classification_report(y_test, y_pred))

# -----------------------------
# FEATURE IMPORTANCE
# -----------------------------

importance = pd.Series(
    model.feature_importances_,
    index=features
).sort_values(ascending=False)

print("\nFeature Importance:")
print((importance * 100).round(2))

import joblib

# Save the trained model
joblib.dump(model, "models/random_forest_model.pkl")

print("\nModel saved successfully!")

# -----------------------------
# EARLY PREDICTION MODEL
# -----------------------------

from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report

# Features available before the final exam
early_features = [
    "Attendance (%)",
    "Midterm_Score",
    "Assignments_Avg",
    "Quizzes_Avg",
    "Participation_Score",
    "Projects_Score"
]

# Early prediction input
X_early = df[early_features]

# Same risk target
y_early = df["Risk_Level"]

# Split early prediction data
X_early_train, X_early_test, y_early_train, y_early_test = train_test_split(
    X_early,
    y_early,
    test_size=0.20,
    random_state=42,
    stratify=y_early
)

# Create early prediction model
early_model = RandomForestClassifier(
    n_estimators=100,
    random_state=42
)

# Train early model
early_model.fit(X_early_train, y_early_train)

# Predict
y_early_pred = early_model.predict(X_early_test)

# Accuracy
early_accuracy = accuracy_score(y_early_test, y_early_pred)

print("\n=================================")
print("     EARLY PREDICTION MODEL")
print("=================================")

print("\nEarly Model Accuracy:",
      round(early_accuracy * 100, 2), "%")

print("\nEarly Model Classification Report:")
print(classification_report(y_early_test, y_early_pred))

# Save early model
joblib.dump(
    early_model,
    "models/early_random_forest_model.pkl"
)

print("\nEarly model saved successfully!")