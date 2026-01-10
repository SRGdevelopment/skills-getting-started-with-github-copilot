const badges = [
  {
    code: "SRG-ALPHA-001",
    name: "Atlas",
    tier: "Black",
    breachLevel: 7,
    roles: ["Operations Lead", "Field Analyst"],
    visibility: "public",
  },
  {
    code: "SRG-GOLD-014",
    name: "Nova",
    tier: "Gold",
    breachLevel: 4,
    roles: ["Intelligence", "Training"],
    visibility: "private",
  },
  {
    code: "SRG-BASIC-212",
    name: "Quill",
    tier: "Basic",
    breachLevel: 2,
    roles: ["Community Liaison"],
    visibility: "public",
  },
];

document.addEventListener("DOMContentLoaded", () => {
  const facilitiesList = document.getElementById("facilities-list");
  const mapMarkers = document.getElementById("map-markers");
  const mapLegendList = document.getElementById("map-legend-list");
  const priorityStatesList = document.getElementById("priority-states-list");
  const badgeList = document.getElementById("badge-list");
  const profileCard = document.getElementById("profile-card");
  const updateForm = document.getElementById("update-form");
  const updatesList = document.getElementById("updates-list");
  const updateMessage = document.getElementById("update-message");

  const highlightFacilityCard = (facilityId) => {
    document.querySelectorAll(".facility-card").forEach((card) => {
      card.classList.toggle("active", card.dataset.id === facilityId);
    });
  };

  const renderFacilities = (facilities) => {
    facilitiesList.innerHTML = "";
    mapMarkers.innerHTML = "";
    mapLegendList.innerHTML = "";

    facilities.forEach((facility) => {
      const card = document.createElement("article");
      card.className = "facility-card";
      card.dataset.id = facility.id;
      card.innerHTML = `
        <h3>${facility.name}</h3>
        <p><strong>Region:</strong> ${facility.location}</p>
        <p><strong>Security Level:</strong> ${facility.security_level}</p>
        <p><strong>Officer Count:</strong> ${facility.officer_count}</p>
        <p><strong>Open Grievances:</strong> ${facility.open_grievances_count}</p>
        <p><strong>Population Estimate:</strong> ${facility.population_estimate}</p>
        <p><strong>Administration Titles:</strong> ${facility.administration_titles.join(", ")}</p>
      `;
      facilitiesList.appendChild(card);

      const marker = document.createElement("button");
      marker.className = "map-marker";
      marker.type = "button";
      marker.style.left = `${facility.map_position.x}%`;
      marker.style.top = `${facility.map_position.y}%`;
      marker.setAttribute("aria-label", `Highlight ${facility.name}`);
      marker.textContent = "•";
      marker.addEventListener("click", () => highlightFacilityCard(facility.id));
      mapMarkers.appendChild(marker);

      const legendItem = document.createElement("li");
      legendItem.textContent = facility.name;
      legendItem.addEventListener("click", () => highlightFacilityCard(facility.id));
      mapLegendList.appendChild(legendItem);
    });
  };

  const renderPriorityStates = (states) => {
    priorityStatesList.innerHTML = "";
    states.forEach((state) => {
      const card = document.createElement("div");
      card.className = "state-card";
      card.innerHTML = `
        <h3>${state}</h3>
        <p>SRG charter planning in progress.</p>
      `;
      priorityStatesList.appendChild(card);
    });
  };

  const renderBadges = () => {
    badgeList.innerHTML = "";

    badges.forEach((badge) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "badge";
      button.innerHTML = `
        <span class="badge-tier">${badge.tier}</span>
        <span class="badge-code">${badge.code}</span>
      `;
      button.addEventListener("click", () => renderProfile(badge));
      badgeList.appendChild(button);
    });
  };

  const renderProfile = (badge) => {
    const isPrivate = badge.visibility === "private";
    profileCard.innerHTML = `
      <h3>${badge.name}</h3>
      <p><strong>Badge Code:</strong> ${badge.code}</p>
      <p><strong>Tier:</strong> ${badge.tier}</p>
      <p><strong>Breach Level:</strong> ${isPrivate ? "Private" : badge.breachLevel}</p>
      <p><strong>Roles:</strong> ${isPrivate ? "Private" : badge.roles.join(", ")}</p>
      <div class="profile-actions">
        <label for="visibility-toggle">Profile Visibility</label>
        <select id="visibility-toggle">
          <option value="public" ${badge.visibility === "public" ? "selected" : ""}>Public</option>
          <option value="private" ${badge.visibility === "private" ? "selected" : ""}>Private</option>
        </select>
      </div>
    `;

    const visibilityToggle = document.getElementById("visibility-toggle");
    visibilityToggle.addEventListener("change", (event) => {
      badge.visibility = event.target.value;
      renderProfile(badge);
    });
  };

  const renderUpdates = (updates) => {
    updatesList.innerHTML = "";
    if (updates.length === 0) {
      updatesList.innerHTML = "<p class=\"empty-state\">No updates submitted yet.</p>";
      return;
    }

    updates.forEach((update) => {
      const card = document.createElement("article");
      card.className = "update-card";
      card.innerHTML = `
        <h3>${update.facility_name}</h3>
        <p><strong>Category:</strong> ${update.category}</p>
        <p>${update.summary}</p>
        <p><strong>Submitted By:</strong> ${update.submitted_by}</p>
        <p><strong>Visibility:</strong> ${update.visibility}</p>
      `;
      updatesList.appendChild(card);
    });
  };

  const fetchFacilities = async () => {
    const response = await fetch("/facilities");
    if (!response.ok) {
      facilitiesList.innerHTML = "<p>Failed to load facilities.</p>";
      return [];
    }
    return response.json();
  };

  const fetchPriorityStates = async () => {
    const response = await fetch("/states/priority");
    if (!response.ok) {
      priorityStatesList.innerHTML = "<p>Failed to load states.</p>";
      return [];
    }
    return response.json();
  };

  const fetchUpdates = async () => {
    const response = await fetch("/facility-updates");
    if (!response.ok) {
      updatesList.innerHTML = "<p>Failed to load updates.</p>";
      return [];
    }
    return response.json();
  };

  updateForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    updateMessage.className = "message hidden";

    const payload = {
      facility_name: document.getElementById("facility-name").value.trim(),
      category: document.getElementById("category").value,
      summary: document.getElementById("summary").value.trim(),
      submitted_by: document.getElementById("submitted-by").value.trim(),
      visibility: document.getElementById("visibility").value,
    };

    try {
      const response = await fetch("/facility-updates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) {
        updateMessage.textContent = result.detail || "Submission failed.";
        updateMessage.className = "message error";
        return;
      }

      updateMessage.textContent = result.message;
      updateMessage.className = "message success";
      updateForm.reset();
      const updates = await fetchUpdates();
      renderUpdates(updates);
    } catch (error) {
      updateMessage.textContent = "Submission failed. Try again.";
      updateMessage.className = "message error";
    }
  });

  const init = async () => {
    const [facilities, states, updates] = await Promise.all([
      fetchFacilities(),
      fetchPriorityStates(),
      fetchUpdates(),
    ]);

    renderFacilities(facilities);
    renderPriorityStates(states);
    renderBadges();
    renderUpdates(updates);
  };

  init();
});
