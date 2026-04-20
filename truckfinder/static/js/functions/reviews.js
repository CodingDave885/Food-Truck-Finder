// Author: Andre Nunes da Silva @ 04/20/26

// Opens the side panel and loads both ratings and reviews for the given truck
async function openReviewPanel(truckId, truckName) {
    const panel = document.getElementById("review-panel");
    const title = document.getElementById("review-panel-title");
    const body = document.getElementById("review-panel-body");

    title.textContent = truckName ? `Reviews for ${truckName}` : "Reviews";
    body.innerHTML = "<p>Loading...</p>";
    panel.dataset.truckId = truckId;
    panel.classList.remove("hidden");

    // Update the URL so users can bookmark or share the panel view
    history.pushState({ truckId }, "", `/map/reviews/${truckId}`);

    try {
        // Fetch ratings and reviews in parallel
        const [ratingRes, reviewsRes] = await Promise.all([
            fetch(`/api/trucks/${truckId}/rating`).then(r => r.json()),
            fetch(`/api/trucks/${truckId}/reviews`).then(r => r.json())
        ]);

        // The review panel hides the truck popup, so surface Menu/Track here too.
        // Pull coords from the marker on the map so callers don't have to pass them.
        const marker = window.markers && window.markers[truckId];
        const latlng = marker && marker.getLatLng ? marker.getLatLng() : null;
        const trackBtn = latlng
            ? `<button class='track-button' onclick="startTracking(${truckId}, ${latlng.lat}, ${latlng.lng})"><i class="fas fa-location-arrow"></i> TRACK</button>`
            : "";

        // Reuse buildRatingWidget from rating.js, then show reviews below
        body.innerHTML = `
            <div class="popup-button-row review-panel-actions">
                <button class='menu-button' onclick="showMenu(${truckId})">
                    <i class="fas fa-bars"></i> MENU
                </button>
                ${trackBtn}
            </div>
            <div id="rating-anchor-${truckId}">
                ${buildPanelRatingWidget(truckId, ratingRes.avg_rating, ratingRes.total_ratings)}
            </div>
            <hr style="margin: 1rem 0;">
            <h3 style="margin-bottom: 0.75rem;">Reviews</h3>
            <div id="reviews-list"></div>
        `;
        renderReviewsInto("reviews-list", reviewsRes.reviews);
    } catch (e) {
        body.innerHTML = "<p>Could not load reviews.</p>";
    }
}

// Renders the list of reviews into a given container element
function renderReviewsInto(containerId, reviews) {
    const container = document.getElementById(containerId);
    if (!container) return;
    if (!reviews.length) {
        container.innerHTML = "<p>No reviews yet. Be the first!</p>";
        return;
    }
    const currentUserId = getUserId();
    const panel = document.getElementById("review-panel");
    const truckId = panel && panel.dataset.truckId;
    container.innerHTML = reviews.map(r => {
        const stars = r.stars || 0;
        const starStr = "★".repeat(stars) + "☆".repeat(5 - stars);
        const date = r.created_at ? new Date(r.created_at).toLocaleDateString() : "";
        const isMine = r.user_id === currentUserId;
        const deleteBtn = isMine && truckId
            ? `<button class="delete-review-btn" onclick="deleteMyReview(${truckId})" title="Delete your review">Delete</button>`
            : "";
        return `
            <div class="review-card${isMine ? ' is-mine' : ''}">
                <div class="review-header">
                    <strong>${escapeHtml(r.display_name)}${isMine ? ' <span class="you-tag">(you)</span>' : ''}</strong>
                    <span class="review-stars">${starStr}</span>
                </div>
                <p>${escapeHtml(r.review_text)}</p>
                <div class="review-footer">
                    <small>${date}</small>
                    ${deleteBtn}
                </div>
            </div>
        `;
    }).join("");
}

// Deletes the current user's review for this truck. Also clears their rating
// since rating + review are intentionally tied together in this UI.
async function deleteMyReview(truckId) {
    if (!confirm("Delete your review? This will also remove your star rating.")) return;
    const userId = getUserId();
    try {
        await fetch(`/api/trucks/${truckId}/review/delete`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: userId })
        });
        // Clear the rating on both backend and local storage so the stars reset
        await fetch(`/api/trucks/${truckId}/rating/delete`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: userId })
        });
        removeUserRating(truckId);

        // Refresh the whole panel so the rating widget + reviews list re-render
        const title = document.getElementById("review-panel-title");
        const truckName = title ? title.textContent.replace(/^Reviews for\s*/, "") : null;
        openReviewPanel(parseInt(truckId, 10), truckName);
    } catch (e) {
        alert("Could not delete your review. Is the server running?");
    }
}

// Closes the panel and restores the /map URL
function closeReviewPanel() {
    document.getElementById("review-panel").classList.add("hidden");
    history.pushState({}, "", "/map");
}

// Submits a new review (or updates the current user's existing review)
async function submitReview() {
    const panel = document.getElementById("review-panel");
    const truckId = panel.dataset.truckId;
    const displayName = document.getElementById("review-display-name").value.trim();
    const reviewText = document.getElementById("review-text").value.trim();

    // Author: Andre Nunes da Silva @ 04/20/26
    // A full review needs both a star rating and written text, we don't want someone dropping a review without a rating attached to it.
    // Grabs either the preview (stars clicked but not submitted yet) or the saved rating from localStorage so the user doesn't have to click Submit on the stars separately.
    const starsContainer = document.getElementById(`stars-${truckId}`);
    const previewStars = starsContainer ? parseInt(starsContainer.dataset.preview) || 0 : 0;
    const savedStars = getUserRating(truckId);
    const stars = previewStars || savedStars;

    if (!stars) {
        alert("Please give a star rating before posting your review.");
        return;
    }

    if (!reviewText) {
        alert("Please write a review first.");
        return;
    }

    // Andre Nunes da Silva @ 04/20/26 : If the user picked stars but never hit Submit on the rating widget, push it to the backend for them so the rating actually lands along with the review.
    if (previewStars && previewStars !== savedStars) {
        submitRating(truckId);
    }

    try {
        const res = await fetch(`/api/trucks/${truckId}/review`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_id: getUserId(),   // from rating.js
                review_text: reviewText,
                display_name: displayName
            })
        });

        if (res.ok) {
            document.getElementById("review-text").value = "";
            // Refresh the list so the new review shows up immediately
            const fresh = await fetch(`/api/trucks/${truckId}/reviews`).then(r => r.json());
            renderReviewsInto("reviews-list", fresh.reviews);
        } else {
            const err = await res.json().catch(() => ({}));
            alert(err.error || "Something went wrong.");
        }
    } catch (e) {
        alert("Could not submit review. Is the server running?");
    }
}

// Escapes user-submitted text so raw HTML can't get injected into the DOM
function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str || "";
    return div.innerHTML;
}

// Auto-open the panel if the user landed on /map/reviews/<id>
document.addEventListener("DOMContentLoaded", () => {
    const config = document.getElementById("review-config");
    const truckId = config && config.dataset.truckId;
    if (truckId) {
        openReviewPanel(parseInt(truckId, 10), null);
    }
});

// Handles browser back/forward button navigation
window.addEventListener("popstate", () => {
    const match = window.location.pathname.match(/^\/map\/reviews\/(\d+)$/);
    if (match) {
        openReviewPanel(parseInt(match[1], 10), null);
    } else {
        document.getElementById("review-panel").classList.add("hidden");
    }
});