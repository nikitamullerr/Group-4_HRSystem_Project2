console.log("Employees JS Loaded");

/* ==================================================
   NAVIGATION
   Creates and manages the main navigation bar
   used throughout the HR system.
================================================== */

const NAV = [
    { id: "dashboard", label: "Dashboard" },
    { id: "employees", label: "Employees" },
    { id: "time_off", label: "Time Off Management" },
    { id: "attendance", label: "Attendance Management" },
    { id: "payroll_payslips", label: "Payroll and Payslips" },
    { id: "performance_review", label: "Performance Reviews" }
];

// Creates page URL from page ID
function pageUrl(id) {
    return `${id}.html`;
}

/* ==================================================
   SVG ICONS
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
            <path d="M3 21h18"/>
            <path d="M6 21V9l6-4 6 4v12"/>
            <path d="M10 21v-5h4v5"/>
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
            <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>
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
            <circle cx="12" cy="12" r="4"/>
            <path d="M12 2v2"/>
            <path d="M12 20v2"/>
            <path d="M2 12h2"/>
            <path d="M20 12h2"/>
            <path d="M4.9 4.9l1.4 1.4"/>
            <path d="M17.7 17.7l1.4 1.4"/>
            <path d="M4.9 19.1l1.4-1.4"/>
            <path d="M17.7 6.3l1.4-1.4"/>
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
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
    `;
}

/* ==================================================
   TOPBAR
   Generates the page navigation bar.
================================================== */

function topbarHTML(active) {

    const links = NAV.map(item => `
        <a
            class="topnav-item ${item.id === active ? "active" : ""}"
            href="${pageUrl(item.id)}"
        >
            ${item.label}
        </a>
    `).join("");

    return `
        <a
            class="tb-brand"
            href="${pageUrl("dashboard")}"
        >
            <span class="tb-logo">${buildingIcon()}</span>
            <span class="tb-name">ModernTech HR</span>
        </a>
        <nav class="topnav">${links}</nav>
        <button class="hamburger-btn" id="hamburgerBtn">${menuIcon()}</button>
        <div class="top-spacer"></div>
        <div class="top-icons">
            <button class="icon-btn" id="themeBtn">${sunIcon()}</button>
            <button class="acct">
                <span class="av">HA</span>
                <span class="who">
                    <b>HR Admin</b>
                    <span>HR Manager</span>
                </span>
            </button>
        </div>
    `;
}

// Determine current page
const activePage = document.body.dataset.page || "employees";

// Render topbar
const topbar = document.getElementById("topbar");
if (topbar) {
    topbar.innerHTML = topbarHTML(activePage);
}

/* ==================================================
   MOBILE NAVIGATION
   Creates and controls the mobile menu.
================================================== */

