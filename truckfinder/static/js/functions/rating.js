// Author: Maisha Sultana (ms5529) | Feature: 5-Star Rating System | 04-15-2026

// Each entry stores who rated, which truck, old vs new rating, and when
const ratingLog = [];

// Stored in localStorage so it persists across page refreshes
// This lets us track who rated what without requiring a login
function getUserId() {
    let uid = localStorage.getItem("ftf_user_id");
    if (!uid) {
        uid = "u_" + Math.random().toString(36).slice(2, 10);
        localStorage.setItem("ftf_user_id", uid);
    }
    return uid;
}

// ─── Gets the user's previously saved star rating for a specific truck ────────
// Returns 0 if the user has never rated this truck
function getUserRating(truckId) {
    return parseInt(localStorage.getItem(`rating_truck_${truckId}`)) || 0;
}

// ─── Saves the user's star rating for a truck to localStorage ─────────────────

function setUserRating(truckId, stars) {
    localStorage.setItem(`rating_truck_${truckId}`, stars);
}

// Called when the user clicks "Clear"
function removeUserRating(truckId) {
    localStorage.removeItem(`rating_truck_${truckId}`);
}

// Injected into the popup when a truck marker is clicked
// avgRating and totalRatings come from the backend
function buildRatingWidget(truckId, avgRating, totalRatings) {
    // Check if the user has already rated this truck
    const userStars = getUserRating(truckId);
    
    // Build the 5 star buttons, marking previously selected stars as 'on'
    const starsHtml = [1,2,3,4,5].map(n => `
        <span class="star-btn ${n <= userStars ? 'on' : ''}"
            data-value="${n}"
            onclick="previewRating(${truckId}, ${n})">★</span>
    `).join("");

    return `
        <div class="rating-section">
            <div class="rate-label">Rate this truck</div>
            <div class="star-row" id="stars-${truckId}">${starsHtml}</div>
            <div class="rating-actions" id="actions-${truckId}" style="display:${userStars > 0 ? 'flex' : 'none'}">
                <button class="submit-rating-btn" onclick="submitRating(${truckId})">Submit</button>
                <button class="takeback-btn" onclick="takeBackRating(${truckId})">Clear</button>
            </div>
            <div class="rating-summary">
                <span class="avg-score" id="avg-${truckId}">${avgRating > 0 ? parseFloat(avgRating).toFixed(1) : "—"}</span>
                <span id="count-${truckId}">avg from ${totalRatings} rating${totalRatings !== 1 ? 's' : ''}</span>
            </div>
        </div>`;
}

// Called every time a user clicks a star
// The rating is only saved when they hit Submit
function previewRating(truckId, stars) {
    const container = document.getElementById(`stars-${truckId}`);
    if (container) {
        container.querySelectorAll(".star-btn").forEach(btn => {
            btn.classList.toggle("on", parseInt(btn.dataset.value) <= stars);
        });
    }
    // Store preview temporarily
    container.dataset.preview = stars;

    // Show the Submit + Take back buttons
    const actions = document.getElementById(`actions-${truckId}`);
    if (actions) actions.style.display = "flex";
}

// Only runs when the user explicitly clicks Submit
function submitRating(truckId) {
    const container = document.getElementById(`stars-${truckId}`);
    const stars = parseInt(container.dataset.preview);
    if (!stars) return;

    const userId = getUserId();
    const oldRating = getUserRating(truckId);

    ratingLog.push({ truckId, userId, oldRating, newRating: stars, timestamp: new Date().toISOString() });
    console.table(ratingLog);

    setUserRating(truckId, stars);

    fetch(`/api/trucks/${truckId}/rating`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, stars })
    })
    .then(res => res.json())
    .then(data => {
        const avg = document.getElementById(`avg-${truckId}`);
        const count = document.getElementById(`count-${truckId}`);
        if (avg) avg.textContent = parseFloat(data.avg_rating).toFixed(1);
        if (count) count.textContent = `avg from ${data.total_ratings} ratings`;
    })
    .catch(() => console.warn("Backend not connected yet. Rating saved locally."));

    // Hide buttons after submit
    const actions = document.getElementById(`actions-${truckId}`);
    if (actions) actions.style.display = "none";
}

// Clears the rating entirely
function takeBackRating(truckId) {
    const userId = getUserId();
    removeUserRating(truckId);

    // Clear star highlights
    const container = document.getElementById(`stars-${truckId}`);
    if (container) {
        container.querySelectorAll(".star-btn").forEach(btn => btn.classList.remove("on"));
        container.dataset.preview = "";
    }

    // Hide buttons
    const actions = document.getElementById(`actions-${truckId}`);
    if (actions) actions.style.display = "none";

    // Tell backend to remove the rating
    fetch(`/api/trucks/${truckId}/rating/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId })
    })
    .then(res => res.json())
    .then(data => {
        const avg = document.getElementById(`avg-${truckId}`);
        const count = document.getElementById(`count-${truckId}`);
        if (avg) avg.textContent = data.total_ratings > 0 ? parseFloat(data.avg_rating).toFixed(1) : "—";
        if (count) count.textContent = `avg from ${data.total_ratings} ratings`;
    })
    .catch(() => console.warn("Backend not connected. Rating removed locally."));
}

// Called automatically every time a truck popup is opened
function loadRatingIntoPopup(truckId) {
    fetch(`/api/trucks/${truckId}/rating`)
        .then(res => res.json())
        .then(data => {
            const target = document.getElementById(`rating-anchor-${truckId}`);
            if (target) target.innerHTML = buildRatingWidget(truckId, data.avg_rating, data.total_ratings);
        })
        .catch(() => {
            const target = document.getElementById(`rating-anchor-${truckId}`);
            if (target) target.innerHTML = buildRatingWidget(truckId, 0, 0);
        });
}
