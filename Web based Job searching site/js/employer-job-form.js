document.addEventListener("DOMContentLoaded", () => {
  const user = DB.requireRole("employer");
  if (!user) return;

  const jobId = UI.qs("id");
  const editing = !!jobId;
  UI.renderDashSidebar("dash-sidebar", "employer", editing ? "employer-jobs.html" : "employer-job-form.html", user);

  // mini rich-text toolbar (contenteditable + execCommand, standing in for Tiptap)
  document.querySelectorAll(".editor-toolbar button").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.getElementById("j-description").focus();
      document.execCommand(btn.dataset.cmd, false, btn.dataset.value || null);
    });
  });
  const editor = document.getElementById("j-description");
  const togglePlaceholder = () => editor.classList.toggle("is-empty", editor.innerHTML.trim() === "");
  editor.addEventListener("input", togglePlaceholder);

  let job = null;
  if (editing) {
    job = DB.getJob(jobId);
    if (!job || job.employerId !== user.id) {
      UI.toast("That job doesn't belong to your account.", "danger");
      window.location.href = "employer-jobs.html";
      return;
    }
    document.getElementById("form-title").textContent = "Edit job";
    document.getElementById("submit-btn").textContent = "Save changes";
    document.getElementById("j-title").value = job.title;
    editor.innerHTML = job.description || "";
    document.getElementById("j-tags").value = job.tags || "";
    document.getElementById("j-location").value = job.location || "";
    document.getElementById("j-jobType").value = job.jobType || "remote";
    document.getElementById("j-workType").value = job.workType || "full-time";
    document.getElementById("j-jobLevel").value = job.jobLevel || "mid level";
    document.getElementById("j-minSalary").value = job.minSalary || "";
    document.getElementById("j-maxSalary").value = job.maxSalary || "";
    document.getElementById("j-salaryCurrency").value = job.salaryCurrency || "USD";
    document.getElementById("j-salaryPeriod").value = job.salaryPeriod || "yearly";
    document.getElementById("j-experience").value = job.experience || "";
    document.getElementById("j-minEducation").value = job.minEducation || "none";
    document.getElementById("j-featured").checked = !!job.isFeatured;
  }
  togglePlaceholder();

  document.getElementById("job-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const title = document.getElementById("j-title").value.trim();
    const description = editor.innerHTML.trim();
    if (!title || !description) {
      UI.toast("Title and description are required.", "danger");
      return;
    }

    const payload = {
      title,
      description,
      tags: document.getElementById("j-tags").value.trim(),
      location: document.getElementById("j-location").value.trim(),
      jobType: document.getElementById("j-jobType").value,
      workType: document.getElementById("j-workType").value,
      jobLevel: document.getElementById("j-jobLevel").value,
      minSalary: Number(document.getElementById("j-minSalary").value) || null,
      maxSalary: Number(document.getElementById("j-maxSalary").value) || null,
      salaryCurrency: document.getElementById("j-salaryCurrency").value,
      salaryPeriod: document.getElementById("j-salaryPeriod").value,
      experience: document.getElementById("j-experience").value.trim(),
      minEducation: document.getElementById("j-minEducation").value,
      isFeatured: document.getElementById("j-featured").checked,
    };

    if (editing) {
      DB.updateJob(job.id, payload);
      UI.toast("Job updated.", "success");
    } else {
      const created = DB.createJob(user.id, payload);
      UI.toast("Job published.", "success");
      job = created;
    }
    window.location.href = "employer-jobs.html";
  });
});
