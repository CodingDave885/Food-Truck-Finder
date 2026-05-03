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
    return `
        <div class="rating-section">
            <div class="rating-summary" style="justify-content: center;">
                <span class="avg-score" id="avg-${truckId}">${avgRating > 0 ? parseFloat(avgRating).toFixed(1) : "—"}</span>
                <span id="count-${truckId}">avg from ${totalRatings} rating${totalRatings !== 1 ? 's' : ''}</span>
            </div>
            <button class="see-reviews-btn" onclick="openReviewPanel(${truckId})">See reviews</button>
        </div>`;
} // Andre Nunes da Silva @ 4/20/26 : Updated so it doesn't show on the truck itself instead it will show inside the review panel.

// Used inside the review panel — has interactive stars for rating, no "See reviews" button

// Author: Andre Nunes da Silva @ 4/20/26
// Stars are preview-only here on purpose — the rating is committed together with the review
// via submitReview() so a user can't change their star rating without also writing/updating a review.
function buildPanelRatingWidget(truckId, avgRating, totalRatings) {
    const userStars = getUserRating(truckId);

    const starsHtml = [1,2,3,4,5].map(n => `
        <span class="star-btn ${n <= userStars ? 'on' : ''}"
            data-value="${n}"
            onclick="previewRating(${truckId}, ${n})">★</span>
    `).join("");

    return `
        <div class="rating-section">
            <div class="rate-label">Rate this truck</div>
            <div class="star-row" id="stars-${truckId}" data-preview="${userStars}">${starsHtml}</div>
            <div class="rating-hint">Your rating posts with your review below.</div>
            <div class="rating-summary">
                <span class="avg-score" id="avg-${truckId}">${avgRating > 0 ? parseFloat(avgRating).toFixed(1) : "—"}</span>
                <span id="count-${truckId}">avg from ${totalRatings} rating${totalRatings !== 1 ? 's' : ''}</span>
            </div>
        </div>`;
}

// Called every time a user clicks a star
// The rating is only saved when the user posts their review (submitReview in reviews.js).
function previewRating(truckId, stars) {
    const container = document.getElementById(`stars-${truckId}`);
    if (!container) return;
    container.querySelectorAll(".star-btn").forEach(btn => {
        btn.classList.toggle("on", parseInt(btn.dataset.value) <= stars);
    });
    container.dataset.preview = stars;

    // Legacy standalone Submit/Clear actions may still exist in the truck popup widget — keep them working.
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
