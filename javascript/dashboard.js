/* SHELL — Topbar and navigation */

const NAV = [ 
  {id:"dashboard", label:"Dashboard"},
  {id:"employees", label:"Employees"},
  {id:"time_off", label:"Time Off Management"},
  {id:"attendance", label:"Attendance Management"},
  {id:"payroll_payslips", label:"Payroll and Payslips"},
  {id:"performance_review", label:"Performance Reviews"},
];

/* PAGE URL GENERATOR */

function pageUrl(id) {
   return id + ".html";
}

/* TOPBAR HTML GENERATOR */

function topbarHTML(active) {
  const logo = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M6 21V9l6-4 6 4v12M10 21v-5h4v5"/></svg>';
  const links = NAV.map(n => `<a class="topnav-item ${n.id === active ? 'active' : ''}" href="${pageUrl(n.id)}">${n.label}</a>`).join("");
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

// Inject topbar
const active = document.body.dataset.page || "dashboard";
const tb = document.getElementById("topbar");
if (tb) tb.innerHTML = topbarHTML(active);

// ---- Create mobile navigation ----
function createMobileNav() {
  const nav = document.createElement('div');
  nav.className = 'mobile-nav';
  nav.id = 'mobileNav';
  
  nav.innerHTML = NAV.map(n => `
    <a class="mobile-nav-item ${n.id === active ? 'active' : ''}" href="${pageUrl(n.id)}">
      ${n.label}
    </a>
  `).join('');
  
  document.body.appendChild(nav);
  
  // Close mobile nav when clicking a link
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
    });
  });
  
  return nav;
}

const mobileNav = createMobileNav();

//  Toggle mobile nav 
document.getElementById('hamburgerBtn')?.addEventListener('click', (e) => {
  e.stopPropagation();
  mobileNav.classList.toggle('open');
});

//  Close mobile nav when clicking outside 
document.addEventListener('click', (e) => {
  if (!e.target.closest('.hamburger-btn') && !e.target.closest('.mobile-nav')) {
    mobileNav.classList.remove('open');
  }
});

//  Close mobile nav on scroll 
let scrollTimeout;
window.addEventListener('scroll', () => {
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(() => {
    mobileNav.classList.remove('open');
  }, 100);
});

/* THEME MANAGEMENT */

const THEME_KEY = "mt-theme";

function currentTheme() { 
  try { return localStorage.getItem(THEME_KEY) || "light"; } 
  catch(e) { return "light"; } 
}

function updateThemeIcon(t) {
  const btn = document.getElementById("themeBtn");
  if (!btn) return;
  if (t === "dark") {
    btn.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  } else {
    btn.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
  }
}

function applyTheme(t) { 
  document.documentElement.setAttribute("data-theme", t); 
  try { localStorage.setItem(THEME_KEY, t); } catch(e) {} 
  updateThemeIcon(t);
}

// Apply saved theme on load
applyTheme(currentTheme());

// Theme button click handler
document.getElementById("themeBtn")?.addEventListener("click", () => {
  applyTheme(currentTheme() === "dark" ? "light" : "dark");
});

/* PROFILE MENU */

document.getElementById("profileBtn")?.addEventListener("click", e => {
  e.stopPropagation();
  document.getElementById("profileMenu").classList.toggle("show");
});
document.getElementById("goProfile")?.addEventListener("click", () => { alert("Profile"); });
document.getElementById("logoutBtn")?.addEventListener("click", () => { 
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  location.href = "../index.html"; 
});
document.addEventListener("click", () => { document.getElementById("profileMenu")?.classList.remove("show"); });

/* API INTEGRATION - MATCHING YOUR BACKEND ROUTES */

const API_BASE_URL = 'https://moderntech-hr-backend.onrender.com';

function getAuthToken() {
    return localStorage.getItem('token');
}

// Get user info from localStorage
function getUserInfo() {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        return user || { name: 'HR Admin', role: 'HR Manager' };
    } catch {
        return { name: 'HR Admin', role: 'HR Manager' };
    }
}

