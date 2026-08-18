/* ============================================================
   SHELL — Top bar and navigation (unchanged)
   ============================================================ */
const NAV = [
  {id:"dashboard", label:"Dashboard"},
  {id:"employees", label:"Employees"},
  {id:"time_off", label:"Time Off Management"},
  {id:"attendance", label:"Attendance Management"},
  {id:"payroll_payslips", label:"Payroll and Payslips"},
  {id:"performance_review", label:"Performance Reviews"},
];

function pageUrl(id) { return id + ".html"; }

function topbarHTML(active) {
  const logo = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M6 21V9l6-4 6 4v12M10 21v-5h4v5"/></svg>';
  const links = NAV.map(n => `<a class="topnav-item ${n.id === active ? 'active' : ''}" href="${pageUrl(n.id)}">${n.label}</a>`).join("");
  return `
    <a class="tb-brand" href="${pageUrl('dashboard')}"><span class="tb-logo">${logo}</span><span class="tb-name">ModernTech HR</span></a>
    <nav class="topnav">${links}</nav>
    <button class="hamburger-btn" id="hamburgerBtn"><i class="bi-list"></i></button>
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

// Mobile nav (unchanged)
function createMobileNav() {
  const nav = document.createElement('div');
  nav.className = 'mobile-nav';
  nav.id = 'mobileNav';
  nav.innerHTML = NAV.map(n => `
    <a class="mobile-nav-item ${n.id === active ? 'active' : ''}" href="${pageUrl(n.id)}">${n.label}</a>
  `).join('');
  document.body.appendChild(nav);
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => { nav.classList.remove('open'); });
  });
  return nav;
}
const mobileNav = createMobileNav();
document.getElementById('hamburgerBtn')?.addEventListener('click', (e) => {
  e.stopPropagation();
  mobileNav.classList.toggle('open');
});
document.addEventListener('click', (e) => {
  if (!e.target.closest('.hamburger-btn') && !e.target.closest('.mobile-nav')) {
    mobileNav.classList.remove('open');
  }
});
let scrollTimeout;
window.addEventListener('scroll', () => {
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(() => { mobileNav.classList.remove('open'); }, 100);
});

// Theme toggle (unchanged)
const THEME_KEY = "mt-theme";
function currentTheme() {
  try { return localStorage.getItem(THEME_KEY) || "light"; }
  catch(e){ return "light"; }
}
function applyTheme(t) {
  document.documentElement.setAttribute("data-theme", t);
  try { localStorage.setItem(THEME_KEY, t); } catch(e){}
  updateThemeIcon(t);
}
function updateThemeIcon(t) {
  const btn = document.getElementById("themeBtn");
  if (!btn) return;
  const isDark = t === "dark";
  btn.innerHTML = isDark 
    ? '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>'
    : '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
  btn.title = isDark ? "Switch to light mode" : "Switch to dark mode";
}
applyTheme(currentTheme());
document.getElementById("themeBtn")?.addEventListener("click", () => {
  applyTheme(currentTheme() === "dark" ? "light" : "dark");
});
document.getElementById("profileBtn")?.addEventListener("click", e => {
  e.stopPropagation();
  document.getElementById("profileMenu").classList.toggle("show");
});
document.getElementById("goProfile")?.addEventListener("click", () => { alert("Profile"); });
document.getElementById("logoutBtn")?.addEventListener("click", () => { location.href = "../index.html"; });
document.addEventListener("click", () => { document.getElementById("profileMenu")?.classList.remove("show"); });

/* ============================================================
   ----------  ALL STATIC DATA REMOVED  ----------
   We now use a global state that will be populated by API calls.
   ============================================================ */

// We'll keep the departments list as static (it rarely changes)
const DEPARTMENTS = [
  {name:"Engineering", color:"#1d4ed8"},
  {name:"Sales", color:"#0ea5e9"},
  {name:"Marketing", color:"#6366f1"},
  {name:"Finance", color:"#0891b2"},
  {name:"People", color:"#2563eb"},
  {name:"Operations", color:"#3b82f6"},
  {name:"Product", color:"#4f46e5"},
  {name:"Support", color:"#38bdf8"},
  {name:"Design", color:"#7c3aed"},
];
const DEPT_COLOR = {};
DEPARTMENTS.forEach(d => DEPT_COLOR[d.name] = d.color);
const AVATAR_COLORS = ["#1d4ed8","#2563eb","#0ea5e9","#6366f1","#0891b2","#3b82f6","#4f46e5","#7c3aed","#0284c7","#4338ca"];
const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// State will be updated from API
let state = {
  employees: [],
  totalMonthlyPayroll: 0,
  departments: DEPARTMENTS,
  payPage: 1,
  payQuery: "",
  payrollEmp: 1
};

// UI helpers (unchanged)
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

function openModal(title, bodyHTML, footHTML) {
  const modal = document.getElementById('modal');
  if (!modal) return;
  modal.innerHTML =
    `<div class="mhead">${title}<button id="mx" aria-label="Close">&times;</button></div>
     <div class="mbody">${bodyHTML}</div>
     ${footHTML ? `<div class="mfoot">${footHTML}</div>` : ''}`;
  document.getElementById('modalBg').classList.add('show');
  document.getElementById('mx').addEventListener('click', closeModal);
}
function closeModal() {
  document.getElementById('modalBg').classList.remove('show');
}
document.addEventListener('DOMContentLoaded', () => {
  const modalBg = document.getElementById('modalBg');
  if (modalBg) {
    modalBg.addEventListener('click', e => {
      if (e.target.id === 'modalBg') closeModal();
    });
  }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

function money(n) {
  return "R" + Math.round(n).toLocaleString();
}
function moneyShort(n) {
  if (n >= 1e9) return "R" + (n/1e9).toFixed(1) + "B";
  if (n >= 1e6) return "R" + (n/1e6).toFixed(2) + "M";
  if (n >= 1e3) return "R" + (n/1e3).toFixed(0) + "K";
  return "R" + n;
}
function initials(name) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}
function avatar(e, cls = "") {
  const color = e.avatar || e.deptColor || '#1d4ed8';
  return `<span class="avatar ${cls}" style="background:${color}">${initials(e.name)}</span>`;
}
function statusPill(s) {
  const cls = s === "Active" ? "active" : (s === "Remote" ? "remote" : "leave");
  return `<span class="pill ${cls}"><span class="dot" style="background:currentColor"></span>${s}</span>`;
}
function pagerHTML(total, page, pages, start, shown) {
  let btns = `<button class="pg" data-pg="${page - 1}" ${page <= 1 ? 'disabled' : ''}>‹</button>`;
  const win = [];
  for (let p = 1; p <= pages; p++) {
    if (p === 1 || p === pages || Math.abs(p - page) <= 1) win.push(p);
  }
  let last = 0;
  win.forEach(p => {
    if (p - last > 1) btns += `<span style="color:var(--muted);padding:0 4px">…</span>`;
    btns += `<button class="pg ${p === page ? 'active' : ''}" data-pg="${p}">${p}</button>`;
    last = p;
  });
  btns += `<button class="pg" data-pg="${page + 1}" ${page >= pages ? 'disabled' : ''}>›</button>`;
  const from = total ? start + 1 : 0;
  return `<div class="pager">
    <span class="info">Showing ${from}–${start + shown} of ${total}</span>
    <div class="controls">${btns}</div>
  </div>`;
}
function wirePager(selector, callback) {
  $$(`${selector} [data-pg]`).forEach(btn => {
    btn.onclick = () => {
      if (!btn.disabled) callback(+btn.dataset.pg);
    };
  });
}

/* ============================================================
   ----------  API CALLS  ----------
   All data now comes from the backend via fetch.
   ============================================================ */

const API_BASE = 'http://localhost:5000/api'; // adjust to your server

// Fetch employees and update state
async function fetchEmployees() {
  try {
    const res = await fetch(`${API_BASE}/employees`);
    if (!res.ok) throw new Error('Failed to fetch employees');
    const data = await res.json();
    // data comes as: { id, name, first, last, role, dept, email, salary, status, ... }
    // We need to add computed fields like deptColor, avatar, etc.
    state.employees = data.map(emp => ({
      ...emp,
      deptColor: DEPT_COLOR[emp.dept] || '#1d4ed8',
      avatar: AVATAR_COLORS[emp.id % AVATAR_COLORS.length],
      overtime: 0,       // will be filled by payroll run
      deductions: 0,     // will be filled by payroll run
      hoursWorked: 0,    // will be filled by payroll run
      leaveDeductions: 0 // will be filled by payroll run
    }));
    // Compute total monthly payroll (sum of salaries)
    state.totalMonthlyPayroll = state.employees.reduce((sum, e) => sum + e.salary, 0);
    renderPayroll();
  } catch (err) {
    console.error(err);
    toast('Error loading employees');
  }
}

// Fetch payslip for a specific employee and period
async function fetchPayslip(employeeId, periodId) {
  try {
    const res = await fetch(`${API_BASE}/payroll/employees/${employeeId}/payslip?periodId=${periodId}`);
    if (!res.ok) {
      if (res.status === 404) return null; // not generated yet
      throw new Error('Failed to fetch payslip');
    }
    return await res.json();
  } catch (err) {
    console.error(err);
    toast('Error loading payslip');
    return null;
  }
}

// Run payroll for a period
async function runPayroll(periodId) {
  try {
    const res = await fetch(`${API_BASE}/payroll/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ periodId })
    });
    if (!res.ok) throw new Error('Payroll run failed');
    const result = await res.json();
    toast('Payroll run completed');
    // Refresh employees (or just payroll items) – we'll refresh all
    await fetchEmployees();
  } catch (err) {
    console.error(err);
    toast('Error running payroll');
  }
}

