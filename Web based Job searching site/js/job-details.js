function renderJobDetails() {
  const id = UI.qs("id");
  const job = DB.getJob(id);
  const root = document.getElementById("job-details-root");

  if (!job) {
    root.innerHTML = `<div class="empty-state" style="margin-top:40px;"><h3>Job not found</h3><p>It may have been closed by the employer.</p><a href="jobs.html" class="btn btn-primary">Back to jobs</a></div>`;
    return;
  }

  const employer = DB.employerFor(job) || {};
  const user = DB.currentUser();
  const alreadyApplied = user && user.role === "applicant" && DB.hasApplied(user.id, job.id);

  root.innerHTML = `
    <div class="page-head" style="padding-top:32px;">
      <a href="jobs.html" class="muted">‹ Back to all jobs</a>
    </div>

    <div class="layout-with-sidebar" style="margin-top:14px;">
      <div>
        <div class="panel">
          <div class="flex-between">
            <div style="display:flex; gap:16px; align-items:flex-start;">
              <div class="company-mark" style="width:56px; height:56px; font-size:1.2rem;">${UI.initials(employer.name || "?")}</div>
              <div>
                <h1 style="margin-bottom:2px; font-size:1.5rem;">${UI.escapeHtml(job.title)}</h1>
                <p class="muted" style="margin:0;">${UI.escapeHtml(employer.name || "Unnamed company")} · ${UI.escapeHtml(job.location || "Location not set")}</p>
              </div>
            </div>
            ${job.isFeatured ? '<span class="featured-ribbon">Featured</span>' : ""}
          </div>

          <div class="tags" style="margin:18px 0;">
            <span class="tag tag-accent">${UI.escapeHtml(job.workType || "—")}</span>
            <span class="tag">${UI.escapeHtml(job.jobType || "—")}</span>
            <span class="tag tag-muted">${UI.escapeHtml(job.jobLevel || "—")}</span>
          </div>

          <p class="salary" style="font-size:1.15rem;">${UI.money(job.minSalary, job.maxSalary, job.salaryCurrency, job.salaryPeriod)}</p>
          <p class="muted" style="margin-top:-8px;">Posted ${UI.timeAgo(job.createdAt)}</p>

          <hr class="divider" />
          <h3>About the role</h3>
          <div class="job-description">${job.description || "<p>No description provided.</p>"}</div>

          ${job.experience ? `<h3>Experience</h3><p>${UI.escapeHtml(job.experience)}</p>` : ""}
          ${job.minEducation ? `<p><strong>Minimum education:</strong> ${UI.escapeHtml(job.minEducation)}</p>` : ""}

          ${(job.tags || "").trim() ? `<h3>Skills &amp; tags</h3><div class="tags">${job.tags.split(",").filter(Boolean).map((t) => `<span class="tag">${UI.escapeHtml(t.trim())}</span>`).join("")}</div>` : ""}
        </div>
      </div>

      <aside>
        <div class="panel">
          <button class="btn btn-primary btn-block" id="apply-btn" ${alreadyApplied ? "disabled" : ""}>
            ${alreadyApplied ? "Application submitted" : "Apply for this job"}
          </button>
          ${!user ? '<p class="hint" style="margin-top:10px;">You\'ll need to <a href="login.html">log in</a> as a candidate first.</p>' : ""}
        </div>
        <div class="panel">
          <h3>About ${UI.escapeHtml(employer.name || "the company")}</h3>
          <p class="muted">${UI.escapeHtml(employer.description || "This employer hasn't added a description yet.")}</p>
          <hr class="divider" />
          <p style="margin:0 0 6px;"><strong>Industry:</strong> ${UI.escapeHtml(employer.organizationType || "—")}</p>
          <p style="margin:0 0 6px;"><strong>Team size:</strong> ${UI.escapeHtml(employer.teamSize || "—")}</p>
          <p style="margin:0;"><strong>Founded:</strong> ${UI.escapeHtml(String(employer.yearOfEstablishment || "—"))}</p>
        </div>
      </aside>
    </div>`;

  document.getElementById("apply-btn")?.addEventListener("click", () => openApplyModal(job));
}

function openApplyModal(job) {
  const user = DB.currentUser();
  if (!user) {
    window.location.href = `login.html?next=job-details.html?id=${job.id}`;
    return;
  }
  if (user.role !== "applicant") {
    UI.toast("Only candidate accounts can apply to jobs.", "danger");
    return;
  }

  const resumes = DB.resumesByApplicant(user.id);
  const overlay = UI.openModal(`
    <div class="flex-between">
      <h3 style="margin:0;">Apply to ${UI.escapeHtml(job.title)}</h3>
      <button class="modal-close" id="modal-close-btn">&times;</button>
    </div>
    <p class="muted">${UI.escapeHtml(DB.employerFor(job)?.name || "")}</p>
    <form id="apply-form">
      <div class="field">
        <label>Resume</label>
        ${
          resumes.length
            ? `<select id="resume-select">${resumes.map((r) => `<option value="${r.id}">${UI.escapeHtml(r.fileName)}</option>`).join("")}</select>`
            : `<p class="hint">No resume on file yet — upload one below.</p>`
        }
      </div>
      <div class="field">
        <label>${resumes.length ? "Or upload a new resume" : "Upload your resume"}</label>
        <input type="file" id="resume-file" accept=".pdf,.doc,.docx" />
      </div>
      <div class="field">
        <label>Cover letter (optional)</label>
        <textarea id="cover-letter" placeholder="A couple of sentences on why you're a fit..."></textarea>
      </div>
      <button type="submit" class="btn btn-primary btn-block">Submit application</button>
    </form>
  `);

  overlay.querySelector("#modal-close-btn").addEventListener("click", UI.closeModal);
  overlay.querySelector("#apply-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const fileInput = overlay.querySelector("#resume-file");
    let resumeId = overlay.querySelector("#resume-select")?.value ? Number(overlay.querySelector("#resume-select").value) : null;

    if (fileInput.files[0]) {
      const file = fileInput.files[0];
      const resume = DB.addResume(user.id, { fileName: file.name, fileSize: file.size });
      resumeId = resume.id;
    }
    if (!resumeId) {
      UI.toast("Add a resume before applying.", "danger");
      return;
    }

    try {
      DB.applyToJob({
        jobId: job.id,
        applicantId: user.id,
        resumeId,
        coverLetter: overlay.querySelector("#cover-letter").value.trim(),
      });
      UI.closeModal();
      UI.toast("Application submitted!", "success");
      renderJobDetails();
    } catch (err) {
      UI.toast(err.message, "danger");
    }
  });
}

document.addEventListener("DOMContentLoaded", renderJobDetails);
