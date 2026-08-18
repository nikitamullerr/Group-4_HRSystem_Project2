console.log("Performance Review JS Loaded");

/* ==================================================
   NAVIGATION
   Creates and manages the main navigation bar.
================================================== */

const NAV = [
    { id: "dashboard", label: "Dashboard" },
    { id: "employees", label: "Employees" },
    { id: "time_off", label: "Time Off Management" },
    { id: "attendance", label: "Attendance Management" },
    { id: "payroll_payslips", label: "Payroll and Payslips" },
    { id: "performance_review", label: "Performance Reviews" }
];

/* ==================================================
   PAGE HELPERS
================================================== */

function pageUrl(id) {

    return `${id}.html`;

}

const activePage =
    document.body.dataset.page ||
    "performance_review";

/* ==================================================
   ICONS
================================================== */

function buildingIcon() {

    return `
        <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round">

            <path d="M3 21h18"></path>
            <path d="M6 21V9l6-4 6 4v12"></path>
            <path d="M10 21v-5h4v5"></path>

        </svg>
    `;

}

function moonIcon() {

    return `
        <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2">

            <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"></path>

        </svg>
    `;

}

function sunIcon() {

    return `
        <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2">

            <circle cx="12" cy="12" r="4"></circle>

            <path d="M12 2v2"></path>
            <path d="M12 20v2"></path>
            <path d="M2 12h2"></path>
            <path d="M20 12h2"></path>

            <path d="M4.9 4.9l1.4 1.4"></path>
            <path d="M17.7 17.7l1.4 1.4"></path>

            <path d="M4.9 19.1l1.4-1.4"></path>
            <path d="M17.7 6.3l1.4-1.4"></path>

        </svg>
    `;

}

function menuIcon() {

    return `
        <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round">

            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>

        </svg>
    `;

}

/* ==================================================
   TOPBAR
================================================== */

function topbarHTML(active) {

    const links = NAV.map(item => `

        <a
            class="topnav-item ${item.id === active ? "active" : ""}"
            href="${pageUrl(item.id)}">

            ${item.label}

        </a>

    `).join("");

    return `

        <a
            class="tb-brand"
            href="${pageUrl("dashboard")}">

            <span class="tb-logo">
                ${buildingIcon()}
            </span>

            <span class="tb-name">
                ModernTech HR
            </span>

        </a>

        <nav class="topnav">
            ${links}
        </nav>

        <button
            class="hamburger-btn"
            id="hamburgerBtn">

            ${menuIcon()}

        </button>

        <div class="top-spacer"></div>

        <div class="top-icons">

            <button
                class="icon-btn"
                id="themeBtn">

                ${sunIcon()}

            </button>

            <button
                class="acct"
                id="profileBtn">

                <span class="av">
                    HA
                </span>

                <span class="who">

                    <b>HR Manager</b>

                    <span>
                        Administrator
                    </span>

                </span>

            </button>

        </div>

    `;

}

const topbar =
    document.getElementById("topbar");

if (topbar) {

    topbar.innerHTML =
        topbarHTML(activePage);

}

/* ==================================================
   MOBILE NAVIGATION
================================================== */

function createMobileNav() {

    const nav =
        document.createElement("div");

    nav.className = "mobile-nav";
    nav.id = "mobileNav";

    nav.innerHTML = NAV.map(item => `

        <a
            href="${pageUrl(item.id)}"
            class="
                mobile-nav-item
                ${item.id === activePage ? "active" : ""}
            ">

            ${item.label}

        </a>

    `).join("");

    document.body.appendChild(nav);

    return nav;

}

const mobileNav =
    createMobileNav();

const hamburgerBtn =
    document.getElementById("hamburgerBtn");

if (hamburgerBtn) {

    hamburgerBtn.addEventListener("click", e => {

        e.stopPropagation();

        mobileNav.classList.toggle("open");

    });

}

