// Author: Maisha Sultana (ms5529) | Feature: 5-Star Rating System

const ratingLog = [];

function getUserId() {
    let uid = localStorage.getItem("ftf_user_id");
    if (!uid) {
        uid = "u_" + Math.random().toString(36).slice(2, 10);
        localStorage.setItem("ftf_user_id", uid);
    }
    return uid;
}

function getUserRating(truckId) {
    return parseInt(localStorage.getItem(`rating_truck_${truckId}`)) || 0;
}

function setUserRating(truckId, stars) {
    localStorage.setItem(`rating_truck_${truckId}`, stars);
}

function buildRatingWidget(truckId, avgRating, totalRatings) {
    const userStars = getUserRating(truckId);
    const starsHtml = [1,2,3,4,5].map(n => `
        <span class="star-btn ${n <= userStars ? 'on' : ''}"
            data-value="${n}" onclick="submitRating(${truckId}, ${n})">★</span>
    `).join("");

    return `
        <div class="rating-section">
            <div class="rate-label">Rate this truck</div>
            <div class="star-row" id="stars-${truckId}">${starsHtml}</div>
            <div class="rating-summary">
                <span class="avg-score" id="avg-${truckId}">${avgRating > 0 ? parseFloat(avgRating).toFixed(1) : "—"}</span>
                <span id="count-${truckId}">avg from ${totalRatings} rating${totalRatings !== 1 ? 's' : ''}</span>
            </div>
        </div>`;
}

function submitRating(truckId, stars) {
    const userId = getUserId();
    const oldRating = getUserRating(truckId);

    ratingLog.push({ truckId, userId, oldRating, newRating: stars, timestamp: new Date().toISOString() });
    console.table(ratingLog);

    setUserRating(truckId, stars);

    const container = document.getElementById(`stars-${truckId}`);
    if (container) {
        container.querySelectorAll(".star-btn").forEach(btn => {
            btn.classList.toggle("on", parseInt(btn.dataset.value) <= stars);
        });
    }

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
}

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
