#!/usr/bin/env python3
"""
UniCore ML Inference Bridge Script
Loads the verified UniCore Random Forest model in read-only mode and generates
risk predictions and class probabilities for academic early-warning advisory.
"""
import sys
import json
import os

def main():
    try:
        # Read JSON input from argument or stdin
        if len(sys.argv) > 1:
            raw_input = sys.argv[1]
        else:
            raw_input = sys.stdin.read()

        if not raw_input or not raw_input.strip():
            print(json.dumps({"error": "Empty input provided to prediction engine"}))
            sys.exit(1)

        data = json.loads(raw_input)
        model_dir = data.get("modelDir", "ML/models")
        use_early = data.get("useEarlyModel", False)

        import joblib
        import pandas as pd

        # Select model based on whether final exam is available or early prediction is requested
        if use_early:
            model_file = "early_random_forest_model.pkl"
            model_path = os.path.join(model_dir, model_file)
            features = [
                "Attendance (%)",
                "Midterm_Score",
                "Assignments_Avg",
                "Quizzes_Avg",
                "Participation_Score",
                "Projects_Score"
            ]
            row = [
                float(data.get("attendance", 75.0)),
                float(data.get("midterm", 70.0)),
                float(data.get("assignments", 75.0)),
                float(data.get("quizzes", 75.0)),
                float(data.get("participation", 7.5)),
                float(data.get("projects", 75.0))
            ]
        else:
            model_file = "random_forest_model.pkl"
            model_path = os.path.join(model_dir, model_file)
            features = [
                "Attendance (%)",
                "Midterm_Score",
                "Final_Score",
                "Assignments_Avg",
                "Quizzes_Avg",
                "Participation_Score",
                "Projects_Score"
            ]
            row = [
                float(data.get("attendance", 75.0)),
                float(data.get("midterm", 70.0)),
                float(data.get("final", 70.0)),
                float(data.get("assignments", 75.0)),
                float(data.get("quizzes", 75.0)),
                float(data.get("participation", 7.5)),
                float(data.get("projects", 75.0))
            ]

        if not os.path.exists(model_path):
            print(json.dumps({"error": f"Model file not found at {model_path}"}))
            sys.exit(2)

        model = joblib.load(model_path)
        df = pd.DataFrame([row], columns=features)

        prediction = model.predict(df)[0]
        probas = model.predict_proba(df)[0]
        probabilities = {str(c): round(float(p), 4) for c, p in zip(model.classes_, probas)}
        confidence = round(float(max(probas)), 4)

        result = {
            "riskLevel": str(prediction),
            "confidence": confidence,
            "probabilities": probabilities,
            "modelVersion": model_file,
            "featuresUsed": {k: v for k, v in zip(features, row)}
        }

        print(json.dumps(result))
        sys.exit(0)

    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(3)

if __name__ == "__main__":
    main()
