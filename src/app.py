"""
SRG Strategic Facilities Portal API

Provides data for strategic facility overviews, priority states, and
community-submitted updates.
"""

from pathlib import Path
import os
from typing import Literal

from fastapi import FastAPI
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

app = FastAPI(
    title="SRG Strategic Facilities Portal",
    description="API for strategic facility insights and community updates",
)

current_dir = Path(__file__).parent
app.mount(
    "/static",
    StaticFiles(directory=os.path.join(current_dir, "static")),
    name="static",
)

facilities = [
    {
        "id": "nyc-01",
        "name": "Hudson Valley Correctional Center",
        "location": "Eastern New York",
        "security_level": "Medium",
        "officer_count": 410,
        "open_grievances_count": 12,
        "population_estimate": 1240,
        "administration_titles": [
            "Superintendent",
            "Chief of Security",
            "Programs Director",
        ],
        "map_position": {"x": 62, "y": 28},
    },
    {
        "id": "nyc-02",
        "name": "Adirondack Regional Facility",
        "location": "Northern New York",
        "security_level": "Minimum",
        "officer_count": 230,
        "open_grievances_count": 5,
        "population_estimate": 780,
        "administration_titles": [
            "Facility Director",
            "Operations Lead",
            "Health Services Administrator",
        ],
        "map_position": {"x": 58, "y": 14},
    },
    {
        "id": "nyc-03",
        "name": "Lakeview Secure Complex",
        "location": "Central New York",
        "security_level": "Maximum",
        "officer_count": 520,
        "open_grievances_count": 18,
        "population_estimate": 1525,
        "administration_titles": [
            "Warden",
            "Deputy Warden",
            "Reentry Coordinator",
        ],
        "map_position": {"x": 48, "y": 38},
    },
    {
        "id": "nyc-04",
        "name": "Empire River Facility",
        "location": "Downstate New York",
        "security_level": "Medium",
        "officer_count": 365,
        "open_grievances_count": 9,
        "population_estimate": 1100,
        "administration_titles": [
            "Superintendent",
            "Security Captain",
            "Education Manager",
        ],
        "map_position": {"x": 66, "y": 52},
    },
]

priority_states = [
    "Alabama",
    "Mississippi",
    "Louisiana",
    "Georgia",
    "Arizona",
    "Texas",
]

facility_updates = []


class FacilityUpdate(BaseModel):
    facility_name: str = Field(..., min_length=2, max_length=80)
    category: Literal[
        "Operations",
        "Conditions",
        "Programs",
        "Health & Safety",
        "Administration",
        "Other",
    ]
    summary: str = Field(..., min_length=10, max_length=500)
    submitted_by: str = Field(..., min_length=2, max_length=40)
    visibility: Literal["public", "private"]


@app.get("/")
def root():
    return RedirectResponse(url="/static/index.html")


@app.get("/facilities")
def get_facilities():
    return facilities


@app.get("/states/priority")
def get_priority_states():
    return priority_states


@app.get("/facility-updates")
def get_facility_updates():
    return facility_updates


@app.post("/facility-updates")
def add_facility_update(update: FacilityUpdate):
    update_record = update.model_dump()
    update_record["id"] = f"update-{len(facility_updates) + 1}"
    facility_updates.append(update_record)
    return {"message": "Update submitted", "update": update_record}
