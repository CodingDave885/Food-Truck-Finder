const currentPage = window.location.pathname;

document.querySelectorAll(".nav-links li a").forEach(link => {
    const href = link.getAttribute("href");
    console.log("Current:", currentPage, "| Link:", href);
    
    if (href !== null && (href === currentPage || (href !== "/" && currentPage.includes(href)))) {
        link.classList.add("active");
    }
});