/* ============================================================
   ----------  RENDER FUNCTIONS (mostly unchanged)  ----------
   ============================================================ */

let currentTab = "payroll";
function renderPayroll() {
  const main = document.getElementById('main');
  if (!main) return;
  main.innerHTML = `
    <div class="page-head">
      <div class="eyebrow">Finance</div>
      <div class="page-title">Payroll &amp; Payslips</div>
      <div class="page-sub">Run payroll and view individual payslips.</div>
    </div>
    <div class="tabs">
      <button class="tab ${currentTab === 'payroll' ? 'active' : ''}" data-tab="payroll">Payroll</button>
      <button class="tab ${currentTab === 'payslips' ? 'active' : ''}" data-tab="payslips">Payslips</button>
    </div>
    <div id="ppBody"></div>
  `;
  document.querySelectorAll('.tab[data-tab]').forEach(tab => {
    tab.onclick = () => {
      currentTab = tab.dataset.tab;
      renderPayroll();
    };
  });
  const body = document.getElementById('ppBody');
  if (currentTab === 'payroll') renderPayrollTab();
  else renderPayslipsTab();
}

function renderPayrollTab() {
  const body = document.getElementById('ppBody');
  if (!body) return;
  const total = state.totalMonthlyPayroll;
  const avgNet = state.employees.length ? Math.round(total / state.employees.length) : 0;

  body.innerHTML = `
    <div class="kpis">
      <div class="kpi">
        <div class="klab">Total Monthly Payroll</div>
        <div class="kval">${moneyShort(total)}</div>
        <span class="ktrend up">▲ 1.8%</span>
      </div>
      <div class="kpi">
        <div class="klab">Employees Paid</div>
        <div class="kval">${state.employees.length}</div>
      </div>
      <div class="kpi">
        <div class="klab">Average Net Pay</div>
        <div class="kval">${money(avgNet)}</div>
      </div>
      <div class="kpi">
        <div class="klab">Pay Run Status</div>
        <div class="kval" style="color:var(--ok)">Ready</div>
        <span class="ktrend up">On schedule</span>
      </div>
    </div>
    <div class="toolbar">
      <div class="search">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <circle cx="11" cy="11" r="7"/>
          <path d="m21 21-4.3-4.3"/>
        </svg>
        <input id="paySearch" placeholder="Search employee to view payslip…" value="${state.payQuery}">
      </div>
      <button class="btn" id="runPay">Run payroll</button>
    </div>
    <div class="card">
      <div class="thead emp-grid" style="grid-template-columns:2.4fr 1.4fr 1fr 1.2fr auto">
        <span>Employee</span>
        <span class="col-hide">Department</span>
        <span class="col-hide">Net Pay</span>
        <span class="col-hide">Status</span>
        <span></span>
      </div>
      <div id="payRows"></div>
      <div id="payPager"></div>
    </div>
  `;

  const search = document.getElementById('paySearch');
  if (search) {
    search.addEventListener('input', e => {
      state.payQuery = e.target.value;
      state.payPage = 1;
      drawPayrollTable();
    });
  }
  const runBtn = document.getElementById('runPay');
  if (runBtn) {
    runBtn.onclick = async () => {
      // In a real app, you'd let user pick a period. For demo, use period 1 (or create one)
      const periodId = 1; // default
      await runPayroll(periodId);
    };
  }
  drawPayrollTable();
}

