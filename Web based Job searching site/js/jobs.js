const PAGE_SIZE = 6;
const FILTER_OPTIONS = {
  workType: ["full-time", "part-time", "contract", "temporary", "freelance"],
  jobType: ["remote", "hybrid", "on-site"],
  jobLevel: ["internship", "entry level", "junior", "mid level", "senior level", "lead", "manager", "director", "executive"],
};

const state = {
  q: UI.qs("q", ""),
  workType: new Set(),
  jobType: new Set(),
  jobLevel: new Set(),
  page: 1,
};

function renderFilterGroup(key) {
  const mount = document.getElementById(`filter-${key}`);
  mount.innerHTML = FILTER_OPTIONS[key]
    .map(
      (value) => `
      <label>
        <input type="checkbox" data-filter="${key}" value="${value}" ${state[key].has(value) ? "checked" : ""} />
        ${value.charAt(0).toUpperCase() + value.slice(1)}
      </label>`
    )
    .join("");
  mount.querySelectorAll("input").forEach((input) => {
    input.addEventListener("change", () => {
      input.checked ? state[key].add(input.value) : state[key].delete(input.value);
      state.page = 1;
      renderResults();
    });
  });
}

function matchesFilters(job) {
  const q = state.q.trim().toLowerCase();
  if (q) {
    const employer = DB.employerFor(job) || {};
    const haystack = `${job.title} ${job.tags || ""} ${employer.name || ""}`.toLowerCase();
    if (!haystack.includes(q)) return false;
  }
  if (state.workType.size && !state.workType.has(job.workType)) return false;
  if (state.jobType.size && !state.jobType.has(job.jobType)) return false;
  if (state.jobLevel.size && !state.jobLevel.has(job.jobLevel)) return false;
  return true;
}

function renderResults() {
  const all = DB.listJobs().filter(matchesFilters);
  const totalPages = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
  state.page = Math.min(state.page, totalPages);
  const pageJobs = all.slice((state.page - 1) * PAGE_SIZE, state.page * PAGE_SIZE);

  document.getElementById("results-count").textContent = `${all.length} job${all.length === 1 ? "" : "s"} found`;
  document.getElementById("job-results").innerHTML = pageJobs.map(UI.jobCardHtml).join("");
  document.getElementById("empty-state").classList.toggle("hidden", all.length > 0);

  renderPagination(totalPages);
}

function renderPagination(totalPages) {
  const mount = document.getElementById("pagination");
  if (totalPages <= 1) {
    mount.innerHTML = "";
    return;
  }
  let buttons = `<button ${state.page === 1 ? "disabled" : ""} data-page="${state.page - 1}">‹</button>`;
  for (let p = 1; p <= totalPages; p++) {
    buttons += `<button class="${p === state.page ? "is-active" : ""}" data-page="${p}">${p}</button>`;
  }
  buttons += `<button ${state.page === totalPages ? "disabled" : ""} data-page="${state.page + 1}">›</button>`;
  mount.innerHTML = buttons;
  mount.querySelectorAll("button[data-page]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.page = Number(btn.dataset.page);
      renderResults();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("jobs-search-input").value = state.q;
  Object.keys(FILTER_OPTIONS).forEach(renderFilterGroup);
  renderResults();

  document.getElementById("jobs-search-form").addEventListener("submit", (e) => {
    e.preventDefault();
    state.q = document.getElementById("jobs-search-input").value;
    state.page = 1;
    renderResults();
  });

  document.getElementById("clear-filters-btn").addEventListener("click", () => {
    state.q = "";
    state.workType.clear();
    state.jobType.clear();
    state.jobLevel.clear();
    state.page = 1;
    document.getElementById("jobs-search-input").value = "";
    Object.keys(FILTER_OPTIONS).forEach(renderFilterGroup);
    renderResults();
  });
});
