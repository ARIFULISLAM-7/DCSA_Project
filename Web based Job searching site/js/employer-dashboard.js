document.addEventListener("DOMContentLoaded", () => {
  const user = DB.requireRole("employer");
  if (!user) return;

  UI.renderDashSidebar("dash-sidebar", "employer", "employer-dashboard.html", user);
  const employer = DB.getEmployerProfile(user.id) || {};
  document.getElementById("dash-greeting").textContent = employer.name ? `Overview — ${employer.name}` : "Overview";

  const jobs = DB.jobsByEmployer(user.id).filter((j) => !j.deletedAt);
  const applications = DB.applicationsForEmployer(user.id);

  document.getElementById("employer-stats").innerHTML = `
    <div class="stat-card"><strong>${jobs.length}</strong><span>Active listings</span></div>
    <div class="stat-card"><strong>${applications.length}</strong><span>Total applicants</span></div>
    <div class="stat-card"><strong>${applications.filter((a) => a.status === "pending").length}</strong><span>Awaiting review</span></div>`;

  document.getElementById("recent-jobs").innerHTML = jobs.length
    ? `<div class="table-wrap"><table>
        <thead><tr><th>Title</th><th>Location</th><th>Posted</th><th>Applicants</th></tr></thead>
        <tbody>${jobs
          .slice(0, 5)
          .map(
            (j) => `<tr>
              <td><a href="job-details.html?id=${j.id}">${UI.escapeHtml(j.title)}</a></td>
              <td>${UI.escapeHtml(j.location || "—")}</td>
              <td>${UI.timeAgo(j.createdAt)}</td>
              <td>${DB.applicationsForJob(j.id).length}</td>
            </tr>`
          )
          .join("")}</tbody>
      </table></div>`
    : `<p class="muted">You haven't posted a job yet. <a href="employer-job-form.html">Post your first one</a>.</p>`;

  document.getElementById("recent-applicants").innerHTML = applications.length
    ? `<div class="table-wrap"><table>
        <thead><tr><th>Candidate</th><th>Job</th><th>Applied</th></tr></thead>
        <tbody>${applications
          .slice(0, 5)
          .map((a) => {
            const applicant = DB.getUser(a.applicantId);
            const job = DB.getJob(a.jobId);
            return `<tr>
              <td>${UI.escapeHtml(applicant?.name || "—")}</td>
              <td>${UI.escapeHtml(job?.title || "—")}</td>
              <td>${UI.dateLabel(a.appliedAt)}</td>
            </tr>`;
          })
          .join("")}</tbody>
      </table></div>`
    : `<p class="muted">No applicants yet.</p>`;
});