document.addEventListener("click", e => {

    if (
        !e.target.closest(".hamburger-btn") &&
        !e.target.closest(".mobile-nav")
    ) {

        mobileNav.classList.remove("open");

    }

});

/* ==================================================
   THEME MANAGEMENT
================================================== */

const THEME_KEY = "mt-theme";

function currentTheme() {

    try {

        return (
            localStorage.getItem(THEME_KEY) ||
            "light"
        );

    }

    catch {

        return "light";

    }

}

function updateThemeIcon(theme) {

    const themeBtn =
        document.getElementById("themeBtn");

    if (!themeBtn) return;

    themeBtn.innerHTML =
        theme === "dark"
            ? sunIcon()
            : moonIcon();

}

function applyTheme(theme) {

    document.documentElement.setAttribute(
        "data-theme",
        theme
    );

    try {

        localStorage.setItem(
            THEME_KEY,
            theme
        );

    }

    catch {}

    updateThemeIcon(theme);

}

/* ==================================================
   PERFORMANCE REVIEW DATA
   Reviews are now loaded from the backend database.
================================================== */

let reviews = [];

const API_URL =
    "http://localhost:5000/api/performance-reviews";

/* ==================================================
   LOAD PERFORMANCE REVIEWS
   Fetches performance reviews from the backend API.
================================================== */

async function loadReviews() {

    const token =
        localStorage.getItem("mt-auth");

    // IMPORTANT:
    // The backend protects performance-review routes,
    // so the authentication token must be sent.
    if (!token) {

        console.error(
            "No authentication token found."
        );

        return;
    }

    try {

        const response =
            await fetch(API_URL, {

                method: "GET",

                headers: {
                    "Authorization":
                        `Bearer ${token}`
                }

            });

        const data =
            await response.json();

        if (!response.ok) {

            throw new Error(
                data.error ||
                "Failed to load performance reviews"
            );

        }

        // Convert database records into the
        // structure used by the frontend.
        reviews = data.map(review => ({

            id: review.id,

            employeeId:
                review.employee_id,

            employee:
                `Employee #${review.employee_id}`,

            department:
                "",

            rating:
                review.rating,

            reviewer:
                review.reviewer,

            feedback:
                review.feedback || "",

            // These fields are not currently
            // stored in the database table.
            strengths: "",
            improvements: "",
            goals: "",
            comments:
                review.feedback || "",

            status:
                review.rating === 5
                    ? "Top Performer"
                    : review.rating === 4
                        ? "Outstanding"
                        : "Needs Improvement"

        }));

        populateDepartments();

        updateStatistics();

        renderReviews(reviews);

        console.log(
            "Performance reviews loaded from database:",
            reviews
        );

    } catch (error) {

        console.error(
            "Error loading performance reviews:",
            error
        );

    }

}

/* ==================================================
   PAGE RENDERING
   Generates the entire page inside #main
================================================== */