function drawPayrollTable() {
  const q = state.payQuery.toLowerCase();
  const PAY_PER_PAGE = 9;
  const rows = state.employees.filter(e => {
    return !q || (e.name + " " + e.dept).toLowerCase().includes(q);
  });
  const pages = Math.max(1, Math.ceil(rows.length / PAY_PER_PAGE));
  if (state.payPage > pages) state.payPage = 1;
  const start = (state.payPage - 1) * PAY_PER_PAGE;
  const slice = rows.slice(start, start + PAY_PER_PAGE);

  const rowsContainer = document.getElementById('payRows');
  const pagerContainer = document.getElementById('payPager');
  if (!rowsContainer || !pagerContainer) return;

  if (!slice.length) {
    rowsContainer.innerHTML = `<div class="empty">No employees match "${state.payQuery}".</div>`;
    pagerContainer.innerHTML = '';
    return;
  }

  // Net pay: use salary + overtime - deductions (from payroll items)
  // If we haven't run payroll, these will be 0, so we show salary as net.
  const netPay = e => e.salary + (e.overtime || 0) - (e.deductions || 0);

  rowsContainer.innerHTML = slice.map(e => `
    <div class="trow emp-grid" style="grid-template-columns:2.4fr 1.4fr 1fr 1.2fr auto">
      <div class="who-cell">
        ${avatar(e)}
        <div style="min-width:0">
          <div class="nm">${e.name}</div>
          <div class="rl">${e.role}</div>
        </div>
      </div>
      <span class="col-hide"><span class="pill dept">${e.dept}</span></span>
      <span class="col-hide" style="font-weight:700">${money(netPay(e))}</span>
      <span class="col-hide">${statusPill(e.status)}</span>
      <div class="row-actions">
        <button class="btn ghost sm" data-action="payslip" data-id="${e.id}">View payslip</button>
      </div>
    </div>
  `).join('');

  pagerContainer.innerHTML = pagerHTML(rows.length, state.payPage, pages, start, slice.length);

  document.querySelectorAll('#payRows [data-action="payslip"]').forEach(btn => {
    btn.onclick = () => viewPayslip(parseInt(btn.dataset.id));
  });
  wirePager('#payPager', page => {
    state.payPage = page;
    drawPayrollTable();
  });
}

