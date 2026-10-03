/* =========================================================
   db.js — the entire "backend" for Havenwork.
   Plain HTML/CSS/JS has no server, so this file plays the
   role your Next.js API routes + Drizzle/MySQL used to play:
   it stores everything in the browser's localStorage and
   exposes functions that look like backend calls.

   NOTE: this is a client-side demo only. Passwords are not
   hashed, "sessions" are just an id in localStorage, and
   resumes only store the file's name/size (a browser can't
   write files to a server on its own). Swap this file for
   real fetch() calls to a backend when you build one.
   ========================================================= */

const DB = (() => {
  const KEYS = {
    users: "hw_users",
    employers: "hw_employers",
    applicants: "hw_applicants",
    jobs: "hw_jobs",
    applications: "hw_applications",
    resumes: "hw_resumes",
    session: "hw_session",
  };

  function read(key) {
    try {
      return JSON.parse(localStorage.getItem(key)) || [];
    } catch {
      return [];
    }
  }
  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }
  function nextId(rows) {
    return rows.reduce((max, r) => Math.max(max, r.id), 0) + 1;
  }

  /* ---------------- seed data (first run only) ---------------- */
  function daysAgo(n) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString();
  }

  function seed() {
    if (localStorage.getItem("hw_seeded")) return;

    const users = [
      { id: 1, name: "Priya Sharma", userName: "technova", email: "hr@technova.io", password: "password123", role: "employer", phoneNumber: "+1 555 0110", createdAt: daysAgo(120) },
      { id: 2, name: "Marcus Webb", userName: "buildworks", email: "hello@buildworks.co", password: "password123", role: "employer", phoneNumber: "+1 555 0199", createdAt: daysAgo(95) },
      { id: 3, name: "Aiden Cole", userName: "demo", email: "demo@havenwork.dev", password: "password123", role: "applicant", phoneNumber: "+1 555 0142", createdAt: daysAgo(40) },
    ];

    const employers = [
      { id: 1, name: "TechNova Inc.", description: "TechNova builds developer tooling used by teams at over 400 companies. We're a remote-first crew of 60, obsessed with fast feedback loops and calm software.", organizationType: "Product company", teamSize: "51-200", yearOfEstablishment: 2016, websiteUrl: "https://technova.example", location: "Austin, TX" },
      { id: 2, name: "BuildWorks Studio", description: "A design-and-build studio for architecture and construction firms. We ship the software that keeps job sites on schedule.", organizationType: "Agency / Studio", teamSize: "11-50", yearOfEstablishment: 2019, websiteUrl: "https://buildworks.example", location: "Denver, CO" },
    ];

    const applicants = [
      { id: 3, biography: "Front-end leaning full-stack developer, four years in. Likes clean component APIs and terse commit messages.", education: "undergraduate", experience: "3-5 years", location: "Portland, OR", websiteUrl: "" },
    ];

    const tags = (...t) => t.join(", ");
    const jobs = [
      { id: 1, employerId: 1, title: "Senior Frontend Engineer", description: "<p>Own the component library that ships to every TechNova product. You'll pair closely with design and set the technical bar for our React codebase.</p><ul><li>Lead migrations across our design system</li><li>Mentor two mid-level engineers</li><li>Review PRs with an eye for accessibility</li></ul>", tags: tags("React", "TypeScript", "Design Systems"), minSalary: 120000, maxSalary: 155000, salaryCurrency: "USD", salaryPeriod: "yearly", location: "Austin, TX", jobType: "remote", workType: "full-time", jobLevel: "senior level", experience: "5+ years", minEducation: "undergraduate", isFeatured: true, createdAt: daysAgo(3) },
      { id: 2, employerId: 1, title: "Backend Engineer, Platform", description: "<p>Build the APIs that power TechNova's core product. You'll work primarily in Node and Postgres, with a strong focus on reliability.</p>", tags: tags("Node.js", "PostgreSQL", "AWS"), minSalary: 110000, maxSalary: 140000, salaryCurrency: "USD", salaryPeriod: "yearly", location: "Austin, TX", jobType: "hybrid", workType: "full-time", jobLevel: "mid level", experience: "3-5 years", minEducation: "undergraduate", isFeatured: false, createdAt: daysAgo(8) },
      { id: 3, employerId: 1, title: "Product Design Intern", description: "<p>A 12-week paid internship working directly with our design lead on real shipping features.</p>", tags: tags("Figma", "UI Design"), minSalary: 22, maxSalary: 26, salaryCurrency: "USD", salaryPeriod: "hourly", location: "Remote", jobType: "remote", workType: "temporary", jobLevel: "internship", experience: "0-1 years", minEducation: "high school", isFeatured: false, createdAt: daysAgo(1) },
      { id: 4, employerId: 1, title: "Engineering Manager", description: "<p>Lead a team of six engineers across two product squads. This role is equal parts people management and technical direction.</p>", tags: tags("Leadership", "React", "Node.js"), minSalary: 160000, maxSalary: 190000, salaryCurrency: "USD", salaryPeriod: "yearly", location: "Austin, TX", jobType: "on-site", workType: "full-time", jobLevel: "manager", experience: "8+ years", minEducation: "undergraduate", isFeatured: true, createdAt: daysAgo(15) },
      { id: 5, employerId: 2, title: "Site Scheduling Software Developer", description: "<p>Build the scheduling engine our field teams rely on daily. Ruby on Rails backend, Stimulus front end.</p>", tags: tags("Ruby on Rails", "PostgreSQL"), minSalary: 95000, maxSalary: 118000, salaryCurrency: "USD", salaryPeriod: "yearly", location: "Denver, CO", jobType: "hybrid", workType: "full-time", jobLevel: "mid level", experience: "2-4 years", minEducation: "undergraduate", isFeatured: false, createdAt: daysAgo(6) },
      { id: 6, employerId: 2, title: "QA Engineer (Contract)", description: "<p>Six-month contract testing our field-ops mobile app ahead of a major release.</p>", tags: tags("QA", "Mobile", "Automation"), minSalary: 45, maxSalary: 55, salaryCurrency: "USD", salaryPeriod: "hourly", location: "Remote", jobType: "remote", workType: "contract", jobLevel: "junior", experience: "1-3 years", minEducation: "none", isFeatured: false, createdAt: daysAgo(12) },
      { id: 7, employerId: 2, title: "Customer Success Lead", description: "<p>Own onboarding and renewals for our top 30 construction-firm accounts.</p>", tags: tags("Customer Success", "SaaS"), minSalary: 70000, maxSalary: 88000, salaryCurrency: "USD", salaryPeriod: "yearly", location: "Denver, CO", jobType: "on-site", workType: "full-time", jobLevel: "entry level", experience: "1-2 years", minEducation: "undergraduate", isFeatured: false, createdAt: daysAgo(20) },
      { id: 8, employerId: 1, title: "DevOps Engineer", description: "<p>Own CI/CD, observability and cost efficiency across our AWS footprint.</p>", tags: tags("AWS", "Terraform", "Kubernetes"), minSalary: 125000, maxSalary: 150000, salaryCurrency: "USD", salaryPeriod: "yearly", location: "Remote", jobType: "remote", workType: "full-time", jobLevel: "senior level", experience: "4-6 years", minEducation: "undergraduate", isFeatured: false, createdAt: daysAgo(2) },
    ];

    write(KEYS.users, users);
    write(KEYS.employers, employers);
    write(KEYS.applicants, applicants);
    write(KEYS.jobs, jobs);
    write(KEYS.applications, []);
    write(KEYS.resumes, []);
    localStorage.setItem("hw_seeded", "1");
  }

  seed();

  /* ---------------- users / auth ---------------- */
  function findUserByUserName(userName) {
    return read(KEYS.users).find((u) => u.userName.toLowerCase() === userName.toLowerCase());
  }
  function findUserByEmail(email) {
    return read(KEYS.users).find((u) => u.email.toLowerCase() === email.toLowerCase());
  }
  function getUser(id) {
    return read(KEYS.users).find((u) => u.id === id) || null;
  }
  function createUser({ name, userName, email, password, role, phoneNumber }) {
    const users = read(KEYS.users);
    if (findUserByUserName(userName)) throw new Error("That username is already taken.");
    if (findUserByEmail(email)) throw new Error("An account with that email already exists.");
    const user = {
      id: nextId(users),
      name, userName, email, password, role,
      phoneNumber: phoneNumber || "",
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    write(KEYS.users, users);

    if (role === "employer") {
      const employers = read(KEYS.employers);
      employers.push({ id: user.id, name: "", description: "", organizationType: "", teamSize: "", yearOfEstablishment: "", websiteUrl: "", location: "" });
      write(KEYS.employers, employers);
    } else if (role === "applicant") {
      const applicants = read(KEYS.applicants);
      applicants.push({ id: user.id, biography: "", education: "none", experience: "", location: "", websiteUrl: "" });
      write(KEYS.applicants, applicants);
    }
    return user;
  }
  function login(userNameOrEmail, password) {
    const user = findUserByUserName(userNameOrEmail) || findUserByEmail(userNameOrEmail);
    if (!user || user.password !== password) {
      throw new Error("Those credentials don't match an account.");
    }
    localStorage.setItem(KEYS.session, String(user.id));
    return user;
  }
  function logout() {
    localStorage.removeItem(KEYS.session);
  }
  function currentUser() {
    const id = Number(localStorage.getItem(KEYS.session));
    if (!id) return null;
    return getUser(id);
  }
  function requireRole(role) {
    const user = currentUser();
    if (!user || user.role !== role) {
      window.location.href = "login.html";
      return null;
    }
    return user;
  }

  /* ---------------- employer profiles ---------------- */
  function getEmployerProfile(userId) {
    return read(KEYS.employers).find((e) => e.id === userId) || null;
  }
  function updateEmployerProfile(userId, patch) {
    const rows = read(KEYS.employers);
    const i = rows.findIndex((e) => e.id === userId);
    if (i === -1) rows.push({ id: userId, ...patch });
    else rows[i] = { ...rows[i], ...patch };
    write(KEYS.employers, rows);
  }

  /* ---------------- applicant profiles ---------------- */
  function getApplicantProfile(userId) {
    return read(KEYS.applicants).find((a) => a.id === userId) || null;
  }
  function updateApplicantProfile(userId, patch) {
    const rows = read(KEYS.applicants);
    const i = rows.findIndex((a) => a.id === userId);
    if (i === -1) rows.push({ id: userId, ...patch });
    else rows[i] = { ...rows[i], ...patch };
    write(KEYS.applicants, rows);
  }

  /* ---------------- jobs ---------------- */
  function listJobs({ activeOnly = true } = {}) {
    let jobs = read(KEYS.jobs);
    if (activeOnly) jobs = jobs.filter((j) => !j.deletedAt);
    return jobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
  function getJob(id) {
    return read(KEYS.jobs).find((j) => j.id === Number(id)) || null;
  }
  function jobsByEmployer(employerId) {
    return listJobs({ activeOnly: false }).filter((j) => j.employerId === employerId);
  }
  function createJob(employerId, data) {
    const jobs = read(KEYS.jobs);
    const job = { id: nextId(jobs), employerId, isFeatured: false, createdAt: new Date().toISOString(), ...data };
    jobs.push(job);
    write(KEYS.jobs, jobs);
    return job;
  }
  function updateJob(id, patch) {
    const jobs = read(KEYS.jobs);
    const i = jobs.findIndex((j) => j.id === Number(id));
    if (i === -1) return null;
    jobs[i] = { ...jobs[i], ...patch, updatedAt: new Date().toISOString() };
    write(KEYS.jobs, jobs);
    return jobs[i];
  }
  function deleteJob(id) {
    const jobs = read(KEYS.jobs);
    const i = jobs.findIndex((j) => j.id === Number(id));
    if (i === -1) return;
    jobs[i].deletedAt = new Date().toISOString();
    write(KEYS.jobs, jobs);
  }

  /* ---------------- resumes ---------------- */
  function resumesByApplicant(applicantId) {
    return read(KEYS.resumes).filter((r) => r.applicantId === applicantId);
  }
  function addResume(applicantId, { fileName, fileSize }) {
    const resumes = read(KEYS.resumes);
    const resume = {
      id: nextId(resumes), applicantId, fileName, fileSize,
      isPrimary: resumesByApplicant(applicantId).length === 0,
      createdAt: new Date().toISOString(),
    };
    resumes.push(resume);
    write(KEYS.resumes, resumes);
    return resume;
  }

  /* ---------------- applications ---------------- */
  function applicationsByApplicant(applicantId) {
    return read(KEYS.applications)
      .filter((a) => a.applicantId === applicantId)
      .sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
  }
  function applicationsForJob(jobId) {
    return read(KEYS.applications).filter((a) => a.jobId === Number(jobId));
  }
  function applicationsForEmployer(employerId) {
    const jobIds = new Set(jobsByEmployer(employerId).map((j) => j.id));
    return read(KEYS.applications)
      .filter((a) => jobIds.has(a.jobId))
      .sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
  }
  function hasApplied(applicantId, jobId) {
    return read(KEYS.applications).some((a) => a.applicantId === applicantId && a.jobId === Number(jobId));
  }
  function applyToJob({ jobId, applicantId, resumeId, coverLetter }) {
    if (hasApplied(applicantId, jobId)) throw new Error("You've already applied to this job.");
    const apps = read(KEYS.applications);
    const application = {
      id: nextId(apps), jobId: Number(jobId), applicantId, resumeId, coverLetter,
      status: "pending", appliedAt: new Date().toISOString(),
    };
    apps.push(application);
    write(KEYS.applications, apps);
    return application;
  }
  function setApplicationStatus(id, status) {
    const apps = read(KEYS.applications);
    const i = apps.findIndex((a) => a.id === id);
    if (i === -1) return;
    apps[i].status = status;
    write(KEYS.applications, apps);
  }

  function employerFor(job) {
    return getEmployerProfile(job.employerId);
  }

  return {
    KEYS,
    currentUser, requireRole, login, logout, createUser, getUser,
    getEmployerProfile, updateEmployerProfile,
    getApplicantProfile, updateApplicantProfile,
    listJobs, getJob, jobsByEmployer, createJob, updateJob, deleteJob, employerFor,
    resumesByApplicant, addResume,
    applicationsByApplicant, applicationsForJob, applicationsForEmployer, hasApplied, applyToJob, setApplicationStatus,
  };
})();