function renderPerformanceReviewPage() {

    const main =
        document.getElementById("main");

    if (!main) return;

    main.innerHTML = `

        <!-- PAGE HEADER -->

        <div class="page-head">

            <div class="eyebrow">
                Performance Management
            </div>

            <h1 class="page-title">
                Employee Performance Reviews
            </h1>

            <div class="page-sub">
                Monitor employee achievements,
                development goals, ratings and
                review outcomes.
            </div>

        </div>

        <!-- KPI SECTION -->

        <section class="kpis">

            <div class="kpi">

                <div
                    class="kico"
                    style="background:linear-gradient(135deg,#2f6be0,#1746b0)"
                >
                    <i class="bi bi-clipboard-data-fill"></i>
                </div>

                <div class="klab">
                    Total Reviews
                </div>

                <div
                    class="kval"
                    id="totalReviews"
                >
                    0
                </div>

            </div>

            <div class="kpi">

                <div
                    class="kico"
                    style="background:linear-gradient(135deg,#10b981,#0f9d6f)"
                >
                    <i class="bi bi-star-fill"></i>
                </div>

                <div class="klab">
                    Average Rating
                </div>

                <div
                    class="kval"
                    id="averageRating"
                >
                    0
                </div>

            </div>

            <div class="kpi">

                <div
                    class="kico"
                    style="background:linear-gradient(135deg,#f59e0b,#b6790c)"
                >
                    <i class="bi bi-trophy-fill"></i>
                </div>

                <div class="klab">
                    Top Performers
                </div>

                <div
                    class="kval"
                    id="topPerformers"
                >
                    0
                </div>

            </div>

            <div class="kpi">

                <div
                    class="kico"
                    style="background:linear-gradient(135deg,#ef4444,#c62828)"
                >
                    <i class="bi bi-exclamation-triangle-fill"></i>
                </div>

                <div class="klab">
                    Needs Improvement
                </div>

                <div
                    class="kval"
                    id="needsImprovement"
                >
                    0
                </div>

            </div>

        </section>

        <!-- STATUS TABS -->

        <section class="tabs">

            <button
                class="tab active"
                data-status="All"
            >
                All Reviews
            </button>

            <button
                class="tab"
                data-status="Top Performer"
            >
                Top Performers
            </button>

            <button
                class="tab"
                data-status="Outstanding"
            >
                Outstanding
            </button>

            <button
                class="tab"
                data-status="Needs Improvement"
            >
                Needs Improvement
            </button>

        </section>

        <!-- REVIEW DIRECTORY -->

        <section class="panel">

            <div class="toolbar">

                <div class="search">

                    <i class="bi bi-search"></i>

                    <input
                        type="text"
                        id="searchInput"
                        placeholder="Search employee..."
                    >

                </div>

                <select
                    id="departmentFilter"
                    class="select"
                >

                    <option value="All">
                        All Departments
                    </option>

                </select>

                <select
                    id="ratingFilter"
                    class="select"
                >

                    <option value="All">
                        All Ratings
                    </option>

                    <option value="5">
                        5 Stars
                    </option>

                    <option value="4">
                        4 Stars
                    </option>

                    <option value="3">
                        3 Stars
                    </option>

                    <option value="2">
                        2 Stars
                    </option>

                    <option value="1">
                        1 Star
                    </option>

                </select>

            </div>

            <div class="thead emp-grid">

                <div>Employee</div>
                <div>Department</div>
                <div>Rating</div>
                <div>Reviewer</div>
                <div>Actions</div>

            </div>

            <div id="reviewContainer"></div>

        </section>

    `;

}

/* ==================================================
   HELPERS
================================================== */

function getInitials(name) {

    return name
        .split(" ")
        .map(word => word[0])
        .join("")
        .toUpperCase();

}

/* ==================================================
   KPI STATISTICS
================================================== */

function updateStatistics() {

    const totalReviews =
        document.getElementById("totalReviews");

    const averageRating =
        document.getElementById("averageRating");

    const topPerformers =
        document.getElementById("topPerformers");

    const needsImprovement =
        document.getElementById("needsImprovement");

    if (
        !totalReviews ||
        !averageRating ||
        !topPerformers ||
        !needsImprovement
    ) {
        return;
    }

    totalReviews.textContent =
        reviews.length;

    const average =
        reviews.reduce(
            (sum, review) =>
                sum + review.rating,
            0
        ) / reviews.length;

    averageRating.textContent =
        average.toFixed(1);

    topPerformers.textContent =
        reviews.filter(
            review => review.rating === 5
        ).length;

    needsImprovement.textContent =
        reviews.filter(
            review => review.rating <= 3
        ).length;

}

/* ==================================================
   DEPARTMENT FILTER
================================================== */

function populateDepartments() {

    const departmentFilter =
        document.getElementById(
            "departmentFilter"
        );

    if (!departmentFilter) return;

    departmentFilter.innerHTML =
        '<option value="All">All Departments</option>';

    const departments =
        [
            ...new Set(
                reviews.map(
                    review =>
                        review.department
                )
            )
        ];

    departments.forEach(department => {

        const option =
            document.createElement("option");

        option.value =
            department;

        option.textContent =
            department;

        departmentFilter.appendChild(
            option
        );

    });

}

