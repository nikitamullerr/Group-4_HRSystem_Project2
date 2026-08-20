/* TIME OFF MANAGEMENT SCRIPT
   This file powers the "Time Off Management" page.
   It loads pending leave requests from the backend API,
   and allows approving or denying them. */

/* Navigation configuration */
const NAV = [
  { id: "dashboard", label: "Dashboard" },
  { id: "employees", label: "Employees" },
  { id: "time_off", label: "Time Off Management" },
  { id: "attendance", label: "Attendance Management" },
  { id: "payroll_payslips", label: "Payroll and Payslips" },
  { id: "performance_review", label: "Performance Reviews" },
];

function pageUrl(id) {
  return id + ".html";
}

/* API CONFIGURATION - PRODUCTION URL */

const API_BASE_URL = 'https://moderntech-hr-backend.onrender.com';

/* Top bar HTML generation */
function topbarHTML(active) {
  const logo = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M6 21V9l6-4 6 4v12M10 21v-5h4v5"/></svg>';

  const links = NAV.map(function(n) {
    return '<a class="topnav-item ' + (n.id === active ? "active" : "") + '" href="' + pageUrl(n.id) + '">' + n.label + '</a>';
  }).join("");

  return `
    <a class="tb-brand" href="${pageUrl('dashboard')}"><span class="tb-logo">${logo}</span><span class="tb-name">ModernTech HR</span></a>
    <nav class="topnav">${links}</nav>
    <button class="hamburger-btn" id="hamburgerBtn">
      <i class="bi-list"></i>
    </button>
    <div class="top-spacer"></div>
    <div class="top-icons">
      <button class="icon-btn" id="themeBtn"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg></button>
      <button class="acct" id="profileBtn"><span class="av">HA</span><span class="who"><b>HR Admin</b><span>HR Manager</span></span></button>
    </div>
    <div class="menu" id="profileMenu">
      <button id="goProfile">My profile</button>
      <div class="sep"></div>
      <button id="logoutBtn">Log out</button>
    </div>
  `;
}

var active = document.body.dataset.page || "time_off";
var tb = document.getElementById("topbar");
if (tb) tb.innerHTML = topbarHTML(active);

/* Mobile navigation */
function createMobileNav() {
  var nav = document.createElement('div');
  nav.className = 'mobile-nav';
  nav.id = 'mobileNav';
  
  nav.innerHTML = NAV.map(function(n) {
    return '<a class="mobile-nav-item ' + (n.id === active ? 'active' : '') + '" href="' + pageUrl(n.id) + '">' + n.label + '</a>';
  }).join('');
  
  document.body.appendChild(nav);
  
  nav.querySelectorAll('a').forEach(function(link) {
    link.addEventListener('click', function() {
      nav.classList.remove('open');
    });
  });
  
  return nav;
}

var mobileNav = createMobileNav();

var hamburgerBtn = document.getElementById('hamburgerBtn');
if (hamburgerBtn) {
  hamburgerBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    mobileNav.classList.toggle('open');
  });
}

document.addEventListener('click', function(e) {
  if (!e.target.closest('.hamburger-btn') && !e.target.closest('.mobile-nav')) {
    mobileNav.classList.remove('open');
  }
});

var scrollTimeout;
window.addEventListener('scroll', function() {
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(function() {
    mobileNav.classList.remove('open');
  }, 100);
});

/* Theme management */
var THEME_KEY = "mt-theme";

function currentTheme() {
  try { return localStorage.getItem(THEME_KEY) || "light"; }
  catch(e) { return "light"; }
}

function applyTheme(t) {
  document.documentElement.setAttribute("data-theme", t);
  try { localStorage.setItem(THEME_KEY, t); } catch(e) {}
  updateThemeIcon(t);
}

function updateThemeIcon(t) {
  var btn = document.getElementById("themeBtn");
  if (!btn) return;
  var isDark = t === "dark";
  btn.innerHTML = isDark
    ? '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>'
    : '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
  btn.title = isDark ? "Switch to light mode" : "Switch to dark mode";
}