const api = {
    // Dashboard - GET /api/dashboard/summary
    getDashboardSummary: async () => {
        const token = getAuthToken();
        if (!token) {
            window.location.href = '../index.html';
            return;
        }
        
        const response = await fetch(`${API_BASE_URL}/api/dashboard/summary`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '../index.html';
            return;
        }
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return response.json();
    },
    
    // Employees - GET /api/employees
    getEmployees: async () => {
        const token = getAuthToken();
        const response = await fetch(`${API_BASE_URL}/api/employees`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    },
    
    // Departments - GET /api/departments
    getDepartments: async () => {
        const token = getAuthToken();
        const response = await fetch(`${API_BASE_URL}/api/departments`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    },
    
    // Attendance - GET /api/attendance
    getAttendance: async () => {
        const token = getAuthToken();
        const response = await fetch(`${API_BASE_URL}/api/attendance`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    },
    
    // TIME OFF ROUTES - MATCHING YOUR BACKEND
    
    // Get pending leaves - GET /api/timeoff/pending
    getLeaveRequests: async () => {
        const token = getAuthToken();
        const response = await fetch(`${API_BASE_URL}/api/timeoff/pending`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    },
    
    // Get all leaves - GET /api/timeoff/all
    getAllLeaves: async () => {
        const token = getAuthToken();
        const response = await fetch(`${API_BASE_URL}/api/timeoff/all`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    },
    
    // Create leave - POST /api/timeoff/create
    createLeave: async (leaveData) => {
        const token = getAuthToken();
        const response = await fetch(`${API_BASE_URL}/api/timeoff/create`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(leaveData)
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    },
    
    // Approve leave - PUT /api/timeoff/:id/approve
    approveLeave: async (id) => {
        const token = getAuthToken();
        const response = await fetch(`${API_BASE_URL}/api/timeoff/${id}/approve`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    },
    
    // Deny leave - PUT /api/timeoff/:id/deny
    denyLeave: async (id) => {
        const token = getAuthToken();
        const response = await fetch(`${API_BASE_URL}/api/timeoff/${id}/deny`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    }
};

/* UPDATE USER INFO IN TOPBAR */

// Update the topbar with actual user info
function updateUserInfo() {
    const user = getUserInfo();
    const avatarEl = document.querySelector('.av');
    const nameEl = document.querySelector('.who b');
    const roleEl = document.querySelector('.who span');
    
    if (avatarEl) {
        avatarEl.textContent = (user.name || 'HA')[0].toUpperCase() + (user.name ? user.name.split(' ')[1]?.[0] || '' : '');
    }
    if (nameEl) nameEl.textContent = user.name || 'HR Admin';
    if (roleEl) roleEl.textContent = user.role || 'HR Manager';
}

// Call this after topbar is injected
setTimeout(updateUserInfo, 100);

/* STATE */

let state = {
    employees: [],
    departments: [],
    deptCounts: {},
    statusCounts: {},
    totalMonthlyPayroll: 0,
    avgRating: 0,
    months: [],
    attendance: [],
    attendanceRate: 0,
    requests: []
};

/* UI HELPERS */

const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

function toast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove('show'), 2200);
}

function navigate(page) {
  const NAV = ['dashboard', 'employees', 'timeoff', 'attendance', 'payroll', 'reviews'];
  if (NAV.includes(page)) {
    location.href = `../${page}/${page}.html`;
  }
}

function moneyShort(n) {
  if (n >= 1e9) return "R" + (n/1e9).toFixed(1) + "B";
  if (n >= 1e6) return "R" + (n/1e6).toFixed(2) + "M";
  if (n >= 1e3) return "R" + (n/1e3).toFixed(0) + "K";
  return "R" + n;
}

/* SVG CHART HELPERS */

function barSVG(values, labels, opts = {}) {
  const w = opts.w || 560;
  const h = opts.h || 240;
  const padL = 34;
  const padB = 26;
  const padT = 10;
  const padR = 6;
  const max = opts.max || Math.ceil(Math.max(...values) / 50) * 50 || 10;
  const plotW = w - padL - padR;
  const plotH = h - padT - padB;
  const n = values.length;
  const gap = plotW / n;
  const bw = Math.min(30, gap * 0.5);

  let grid = "";
  let yl = "";
  
  for (let i = 0; i <= 4; i++) {
    const y = padT + plotH - (plotH * i / 4);
    const val = Math.round(max * i / 4);
    grid += `<line x1="${padL}" y1="${y}" x2="${w - padR}" y2="${y}" class="grid-line"/>`;
    yl += `<text x="${padL - 6}" y="${y + 3}" text-anchor="end" class="axis-label">${val}</text>`;
  }
  
  const bars = values.map((v, i) => {
    const bh = (v / max) * plotH;
    const x = padL + gap * i + (gap - bw) / 2;
    const y = padT + plotH - bh;
    const col = opts.color || "url(#barGrad)";
    return `<g class="bar">
      <rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="5" fill="${col}">
        <title>${labels[i]}: ${v}</title>
      </rect>
      <text x="${x + bw/2}" y="${h - 8}" text-anchor="middle" class="axis-label">${labels[i]}</text>
    </g>`;
  }).join("");

  return `<svg viewBox="0 0 ${w} ${h}" width="100%" class="barchart" preserveAspectRatio="xMidYMid meet">
    <defs>
      <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#3b82f6"/>
        <stop offset="100%" stop-color="#1d4ed8"/>
      </linearGradient>
    </defs>
    ${grid}${yl}${bars}
  </svg>`;
}

function donutSVG(segments, size = 190, stroke = 26) {
  const r = (size - stroke) / 2;
  const c = size / 2;
  const C = 2 * Math.PI * r;
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  let off = 0;
  
  const arcs = segments.map(seg => {
    const len = (seg.value / total) * C;
    const gap = 1.5;
    const el = `<circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="${seg.color}" stroke-width="${stroke}"
      stroke-dasharray="${Math.max(len - gap, 0)} ${C - Math.max(len - gap, 0)}" stroke-dashoffset="${-off}"
      transform="rotate(-90 ${c} ${c})" stroke-linecap="round"/>`;
    off += len;
    return el;
  }).join("");
  
  return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
    ${arcs}
    <text x="${c}" y="${c - 2}" text-anchor="middle" class="donut-total">${total}</text>
    <text x="${c}" y="${c + 18}" text-anchor="middle" class="donut-sub">Total</text>
  </svg>`;
}

/* LEAVE REQUEST FUNCTIONS - UPDATED FOR YOUR BACKEND */

async function applyLeaveDecision(id, approve) {
    try {
        let result;
        if (approve) {
            result = await api.approveLeave(id);
            toast(` Leave request approved`);
        } else {
            result = await api.denyLeave(id);
            toast(` Leave request denied`);
        }
        console.log('Leave update result:', result);
        await loadDashboardData();
    } catch (error) {
        console.error('Error updating leave:', error);
        toast('Error updating leave request: ' + error.message);
    }
}

/* LOAD DATA FROM BACKEND - UPDATED */

async function loadDashboardData() {
    try {
        // Show loading state
        const main = document.getElementById('main');
        if (main) {
            main.innerHTML = `
                <div style="text-align:center;padding:60px 20px;">
                    <div style="font-size:48px;margin-bottom:20px;"> </div>
                    <h3>Loading Dashboard...</h3>
                    <p style="color:var(--muted);">Fetching latest data</p>
                </div>
            `;
        }
        
        // Get all data from API
        const summary = await api.getDashboardSummary();
        const employees = await api.getEmployees();
        const departments = await api.getDepartments();
        const leaveRequests = await api.getLeaveRequests(); // GET /api/timeoff/pending
        
        console.log('Dashboard data loaded:', { summary, employees, departments, leaveRequests });
        
        // Calculate department counts
        const deptCounts = {};
        departments.forEach(d => deptCounts[d.name] = 0);
        employees.forEach(e => {
            const dept = e.department || e.department_id;
            if (deptCounts[dept] !== undefined) {
                deptCounts[dept]++;
            }
        });
        
        // Calculate status counts
        const statusCounts = { 'Active': 0, 'On Leave': 0 };
        employees.forEach(e => {
            const status = e.status || 'Active';
            if (statusCounts[status] !== undefined) {
                statusCounts[status]++;
            } else {
                statusCounts[status] = (statusCounts[status] || 0) + 1;
            }
        });
        
        // Build state
        state = {
            employees,
            departments,
            deptCounts,
            statusCounts,
            totalMonthlyPayroll: summary.totalMonthlyPayroll || 0,
            avgRating: summary.avgRating || 0,
            months: summary.dayLabels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            attendance: summary.dailyPresent || [0, 0, 0, 0, 0, 0],
            attendanceRate: summary.attendanceRate || 0,
            requests: leaveRequests || [],
            departmentStats: summary.departmentStats || []  // Store department stats from backend
        };
        
        // Render dashboard
        renderDashboard();
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
        const main = document.getElementById('main');
        if (main) {
            main.innerHTML = `
                <div style="text-align:center;padding:60px 20px;">
                    <div style="font-size:48px;margin-bottom:20px;"></div>
                    <h3>Error Loading Dashboard</h3>
                    <p style="color:var(--muted);">${error.message}</p>
                    <p style="color:var(--muted);font-size:14px;margin-top:10px;">
                        Make sure the backend is running on port 5000
                    </p>
                    <button onclick="loadDashboardData()" style="margin-top:20px;padding:10px 20px;background:#4a90e2;color:#fff;border:none;border-radius:6px;cursor:pointer;">
                        Retry
                    </button>
                </div>
            `;
        }
    }
}

/* MAIN RENDER FUNCTION */

function renderDashboard() {
  const main = document.getElementById('main');
  if (!main) return;
  
  const totalEmp = state.employees.length;
  const pendingLeave = state.requests.length;
  
  // Department donut segments - Use departmentStats from backend
  const segs = state.departmentStats
    .map(d => ({
      label: d.name || d.department,  // Handle both field names
      value: d.count || d.employeeCount || 0,
      color: '#3b82f6'
    }))
    .filter(s => s.value > 0)
    .sort((a, b) => b.value - a.value);
  
  // If no department stats, use departments from state
  const finalSegs = segs.length > 0 ? segs : state.departments
    .map(d => ({
      label: d.name,
      value: state.deptCounts[d.name] || 0,
      color: '#3b82f6'
    }))
    .filter(s => s.value > 0)
    .sort((a, b) => b.value - a.value);
  
  const legend = finalSegs.map(s => `
    <div class="lg">
      <span class="sw" style="background:${s.color}"></span>
      ${s.label}
      <span class="ct">${s.value}</span>
    </div>
  `).join("");
  
  // Attendance review
  const onLeave = state.statusCounts["On Leave"] || 0;
  const active = state.statusCounts["Active"] || 0;
  const absent = Math.round(totalEmp * 0.03);
  const present = Math.max(0, active - onLeave);
  
  const attRows = [
    ["Present (on-site)", present, "#1d4ed8"],
    ["On leave", onLeave, "#f59e0b"],
    ["Absent", absent, "#ef4444"]
  ].map(([label, value, color]) => `
    <div class="att-row">
      <span class="al">${label}</span>
      <span class="track">
        <span class="fill" style="width:${totalEmp > 0 ? (value/totalEmp*100).toFixed(1) : 0}%;background:${color}"></span>
      </span>
      <span class="av">${value} · ${totalEmp > 0 ? (value/totalEmp*100).toFixed(0) : 0}%</span>
    </div>
  `).join("");
  
  // Pending approvals - handle different field names
  const approvals = state.requests.slice(0, 4).map(r => {
    const name = r.name || r.first_name + ' ' + r.last_name || r.employee || 'Unknown';
    const reason = r.type || r.reason || 'Leave request';
    const id = r._id || r.id;
    return `
    <div class="req">
      <div class="who">
        <b>${name}</b>
        <span style="color:var(--muted)">· ${reason}</span>
      </div>
      <div class="row-actions">
        <button class="btn sm" data-action="approve" data-id="${id}">Approve</button>
        <button class="btn sm red" data-action="deny" data-id="${id}">Deny</button>
      </div>
    </div>
  `}).join("") || `<div class="empty">No requests waiting.</div>`;
  
  // KPI icons
  const KIcon = {
    people: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>',
    money: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
    cal: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
    star: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3 6.5 7 .6-5.3 4.6 1.7 6.8L12 17l-6.1 3.5 1.7-6.8L2.3 9.1l7-.6z"/></svg>'
  };
  
  main.innerHTML = `
    <div class="page-head">
      <div class="eyebrow">Overview</div>
      <div class="page-title">Welcome back, HR Admin</div>
      <div class="page-sub">Here's what's happening across ModernTech today.</div>
    </div>

    <div class="kpis">
      <div class="kpi">
        <div class="kico" style="background:linear-gradient(135deg,#3b82f6,#1d4ed8)">${KIcon.people}</div>
        <div class="klab">Total Employees</div>
        <div class="kval">${totalEmp}</div>
        <span class="ktrend up">▲ Live data</span>
      </div>
      <div class="kpi">
        <div class="kico" style="background:linear-gradient(135deg,#0ea5e9,#0369a1)">${KIcon.money}</div>
        <div class="klab">Monthly Payroll</div>
        <div class="kval">${moneyShort(state.totalMonthlyPayroll)}</div>
        <span class="ktrend up">▲ Live data</span>
      </div>
      <div class="kpi">
        <div class="kico" style="background:linear-gradient(135deg,#f59e0b,#d97706)">${KIcon.cal}</div>
        <div class="klab">Pending Leave</div>
        <div class="kval">${pendingLeave}</div>
        <span class="ktrend down">▼ Needs review</span>
      </div>
      <div class="kpi">
        <div class="kico" style="background:linear-gradient(135deg,#6366f1,#4338ca)">${KIcon.star}</div>
        <div class="klab">Avg Performance</div>
        <div class="kval">${state.avgRating}<span style="font-size:16px;color:var(--muted)">/5</span></div>
        <span class="ktrend up">▲ Live data</span>
      </div>
    </div>

    <div class="grid-2">
      <div class="panel">
        <div class="panel-title">
          <h3>Attendance Overview</h3>
          <span class="hint">Daily present headcount · ${state.attendanceRate}% for the period</span>
        </div>
        ${barSVG(state.attendance, state.months, {max: totalEmp || 10})}
      </div>
      <div class="panel">
        <div class="panel-title"><h3>Workforce by Department</h3></div>
        <div style="display:flex;justify-content:center;margin:6px 0 10px">${donutSVG(finalSegs)}</div>
        <div class="legend">${legend}</div>
      </div>
    </div>

    <div class="grid-2b">
      <div class="panel">
        <div class="panel-title">
          <h3>Attendance Review</h3>
          <span class="hint">Today</span>
        </div>
        ${attRows}
      </div>
      <div class="panel" style="padding:0">
        <div class="panel-title" style="padding:20px 20px 0">
          <h3>Leave Requests to Review</h3>
          <button class="btn ghost sm" id="dashSeeAll">See all</button>
        </div>
        <div style="margin-top:6px">${approvals}</div>
      </div>
    </div>
  `;
  
  // Wire quick approval buttons
  document.querySelectorAll('[data-action="approve"], [data-action="deny"]').forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      const approve = btn.dataset.action === 'approve';
      applyLeaveDecision(id, approve);
    };
  });
  
  // Wire "See all" button
  const seeAllBtn = document.getElementById('dashSeeAll');
  if (seeAllBtn) {
    seeAllBtn.onclick = () => navigate('timeoff');
  }
}
  
  // Wire quick approval buttons
  document.querySelectorAll('[data-action="approve"], [data-action="deny"]').forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      const approve = btn.dataset.action === 'approve';
      applyLeaveDecision(id, approve);
    };
  });
  
  // Wire "See all" button
  const seeAllBtn = document.getElementById('dashSeeAll');
  if (seeAllBtn) {
    seeAllBtn.onclick = () => navigate('timeoff');
  }


/* BOOT */

document.addEventListener('DOMContentLoaded', () => {
  console.log('Dashboard initializing...');
  
  // Check authentication
  const token = getAuthToken();
  if (!token) {
    window.location.href = '../index.html';
    return;
  }
  
  // Load data from backend
  loadDashboardData();
});

// Make functions available globally
window.loadDashboardData = loadDashboardData;
window.renderDashboard = renderDashboard;
window.state = state;
window.applyLeaveDecision = applyLeaveDecision;