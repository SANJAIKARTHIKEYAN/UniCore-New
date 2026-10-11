import pandas as pd

# Load original dataset
df = pd.read_csv("data/train.csv")

# Convert participation score from 0-10 to 0-100
df["Participation_Pct"] = df["Participation_Score"] * 10

# Calculate UniCore Risk Score
df["Risk_Score"] = (
    df["Attendance (%)"] * 0.25
    + df["Midterm_Score"] * 0.20
    + df["Final_Score"] * 0.25
    + df["Assignments_Avg"] * 0.10
    + df["Quizzes_Avg"] * 0.10
    + df["Participation_Pct"] * 0.05
    + df["Projects_Score"] * 0.05
)

# Create Risk Level
df["Risk_Level"] = pd.cut(
    df["Risk_Score"],
    bins=[-float("inf"), 65, 75, float("inf")],
    labels=["High Risk", "Medium Risk", "Low Risk"],
    right=False
)

# Save processed dataset
df.to_csv("data/unicore_student_risk.csv", index=False)

print("Dataset created successfully!")
print("\nRisk distribution:")
print(df["Risk_Level"].value_counts())

print("\nSaved as:")
print("data/unicore_student_risk.csv")