/* ============================================================
   PAYSLIP MODAL - now fetches real payslip from API
   ============================================================ */
async function viewPayslip(id) {
  const e = state.employees.find(x => x.id === id);
  if (!e) return;

  // For modal, we fetch the latest payslip for period 1 (or user-selected)
  // In a real app, you'd ask which period. For simplicity, we use periodId=1.
  const periodId = 1;
  const payslipData = await fetchPayslip(id, periodId);
  if (!payslipData) {
    toast('No payslip generated for this employee yet. Run payroll first.');
    return;
  }

  // Build modal with real data
  const { earnings, deductions, net } = payslipData;
  const basic = earnings.basic;
  const ot = earnings.overtime;
  const ded = deductions.total;

  openModal(
    "Payslip · " + e.name,
    `
      <p style="color:var(--muted);margin-bottom:12px">${e.role} · ${e.dept}</p>
      <div class="line"><span>Hours worked</span><b>${e.hoursWorked || 'N/A'}</b></div>
      <div class="line"><span>Leave deductions</span><b>${e.leaveDeductions || 0}</b></div>
      <div class="pay-table" style="border:1px solid var(--line);border-radius:12px;overflow:hidden;margin-top:12px">
        <div class="prow"><span>Basic Salary</span><span class="r"></span><span class="r">${money(basic)}</span></div>
        <div class="prow"><span>Overtime</span><span class="r"></span><span class="r">${money(ot)}</span></div>
        <div class="prow"><span>Deductions</span><span class="r"></span><span class="r">-${money(ded)}</span></div>
        <div class="prow net"><span><b>Net Pay</b></span><span class="r"></span><span class="r">${money(net)}</span></div>
      </div>
    `,
    `
      <button class="btn line" id="mclose">Close</button>
      <button class="btn ghost" id="mfull">Open full payslip</button>
      <button class="btn" id="mslip">Download payslip</button>
    `
  );

  document.getElementById('mclose').onclick = closeModal;
  document.getElementById('mfull').onclick = () => {
    state.payrollEmp = id;
    currentTab = 'payslips';
    closeModal();
    renderPayroll();
  };
  document.getElementById('mslip').onclick = () => {
    closeModal();
    window.print();
    toast("Downloaded " + e.name + "'s payslip");
  };
}

