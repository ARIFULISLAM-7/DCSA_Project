function redirectForRole(role) {
  const next = UI.qs("next");
  window.location.href = next || (role === "employer" ? "employer-dashboard.html" : "applicant-dashboard.html");
}

document.addEventListener("DOMContentLoaded", () => {
  // if already logged in, bounce straight to the right dashboard
  const existing = DB.currentUser();
  if (existing && (document.getElementById("login-form") || document.getElementById("register-form"))) {
    redirectForRole(existing.role);
    return;
  }

  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      try {
        const user = DB.login(
          document.getElementById("login-id").value.trim(),
          document.getElementById("login-password").value
        );
        UI.toast(`Welcome back, ${user.name.split(" ")[0]}.`, "success");
        redirectForRole(user.role);
      } catch (err) {
        UI.toast(err.message, "danger");
      }
    });
  }

  const registerForm = document.getElementById("register-form");
  if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const role = document.querySelector('input[name="role"]:checked').value;
      try {
        const user = DB.createUser({
          name: document.getElementById("reg-name").value.trim(),
          userName: document.getElementById("reg-username").value.trim(),
          email: document.getElementById("reg-email").value.trim(),
          password: document.getElementById("reg-password").value,
          role,
        });
        DB.login(user.userName, user.password);
        UI.toast("Account created.", "success");
        redirectForRole(user.role);
      } catch (err) {
        UI.toast(err.message, "danger");
      }
    });
  }
});
