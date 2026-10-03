document.addEventListener("DOMContentLoaded", () => {
  const user = DB.requireRole("employer");
  if (!user) return;
  UI.renderDashSidebar("dash-sidebar", "employer", "employer-settings.html", user);

  const profile = DB.getEmployerProfile(user.id) || {};
  document.getElementById("e-name").value = profile.name || "";
  document.getElementById("e-description").value = profile.description || "";
  document.getElementById("e-orgType").value = profile.organizationType || "";
  document.getElementById("e-teamSize").value = profile.teamSize || "";
  document.getElementById("e-year").value = profile.yearOfEstablishment || "";
  document.getElementById("e-location").value = profile.location || "";
  document.getElementById("e-website").value = profile.websiteUrl || "";

  document.getElementById("employer-form").addEventListener("submit", (e) => {
    e.preventDefault();
    DB.updateEmployerProfile(user.id, {
      name: document.getElementById("e-name").value.trim(),
      description: document.getElementById("e-description").value.trim(),
      organizationType: document.getElementById("e-orgType").value.trim(),
      teamSize: document.getElementById("e-teamSize").value.trim(),
      yearOfEstablishment: Number(document.getElementById("e-year").value) || null,
      location: document.getElementById("e-location").value.trim(),
      websiteUrl: document.getElementById("e-website").value.trim(),
    });
    UI.toast("Company profile saved.", "success");
  });
});