function createMobileNav() {

    const nav = document.createElement("div");

    nav.className = "mobile-nav";
    nav.id = "mobileNav";

    nav.innerHTML = NAV.map(item => `
        <a
            class="mobile-nav-item ${item.id === activePage ? "active" : ""}"
            href="${pageUrl(item.id)}"
        >
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
   API CONFIGURATION
   Uses the running Node.js/Express backend.
================================================== */

const API_BASE_URL = "https://moderntech-hr-backend.onrender.com";
const API_URL = `${API_BASE_URL}/api/employees`;

/* ==================================================
   API EMPLOYEE DATA
   Employees are now loaded from the Node.js backend
   instead of using hard-coded frontend data.
================================================== */

let employees = [];
let currentEmployeeId = null;

/* ==================================================
   GET AUTH TOKEN
   The login token is stored in localStorage.
================================================== */

function getAuthToken() {
    return localStorage.getItem("token");
}

/* ==================================================
   TOAST NOTIFICATION
================================================== */

function toast(msg) {
    let t = document.getElementById('toast');
    if (!t) {
        const toastEl = document.createElement('div');
        toastEl.id = 'toast';
        toastEl.className = 'toast';
        document.body.appendChild(toastEl);
        t = toastEl;
    }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._t);
    t._t = setTimeout(function() { t.classList.remove('show'); }, 3000);
}

/* ==================================================
   LOAD EMPLOYEES FROM BACKEND
   Retrieves employee records from MySQL through
   the Express API.
================================================== */

async function loadEmployees() {

    const token = getAuthToken();

    if (!token) {
        console.error("No authentication token found.");
        toast("Please login first.");
        return;
    }

    try {

        const response = await fetch(API_URL, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Failed to load employees");
        }

        employees = data.map(employee => ({
            employeeId: employee.id,
            name: `${employee.first_name} ${employee.last_name}`,
            position: employee.position || "",
            department: employee.department_name || "",
            contact: employee.email || "",
            role: employee.role || "",
            email: employee.email || ""
        }));

        populateDepartments();
        updateStatistics();
        renderEmployees(employees);

    } catch (error) {
        console.error("Error loading employees:", error);
        toast("Error loading employees");
    }

}

/* ==================================================
   PAGE RENDERING
   Generates the Employees page inside #main.
================================================== */

function renderEmployeesPage() {

    const main = document.getElementById("main");

    if (!main) return;

    main.innerHTML = `

        <!-- PAGE HEADER -->
        <div class="page-head">
            <div class="eyebrow">Employee Management</div>
            <h1 class="page-title">Employees</h1>
            <div class="page-sub">Manage employee records, departments and workforce information.</div>
        </div>

        <!-- KPI SECTION -->
        <section class="kpis">
            <div class="kpi">
                <div class="kico" style="background:linear-gradient(135deg,#2f6be0,#1746b0)">
                    <i class="bi bi-people-fill"></i>
                </div>
                <div class="klab">Total Employees</div>
                <div class="kval" id="totalEmployees">0</div>
            </div>
            <div class="kpi">
                <div class="kico" style="background:linear-gradient(135deg,#10b981,#0f9d6f)">
                    <i class="bi bi-building-fill"></i>
                </div>
                <div class="klab">Departments</div>
                <div class="kval" id="totalDepartments">0</div>
            </div>
            <div class="kpi">
                <div class="kico" style="background:linear-gradient(135deg,#f59e0b,#b6790c)">
                    <i class="bi bi-cash-stack"></i>
                </div>
                <div class="klab">Average Salary</div>
                <div class="kval" id="averageSalary">R0</div>
            </div>
        </section>

        <!-- EMPLOYEE DIRECTORY -->
        <section class="panel">
            <div class="panel-title">
                <h3>Employee Directory</h3>
                <span class="hint">Search and manage employee records</span>
            </div>

            <!-- SEARCH + FILTER -->
            <div class="toolbar">
                <div class="search">
                    <i class="bi bi-search"></i>
                    <input type="text" id="searchInput" placeholder="Search employees...">
                </div>
                <select id="departmentFilter" class="select">
                    <option value="All">All Departments</option>
                </select>
                <button class="btn primary" id="addEmployeeBtn">+ Add Employee</button>
            </div>

            <!-- TABLE HEADER -->
            <div class="thead emp-grid">
                <div>Employee</div>
                <div>Department</div>
                <div>Position</div>
                <div>Contact</div>
                <div>Actions</div>
            </div>

            <!-- EMPLOYEE ROWS -->
            <div id="employeeContainer"></div>

        </section>

    `;

}

/* ==================================================
   HELPERS
================================================== */

function getInitials(name) {
    return name.split(" ").map(word => word[0]).join("").toUpperCase();
}

/* ==================================================
   KPI STATISTICS
================================================== */

function updateStatistics() {

    const totalEmployees = document.getElementById("totalEmployees");
    const totalDepartments = document.getElementById("totalDepartments");
    const averageSalary = document.getElementById("averageSalary");

    if (!totalEmployees || !totalDepartments || !averageSalary) {
        return;
    }

    totalEmployees.textContent = employees.length;

    const departments = [...new Set(employees.map(employee => employee.department))];
    totalDepartments.textContent = departments.length;

    // Salary is not currently returned by the employee backend
    averageSalary.textContent = "N/A";

}

/* ==================================================
   DEPARTMENT FILTER
================================================== */

function populateDepartments() {

    const departmentFilter = document.getElementById("departmentFilter");

    if (!departmentFilter) return;

    departmentFilter.innerHTML = '<option value="All">All Departments</option>';

    const departments = [...new Set(employees.map(employee => employee.department))];

    departments.forEach(department => {
        const option = document.createElement("option");
        option.value = department;
        option.textContent = department;
        departmentFilter.appendChild(option);
    });

}

/* ==================================================
   EMPLOYEE TABLE RENDERING
================================================== */

function renderEmployees(employeeList) {

    const employeeContainer = document.getElementById("employeeContainer");

    if (!employeeContainer) return;

    employeeContainer.innerHTML = "";

    if (!employeeList || employeeList.length === 0) {
        employeeContainer.innerHTML = '<div class="empty">No employees found.</div>';
        return;
    }

    employeeList.forEach(employee => {

        employeeContainer.innerHTML += `

            <div class="trow emp-grid">

                <div class="who-cell">
                    <div class="avatar">${getInitials(employee.name)}</div>
                    <div>
                        <div class="nm">${employee.name}</div>
                        <div class="rl">ID: ${employee.employeeId}</div>
                    </div>
                </div>

                <div>
                    <span class="pill dept">${employee.department || 'N/A'}</span>
                </div>

                <div>${employee.position || 'N/A'}</div>

                <div>${employee.contact}</div>

                <div class="row-actions">
                    <button class="btn sm ghost" onclick="viewEmployee(${employee.employeeId})">View</button>
                    <button class="btn sm" onclick="editEmployee(${employee.employeeId})">Edit</button>
                    <button class="btn sm red" onclick="deleteEmployee(${employee.employeeId})">Delete</button>
                </div>

            </div>

        `;

    });

}

/* ==================================================
   VIEW EMPLOYEE
   Displays employee information retrieved from
   the backend API.
================================================== */

function viewEmployee(id) {

    const employee = employees.find(emp => emp.employeeId === id);

    if (!employee) return;

    const modalContent = document.getElementById("modalContent");

    modalContent.innerHTML = `
        <div class="line"><span>ID</span><strong>${employee.employeeId}</strong></div>
        <div class="line"><span>Name</span><strong>${employee.name}</strong></div>
        <div class="line"><span>Position</span><strong>${employee.position}</strong></div>
        <div class="line"><span>Department</span><strong>${employee.department}</strong></div>
        <div class="line"><span>Contact</span><strong>${employee.contact}</strong></div>
        <div class="line"><span>Role</span><strong>${employee.role}</strong></div>
    `;

    document.getElementById("employeeModal").classList.add("show");

}

/* ==================================================
   EDIT EMPLOYEE
   Loads an employee into the existing edit modal.
================================================== */

async function editEmployee(id) {

    try {

        const token = getAuthToken();

        const response = await fetch(`${API_URL}/${id}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const employee = await response.json();

        if (!response.ok) {
            throw new Error(employee.error || "Unable to load employee");
        }

        currentEmployeeId = id;

        document.getElementById("editName").value =
            `${employee.first_name} ${employee.last_name}`;

        document.getElementById("editPosition").value =
            employee.position || "";

        document.getElementById("editDepartment").value =
            employee.department || "";

        document.getElementById("editContact").value =
            employee.email || "";

        /* Salary is not part of the current API. */
        document.getElementById("editSalary").value = "";

        document.getElementById("editModal").classList.add("show");

    } catch (error) {
        console.error("Error loading employee:", error);
        toast("Error loading employee");
    }

}

