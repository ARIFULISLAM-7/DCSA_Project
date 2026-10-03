/* =========================================================
   ui.js — shared chrome and small helpers used on every page:
   the navbar, toast notifications, a modal helper, and a
   handful of formatters. Include after db.js.
   ========================================================= */

const UI = (() => {
  function qs(name, fallback = null) {
    return new URLSearchParams(window.location.search).get(name) ?? fallback;
  }

  function initials(name = "") {
    return name
      .split(" ")
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }

  function money(min, max, currency, period) {
    const fmt = (n) => new Intl.NumberFormat("en-US").format(n);
    const symbol = { USD: "$", EUR: "€", GBP: "£", CAD: "$", AUD: "$", JPY: "¥", INR: "₹", NPR: "₨" }[currency] || "";
    const periodLabel = { hourly: "/hr", monthly: "/mo", yearly: "/yr" }[period] || "";
    if (!min && !max) return "Salary not disclosed";
    if (min && max) return `${symbol}${fmt(min)} – ${symbol}${fmt(max)}${periodLabel}`;
    return `${symbol}${fmt(min || max)}${periodLabel}`;
  }

  function timeAgo(iso) {
    const diff = Date.now() - new Date(iso).getTime();
    const days = Math.floor(diff / 86400000);
    if (days <= 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 30) return `${days} days ago`;
    const months = Math.floor(days / 30);
    return `${months} month${months > 1 ? "s" : ""} ago`;
  }

  function dateLabel(iso) {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  function escapeHtml(str = "") {
    return str.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function toast(message, type = "default") {
    let region = document.getElementById("toast-region");
    if (!region) {
      region = document.createElement("div");
      region.id = "toast-region";
      document.body.appendChild(region);
    }
    const el = document.createElement("div");
    el.className = `toast ${type === "success" ? "toast-success" : type === "danger" ? "toast-danger" : ""}`;
    el.textContent = message;
    region.appendChild(el);
    setTimeout(() => el.remove(), 3200);
  }

  function openModal(innerHtml) {
    closeModal();
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.id = "active-modal";
    overlay.innerHTML = `<div class="modal-box">${innerHtml}</div>`;
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeModal();
    });
    document.body.appendChild(overlay);
    return overlay;
  }
  function closeModal() {
    document.getElementById("active-modal")?.remove();
  }

  /* ---------------- navbar ---------------- */
  function renderNavbar(activePath) {
    const mount = document.getElementById("site-navbar");
    if (!mount) return;
    const user = DB.currentUser();

    let rightSide = "";
    if (!user) {
      rightSide = `
        <div class="nav-cta">
          <a href="login.html" class="btn btn-ghost">Log in</a>
          <a href="register.html" class="btn btn-primary">Post a job</a>
        </div>`;
    } else {
      const dashHref = user.role === "employer" ? "employer-dashboard.html" : "applicant-dashboard.html";
      rightSide = `
        <div class="nav-cta">
          <a href="${dashHref}" class="nav-user">
            <span class="avatar-chip">${initials(user.name)}</span>
            <span>${escapeHtml(user.name.split(" ")[0])}</span>
          </a>
          <button class="btn btn-outline btn-sm" id="nav-logout-btn">Log out</button>
        </div>`;
    }

    const links = [
      { href: "index.html", label: "Home" },
      { href: "jobs.html", label: "Find jobs" },
    ];
    const linksHtml = links
      .map((l) => `<a href="${l.href}" class="${activePath === l.href ? "is-active" : ""}">${l.label}</a>`)
      .join("");

    mount.innerHTML = `
      <div class="nav-inner">
        <a href="index.html" class="brand-mark">Haven<span class="dot">work</span></a>
        <nav class="nav-links">${linksHtml}</nav>
        ${rightSide}
        <button class="nav-toggle" id="nav-toggle-btn" aria-label="Toggle menu">☰</button>
      </div>`;

    document.getElementById("nav-logout-btn")?.addEventListener("click", () => {
      DB.logout();
      window.location.href = "index.html";
    });
    document.getElementById("nav-toggle-btn")?.addEventListener("click", () => {
      mount.querySelector(".nav-inner").classList.toggle("is-open");
    });
  }

  function renderFooter() {
    const mount = document.getElementById("site-footer");
    if (!mount) return;
    mount.innerHTML = `
      <div class="container">
        <div>
          <div class="brand-mark" style="color:#fff">Haven<span class="dot">work</span></div>
          <p style="color:#92a1b6; max-width: 32ch; margin-top:10px;">A calmer place to find your next role, or the person who'll fill yours.</p>
        </div>
        <div>
          <strong style="display:block; margin-bottom:10px;">For candidates</strong>
          <a href="jobs.html" style="display:block; margin-bottom:6px;">Browse jobs</a>
          <a href="register.html" style="display:block;">Create an account</a>
        </div>
        <div>
          <strong style="display:block; margin-bottom:10px;">For employers</strong>
          <a href="register.html" style="display:block; margin-bottom:6px;">Post a job</a>
          <a href="login.html" style="display:block;">Employer login</a>
        </div>
      </div>
      <div class="container">
        <small>Havenwork is a static front-end demo — a vanilla HTML/CSS/JS rebuild of a Next.js project, with data kept in your browser's local storage.</small>
      </div>`;
  }

  function jobCardHtml(job) {
    const employer = DB.employerFor(job) || {};
    return `
      <a href="job-details.html?id=${job.id}" class="job-card">
        <div class="job-card-top">
          <div style="display:flex; gap:12px;">
            <div class="company-mark">${initials(employer.name || "?")}</div>
            <div>
              <h3>${escapeHtml(job.title)}</h3>
              <div class="company-name">${escapeHtml(employer.name || "Unnamed company")}</div>
            </div>
          </div>
          ${job.isFeatured ? '<span class="featured-ribbon">Featured</span>' : ""}
        </div>
        <div class="job-meta">
          <span>📍 ${escapeHtml(job.location || "Not specified")}</span>
          <span>🕓 ${escapeHtml(job.workType || "")}</span>
          <span>💻 ${escapeHtml(job.jobType || "")}</span>
        </div>
        <div class="tags">
          ${(job.tags || "").split(",").filter(Boolean).slice(0, 3).map((t) => `<span class="tag">${escapeHtml(t.trim())}</span>`).join("")}
        </div>
        <div class="salary">${money(job.minSalary, job.maxSalary, job.salaryCurrency, job.salaryPeriod)}</div>
      </a>`;
  }

  function renderDashSidebar(mountId, role, activeHref, user) {
    const mount = document.getElementById(mountId);
    if (!mount) return;

    const applicantItems = [
      { href: "applicant-dashboard.html", label: "Overview", icon: "🏠" },
      { href: "jobs.html", label: "Find jobs", icon: "🔍" },
      { href: "applicant-applied.html", label: "Applied jobs", icon: "📄" },
      { href: "applicant-settings.html", label: "Settings", icon: "⚙️" },
    ];
    const employerItems = [
      { href: "employer-dashboard.html", label: "Overview", icon: "🏠" },
      { href: "employer-applications.html", label: "Applications", icon: "👤" },
      { href: "employer-job-form.html", label: "Post a job", icon: "➕" },
      { href: "employer-jobs.html", label: "My jobs", icon: "💼" },
      { href: "employer-settings.html", label: "Settings", icon: "⚙️" },
    ];
    const items = role === "employer" ? employerItems : applicantItems;

    mount.innerHTML = `
      <div class="panel">
        <div style="display:flex; align-items:center; gap:10px; margin-bottom:16px;">
          <span class="avatar-chip" style="width:40px; height:40px; font-size:0.95rem;">${initials(user.name)}</span>
          <div>
            <div style="font-weight:600;">${escapeHtml(user.name)}</div>
            <div class="muted" style="font-size:0.8rem; text-transform:capitalize;">${escapeHtml(role)}</div>
          </div>
        </div>
        <nav class="dash-nav">
          ${items
            .map(
              (item) => `<a href="${item.href}" class="${item.href === activeHref ? "is-active" : ""}">
                <span>${item.icon}</span> ${item.label}
              </a>`
            )
            .join("")}
        </nav>
      </div>`;
  }

  return { qs, initials, money, timeAgo, dateLabel, escapeHtml, toast, openModal, closeModal, renderNavbar, renderFooter, jobCardHtml, renderDashSidebar };
})();

document.addEventListener("DOMContentLoaded", () => {
  UI.renderNavbar(location.pathname.split("/").pop());
  UI.renderFooter();
});