/* ==================================================
   REVIEW TABLE RENDERING
================================================== */

function renderReviews(reviewList) {

    const reviewContainer =
        document.getElementById(
            "reviewContainer"
        );

    if (!reviewContainer) return;

    reviewContainer.innerHTML = "";

    reviewList.forEach(review => {

        reviewContainer.innerHTML += `

            <div class="trow emp-grid">

                <div class="who-cell">

                    <div class="avatar">
                        ${getInitials(review.employee)}
                    </div>

                    <div>

                        <div class="nm">
                            ${review.employee}
                        </div>

                    </div>

                </div>

                <div>
                    ${review.department}
                </div>

                <div>
                    ⭐ ${review.rating}
                </div>

                <div>
                    ${review.reviewer}
                </div>

                <div class="row-actions">

                    <button
                        class="btn sm ghost"
                        onclick="viewReview(${review.id})"
                    >
                        View
                    </button>

                    <button
                        class="btn sm"
                        onclick="editReview(${review.id})"
                    >
                        Edit
                    </button>

                </div>

            </div>

        `;

    });

}

/* ==================================================
   VIEW REVIEW
================================================== */

function viewReview(id) {

    const review =
        reviews.find(
            item => item.id === id
        );

    if (!review) return;

    const modalContent =
        document.getElementById(
            "modalContent"
        );

    modalContent.innerHTML = `

        <div class="line">
            <span>Employee</span>
            <strong>${review.employee}</strong>
        </div>

        <div class="line">
            <span>Department</span>
            <strong>${review.department}</strong>
        </div>

        <div class="line">
            <span>Rating</span>
            <strong>${review.rating}</strong>
        </div>

        <div class="line">
            <span>Reviewer</span>
            <strong>${review.reviewer}</strong>
        </div>

        <div class="line">
            <span>Strengths</span>
            <strong>${review.strengths}</strong>
        </div>

        <div class="line">
            <span>Areas For Improvement</span>
            <strong>${review.improvements}</strong>
        </div>

        <div class="line">
            <span>Development Goals</span>
            <strong>${review.goals}</strong>
        </div>

        <div class="line">
            <span>Comments</span>
            <strong>${review.comments}</strong>
        </div>

        <div class="line">
            <span>Status</span>
            <strong>${review.status}</strong>
        </div>

    `;

    document
        .getElementById("reviewModal")
        .classList.add("show");

}

window.viewReview =
    viewReview;

/* ==================================================
   EDIT REVIEW
================================================== */

function editReview(id) {

    const review =
        reviews.find(
            item => item.id === id
        );

    if (!review) return;

    currentReviewId = id;

    document.getElementById(
        "editRating"
    ).value = review.rating;

    document.getElementById(
        "editStrengths"
    ).value = review.strengths;

    document.getElementById(
        "editImprovements"
    ).value = review.improvements;

    document.getElementById(
        "editGoals"
    ).value = review.goals;

    document.getElementById(
        "editComments"
    ).value = review.comments;

    document
        .getElementById("editModal")
        .classList.add("show");

}

window.editReview =
    editReview;

/* ==================================================
   SAVE REVIEW CHANGES
================================================== */

function saveReviewChanges() {

    const review =
        reviews.find(
            item =>
                item.id === currentReviewId
        );

    if (!review) return;

    review.rating =
        Number(
            document.getElementById(
                "editRating"
            ).value
        );

    review.strengths =
        document.getElementById(
            "editStrengths"
        ).value;

    review.improvements =
        document.getElementById(
            "editImprovements"
        ).value;

    review.goals =
        document.getElementById(
            "editGoals"
        ).value;

    review.comments =
        document.getElementById(
            "editComments"
        ).value;

    document
        .getElementById("editModal")
        .classList.remove("show");

    applyFilters();

    updateStatistics();

}