applyTheme(currentTheme());

var themeBtn = document.getElementById("themeBtn");
if (themeBtn) {
  themeBtn.addEventListener("click", function() {
    applyTheme(currentTheme() === "dark" ? "light" : "dark");
  });
}

/* Profile menu */
var profileBtn = document.getElementById("profileBtn");
if (profileBtn) {
  profileBtn.addEventListener("click", function(e) {
    e.stopPropagation();
    var menu = document.getElementById("profileMenu");
    if (menu) menu.classList.toggle("show");
  });
}

var goProfileBtn = document.getElementById("goProfile");
if (goProfileBtn) {
  goProfileBtn.addEventListener("click", function() { alert("Profile"); });
}

var logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", function() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    location.href = "index.html";
  });
}

document.addEventListener("click", function() {
  var menu = document.getElementById("profileMenu");
  if (menu) menu.classList.remove("show");
});

/* BACKEND API INTEGRATION*/

var ATTENDANCE_LEAVE = [];
var PAYROLL = {};
var EMP_META = {};

function getToken() {
  return localStorage.getItem('token');
}

function toast(msg) {
  var t = document.getElementById("toast");
  if (!t) {
    var toastEl = document.createElement('div');
    toastEl.id = 'toast';
    toastEl.className = 'toast';
    document.body.appendChild(toastEl);
    t = toastEl;
  }
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(t._t);
  t._t = setTimeout(function() { t.classList.remove("show"); }, 3000);
}

// FALLBACK FUNCTION - Used when /api/employees is not available

function getFallbackEmployeeData(attendanceData) {
  console.log('Using fallback employee data (hardcoded departments)');
  
  const departmentMap = {
    1: 'Development',
    2: 'HR',
    3: 'QA',
    4: 'Sales',
    5: 'Marketing',
    6: 'Design',
    7: 'IT',
    8: 'Finance',
    9: 'Support'
  };

  const meta = {};
  attendanceData.forEach(record => {
    const empId = record.employee_id;
    if (!meta[empId]) {
      meta[empId] = {
        dept: departmentMap[empId] || 'Development',
        role: 'Team Member'
      };
    }
  });
  
  return meta;
}

// LOAD DATA FROM BACKEND API

