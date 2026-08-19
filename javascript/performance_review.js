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

const activePage = document.body.dataset.page || "performance_review";

/* ==================================================
   ICONS
================================================== */

function buildingIcon() {
    return `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 21h18"></path>
            <path d="M6 21V9l6-4 6 4v12"></path>
            <path d="M10 21v-5h4v5"></path>
        </svg>
    `;
}

function moonIcon() {
    return `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"></path>
        </svg>
    `;
}

function sunIcon() {
    return `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
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
        <a class="topnav-item ${item.id === active ? "active" : ""}" href="${pageUrl(item.id)}">
            ${item.label}
        </a>
    `).join("");

    return `
        <a class="tb-brand" href="${pageUrl("dashboard")}">
            <span class="tb-logo">${buildingIcon()}</span>
            <span class="tb-name">ModernTech HR</span>
        </a>
        <nav class="topnav">${links}</nav>
        <button class="hamburger-btn" id="hamburgerBtn">${menuIcon()}</button>
        <div class="top-spacer"></div>
        <div class="top-icons">
            <button class="icon-btn" id="themeBtn">${sunIcon()}</button>
            <button class="acct" id="profileBtn">
                <span class="av">HA</span>
                <span class="who"><b>HR Manager</b><span>Administrator</span></span>
            </button>
        </div>
    `;
}

const topbar = document.getElementById("topbar");
if (topbar) {
    topbar.innerHTML = topbarHTML(activePage);
}

/* ==================================================
   MOBILE NAVIGATION
================================================== */

function createMobileNav() {
    const nav = document.createElement("div");
    nav.className = "mobile-nav";
    nav.id = "mobileNav";
    nav.innerHTML = NAV.map(item => `
        <a href="${pageUrl(item.id)}" class="mobile-nav-item ${item.id === activePage ? "active" : ""}">
            ${item.label}
        </a>
    `).join("");
    document.body.appendChild(nav);
    return nav;
}

const mobileNav = createMobileNav();
const hamburgerBtn = document.getElementById("hamburgerBtn");

if (hamburgerBtn) {
    hamburgerBtn.addEventListener("click", e => {
        e.stopPropagation();
        mobileNav.classList.toggle("open");
    });
}

document.addEventListener("click", e => {
    if (!e.target.closest(".hamburger-btn") && !e.target.closest(".mobile-nav")) {
        mobileNav.classList.remove("open");
    }
});

/* ==================================================
   THEME MANAGEMENT
================================================== */

const THEME_KEY = "mt-theme";

function currentTheme() {
    try {
        return localStorage.getItem(THEME_KEY) || "light";
    } catch {
        return "light";
    }
}

function updateThemeIcon(theme) {
    const themeBtn = document.getElementById("themeBtn");
    if (!themeBtn) return;
    themeBtn.innerHTML = theme === "dark" ? sunIcon() : moonIcon();
}

function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    try {
        localStorage.setItem(THEME_KEY, theme);
    } catch {}
    updateThemeIcon(theme);
}

/* ==================================================
   API CONFIGURATION - PRODUCTION URL
   ================================================== */

const API_BASE_URL = "https://moderntech-hr-backend.onrender.com";
const API_URL = `${API_BASE_URL}/api/performance-reviews`;

/* ==================================================
   PERFORMANCE REVIEW DATA
   Reviews are now loaded from the backend database.
================================================== */

let reviews = [];
let currentReviewId = null;
let currentStatusFilter = "All";

/* ==================================================
   FETCH EMPLOYEES FOR DEPARTMENT NAMES
================================================== */

