let currentUser;

function renderResumes() {
  const resumes = DB.resumesByApplicant(currentUser.id);
  document.getElementById("resume-list").innerHTML = resumes.length
    ? resumes
        .map(
          (r) => `<div class="flex-between" style="padding:10px 0; border-bottom:1px solid var(--line-soft);">
            <div>
              <strong>${UI.escapeHtml(r.fileName)}</strong>
              ${r.isPrimary ? '<span class="tag tag-success" style="margin-left:8px;">Primary</span>' : ""}
              <div class="muted" style="font-size:0.8rem;">${r.fileSize ? Math.round(r.fileSize / 1024) + " KB" : ""} · added ${UI.dateLabel(r.createdAt)}</div>
            </div>
          </div>`
        )
        .join("")
    : `<p class="muted">No resumes uploaded yet.</p>`;
}

document.addEventListener("DOMContentLoaded", () => {
  currentUser = DB.requireRole("applicant");
  if (!currentUser) return;

  UI.renderDashSidebar("dash-sidebar", "applicant", "applicant-settings.html", currentUser);

  const profile = DB.getApplicantProfile(currentUser.id) || {};
  document.getElementById("p-name").value = currentUser.name;
  document.getElementById("p-phone").value = currentUser.phoneNumber || "";
  document.getElementById("p-location").value = profile.location || "";
  document.getElementById("p-education").value = profile.education || "none";
  document.getElementById("p-experience").value = profile.experience || "";
  document.getElementById("p-bio").value = profile.biography || "";
  renderResumes();

  document.getElementById("profile-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem(DB.KEYS.users)) || [];
    const idx = users.findIndex((u) => u.id === currentUser.id);
    if (idx > -1) {
      users[idx].name = document.getElementById("p-name").value.trim();
      users[idx].phoneNumber = document.getElementById("p-phone").value.trim();
      localStorage.setItem(DB.KEYS.users, JSON.stringify(users));
    }
    DB.updateApplicantProfile(currentUser.id, {
      location: document.getElementById("p-location").value.trim(),
      education: document.getElementById("p-education").value,
      experience: document.getElementById("p-experience").value.trim(),
      biography: document.getElementById("p-bio").value.trim(),
    });
    UI.toast("Profile saved.", "success");
  });

  document.getElementById("resume-upload").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    DB.addResume(currentUser.id, { fileName: file.name, fileSize: file.size });
    UI.toast("Resume added.", "success");
    renderResumes();
    e.target.value = "";
  });
});