/* ==================================================
   SAVE EMPLOYEE CHANGES
   Sends the edited employee to the Node.js backend
   using the PUT endpoint.
================================================== */

async function saveEmployeeChanges() {

    const token = getAuthToken();

    if (!token) {
        console.error("No authentication token found.");
        toast("Please login first.");
        return;
    }

    const fullName = document.getElementById("editName").value.trim();
    const position = document.getElementById("editPosition").value.trim();
    const email = document.getElementById("editContact").value.trim();
    const departmentName = document.getElementById("editDepartment").value.trim();

    /* ==================================================
       NAME VALIDATION
       The backend requires first_name and last_name.
    ================================================== */

    const nameParts = fullName.split(/\s+/);

    const first_name = nameParts.shift();
    const last_name = nameParts.join(" ");

    if (!first_name || !last_name) {
        alert("Please enter the employee's first and last name.");
        return;
    }

    /* ==================================================
       DEPARTMENT LOOKUP
       The backend requires department_id, while the
       frontend currently displays the department name.
    ================================================== */

    const existingEmployee = employees.find(employee => employee.employeeId === currentEmployeeId);

    if (!existingEmployee) return;

    let department_id = null;

    try {

        const employeeResponse = await fetch(`${API_URL}/${currentEmployeeId}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const employeeData = await employeeResponse.json();

        department_id = employeeData.department_id;

    } catch (error) {
        console.error("Unable to retrieve department ID:", error);
        toast("Unable to retrieve department ID");
        return;
    }

    if (!department_id) {
        alert("Employee department could not be identified.");
        return;
    }

    /* ==================================================
       SEND PUT REQUEST
    ================================================== */

    try {

        const response = await fetch(`${API_URL}/${currentEmployeeId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                first_name,
                last_name,
                email,
                department_id,
                position,
                role: existingEmployee.role || "employee"
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Employee update failed");
        }

        console.log("Employee updated successfully:", data);
        toast("✅ Employee updated successfully");

        document.getElementById("editModal").classList.remove("show");

        /* Reload employees from MySQL. */
        await loadEmployees();

    } catch (error) {
        console.error("Error updating employee:", error);
        alert("Unable to update employee.");
    }

}

/* ==================================================
   DELETE EMPLOYEE
================================================== */

async function deleteEmployee(id) {

    const employee = employees.find(emp => emp.employeeId === id);
    if (!employee) {
        toast('Employee not found');
        return;
    }

    // Prevent deleting the admin user
    if (employee.email === 'admin@moderntech.com') {
        toast('❌ Cannot delete the admin user');
        return;
    }

    const confirmDelete = confirm(
        `⚠️ Are you sure you want to delete ${employee.name}?\n\nThis action cannot be undone.`
    );

    if (!confirmDelete) {
        return;
    }

    const token = getAuthToken();
    if (!token) {
        toast('Please login first');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            toast(`✅ ${employee.name} deleted successfully`);
            await loadEmployees();
        } else {
            toast('Error: ' + (data.error || 'Failed to delete employee'));
        }
    } catch (error) {
        console.error('Error deleting employee:', error);
        toast('Error deleting employee');
    }

}

