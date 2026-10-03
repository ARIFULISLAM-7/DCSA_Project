let user;

function renderJobsTable() {
  const jobs = DB.jobsByEmployer(user.id);
  const mount = document.getElementById("jobs-table");

  if (!jobs.length) {
    mount.innerHTML = `<div class="empty-state">
      <h3>Nothing posted yet</h3>
      <p>Your first listing is a couple of fields away.</p>
      <a href="employer-job-form.html" class="btn btn-primary">Post a job</a>
    </div>`;
    return;
  }

  mount.innerHTML = `<div class="table-wrap"><table>
    <thead><tr><th>Title</th><th>Location</th><th>Type</th><th>Status</th><th>Applicants</th><th></th></tr></thead>
    <tbody>
      ${jobs
        .map((j) => {
          const applicants = DB.applicationsForJob(j.id).length;
          const isClosed = !!j.deletedAt;
          return `<tr>
            <td><a href="job-details.html?id=${j.id}">${UI.escapeHtml(j.title)}</a>${j.isFeatured ? ' <span class="tag tag-accent">Featured</span>' : ""}</td>
            <td>${UI.escapeHtml(j.location || "—")}</td>
            <td>${UI.escapeHtml(j.workType || "—")}</td>
            <td>${isClosed ? '<span class="tag tag-danger">Closed</span>' : '<span class="tag tag-success">Active</span>'}</td>
            <td>${applicants}</td>
            <td style="display:flex; gap:6px; justify-content:flex-end;">
              <a class="btn btn-outline btn-sm" href="employer-job-form.html?id=${j.id}">Edit</a>
              ${
                isClosed
                  ? `<button class="btn btn-outline btn-sm" data-reopen="${j.id}">Reopen</button>`
                  : `<button class="btn btn-danger btn-sm" data-close="${j.id}">Close</button>`
              }
            </td>
          </tr>`;
        })
        .join("")}
    </tbody>
  </table></div>`;

  mount.querySelectorAll("[data-close]").forEach((btn) =>
    btn.addEventListener("click", () => {
      DB.deleteJob(btn.dataset.close);
      UI.toast("Listing closed.", "success");
      renderJobsTable();
    })
  );
  mount.querySelectorAll("[data-reopen]").forEach((btn) =>
    btn.addEventListener("click", () => {
      DB.updateJob(btn.dataset.reopen, { deletedAt: null });
      UI.toast("Listing reopened.", "success");
      renderJobsTable();
    })
  );
}

document.addEventListener("DOMContentLoaded", () => {
  user = DB.requireRole("employer");
  if (!user) return;
  UI.renderDashSidebar("dash-sidebar", "employer", "employer-jobs.html", user);
  renderJobsTable();
});
