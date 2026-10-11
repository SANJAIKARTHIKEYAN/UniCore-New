import joblib
import pandas as pd

# Load the trained model
model = joblib.load("models/random_forest_model.pkl")

print("=================================")
print("       UniCore Risk Predictor")
print("=================================")

# Get student details
attendance = float(input("Enter Attendance (%): "))
midterm = float(input("Enter Midterm Score: "))
final = float(input("Enter Final Score: "))
assignments = float(input("Enter Assignments Average: "))
quizzes = float(input("Enter Quizzes Average: "))
participation = float(input("Enter Participation Score (0-10): "))
projects = float(input("Enter Projects Score: "))

# Create student data
student = pd.DataFrame([[
    attendance,
    midterm,
    final,
    assignments,
    quizzes,
    participation,
    projects
]], columns=[
    "Attendance (%)",
    "Midterm_Score",
    "Final_Score",
    "Assignments_Avg",
    "Quizzes_Avg",
    "Participation_Score",
    "Projects_Score"
])

# Predict risk
prediction = model.predict(student)[0]

# Get probabilities
probabilities = model.predict_proba(student)[0]

print("\n=================================")
print("          Prediction")
print("=================================")

print("Risk Level:", prediction)

print("\nRisk Probabilities:")

for risk, probability in zip(model.classes_, probabilities):
    print(f"{risk}: {probability * 100:.2f}%")