/* ============================================================
   TAB 2: PAYSLIPS - now uses API for payslip document
   ============================================================ */
const PS_PERIODS = ["January", "February", "March", "April", "May", "June"]
  .map((name, m) => ({
    m,
    name,
    year: 2026,
    range: `01 – ${new Date(2026, m + 1, 0).getDate()} ${name.slice(0, 3)} 2026`
  }));

let psEmpId = 1;
let psPeriod = 5;
let psQuery = "";

function renderPayslipsTab() {
  const body = document.getElementById('ppBody');
  if (!body) return;
  if (!psEmpId || !state.employees.find(e => e.id === psEmpId)) {
    psEmpId = state.employees[0]?.id || 1;
  }
  body.innerHTML = `
    <div class="ps-grid">
      <div class="card ps-picker">
        <div class="ps-search">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <circle cx="11" cy="11" r="7"/>
            <path d="m21 21-4.3-4.3"/>
          </svg>
          <input id="psSearch" placeholder="Find an employee…" value="${psQuery}">
        </div>
        <div class="ps-list" id="psList"></div>
      </div>
      <div id="slipDoc"></div>
    </div>
  `;
  const search = document.getElementById('psSearch');
  if (search) {
    search.addEventListener('input', e => {
      psQuery = e.target.value;
      drawPayslipList();
    });
  }
  drawPayslipList();
  drawPayslipDoc();
}

function drawPayslipList() {
  const q = psQuery.toLowerCase();
  const rows = state.employees.filter(e => {
    return !q || (e.name + " " + e.role + " " + e.dept).toLowerCase().includes(q);
  }).slice(0, 9);
  const listContainer = document.getElementById('psList');
  if (!listContainer) return;
  if (!rows.length) {
    listContainer.innerHTML = `<div class="empty">No employees match "${psQuery}".</div>`;
    return;
  }
  listContainer.innerHTML = rows.map(e => `
    <button class="ps-item ${e.id === psEmpId ? 'active' : ''}" data-id="${e.id}">
      ${avatar(e)}
      <span class="ps-nm">
        <b>${e.name}</b>
        <span>${e.role}</span>
      </span>
    </button>
  `).join('');
  document.querySelectorAll('#psList [data-id]').forEach(btn => {
    btn.onclick = () => {
      psEmpId = parseInt(btn.dataset.id);
      drawPayslipList();
      drawPayslipDoc();
    };
  });
}