window.deleteEmployee = deleteEmployee;

/* ==================================================
   ADD EMPLOYEE
================================================== */

// Open the add modal
document.addEventListener('click', function(e) {
    if (e.target.id === 'addEmployeeBtn') {
        document.getElementById('addEmployeeModal').classList.add('show');
    }
});

// Close modal functions
document.getElementById('closeAddModal')?.addEventListener('click', function() {
    document.getElementById('addEmployeeModal').classList.remove('show');
});

document.getElementById('cancelAddBtn')?.addEventListener('click', function() {
    document.getElementById('addEmployeeModal').classList.remove('show');
});

// Close modal when clicking outside
document.getElementById('addEmployeeModal')?.addEventListener('click', function(e) {
    if (e.target === this) {
        this.classList.remove('show');
    }
});

// Save new employee
document.getElementById('saveAddBtn')?.addEventListener('click', async function() {
    const firstName = document.getElementById('addFirstName').value.trim();
    const lastName = document.getElementById('addLastName').value.trim();
    const email = document.getElementById('addEmail').value.trim();
    const departmentId = document.getElementById('addDepartment').value;
    const position = document.getElementById('addPosition').value.trim();
    const password = document.getElementById('addPassword').value;

    // Validate
    if (!firstName || !lastName || !email || !password) {
        toast('Please fill in all required fields.');
        return;
    }

    if (password.length < 6) {
        toast('Password must be at least 6 characters.');
        return;
    }

    const token = getAuthToken();
    if (!token) {
        toast('Please login first.');
        return;
    }

    // Show loading state
    const saveBtn = document.getElementById('saveAddBtn');
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                first_name: firstName,
                last_name: lastName,
                email: email,
                department_id: parseInt(departmentId),
                position: position,
                password: password
            })
        });

        const data = await response.json();

        if (response.ok) {
            toast(`✅ ${firstName} ${lastName} added successfully!`);
            document.getElementById('addEmployeeModal').classList.remove('show');
            
            // Clear form
            document.getElementById('addFirstName').value = '';
            document.getElementById('addLastName').value = '';
            document.getElementById('addEmail').value = '';
            document.getElementById('addPosition').value = '';
            document.getElementById('addPassword').value = '';
            
            // Reload employees
            await loadEmployees();
        } else {
            toast('Error: ' + (data.error || 'Failed to add employee'));
        }
    } catch (error) {
        console.error('Error adding employee:', error);
        toast('Error adding employee. Please try again.');
    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = '+ Add Employee';
    }
});