async function fetchEmployees() {
    const token = localStorage.getItem("token");
    if (!token) return {};

    try {
        const response = await fetch(`${API_BASE_URL}/api/employees`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        if (!response.ok) return {};
        const data = await response.json();
        // Create a map of employee_id -> employee object
        const employeeMap = {};
        data.forEach(emp => {
            employeeMap[emp.id] = emp;
        });
        return employeeMap;
    } catch (error) {
        console.error("Error fetching employees:", error);
        return {};
    }
}

/* ==================================================
   LOAD PERFORMANCE REVIEWS
   Fetches performance reviews from the backend API.
================================================== */

async function loadReviews() {
    const token = localStorage.getItem("token");

    if (!token) {
        console.error("No authentication token found. Please login first.");
        document.getElementById("reviewContainer").innerHTML = `
            <div class="empty-state">
                <p>Please login to view performance reviews.</p>
                <a href="index.html" class="btn primary">Go to Login</a>
            </div>
        `;
        return;
    }

    try {
        // 1. Fetch performance reviews
        const response = await fetch(API_URL, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error("Session expired. Please login again.");
            }
            throw new Error(`Failed to load performance reviews: ${response.status}`);
        }

        const data = await response.json();
        console.log("📋 Performance reviews loaded:", data.length, "records");

        // 2. Fetch employees for department names
        const employeeMap = await fetchEmployees();
        console.log("📋 Employees loaded:", Object.keys(employeeMap).length, "records");

        // 3. Convert database records into the frontend structure
        reviews = data.map(review => {
            const employee = employeeMap[review.employee_id] || {};
            const fullName = employee.first_name && employee.last_name 
                ? `${employee.first_name} ${employee.last_name}` 
                : `Employee #${review.employee_id}`;

            const status = review.rating === 5 ? "Top Performer" 
                        : review.rating === 4 ? "Outstanding" 
                        : "Needs Improvement";

            return {
                id: review.id,
                employeeId: review.employee_id,
                employee: fullName,
                department: employee.department_name || "N/A",
                rating: review.rating,
                reviewer: review.reviewer,
                feedback: review.feedback || "",
                strengths: review.feedback || "",
                improvements: "",
                goals: "",
                comments: review.feedback || "",
                status: status
            };
        });

        // 4. Populate department filter
        populateDepartments();

        // 5. Update KPI statistics
        updateStatistics();

        // 6. Render the reviews
        renderReviews(reviews);

        console.log("✅ Performance reviews loaded successfully:", reviews.length);

    } catch (error) {
        console.error("Error loading performance reviews:", error);
        document.getElementById("reviewContainer").innerHTML = `
            <div class="empty-state">
                <p>Error loading performance reviews: ${error.message}</p>
                <button onclick="loadReviews()" class="btn primary">Retry</button>
            </div>
        `;
    }
}

/* ==================================================
   PAGE RENDERING
   Generates the entire page inside #main
================================================== */

