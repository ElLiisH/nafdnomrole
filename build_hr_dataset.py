import pandas as pd
import json
from pathlib import Path

FILES = {
    "2017": "Nominal Roll as at 30th November, 2017.xlsx",
    "2022": "Nominal Roll as at 31st December, 2022.xlsx",
    "2024": "Nominal Roll as at 31st December, 2024 1.xlsx",
    "2026": "NOMINAL ROLL AS AT 27TH FEBRUARY 2026.xlsx"
}

OUTPUT_DIR = Path("output")
OUTPUT_DIR.mkdir(exist_ok=True)

def load_roll(path):
    df = pd.read_excel(path, skiprows=5)
    df.columns = df.columns.str.strip().str.upper()
    df = df.rename(columns={
        "FULL NAME": "name",
        "PRESENT APPT.": "rank",
        "STAFF NO": "staff_no",
        "STATE OF ORIGIN": "state",
        "DIR": "dir"
    })
    df = df[["name","rank","staff_no","state","dir"]].dropna(subset=["name"])
    df["state"] = df["state"].str.strip().str.upper()
    return df

all_counts = {}
directory_latest = None

for year, file in FILES.items():
    df = load_roll(file)

    # save clean directory
    df.to_json(OUTPUT_DIR/f"staff_{year}.json", orient="records", indent=2)

    # compute counts per state
    counts = df["state"].value_counts().to_dict()
    all_counts[year] = counts

    if year == "2024":
        directory_latest = df

# build comparison table
states = set()
for year in all_counts:
    states.update(all_counts[year].keys())

comparison = {}
for s in states:
    comparison[s] = {year: all_counts[year].get(s,0) for year in FILES}

with open(OUTPUT_DIR/"state_comparison.json","w") as f:
    json.dump(comparison,f,indent=2)

# build dashboard directory dataset
directory_latest = directory_latest.reset_index(drop=True)
directory_latest["sn"] = directory_latest.index + 1

directory = directory_latest.rename(columns={
    "name":"name",
    "rank":"rank",
    "staff_no":"id",
    "state":"state",
    "dept":"dir"
})

directory["loc"] = "CHQ"

directory[["sn","name","rank","id","state","dir","loc"]]\
    .to_json(OUTPUT_DIR/"dashboard_staff.json", orient="records", indent=2)

print("✔ HR datasets built successfully")