async function loadData() {
  const token = getToken();
  
  if (!token) {
    console.warn('No token found. Please login first.');
    toast('Please login first');
    return;
  }

  try {
    // 1. Fetch attendance data (YOUR API)
    const attRes = await fetch(`${API_BASE_URL}/api/attendance`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!attRes.ok) {
      if (attRes.status === 401) {
        toast('Session expired. Please login again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setTimeout(() => { location.href = 'index.html'; }, 1500);
        return;
      }
      throw new Error('Failed to fetch attendance data');
    }

    const attendanceData = await attRes.json();
    console.log('Attendance data:', attendanceData.length, 'records');

    // 2. Try to fetch employee data (Xabiso's API) with fallback
    let EMP_META = {};

    try {
      console.log('Attempting to fetch employees from /api/employees...');
      const empRes = await fetch(`${API_BASE_URL}/api/employees`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (empRes.ok) {
        const employeesData = await empRes.json();
        console.log('Employee data loaded from API:', employeesData.length, 'records');
        
        employeesData.forEach(emp => {
          EMP_META[emp.id] = {
            dept: emp.department || 'Development',
            role: emp.position || 'Team Member'
          };
        });
      } else {
        console.warn('/api/employees returned', empRes.status, '- using fallback');
        EMP_META = getFallbackEmployeeData(attendanceData);
      }
    } catch (empError) {
      console.warn('Failed to fetch /api/employees, using fallback:', empError.message);
      EMP_META = getFallbackEmployeeData(attendanceData);
    }

    // 3. Fetch pending leave requests (YOUR API)
    const leaveRes = await fetch(`${API_BASE_URL}/api/timeoff/pending`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    let leaveData = [];
    if (leaveRes.ok) {
      leaveData = await leaveRes.json();
      console.log('Pending leave data:', leaveData.length, 'requests');
    } else {
      console.warn('Failed to fetch pending leaves:', leaveRes.status);
    }

    // 4. Build employee map from attendance data + EMP_META
    const employeeMap = {};
    
    attendanceData.forEach(record => {
      const empId = record.employee_id;
      if (!employeeMap[empId]) {
        const meta = EMP_META[empId] || { dept: 'Development', role: 'Team Member' };
        employeeMap[empId] = {
          employeeId: empId,
          name: `${record.first_name} ${record.last_name}`,
          dept: meta.dept,
          role: meta.role,
          attendance: [],
          leaveRequests: []
        };
      }
      employeeMap[empId].attendance.push({
        date: record.date.split('T')[0],
        status: record.status
      });
    });

    // 5. Add leave requests to employees
    leaveData.forEach(leave => {
      const empId = leave.employee_id;
      if (employeeMap[empId]) {
        employeeMap[empId].leaveRequests.push({
          date: leave.start_date.split('T')[0],
          reason: leave.type,
          status: leave.status
        });
        console.log('Added leave for:', employeeMap[empId].name, leave.type);
      } else {
        console.warn('Employee not found for leave:', empId);
      }
    });

    // 6. Store in global variables
    ATTENDANCE_LEAVE = Object.values(employeeMap);
    
    console.log('Total employees:', ATTENDANCE_LEAVE.length);
    console.log('Total leave requests:', leaveData.length);

    // 7. Build EMP_META
    EMP_META = {};
    ATTENDANCE_LEAVE.forEach(emp => {
      EMP_META[emp.employeeId] = {
        dept: emp.dept || 'Development',
        role: emp.role || 'Team Member'
      };
    });

    // 8. Build PAYROLL data (default values)
    PAYROLL = {};
    Object.keys(employeeMap).forEach(id => {
      PAYROLL[id] = {
        hoursWorked: 160,
        leaveDeductions: 0,
        finalSalary: 0
      };
    });

    toast('Data loaded successfully');

  } catch (err) {
    console.error('Error loading data:', err);
    toast('Error loading data: ' + err.message);
  }
}

// APPROVE / DENY LEAVE REQUESTS (BACKEND)

async function approveLeaveOnBackend(id) {
  const token = getToken();
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/timeoff/${id}/approve`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to approve leave');
    }
    
    return await response.json();
  } catch (err) {
    console.error('Error approving leave:', err);
    throw err;
  }
}

async function denyLeaveOnBackend(id) {
  const token = getToken();
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/timeoff/${id}/deny`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to deny leave');
    }
    
    return await response.json();
  } catch (err) {
    console.error('Error denying leave:', err);
    throw err;
  }
}

// STATIC DEPARTMENT AND LEAVE TYPE MAPPINGS

var DEPARTMENTS = [
  { name: "Development", color: "#1d4ed8" },
  { name: "HR", color: "#0ea5e9" },
  { name: "QA", color: "#6366f1" },
  { name: "Sales", color: "#0891b2" },
  { name: "Marketing", color: "#2563eb" },
  { name: "Design", color: "#3b82f6" },
  { name: "IT", color: "#4f46e5" },
  { name: "Finance", color: "#7c3aed" },
  { name: "Support", color: "#38bdf8" },
];

var DEPT_COLOR = {};
DEPARTMENTS.forEach(function(d) { DEPT_COLOR[d.name] = d.color; });

var LEAVE_TYPES = {
  "Sick Leave": "#10b981",
  "Vacation": "#f59e0b",
  "Personal": "#2563eb",
  "Family Responsibility": "#7c3aed",
  "Medical Appointment": "#0891b2",
  "Bereavement": "#64748b",
  "Childcare": "#0ea5e9",
};

var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var MONTHS_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function parseDate(s) {
  var parts = s.split("-").map(Number);
  return { y: parts[0], m: parts[1] - 1, d: parts[2] };
}

// BUILD EMPLOYEE OBJECTS

function buildEmployees() {
  if (!ATTENDANCE_LEAVE || ATTENDANCE_LEAVE.length === 0) {
    console.warn('No attendance data available');
    return [];
  }
  
  return ATTENDANCE_LEAVE.map(function(rec) {
    var id = rec.employeeId;
    var meta = EMP_META[id] || { dept: "Operations", role: "Team Member" };
    var pay = PAYROLL[id] || { hoursWorked: 160, leaveDeductions: 0, finalSalary: 0 };
    var nameParts = rec.name.split(" ");
    var first = nameParts[0];
    var last = nameParts.slice(1).join(" ");

    var onLeave = rec.leaveRequests && rec.leaveRequests.some(function(l) {
      var dt = parseDate(l.date);
      return l.status === "Approved" && dt.y === 2025 && dt.m === 6;
    });

    return {
      id: id,
      name: rec.name,
      first: first,
      last: last,
      role: meta.role,
      dept: meta.dept,
      deptColor: DEPT_COLOR[meta.dept] || "#1d4ed8",
      email: first.toLowerCase() + "." + last.toLowerCase().replace(/[^a-z]/g, "") + "@moderntech.io",
      phone: "+27 82 555 " + String(1000 + id * 37).slice(0, 4),
      salary: pay.finalSalary,
      finalSalary: pay.finalSalary,
      hoursWorked: pay.hoursWorked,
      leaveDeductions: pay.leaveDeductions,
      status: onLeave ? "On Leave" : "Active",
      attendanceLog: rec.attendance || [],
      leaveRequests: rec.leaveRequests || [],
    };
  });
}

var state = {
  employees: [],
  requests: [],
  leave: [],
  leaveTypes: LEAVE_TYPES,
  timeoffTab: "pending",
  calMonth: 6,
  calYear: 2025,
};

function initState() {
  state.employees = buildEmployees();
  
  console.log('Building employees from:', ATTENDANCE_LEAVE.length, 'records');

  var reqId = 0;
  var leaveId = 0;
  var requests = [];
  var leave = [];

  state.employees.forEach(function(e) {
    if (e.leaveRequests && e.leaveRequests.length > 0) {
      e.leaveRequests.forEach(function(l) {
        var dt = parseDate(l.date);
        if (l.status === "Pending") {
          requests.push({ id: ++reqId, name: e.name, dept: e.dept, type: l.reason, year: dt.y, month: dt.m, day: dt.d });
        }
        if (l.status === "Approved") {
          leave.push({ id: ++leaveId, name: e.name, type: l.reason, year: dt.y, month: dt.m, day: dt.d });
        }
      });
    }
  });

  state.requests = requests;
  state.leave = leave;
  
  console.log('State initialized:', {
    employees: state.employees.length,
    requests: state.requests.length,
    leave: state.leave.length
  });
}

// UI HELPERS

function $(s) { return document.querySelector(s); }
function $$(s) { return Array.from(document.querySelectorAll(s)); }

function openModal(title, bodyHTML, footHTML) {
  var modalBg = document.getElementById("modalBg");
  var modal = document.getElementById("modal");
  if (!modalBg || !modal) {
    var bg = document.createElement('div');
    bg.id = 'modalBg';
    bg.className = 'modal-bg';
    document.body.appendChild(bg);
    
    var m = document.createElement('div');
    m.id = 'modal';
    m.className = 'modal';
    document.body.appendChild(m);
    
    modalBg = bg;
    modal = m;
  }
  
  modal.innerHTML = 
    '<div class="mhead">' + title + '<button id="mx" aria-label="Close">&times;</button></div>' +
    '<div class="mbody">' + bodyHTML + '</div>' +
    (footHTML ? '<div class="mfoot">' + footHTML + '</div>' : "");
  modalBg.classList.add("show");
  
  var closeBtn = document.getElementById("mx");
  if (closeBtn) {
    closeBtn.addEventListener("click", closeModal);
  }
}

function closeModal() {
  var modalBg = document.getElementById("modalBg");
  if (modalBg) modalBg.classList.remove("show");
}

function nextLeaveId() {
  return state.leave.reduce(function(max, l) { 
    return Math.max(max, l.id); 
  }, 0) + 1;
}

async function applyLeaveDecision(id, approve) {
  var r = state.requests.find(function(x) { return x.id === id; });
  if (!r) return null;

  try {
    if (approve) {
      await approveLeaveOnBackend(id);
      state.leave.push({ id: nextLeaveId(), name: r.name, type: r.type, year: r.year, month: r.month, day: r.day });
    } else {
      await denyLeaveOnBackend(id);
    }
    state.requests = state.requests.filter(function(x) { return x.id !== id; });
    return r;
  } catch (err) {
    toast('Error: ' + err.message);
    return null;
  }
}

function leaveColor(type) {
  return state.leaveTypes[type] || "#64748b";
}

function leaveOn(year, month, day) {
  return state.leave.filter(function(l) { 
    return l.year === year && l.month === month && l.day === day; 
  });
}

function reqDateLabel(r) {
  var m = months[r.month] || "";
  return r.endDay ? r.day + '–' + r.endDay + ' ' + m + ' ' + r.year : r.day + ' ' + m + ' ' + r.year;
}

// RENDER – Time Off Page

function renderTimeoff() {
  var main = document.getElementById("main");
  if (!main) {
    console.error("Main element not found");
    return;
  }

  main.innerHTML = 
    '<div class="page-head">' +
      '<div class="eyebrow">People</div>' +
      '<div class="page-title">Time Off &amp; Leave</div>' +
      '<div class="page-sub">Approve requests and manage the team leave calendar.</div>' +
    '</div>' +
    '<div class="tabs">' +
      '<button class="tab ' + (state.timeoffTab === "pending" ? "active" : "") + '" data-tab="pending">Pending Requests (' + state.requests.length + ')</button>' +
      '<button class="tab ' + (state.timeoffTab === "calendar" ? "active" : "") + '" data-tab="calendar">Leave Calendar</button>' +
    '</div>' +
    '<div id="toBody"></div>';

  document.querySelectorAll(".tab[data-tab]").forEach(function(tab) {
    tab.onclick = function() {
      state.timeoffTab = tab.dataset.tab;
      renderTimeoff();
    };
  });

  var body = document.getElementById("toBody");
  if (state.timeoffTab === "pending") {
    body.innerHTML = renderPending();
    wirePending();
  } else {
    body.innerHTML = renderCalendar();
    wireCalendar();
  }
}

function renderPending() {
  if (!state.requests || state.requests.length === 0) {
    return '<div class="req-card"><div class="empty">No pending requests. You are all caught up!</div></div>';
  }

  return '<div class="req-card">' + state.requests.map(function(r) {
    return '<div class="req">' +
      '<div class="who">' +
        '<b>' + r.name + '</b>' +
        '<span style="color:var(--muted)">· ' + r.type + ' · ' + reqDateLabel(r) + ' · ' + r.dept + '</span>' +
      '</div>' +
      '<div class="row-actions">' +
        '<button class="btn sm" data-action="approve" data-id="' + r.id + '"> Approve</button>' +
        '<button class="btn sm red" data-action="deny" data-id="' + r.id + '"> Deny</button>' +
      '</div>' +
    '</div>';
  }).join("") + '</div>';
}

function wirePending() {
  document.querySelectorAll('[data-action="approve"], [data-action="deny"]').forEach(function(btn) {
    btn.onclick = async function() {
      var id = parseInt(btn.dataset.id);
      var approve = btn.dataset.action === "approve";
      
      btn.disabled = true;
      btn.textContent = '...';
      
      var r = await applyLeaveDecision(id, approve);
      
      btn.disabled = false;
      btn.textContent = approve ? 'Approve' : 'Deny';
      
      if (r) {
        toast((approve ? "Approved" : "Denied") + ": " + r.name + " — " + r.type);
        renderTimeoff();
      }
    };
  });
}

function renderCalendar() {
  var y = state.calYear;
  var m = state.calMonth;
  var first = new Date(y, m, 1).getDay();
  var days = new Date(y, m + 1, 0).getDate();

  var cells = "";
  for (var i = 0; i < first; i++) {
    cells += '<div class="cal-cell muted"></div>';
  }

  for (var d = 1; d <= days; d++) {
    var entries = leaveOn(y, m, d);
    var chips = entries.slice(0, 3).map(function(l) {
      return '<span class="chip" style="background:' + leaveColor(l.type) + ';font-size:10px;padding:2px 6px;border-radius:3px;color:#fff;display:inline-block;margin:1px 0;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="' + l.name + ' — ' + l.type + '">' +
        l.name.split(" ")[0] + ' · ' + l.type.split(" ")[0] +
      '</span>';
    }).join("");

    var hasMore = entries.length > 3;
    cells += '<div class="cal-cell clickable" data-day="' + d + '" style="' + (entries.length ? "background:rgba(var(--primary-rgb,59,130,246),0.05)" : "") + '">' +
      '<span class="cal-num">' + d + '</span>' +
      chips +
      (hasMore ? '<span class="more" style="font-size:9px;color:var(--muted)">+' + (entries.length - 3) + ' more</span>' : "") +
    '</div>';
  }

  var dows = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map(function(d) { 
    return '<div class="dow">' + d + '</div>'; 
  }).join("");

  var style = `
    <style>
      .calendar-wrapper {
        width: 100%;
        overflow-x: auto;
        margin-top: 12px;
      }
      .cal-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 2px;
        min-width: 280px;
      }
      @media (max-width: 600px) {
        .cal-cell .chip,
        .cal-cell .more {
          display: none;
        }
        .cal-cell {
          min-height: 48px;
          padding: 4px 2px;
          justify-content: center;
        }
        .cal-num {
          font-size: 15px;
        }
        .dow {
          font-size: 10px;
          padding: 4px 0;
        }
        .cal-head .mname {
          font-size: 16px;
        }
        .cal-nav, .btn.sm {
          font-size: 12px;
          padding: 4px 8px;
        }
      }
    </style>
  `;

  return style +
    '<div class="calendar-wrapper">' +
      '<div class="cal-head">' +
        '<div style="display:flex;gap:8px;align-items:center">' +
          '<button class="cal-nav" data-cal="prev">‹</button>' +
          '<button class="cal-nav" data-cal="next">›</button>' +
          '<button class="btn line sm" data-cal="today">Today</button>' +
        '</div>' +
        '<span class="mname">' + MONTHS_LONG[m] + ' ' + y + '</span>' +
        '<span style="width:36px"></span>' +
      '</div>' +
      '<div class="cal-grid">' + dows + cells + '</div>' +
      '<p style="color:var(--muted);font-size:13px;margin-top:10px"> Click any day to add or remove leave.</p>' +
    '</div>';
}

function wireCalendar() {
  document.querySelectorAll("[data-cal]").forEach(function(btn) {
    btn.onclick = function() {
      var action = btn.dataset.cal;
      if (action === "prev") {
        state.calMonth--;
        if (state.calMonth < 0) { state.calMonth = 11; state.calYear--; }
      } else if (action === "next") {
        state.calMonth++;
        if (state.calMonth > 11) { state.calMonth = 0; state.calYear++; }
      } else if (action === "today") {
        var now = new Date();
        state.calMonth = now.getMonth();
        state.calYear = now.getFullYear();
      }
      renderTimeoff();
    };
  });

  document.querySelectorAll(".cal-cell.clickable").forEach(function(cell) {
    cell.onclick = function() { 
      openDay(state.calYear, state.calMonth, parseInt(cell.dataset.day)); 
    };
  });
}

function openDay(year, month, day) {
  function getBody() {
    var entries = leaveOn(year, month, day);
    var typeOptions = Object.keys(state.leaveTypes).map(function(t) { 
      return '<option value="' + t + '">' + t + '</option>'; 
    }).join("");

    var list = entries.length
      ? entries.map(function(l) {
          return '<div class="line" style="padding:6px 0">' +
            '<span>' +
              '<span style="display:inline-block;width:10px;height:10px;border-radius:3px;background:' + leaveColor(l.type) + ';margin-right:8px"></span>' +
              '<b>' + l.name + '</b> — ' + l.type +
            '</span>' +
            '<button class="btn red sm" data-action="remove" data-id="' + l.id + '">Remove</button>' +
          '</div>';
        }).join("")
      : '<p style="color:var(--muted);font-size:14px;padding:6px 0">No leave booked on this day.</p>';

    return (
      '<div style="margin-bottom:12px">' + list + '</div>' +
      '<label style="font-weight:600;font-size:14px;display:block;margin-top:12px">Add leave</label>' +
      '<input class="field" id="d_name" placeholder="Employee name" style="margin-bottom:8px">' +
      '<select class="select" id="d_type" style="width:100%">' + typeOptions + '</select>'
    );
  }

  openModal(
    MONTHS_LONG[month] + ' ' + day + ', ' + year,
    getBody(),
    '<button class="btn ghost" id="mclose">Close</button><button class="btn green" id="dAdd">+ Add leave</button>'
  );

  function refreshModal() {
    var bodyEl = document.querySelector(".mbody");
    if (bodyEl) {
      bodyEl.innerHTML = getBody();
      wireModalEvents(year, month, day, refreshModal);
    }
  }

  wireModalEvents(year, month, day, refreshModal);
}

function wireModalEvents(year, month, day, refreshFn) {
  var closeBtn = document.getElementById("mclose");
  if (closeBtn) closeBtn.addEventListener("click", closeModal);

  var addBtn = document.getElementById("dAdd");
  if (addBtn) {
    addBtn.addEventListener("click", function() {
      var nameInput = document.getElementById("d_name");
      var typeSelect = document.getElementById("d_type");
      if (!nameInput || !typeSelect) return;

      var name = nameInput.value.trim();
      var type = typeSelect.value;

      if (!name) {
        toast("Please enter an employee name");
        nameInput.focus();
        return;
      }

      var exists = state.leave.some(function(l) {
        return l.name === name && l.type === type && l.year === year && l.month === month && l.day === day;
      });
      if (exists) {
        toast("This leave entry already exists");
        return;
      }

      state.leave.push({ id: nextLeaveId(), name: name, type: type, year: year, month: month, day: day });
      refreshFn();
      renderTimeoff();
      toast("Added " + type + " for " + name);
    });
  }

  document.querySelectorAll('[data-action="remove"]').forEach(function(btn) {
    btn.onclick = function() {
      state.leave = state.leave.filter(function(l) { 
        return l.id !== parseInt(btn.dataset.id); 
      });
      refreshFn();
      renderTimeoff();
      toast("Removed leave entry");
    };
  });
}

/* BOOT */
document.addEventListener("DOMContentLoaded", async function() {
  var modalBg = document.getElementById("modalBg");
  if (modalBg) {
    modalBg.addEventListener("click", function(e) {
      if (e.target.id === "modalBg") closeModal();
    });
  }

  await loadData();
  initState();
  renderTimeoff();
});

document.addEventListener("keydown", function(e) {
  if (e.key === "Escape") closeModal();
});

window.renderTimeoff = renderTimeoff;
window.state = state;
window.loadData = loadData;