document.addEventListener("DOMContentLoaded", () => {
  const user = DB.requireRole("applicant");
  if (!user) return;

  UI.renderDashSidebar("dash-sidebar", "applicant", "applicant-dashboard.html", user);
  document.getElementById("dash-greeting").textContent = `Welcome back, ${user.name.split(" ")[0]}`;

  const applications = DB.applicationsByApplicant(user.id);
  const resumes = DB.resumesByApplicant(user.id);
  const profile = DB.getApplicantProfile(user.id) || {};

  document.getElementById("applicant-stats").innerHTML = `
    <div class="stat-card"><strong>${applications.length}</strong><span>Applications sent</span></div>
    <div class="stat-card"><strong>${applications.filter((a) => a.status === "pending").length}</strong><span>Awaiting response</span></div>
    <div class="stat-card"><strong>${resumes.length}</strong><span>Resumes on file</span></div>`;

  const fields = ["biography", "education", "experience", "location"];
  const filled = fields.filter((f) => profile[f] && profile[f] !== "none").length;
  const pct = Math.round((filled / fields.length) * 100);
  document.getElementById("profile-status").innerHTML = `
    <div style="background:var(--line-soft); border-radius:20px; height:8px; overflow:hidden; margin-bottom:10px;">
      <div style="background:var(--brand); width:${pct}%; height:100%;"></div>
    </div>
    <p class="muted" style="margin-bottom:12px;">${pct}% complete — a fuller profile helps employers say yes faster.</p>
    <a href="applicant-settings.html" class="btn btn-outline btn-sm">Complete your profile</a>`;

  const recent = applications.slice(0, 5);
  document.getElementById("recent-applications").innerHTML = recent.length
    ? `<div class="table-wrap"><table>
        <thead><tr><th>Job</th><th>Company</th><th>Applied</th><th>Status</th></tr></thead>
        <tbody>${recent.map(applicationRow).join("")}</tbody>
      </table></div>`
    : `<p class="muted">You haven't applied to anything yet — <a href="jobs.html">browse open roles</a>.</p>`;
});

function applicationRow(app) {
  const job = DB.getJob(app.jobId);
  const employer = job ? DB.employerFor(job) : null;
  const statusTag = { pending: "tag-accent", reviewed: "tag-success", rejected: "tag-danger" }[app.status] || "tag-muted";
  return `<tr>
    <td>${job ? `<a href="job-details.html?id=${job.id}">${UI.escapeHtml(job.title)}</a>` : "Job removed"}</td>
    <td>${UI.escapeHtml(employer?.name || "—")}</td>
    <td>${UI.dateLabel(app.appliedAt)}</td>
    <td><span class="tag ${statusTag}" style="text-transform:capitalize;">${app.status}</span></td>
  </tr>`;
}
