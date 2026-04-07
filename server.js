from flask import Flask, request, jsonify
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)

DB_FILE = "database.json"

def load_db():
    with open(DB_FILE, "r") as f:
        return json.load(f)

def save_db(data):
    with open(DB_FILE, "w") as f:
        json.dump(data, f, indent=4)

# ------------------------------
# API HOME
# ------------------------------
@app.route("/")
def home():
    return jsonify({"message": "AI Smart Study Planner Backend Running!"})

# ------------------------------
# GET ALL STUDY PLANS
# ------------------------------
@app.route("/plans", methods=["GET"])
def get_plans():
    db = load_db()
    return jsonify(db["plans"])

# ------------------------------
# ADD NEW STUDY PLAN
# ------------------------------
@app.route("/plans", methods=["POST"])
def add_plan():
    data = request.get_json()
    db = load_db()

    new_plan = {
        "topic": data["topic"],
        "difficulty": data["difficulty"],
        "weightage": data["weightage"],
        "examDate": data["examDate"],
        "hours": data["hours"],
        "completed": False
    }

    db["plans"].append(new_plan)
    save_db(db)

    return jsonify({"message": "Plan added successfully!"})

# ------------------------------
# MARK PLAN COMPLETED
# ------------------------------
@app.route("/plans/complete", methods=["POST"])
def complete_plan():
    index = request.json.get("index")
    db = load_db()

    if 0 <= index < len(db["plans"]):
        db["plans"][index]["completed"] = True
        save_db(db)
        return jsonify({"message": "Task marked as completed!"})

    return jsonify({"error": "Invalid index"}), 400

# ------------------------------
# TODO LIST — GET
# ------------------------------
@app.route("/todos", methods=["GET"])
def get_todos():
    db = load_db()
    return jsonify(db["todos"])

# ------------------------------
# TODO LIST — ADD
# ------------------------------
@app.route("/todos", methods=["POST"])
def add_todo():
    data = request.get_json()
    db = load_db()

    db["todos"].append(data["task"])
    save_db(db)

    return jsonify({"message": "Todo added!"})

# ------------------------------
# TODO LIST — DELETE
# ------------------------------
@app.route("/todos/delete", methods=["POST"])
def delete_todo():
    index = request.json.get("index")
    db = load_db()

    if 0 <= index < len(db["todos"]):
        db["todos"].pop(index)
        save_db(db)
        return jsonify({"message": "Todo removed!"})

    return jsonify({"error": "Invalid index"}), 400


# ------------------------------
# RUN SERVER
# ------------------------------
if __name__ == "__main__":
    app.run(debug=True)