let employerUser;

function renderApplications() {
  const jobFilter = document.getElementById("job-filter").value;
  let applications = DB.applicationsForEmployer(employerUser.id);
  if (jobFilter !== "all") applications = applications.filter((a) => a.jobId === Number(jobFilter));

  const mount = document.getElementById("applications-table");
  if (!applications.length) {
    mount.innerHTML = `<div class="empty-state"><h3>No applications here yet</h3><p>Once candidates apply, they'll show up in this list.</p></div>`;
    return;
  }

  mount.innerHTML = `<div class="table-wrap"><table>
    <thead><tr><th>Candidate</th><th>Job</th><th>Resume</th><th>Applied</th><th>Status</th><th></th></tr></thead>
    <tbody>
      ${applications
        .map((app) => {
          const applicant = DB.getUser(app.applicantId);
          const job = DB.getJob(app.jobId);
          const resume = DB.resumesByApplicant(app.applicantId).find((r) => r.id === app.resumeId);
          return `<tr>
            <td>${UI.escapeHtml(applicant?.name || "—")}<div class="muted" style="font-size:0.8rem;">${UI.escapeHtml(applicant?.email || "")}</div></td>
            <td>${UI.escapeHtml(job?.title || "—")}</td>
            <td class="muted">${UI.escapeHtml(resume?.fileName || "—")}</td>
            <td>${UI.dateLabel(app.appliedAt)}</td>
            <td>
              <select data-status="${app.id}" style="padding:4px 6px; font-size:0.82rem;">
                <option value="pending" ${app.status === "pending" ? "selected" : ""}>Pending</option>
                <option value="reviewed" ${app.status === "reviewed" ? "selected" : ""}>Reviewed</option>
                <option value="rejected" ${app.status === "rejected" ? "selected" : ""}>Rejected</option>
              </select>
            </td>
            <td>${app.coverLetter ? `<button class="btn btn-outline btn-sm" data-view="${app.id}">Cover letter</button>` : ""}</td>
          </tr>`;
        })
        .join("")}
    </tbody>
  </table></div>`;

  mount.querySelectorAll("[data-status]").forEach((select) => {
    select.addEventListener("change", () => {
      DB.setApplicationStatus(Number(select.dataset.status), select.value);
      UI.toast("Status updated.", "success");
    });
  });
  mount.querySelectorAll("[data-view]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const app = DB.applicationsForEmployer(employerUser.id).find((a) => a.id === Number(btn.dataset.view));
      const applicant = DB.getUser(app.applicantId);
      const overlay = UI.openModal(`
        <div class="flex-between">
          <h3 style="margin:0;">Cover letter — ${UI.escapeHtml(applicant?.name || "")}</h3>
          <button class="modal-close" id="modal-close-btn">&times;</button>
        </div>
        <p style="white-space:pre-wrap;">${UI.escapeHtml(app.coverLetter)}</p>
      `);
      overlay.querySelector("#modal-close-btn").addEventListener("click", UI.closeModal);
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  employerUser = DB.requireRole("employer");
  if (!employerUser) return;
  UI.renderDashSidebar("dash-sidebar", "employer", "employer-applications.html", employerUser);

  const jobs = DB.jobsByEmployer(employerUser.id);
  const jobFilter = document.getElementById("job-filter");
  jobFilter.innerHTML = `<option value="all">All jobs</option>` + jobs.map((j) => `<option value="${j.id}">${UI.escapeHtml(j.title)}</option>`).join("");
  jobFilter.addEventListener("change", renderApplications);

  renderApplications();
});
