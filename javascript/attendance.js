/* ATTENDANCE MANAGEMENT SCRIPT
   This file powers the "Attendance Management" page.
   It loads employee attendance data from the backend API,
   renders a dashboard with KPIs, a bar chart,
   and a detailed attendance table. */

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
const API_BASE_URL = "https://moderntech-hr-backend.onrender.com";

/* Top bar HTML generation */
function topbarHTML(active) {
  const logo = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M6 21V9l6-4 6 4v12M10 21v-5h4v5"/></svg>';
  
  const links = NAV.map(function(n) {
    return '<a class="topnav-item ' + (n.id === active ? 'active' : '') + '" href="' + pageUrl(n.id) + '">' + n.label + '</a>';
  }).join("");

  return `
    <a class="tb-brand" href="${pageUrl('dashboard')}"><span class="tb-logo">${logo}</span><span class="tb-name">ModernTech HR</span></a>
    <button class="hamburger-btn" id="hamburgerBtn" aria-label="Toggle navigation">
      <i class="bi bi-list"></i>
    </button>
    <nav class="topnav">${links}</nav>
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

var active = document.body.dataset.page || "attendance";
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

/* DATA LOADING AND STATE BUILDING */

var ATTENDANCE_LEAVE = [];
var PAYROLL = {};
var EMP_META = {};

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

var AVATAR_COLORS = ["#1d4ed8","#2563eb","#0ea5e9","#6366f1","#0891b2","#3b82f6","#4f46e5","#7c3aed","#0284c7","#4338ca"];

var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function parseDate(s) {
  var parts = s.split("-").map(Number);
  return { y: parts[0], m: parts[1] - 1, d: parts[2] };
}

var employees = [];
var deptCounts = {};
var statusCounts = {};
var dayLabels = [];
var dailyPresent = [];
var attendanceRate = 0;
var state = {};

function buildState() {
  employees = ATTENDANCE_LEAVE.map(function(rec) {
    var id = rec.employeeId;
    var meta = EMP_META[id] || { dept: "Development", role: "Team Member" };
    var pay = PAYROLL[id] || { hoursWorked: 160, leaveDeductions: 0, finalSalary: 0 };
    var nameParts = rec.name.split(" ");
    var first = nameParts[0];
    var last = nameParts.slice(1).join(" ");

    return {
      id: id,
      name: rec.name,
      first: first,
      last: last,
      role: meta.role,
      dept: meta.dept,
      deptColor: DEPT_COLOR[meta.dept] || "#1d4ed8",
      avatar: AVATAR_COLORS[id % AVATAR_COLORS.length],
      attendanceLog: rec.attendance || []
    };
  });

  deptCounts = {};
  DEPARTMENTS.forEach(function(d) { deptCounts[d.name] = 0; });
  employees.forEach(function(e) {
    if (deptCounts[e.dept] != null) deptCounts[e.dept]++;
  });

  statusCounts = { "Active": 0, "Remote": 0, "On Leave": 0 };
  employees.forEach(function(e) { statusCounts["Active"]++; });

  var attDates = ATTENDANCE_LEAVE[0].attendance.map(function(a) { return a.date; });
  dayLabels = attDates.map(function(d) {
    var p = parseDate(d);
    return p.d + " " + months[p.m];
  });

  dailyPresent = attDates.map(function(date) {
    return employees.reduce(function(n, e) {
      var found = e.attendanceLog.find(function(a) { return a.date === date; });
      return n + (found && found.status === "Present" ? 1 : 0);
    }, 0);
  });

  var totalPresent = employees.reduce(function(n, e) {
    return n + e.attendanceLog.filter(function(a) { return a.status === "Present"; }).length;
  }, 0);
  var totalPossible = employees.length * attDates.length;
  attendanceRate = totalPossible > 0 ? Math.round((totalPresent / totalPossible) * 100) : 0;

  state = {
    employees: employees,
    departments: DEPARTMENTS,
    deptCounts: deptCounts,
    statusCounts: statusCounts,
    months: dayLabels,
    attendance: dailyPresent,
    attendanceRate: attendanceRate
  };
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
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No authentication token found. Please login first.');
    }

    // 1. Fetch attendance data (YOUR API)
    const attRes = await fetch(`${API_BASE_URL}/api/attendance`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!attRes.ok) {
      if (attRes.status === 401) {
        throw new Error('Session expired. Please login again.');
      }
      throw new Error('Failed to fetch attendance data from server');
    }

    const attendanceData = await attRes.json();
    console.log('Attendance data loaded:', attendanceData.length, 'records');

    // 2. Try to fetch employee data with fallback
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
            dept: emp.department_name || 'Development',
            role: emp.position || 'Team Member'
          };
        });
      } else {
        console.warn('/api/employees returned', empRes.status, '- using fallback data');
        EMP_META = getFallbackEmployeeData(attendanceData);
      }
    } catch (empError) {
      console.warn('Failed to fetch /api/employees, using fallback:', empError.message);
      EMP_META = getFallbackEmployeeData(attendanceData);
    }

    // 3. Fetch pending leave requests
    const leaveRes = await fetch(`${API_BASE_URL}/api/timeoff/pending`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    let leaveData = [];
    if (leaveRes.ok) {
      leaveData = await leaveRes.json();
      console.log('Pending leave data loaded:', leaveData.length, 'requests');
    }

    // 4. Transform attendance data
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

    // 5. Add leave requests
    leaveData.forEach(leave => {
      const empId = leave.employee_id;
      if (employeeMap[empId]) {
        employeeMap[empId].leaveRequests.push({
          date: leave.start_date.split('T')[0],
          reason: leave.type,
          status: leave.status
        });
      }
    });

    // 6. Store in global variables
    ATTENDANCE_LEAVE = Object.values(employeeMap);
    console.log('Total employees processed:', ATTENDANCE_LEAVE.length);

    // 7. Build EMP_META
    EMP_META = {};
    ATTENDANCE_LEAVE.forEach(emp => {
      EMP_META[emp.employeeId] = {
        dept: emp.dept || 'Development',
        role: emp.role || 'Team Member'
      };
    });

    // 8. Build PAYROLL data
    PAYROLL = {};
    Object.keys(employeeMap).forEach(id => {
      PAYROLL[id] = {
        hoursWorked: 160,
        leaveDeductions: 0,
        finalSalary: 0
      };
    });

    buildState();
    return true;

  } catch (err) {
    console.error('Error loading data:', err);
    const main = document.getElementById("main");
    if (main) {
      main.innerHTML =
        '<div class="no-results" style="padding: 40px; text-align: center;">' +
          '<h2>Could not load data</h2>' +
          '<p style="color: var(--muted); font-size: 14px; margin-top: 8px;">' + err.message + '</p>' +
          '<button onclick="location.reload()" style="margin-top: 20px; padding: 10px 24px; border: none; border-radius: 8px; background: #3b82f6; color: white; cursor: pointer; font-weight: 600;">Retry</button>' +
        '</div>';
    }
    return false;
  }
}

/* UI HELPERS */

function $(s) { return document.querySelector(s); }
function $$(s) { return Array.from(document.querySelectorAll(s)); }

function initials(name) {
  return name.split(" ").map(function(w) { return w[0]; }).join("").slice(0, 2).toUpperCase();
}

function avatar(e, cls) {
  cls = cls || "";
  return '<span class="avatar ' + cls + '" style="background:' + (e.avatar || e.deptColor || '#1d4ed8') + '">' + initials(e.name) + '</span>';
}

function toast(msg) {
  var t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(t._t);
  t._t = setTimeout(function() { t.classList.remove("show"); }, 2200);
}

/* SVG bar chart generator */
function barSVG(values, labels, opts) {
  opts = opts || {};
  var w = opts.w || 560;
  var h = opts.h || 240;
  var padL = 34, padB = 26, padT = 10, padR = 6;
  var max = opts.max || Math.ceil(Math.max.apply(null, values) / 50) * 50 || 10;
  var plotW = w - padL - padR;
  var plotH = h - padT - padB;
  var n = values.length;
  var gap = plotW / n;
  var bw = Math.min(30, gap * 0.5);

  var grid = "";
  var yl = "";
  for (var i = 0; i <= 4; i++) {
    var y = padT + plotH - (plotH * i / 4);
    var val = Math.round(max * i / 4);
    grid += '<line x1="' + padL + '" y1="' + y + '" x2="' + (w - padR) + '" y2="' + y + '" class="grid-line"/>';
    yl += '<text x="' + (padL - 6) + '" y="' + (y + 3) + '" text-anchor="end" class="axis-label">' + val + '</text>';
  }

  var bars = values.map(function(v, i) {
    var bh = (v / max) * plotH;
    var x = padL + gap * i + (gap - bw) / 2;
    var y = padT + plotH - bh;
    var col = opts.color || "url(#barGrad)";
    return '<g class="bar"><rect x="' + x + '" y="' + y + '" width="' + bw + '" height="' + bh + '" rx="5" fill="' + col + '"><title>' + labels[i] + ': ' + v + '</title></rect><text x="' + (x + bw/2) + '" y="' + (h - 8) + '" text-anchor="middle" class="axis-label">' + labels[i] + '</text></g>';
  }).join("");

  return '<svg viewBox="0 0 ' + w + ' ' + h + '" width="100%" class="barchart" preserveAspectRatio="xMidYMid meet"><defs><linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#3b82f6"/><stop offset="100%" stop-color="#1d4ed8"/></linearGradient></defs>' + grid + yl + bars + '</svg>';
}

/* RENDER THE ATTENDANCE PAGE */
function renderAttendance() {
  var emps = state.employees;

  if (!emps || emps.length === 0) {
    document.getElementById("main").innerHTML =
      '<div class="no-results" style="padding: 40px; text-align: center;">' +
        '<h2>No employee data available</h2>' +
        '<p>Please check your data files.</p>' +
      '</div>';
    return;
  }

  var dates = emps[0].attendanceLog.map(function(a) { return a.date; });
  var dayHeads = state.months;

  var totalCells = emps.length * dates.length;
  var totalPresent = emps.reduce(function(n, e) {
    return n + e.attendanceLog.filter(function(a) { return a.status === "Present"; }).length;
  }, 0);
  var totalAbsent = totalCells - totalPresent;
  var avgPerDay = Math.round(state.attendance.reduce(function(a, b) { return a + b; }, 0) / dates.length);
  var onLeave = state.statusCounts["On Leave"] || 0;

  function dot(st) {
    return st === "Present"
      ? '<span class="att-dot present" title="Present">P</span>'
      : '<span class="att-dot absent" title="Absent">A</span>';
  }

  var bodyRows = emps.map(function(e) {
    var present = e.attendanceLog.filter(function(a) { return a.status === "Present"; }).length;
    var rate = Math.round(present / dates.length * 100);
    var cells = dates.map(function(d) {
      var rec = e.attendanceLog.find(function(a) { return a.date === d; });
      return '<td class="att-cell">' + (rec ? dot(rec.status) : "—") + '</td>';
    }).join("");
    return '<tr>' +
      '<td class="att-emp"><div class="who-cell">' + avatar(e) + '<div style="min-width:0"><div class="nm">' + e.name + '</div><div class="rl">' + e.role + '</div></div></div></td>' +
      '<td class="col-hide"><span class="pill dept">' + e.dept + '</span></td>' +
      cells +
      '<td class="att-num">' + present + '/' + dates.length + '</td>' +
      '<td class="att-num"><b>' + rate + '%</b></td>' +
    '</tr>';
  }).join("");

  document.getElementById("main").innerHTML =
    '<div class="page-head">' +
      '<div class="eyebrow">Operations</div>' +
      '<div class="page-title">Attendance Management</div>' +
      '<div class="page-sub">Daily attendance across the team · ' + dayHeads[0] + ' – ' + dayHeads[dayHeads.length - 1] + ' 2025</div>' +
    '</div>' +
    '<div class="kpis">' +
      '<div class="kpi"><div class="klab">Attendance Rate</div><div class="kval">' + state.attendanceRate + '%</div><span class="ktrend up">team average</span></div>' +
      '<div class="kpi"><div class="klab">Avg Present / Day</div><div class="kval">' + avgPerDay + '<span style="font-size:15px;color:var(--muted)"> / ' + emps.length + '</span></div></div>' +
      '<div class="kpi"><div class="klab">Total Absences</div><div class="kval">' + totalAbsent + '</div><span class="ktrend">over ' + dates.length + ' days</span></div>' +
      '<div class="kpi"><div class="klab">On Leave</div><div class="kval">' + onLeave + '</div></div>' +
    '</div>' +
    '<div class="panel" style="margin-bottom:20px">' +
      '<div class="panel-title"><h3>Daily Present Headcount</h3><span class="hint">People on-site each day</span></div>' +
      barSVG(state.attendance, dayHeads, {max: emps.length}) +
    '</div>' +
    '<div class="card att-wrap">' +
      '<div class="att-scroll">' +
        '<table class="att-table">' +
          '<thead><tr>' +
            '<th class="att-emp">Employee</th>' +
            '<th class="col-hide">Department</th>' +
            dayHeads.map(function(d) { return '<th class="att-cell">' + d + '</th>'; }).join("") +
            '<th class="att-num">Present</th>' +
            '<th class="att-num">Rate</th>' +
          '</tr></thead>' +
          '<tbody>' + bodyRows + '</tbody>' +
        '</table>' +
      '</div>' +
    '</div>';
}

/* BOOT */
document.addEventListener("DOMContentLoaded", async function() {
  var success = await loadData();
  if (success) {
    renderAttendance();
  }
});