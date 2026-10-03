document.addEventListener("DOMContentLoaded", () => {
  const jobs = DB.listJobs();
  const employerIds = new Set(jobs.map((j) => j.employerId));
  const remoteCount = jobs.filter((j) => j.jobType === "remote").length;

  document.getElementById("stat-jobs").textContent = jobs.length;
  document.getElementById("stat-companies").textContent = employerIds.size;
  document.getElementById("stat-remote").textContent = remoteCount;

  const featured = jobs.filter((j) => j.isFeatured).concat(jobs).slice(0, 3);
  const seen = new Set();
  const uniqueFeatured = featured.filter((j) => (seen.has(j.id) ? false : seen.add(j.id)));
  document.getElementById("featured-jobs").innerHTML = uniqueFeatured.map(UI.jobCardHtml).join("");

  document.getElementById("hero-search-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const q = document.getElementById("hero-search-input").value.trim();
    window.location.href = "jobs.html" + (q ? `?q=${encodeURIComponent(q)}` : "");
  });
});