// Enter key support for the form
document.getElementById('addPassword')?.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        document.getElementById('saveAddBtn').click();
    }
});

/* ==================================================
   SEARCH AND FILTERING
================================================== */

function applyFilters() {

    const searchInput = document.getElementById("searchInput");
    const departmentFilter = document.getElementById("departmentFilter");

    const searchTerm = searchInput.value.toLowerCase().trim();
    const department = departmentFilter.value;

    const filteredEmployees = employees.filter(employee => {

        const matchesSearch =
            employee.name.toLowerCase().includes(searchTerm) ||
            employee.position.toLowerCase().includes(searchTerm) ||
            employee.department.toLowerCase().includes(searchTerm);

        const matchesDepartment = department === "All" || employee.department === department;

        return (matchesSearch && matchesDepartment);

    });

    renderEmployees(filteredEmployees);

}

/* ==================================================
   MODAL EVENTS
================================================== */

function initialiseModalEvents() {

    const closeModal = document.getElementById("closeModal");
    const closeEditModal = document.getElementById("closeEditModal");
    const saveEmployeeBtn = document.getElementById("saveEmployeeBtn");

    if (closeModal) {
        closeModal.addEventListener("click", () => {
            document.getElementById("employeeModal").classList.remove("show");
        });
    }

    if (closeEditModal) {
        closeEditModal.addEventListener("click", () => {
            document.getElementById("editModal").classList.remove("show");
        });
    }

    if (saveEmployeeBtn) {
        saveEmployeeBtn.addEventListener("click", saveEmployeeChanges);
    }

}

/* ==================================================
   FILTER EVENTS
================================================== */

function initialiseFilterEvents() {

    const searchInput = document.getElementById("searchInput");
    const departmentFilter = document.getElementById("departmentFilter");

    if (searchInput) {
        searchInput.addEventListener("input", applyFilters);
    }

    if (departmentFilter) {
        departmentFilter.addEventListener("change", applyFilters);
    }

}

/* ==================================================
   THEME BUTTON
================================================== */

function initialiseThemeButton() {

    const themeBtn = document.getElementById("themeBtn");

    if (!themeBtn) return;

    themeBtn.addEventListener("click", () => {

        const nextTheme = currentTheme() === "dark" ? "light" : "dark";

        applyTheme(nextTheme);

    });

}

/* ==================================================
   INITIALISATION
   Builds the page and then loads employee records
   from the Node.js backend.
================================================== */

document.addEventListener("DOMContentLoaded", async function () {

    renderEmployeesPage();

    initialiseThemeButton();

    initialiseFilterEvents();

    initialiseModalEvents();

    applyTheme(currentTheme());

    /*
     * Load the real employee records from MySQL
     * through the Express API.
     */
    await loadEmployees();

    console.log("Employees page initialised successfully.");

});