async function drawPayslipDoc() {
  const e = state.employees.find(x => x.id === psEmpId) || state.employees[0];
  if (!e) return;
  psEmpId = e.id;
  const p = PS_PERIODS[psPeriod] || PS_PERIODS[0];

  // Fetch payslip data from API
  const periodId = psPeriod + 1; // assuming period IDs correspond to month index + 1
  const payslipData = await fetchPayslip(e.id, periodId);
  if (!payslipData) {
    const docContainer = document.getElementById('slipDoc');
    if (docContainer) {
      docContainer.innerHTML = `<div class="panel empty">No payslip for ${e.name} for ${p.name} ${p.year}. Run payroll first.</div>`;
    }
    return;
  }

  const { earnings, deductions, net } = payslipData;
  // Compute YTD - could be provided by API, but for demo we calculate from earnings/deductions
  // In a real system, you'd have an endpoint for YTD. We'll just show current period.

  const periodOpts = PS_PERIODS.map(pr => `
    <option value="${pr.m}" ${pr.m === psPeriod ? 'selected' : ''}>${pr.name} ${pr.year}</option>
  `).join('');

  const logo = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M6 21V9l6-4 6 4v12M10 21v-5h4v5"/></svg>';

  const docContainer = document.getElementById('slipDoc');
  if (!docContainer) return;

  docContainer.innerHTML = `
    <div class="panel slip-doc" id="slipPaper">
      <div class="slip-top">
        <div class="slip-brand">
          <span class="slip-logo">${logo}</span>
          <div>
            <b>ModernTech Inc.</b>
            <span>100 Market Street · San Francisco, CA</span>
          </div>
        </div>
        <div class="slip-title">
          <div class="eyebrow">Payslip</div>
          <b>${p.name} ${p.year}</b>
          <span>${p.range}</span>
        </div>
      </div>
      
      <div class="slip-emp">
        ${avatar(e)}
        <div class="slip-emp-main">
          <b>${e.name}</b>
          <span>${e.role} · ${e.dept}</span>
        </div>
        <div class="slip-emp-meta">
          <div>
            <span>Employee ID</span>
            <b>MT-${String(e.id).padStart(4, "0")}</b>
          </div>
          <div>
            <span>Hours worked</span>
            <b>${e.hoursWorked || 'N/A'}</b>
          </div>
          <div>
            <span>Leave deductions</span>
            <b>${e.leaveDeductions || 0}</b>
          </div>
        </div>
      </div>
      
      <div class="slip-period">
        <label>Pay period</label>
        <select class="select" id="psPeriod">${periodOpts}</select>
      </div>
      
      <div class="slip-cols">
        <div class="slip-block">
          <div class="slip-h">Earnings</div>
          <div class="slip-row"><span>Basic salary</span><b>${money(earnings.basic)}</b></div>
          <div class="slip-row"><span>Overtime</span><b>${money(earnings.overtime)}</b></div>
          <div class="slip-row total"><span>Gross pay</span><b>${money(earnings.gross)}</b></div>
        </div>
        <div class="slip-block">
          <div class="slip-h">Deductions</div>
          <div class="slip-row"><span>PAYE tax</span><b>-${money(deductions.tax)}</b></div>
          <div class="slip-row"><span>Pension</span><b>-${money(deductions.pension)}</b></div>
          <div class="slip-row"><span>Other</span><b>-${money(deductions.other)}</b></div>
          <div class="slip-row total"><span>Total deductions</span><b>-${money(deductions.total)}</b></div>
        </div>
      </div>
      
      <div class="slip-net">
        <span>Net pay · ${p.name} ${p.year}</span>
        <b>${money(net)}</b>
      </div>
      
      <!-- YTD - we'll omit for simplicity; could be added via another API -->
      <div class="slip-actions">
        <button class="btn" id="slipPrint">Download PDF</button>
        <button class="btn ghost" id="slipPayroll">Back to Payroll</button>
      </div>
    </div>
  `;

  const periodSelect = document.getElementById('psPeriod');
  if (periodSelect) {
    periodSelect.onchange = () => {
      psPeriod = parseInt(periodSelect.value);
      drawPayslipDoc();
    };
  }
  document.getElementById('slipPrint')?.addEventListener('click', () => {
    window.print();
    toast(`Preparing ${e.name}'s payslip — ${p.name} ${p.year}`);
  });
  document.getElementById('slipPayroll')?.addEventListener('click', () => {
    currentTab = 'payroll';
    renderPayroll();
  });
}

/* ============================================================
   BOOT – Load employees from API on page load
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  console.log('Payroll initializing...');
  // Check if there's a stored employee ID to show (from other pages)
  try {
    const pre = sessionStorage.getItem("mt-payslipEmp");
    if (pre) {
      psEmpId = parseInt(pre);
      currentTab = 'payslips';
      sessionStorage.removeItem("mt-payslipEmp");
    }
  } catch (e) { /* ignore */ }

  // Fetch employees from backend
  fetchEmployees();
});

// Expose for debugging
window.renderPayroll = renderPayroll;
window.state = state;