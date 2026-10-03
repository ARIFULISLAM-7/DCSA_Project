document.addEventListener("DOMContentLoaded", () => {
  const user = DB.requireRole("applicant");
  if (!user) return;

  UI.renderDashSidebar("dash-sidebar", "applicant", "applicant-applied.html", user);

  const applications = DB.applicationsByApplicant(user.id);
  const resumes = DB.resumesByApplicant(user.id);

  if (!applications.length) {
    document.getElementById("applied-list").innerHTML = `
      <div class="empty-state">
        <h3>No applications yet</h3>
        <p>When you apply to a job, it'll show up here so you can track its status.</p>
        <a href="jobs.html" class="btn btn-primary">Browse jobs</a>
      </div>`;
    return;
  }

  const statusTag = (status) => ({ pending: "tag-accent", reviewed: "tag-success", rejected: "tag-danger" }[status] || "tag-muted");

  document.getElementById("applied-list").innerHTML = `
    <div class="table-wrap">
      <table>
        <thead><tr><th>Job</th><th>Company</th><th>Resume used</th><th>Applied</th><th>Status</th></tr></thead>
        <tbody>
          ${applications
            .map((app) => {
              const job = DB.getJob(app.jobId);
              const employer = job ? DB.employerFor(job) : null;
              const resume = resumes.find((r) => r.id === app.resumeId);
              return `<tr>
                <td>${job ? `<a href="job-details.html?id=${job.id}">${UI.escapeHtml(job.title)}</a>` : "Job removed"}</td>
                <td>${UI.escapeHtml(employer?.name || "—")}</td>
                <td class="muted">${UI.escapeHtml(resume?.fileName || "—")}</td>
                <td>${UI.dateLabel(app.appliedAt)}</td>
                <td><span class="tag ${statusTag(app.status)}" style="text-transform:capitalize;">${app.status}</span></td>
              </tr>`;
            })
            .join("")}
        </tbody>
      </table>
    </div>`;
});