/* ==================================================
   FILTERING
================================================== */

function applyFilters() {

    const searchInput =
        document.getElementById(
            "searchInput"
        );

    const departmentFilter =
        document.getElementById(
            "departmentFilter"
        );

    const ratingFilter =
        document.getElementById(
            "ratingFilter"
        );

    const searchTerm =
        searchInput.value
            .toLowerCase()
            .trim();

    const department =
        departmentFilter.value;

    const rating =
        ratingFilter.value;

    let filteredReviews =
        reviews.filter(review => {

            const matchesSearch =

                review.employee
                    .toLowerCase()
                    .includes(searchTerm)

                ||

                review.department
                    .toLowerCase()
                    .includes(searchTerm)

                ||

                review.reviewer
                    .toLowerCase()
                    .includes(searchTerm);

            const matchesDepartment =

                department === "All"

                ||

                review.department === department;

            const matchesRating =

                rating === "All"

                ||

                review.rating === Number(rating);

            const matchesStatus =

                currentStatusFilter === "All"

                ||

                review.status === currentStatusFilter;

            return (
                matchesSearch &&
                matchesDepartment &&
                matchesRating &&
                matchesStatus
            );

        });

    renderReviews(
        filteredReviews
    );

}

/* ==================================================
   TAB EVENTS
================================================== */

function initialiseTabs() {

    const tabs =
        document.querySelectorAll(
            ".tab"
        );

    tabs.forEach(tab => {

        tab.addEventListener(
            "click",
            () => {

                tabs.forEach(item =>
                    item.classList.remove(
                        "active"
                    )
                );

                tab.classList.add(
                    "active"
                );

                currentStatusFilter =
                    tab.dataset.status;

                applyFilters();

            }
        );

    });

}

/* ==================================================
   FILTER EVENTS
================================================== */

function initialiseFilterEvents() {

    const searchInput =
        document.getElementById(
            "searchInput"
        );

    const departmentFilter =
        document.getElementById(
            "departmentFilter"
        );

    const ratingFilter =
        document.getElementById(
            "ratingFilter"
        );

    searchInput.addEventListener(
        "input",
        applyFilters
    );

    departmentFilter.addEventListener(
        "change",
        applyFilters
    );

    ratingFilter.addEventListener(
        "change",
        applyFilters
    );

}

/* ==================================================
   MODAL EVENTS
================================================== */

function initialiseModalEvents() {

    const closeModal =
        document.getElementById(
            "closeModal"
        );

    const closeEditModal =
        document.getElementById(
            "closeEditModal"
        );

    const saveReviewBtn =
        document.getElementById(
            "saveReviewBtn"
        );

    closeModal.addEventListener(
        "click",
        () => {

            document
                .getElementById(
                    "reviewModal"
                )
                .classList.remove(
                    "show"
                );

        }
    );

    closeEditModal.addEventListener(
        "click",
        () => {

            document
                .getElementById(
                    "editModal"
                )
                .classList.remove(
                    "show"
                );

        }
    );

    saveReviewBtn.addEventListener(
        "click",
        saveReviewChanges
    );

}

/* ==================================================
   THEME BUTTON
================================================== */

function initialiseThemeButton() {

    const themeBtn =
        document.getElementById(
            "themeBtn"
        );

    if (!themeBtn) return;

    themeBtn.addEventListener(
        "click",
        () => {

            const nextTheme =

                currentTheme() === "dark"
                    ? "light"
                    : "dark";

            applyTheme(
                nextTheme
            );

        }
    );

}

/* ==================================================
   APPLICATION STARTUP
================================================== */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        renderPerformanceReviewPage();

        // Load real performance reviews from the backend database.
        await loadReviews();

        initialiseTabs();

        initialiseFilterEvents();

        initialiseModalEvents();

        initialiseThemeButton();

        applyTheme(
            currentTheme()
        );

        console.log(
            "Performance Reviews page initialised successfully."
        );

    }
);