function renderPerformanceReviewPage() {
    const main = document.getElementById("main");
    if (!main) return;

    main.innerHTML = `
        <!-- PAGE HEADER -->
        <div class="page-head">
            <div class="eyebrow">Performance Management</div>
            <h1 class="page-title">Employee Performance Reviews</h1>
            <div class="page-sub">
                Monitor employee achievements, development goals, ratings and review outcomes.
            </div>
        </div>

        <!-- KPI SECTION -->
        <section class="kpis">
            <div class="kpi">
                <div class="kico" style="background:linear-gradient(135deg,#2f6be0,#1746b0)">
                    <i class="bi bi-clipboard-data-fill"></i>
                </div>
                <div class="klab">Total Reviews</div>
                <div class="kval" id="totalReviews">0</div>
            </div>
            <div class="kpi">
                <div class="kico" style="background:linear-gradient(135deg,#10b981,#0f9d6f)">
                    <i class="bi bi-star-fill"></i>
                </div>
                <div class="klab">Average Rating</div>
                <div class="kval" id="averageRating">0</div>
            </div>
            <div class="kpi">
                <div class="kico" style="background:linear-gradient(135deg,#f59e0b,#b6790c)">
                    <i class="bi bi-trophy-fill"></i>
                </div>
                <div class="klab">Top Performers</div>
                <div class="kval" id="topPerformers">0</div>
            </div>
            <div class="kpi">
                <div class="kico" style="background:linear-gradient(135deg,#ef4444,#c62828)">
                    <i class="bi bi-exclamation-triangle-fill"></i>
                </div>
                <div class="klab">Needs Improvement</div>
                <div class="kval" id="needsImprovement">0</div>
            </div>
        </section>

        <!-- STATUS TABS -->
        <section class="tabs">
            <button class="tab active" data-status="All">All Reviews</button>
            <button class="tab" data-status="Top Performer">Top Performers</button>
            <button class="tab" data-status="Outstanding">Outstanding</button>
            <button class="tab" data-status="Needs Improvement">Needs Improvement</button>
        </section>

        <!-- REVIEW DIRECTORY -->
        <section class="panel">
            <div class="toolbar">
                <div class="search">
                    <i class="bi bi-search"></i>
                    <input type="text" id="searchInput" placeholder="Search employee...">
                </div>
                <select id="departmentFilter" class="select">
                    <option value="All">All Departments</option>
                </select>
                <select id="ratingFilter" class="select">
                    <option value="All">All Ratings</option>
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
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
    if (!name || name === "N/A") return "?";
    return name
        .split(" ")
        .map(word => word[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

/* ==================================================
   KPI STATISTICS
================================================== */

function updateStatistics() {
    const totalReviews = document.getElementById("totalReviews");
    const averageRating = document.getElementById("averageRating");
    const topPerformers = document.getElementById("topPerformers");
    const needsImprovement = document.getElementById("needsImprovement");

    if (!totalReviews || !averageRating || !topPerformers || !needsImprovement) return;

    totalReviews.textContent = reviews.length;

    const average = reviews.length > 0 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
        : 0;

    averageRating.textContent = average.toFixed(1);

    topPerformers.textContent = reviews.filter(review => review.rating === 5).length;
    needsImprovement.textContent = reviews.filter(review => review.rating <= 3).length;
}

/* ==================================================
   DEPARTMENT FILTER
================================================== */

function populateDepartments() {
    const departmentFilter = document.getElementById("departmentFilter");
    if (!departmentFilter) return;

    const departments = [...new Set(reviews.map(review => review.department).filter(d => d && d !== "N/A"))];
    
    departmentFilter.innerHTML = '<option value="All">All Departments</option>';
    departments.forEach(department => {
        const option = document.createElement("option");
        option.value = department;
        option.textContent = department;
        departmentFilter.appendChild(option);
    });
}

/* ==================================================
   REVIEW TABLE RENDERING
================================================== */

function renderReviews(reviewList) {
    const reviewContainer = document.getElementById("reviewContainer");
    if (!reviewContainer) return;

    if (!reviewList || reviewList.length === 0) {
        reviewContainer.innerHTML = `
            <div class="empty-state">
                <p>No performance reviews found.</p>
            </div>
        `;
        return;
    }

    reviewContainer.innerHTML = reviewList.map(review => `
        <div class="trow emp-grid">
            <div class="who-cell">
                <div class="avatar">${getInitials(review.employee)}</div>
                <div>
                    <div class="nm">${review.employee}</div>
                </div>
            </div>
            <div>${review.department}</div>
            <div>⭐ ${review.rating}</div>
            <div>${review.reviewer}</div>
            <div class="row-actions">
                <button class="btn sm ghost" onclick="viewReview(${review.id})">View</button>
                <button class="btn sm" onclick="editReview(${review.id})">Edit</button>
            </div>
        </div>
    `).join("");
}

/* ==================================================
   VIEW REVIEW
================================================== */

function viewReview(id) {
    const review = reviews.find(item => item.id === id);
    if (!review) return;

    const modalContent = document.getElementById("modalContent");
    if (!modalContent) return;

    modalContent.innerHTML = `
        <div class="line"><span>Employee</span><strong>${review.employee}</strong></div>
        <div class="line"><span>Department</span><strong>${review.department}</strong></div>
        <div class="line"><span>Rating</span><strong>${review.rating}</strong></div>
        <div class="line"><span>Reviewer</span><strong>${review.reviewer}</strong></div>
        <div class="line"><span>Feedback</span><strong>${review.feedback}</strong></div>
        <div class="line"><span>Status</span><strong>${review.status}</strong></div>
    `;

    document.getElementById("reviewModal").classList.add("show");
}

window.viewReview = viewReview;

/* ==================================================
   EDIT REVIEW
================================================== */

function editReview(id) {
    const review = reviews.find(item => item.id === id);
    if (!review) return;

    currentReviewId = id;

    document.getElementById("editRating").value = review.rating;
    document.getElementById("editStrengths").value = review.strengths;
    document.getElementById("editImprovements").value = review.improvements;
    document.getElementById("editGoals").value = review.goals;
    document.getElementById("editComments").value = review.comments;

    document.getElementById("editModal").classList.add("show");
}

window.editReview = editReview;

/* ==================================================
   SAVE REVIEW CHANGES
================================================== */

function saveReviewChanges() {
    const review = reviews.find(item => item.id === currentReviewId);
    if (!review) return;

    review.rating = Number(document.getElementById("editRating").value);
    review.strengths = document.getElementById("editStrengths").value;
    review.improvements = document.getElementById("editImprovements").value;
    review.goals = document.getElementById("editGoals").value;
    review.comments = document.getElementById("editComments").value;

    document.getElementById("editModal").classList.remove("show");
    applyFilters();
    updateStatistics();
}

window.saveReviewChanges = saveReviewChanges;

/* ==================================================
   FILTERING
================================================== */

function applyFilters() {
    const searchInput = document.getElementById("searchInput");
    const departmentFilter = document.getElementById("departmentFilter");
    const ratingFilter = document.getElementById("ratingFilter");

    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : "";
    const department = departmentFilter ? departmentFilter.value : "All";
    const rating = ratingFilter ? ratingFilter.value : "All";

    const filteredReviews = reviews.filter(review => {
        const matchesSearch = 
            review.employee.toLowerCase().includes(searchTerm) ||
            review.department.toLowerCase().includes(searchTerm) ||
            review.reviewer.toLowerCase().includes(searchTerm);

        const matchesDepartment = department === "All" || review.department === department;
        const matchesRating = rating === "All" || review.rating === Number(rating);
        const matchesStatus = currentStatusFilter === "All" || review.status === currentStatusFilter;

        return matchesSearch && matchesDepartment && matchesRating && matchesStatus;
    });

    renderReviews(filteredReviews);
}

/* ==================================================
   TAB EVENTS
================================================== */

function initialiseTabs() {
    const tabs = document.querySelectorAll(".tab");
    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tabs.forEach(item => item.classList.remove("active"));
            tab.classList.add("active");
            currentStatusFilter = tab.dataset.status;
            applyFilters();
        });
    });
}

/* ==================================================
   FILTER EVENTS
================================================== */

function initialiseFilterEvents() {
    const searchInput = document.getElementById("searchInput");
    const departmentFilter = document.getElementById("departmentFilter");
    const ratingFilter = document.getElementById("ratingFilter");

    if (searchInput) searchInput.addEventListener("input", applyFilters);
    if (departmentFilter) departmentFilter.addEventListener("change", applyFilters);
    if (ratingFilter) ratingFilter.addEventListener("change", applyFilters);
}

/* ==================================================
   MODAL EVENTS
================================================== */

function initialiseModalEvents() {
    const closeModal = document.getElementById("closeModal");
    const closeEditModal = document.getElementById("closeEditModal");
    const saveReviewBtn = document.getElementById("saveReviewBtn");

    if (closeModal) {
        closeModal.addEventListener("click", () => {
            document.getElementById("reviewModal").classList.remove("show");
        });
    }

    if (closeEditModal) {
        closeEditModal.addEventListener("click", () => {
            document.getElementById("editModal").classList.remove("show");
        });
    }

    if (saveReviewBtn) {
        saveReviewBtn.addEventListener("click", saveReviewChanges);
    }
}

/* ==================================================
   THEME BUTTON
================================================== */

function initialiseThemeButton() {
    const themeBtn = document.getElementById("themeBtn");
    if (!themeBtn) return;
    themeBtn.addEventListener("click", () => {
        applyTheme(currentTheme() === "dark" ? "light" : "dark");
    });
}

/* ==================================================
   PROFILE MENU
================================================== */

function initialiseProfileMenu() {
    const profileBtn = document.getElementById("profileBtn");
    if (!profileBtn) return;

    profileBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const menu = document.getElementById("profileMenu");
        if (menu) menu.classList.toggle("show");
    });

    document.addEventListener("click", () => {
        const menu = document.getElementById("profileMenu");
        if (menu) menu.classList.remove("show");
    });

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "index.html";
        });
    }
}

/* ==================================================
   APPLICATION STARTUP
================================================== */

document.addEventListener("DOMContentLoaded", async () => {
    renderPerformanceReviewPage();
    await loadReviews();
    initialiseTabs();
    initialiseFilterEvents();
    initialiseModalEvents();
    initialiseThemeButton();
    initialiseProfileMenu();
    applyTheme(currentTheme());
    console.log("✅ Performance Reviews page initialised successfully.");
});