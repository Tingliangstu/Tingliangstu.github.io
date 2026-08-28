const PAGE = document.body.dataset.page || "home";
const BASE_PATH = document.body.dataset.basePath || ".";
const DATA_VERSION = "20260828-scholar-sync";

function withBase(path) {
  if (!path) {
    return "";
  }
  if (/^(https?:|mailto:|#)/.test(path) || path.startsWith("../")) {
    return path;
  }
  const prefix = BASE_PATH === "." ? "" : `${BASE_PATH}/`;
  return `${prefix}${path.replace(/^\.\//, "")}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function initMobileNav() {
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector("#site-nav");
  if (!toggle || !nav) {
    return;
  }

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    document.body.classList.toggle("menu-open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      document.body.classList.remove("menu-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

function initReveal() {
  const elements = document.querySelectorAll(".reveal");
  if (!elements.length) {
    return;
  }

  if (!("IntersectionObserver" in window)) {
    elements.forEach((el) => el.classList.add("visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  elements.forEach((el) => observer.observe(el));
}

function formatNumber(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return "0";
  }
  return number.toLocaleString("en-US");
}

function formatDate(value) {
  if (!value || value === "present") {
    return "Present";
  }
  const [year, month] = String(value).split("-");
  return month ? `${year}.${month}` : year;
}

function formatRange(item = {}) {
  const start = formatDate(item.start);
  const end = item.end ? formatDate(item.end) : "Present";
  return `${start} - ${end}`;
}

function setText(id, value) {
  const el = document.querySelector(`#${id}`);
  if (el && value !== undefined && value !== null) {
    el.textContent = String(value);
  }
}

function setHref(id, value) {
  const el = document.querySelector(`#${id}`);
  if (el && value) {
    el.setAttribute("href", withBase(value));
  }
}

function setMail(id, email) {
  const el = document.querySelector(`#${id}`);
  if (el && email) {
    el.textContent = email;
    el.setAttribute("href", `mailto:${email}`);
  }
}

function hydrateProfile(profile = {}) {
  setHref("hero-cv-link", profile.cv_url);
  setHref("contact-cv-link", profile.cv_url);
  setHref("contact-scholar-link", profile.scholar_url);
  setHref("contact-github-link", profile.github_url);
  setHref("contact-orcid-link", profile.orcid_url);
  setHref("home-scholar-link", profile.scholar_url);
  setHref("home-github-link", profile.github_url);
  setHref("home-researchgate-link", profile.researchgate_url);
  setHref("profile-scholar-link", profile.scholar_url);
  setHref("profile-github-link", profile.github_url);
  setHref("profile-researchgate-link", profile.researchgate_url);
  setHref("profile-orcid-link", profile.orcid_url);
  setHref("software-github-link", profile.github_url);
  setHref("software-github-link-inline", profile.github_url);
  setHref("publication-scholar-link", profile.scholar_url);

  setText("contact-name", profile.name);
  setText("contact-affiliation", profile.affiliation);
  setText("contact-location", profile.affiliation);
  setMail("primary-email-link", profile.email);
  setMail("backup-email-link", profile.backup_email);

  const stats = profile.stats || {};
  setText("publication-hero-count", formatNumber(stats.publications));
}

function roleLabel(role) {
  const map = {
    "first-author": "First author",
    "co-first-author": "Co-first author",
    "corresponding-author": "Corresponding author",
    "co-author": "Co-author"
  };
  return map[role] || role || "";
}

function roleLabels(item = {}) {
  const roles = Array.isArray(item.roles) && item.roles.length ? item.roles : [item.role];
  return roles.map(roleLabel).filter(Boolean);
}

function hasRole(item = {}, role) {
  const roles = Array.isArray(item.roles) && item.roles.length ? item.roles : [item.role];
  return roles.includes(role);
}

function resolvePrimaryLink(item = {}) {
  const links = item.links || {};
  return links.journal || links.doi || links.scholar || links.code || "";
}

function renderTitle(title, href, cls = "publication-title") {
  const safeTitle = title || "Untitled";
  if (!href) {
    return `<h3 class="${cls}">${safeTitle}</h3>`;
  }
  return `<h3 class="${cls}"><a class="paper-title-link" href="${href}" target="_blank" rel="noreferrer">${safeTitle}</a></h3>`;
}

function renderLinks(item = {}) {
  const links = item.links || {};
  const rows = [];
  if (links.journal) {
    rows.push(`<a href="${links.journal}" target="_blank" rel="noreferrer">Journal</a>`);
  }
  if (links.doi) {
    rows.push(`<a href="${links.doi}" target="_blank" rel="noreferrer">DOI</a>`);
  }
  if (links.code) {
    rows.push(`<a href="${links.code}" target="_blank" rel="noreferrer">Code</a>`);
  }
  if (links.dataset) {
    rows.push(`<a href="${links.dataset}" target="_blank" rel="noreferrer">Dataset</a>`);
  }
  if (links.pdf) {
    rows.push(`<a href="${links.pdf}" target="_blank" rel="noreferrer">PDF</a>`);
  }
  if (links.scholar) {
    rows.push(`<a href="${links.scholar}" target="_blank" rel="noreferrer">Scholar</a>`);
  }
  return rows.join("");
}

function renderStats(profile = {}) {
  const host = document.querySelector("#publication-stats");
  if (!host) {
    return;
  }
  const stats = profile.stats || {};
  const rows = [
    ["Works", stats.publications],
    ["Scholar citations", stats.cited_by],
    ["h-index", stats.h_index],
    ["i10-index", stats.i10_index]
  ];
  host.innerHTML = rows
    .map(([label, value]) => `
<div class="stat-box">
  <span class="stat-value">${formatNumber(value)}</span>
  <span class="stat-label">${label}</span>
</div>`)
    .join("");
}

function renderTimeline(hostId, items = []) {
  const host = document.querySelector(`#${hostId}`);
  if (!host) {
    return;
  }
  if (!items.length) {
    host.innerHTML = `<p class="meta">No public records available.</p>`;
    return;
  }
  host.innerHTML = items
    .map((item) => {
      const supervisor = item.supervisor
        ? item.supervisor_url
          ? `<span class="timeline-meta">Supervisor: <a href="${withBase(item.supervisor_url)}" target="_blank" rel="noreferrer">${escapeHtml(item.supervisor)}</a></span>`
          : `<span class="timeline-meta">Supervisor: ${escapeHtml(item.supervisor)}</span>`
        : "";
      return `
<div class="timeline-item">
  <span class="timeline-date">${formatRange(item)}</span>
  <span class="timeline-title">${escapeHtml(item.role || "")}</span>
  <span class="timeline-meta">${escapeHtml(item.organization || "")}</span>
  ${item.area ? `<span class="timeline-meta">${escapeHtml(item.area)}</span>` : ""}
  ${item.location ? `<span class="timeline-meta">${escapeHtml(item.location)}</span>` : ""}
  ${supervisor}
</div>`;
    })
    .join("");
}

function researchCardData(profile = {}) {
  const tags = profile.research_interests || [];
  const focus = profile.research_focus || [];
  return tags.map((title, index) => ({
    title,
    body: focus[index] || title
  }));
}

function renderResearchCards(hostId, profile = {}) {
  const host = document.querySelector(`#${hostId}`);
  if (!host) {
    return;
  }
  const items = researchCardData(profile);
  host.innerHTML = items
    .map((item, index) => `
<article class="feature-card reveal">
  <span>0${index + 1}</span>
  <h3>${escapeHtml(item.title)}</h3>
  <p>${escapeHtml(item.body)}</p>
</article>`)
    .join("");
  initReveal();
}

function renderKeywordChips(hostId, keywords = []) {
  const host = document.querySelector(`#${hostId}`);
  if (!host) {
    return;
  }
  host.innerHTML = keywords.map((item) => `<span class="chip">${escapeHtml(item)}</span>`).join("");
}

function renderNews(news, limit = news.length) {
  const host = document.querySelector("#news-list");
  if (!host) {
    return;
  }
  const items = Array.isArray(news) ? news.slice(0, limit) : [];
  if (!items.length) {
    host.innerHTML = "<li>No news items yet.</li>";
    return;
  }
  host.innerHTML = items
    .map((item) => {
      const title = escapeHtml(item.title || item.text || "");
      const titleHtml = item.url
        ? `<a href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer">${title}</a>`
        : title;
      const detailHtml = item.detail
        ? `<p class="news-detail">${escapeHtml(item.detail)}</p>`
        : "";
      return `
<li>
  <time datetime="${escapeHtml(item.datetime || "")}">${escapeHtml(item.date || "")}</time>
  <div class="news-content">
    <p class="news-title">${titleHtml}</p>
    ${detailHtml}
  </div>
</li>`;
    })
    .join("");
}

function summaryHtml(summary) {
  if (!summary || /^Please add/i.test(summary)) {
    return "";
  }
  return `<p class="work-summary">${summary}</p>`;
}

function renderWorkCard(item = {}) {
  const titleLink = resolvePrimaryLink(item);
  const icon = withBase(item.icon || "assets/img/work-placeholder.svg");
  return `
<article class="work-card reveal">
  <img class="work-thumb" src="${icon}" alt="Representative work visual" onerror="this.src='${withBase("assets/img/work-placeholder.svg")}'">
  ${renderTitle(item.title, titleLink, "work-title")}
  <p class="work-meta">${item.authors || ""}</p>
  <p class="work-meta">${item.venue || ""} (${item.year || "n.d."})</p>
  ${summaryHtml(item.summary)}
  <div class="publication-links">${renderLinks(item)}</div>
</article>`;
}

function renderRepresentativeWorks(works, limit = 6) {
  const host = document.querySelector("#representative-works-list");
  if (!host) {
    return;
  }
  const items = Array.isArray(works) ? works.slice(0, limit) : [];
  if (!items.length) {
    host.innerHTML = "<p>Representative works will appear here.</p>";
    return;
  }
  host.innerHTML = items.map(renderWorkCard).join("");
  initReveal();
}

function renderSoftwareCard(item = {}) {
  const starText = Number.isFinite(item.stars) ? `${item.stars} stars` : "";
  const logoHtml = item.logo
    ? `<img class="software-logo" src="${withBase(item.logo)}" alt="${escapeHtml(item.name || "Software")} logo" onerror="this.src='${withBase("assets/img/work-placeholder.svg")}'">`
    : `<div class="software-logo software-logo-wordmark" role="img" aria-label="${escapeHtml(item.name || "Software")} logo">${escapeHtml(item.logo_text || item.name || "Software")}</div>`;
  return `
<article class="software-card reveal">
  ${logoHtml}
  <div class="software-content">
    <h3 class="software-title">${escapeHtml(item.name || "")}</h3>
    <p class="software-tagline">${escapeHtml(item.tagline || "")}</p>
    <p class="software-description">${escapeHtml(item.description || "")}</p>
    <p class="software-meta">${escapeHtml(item.language || "")}${item.language && starText ? " / " : ""}${starText}</p>
    <div class="publication-links">
      ${item.repository ? `<a href="${item.repository}" target="_blank" rel="noreferrer">GitHub</a>` : ""}
      ${item.homepage ? `<a href="${item.homepage}" target="_blank" rel="noreferrer">Docs</a>` : ""}
      ${item.paper ? `<a href="${item.paper}" target="_blank" rel="noreferrer">Paper</a>` : ""}
      ${item.publications ? `<a href="${item.publications}" target="_blank" rel="noreferrer">Publications</a>` : ""}
    </div>
  </div>
</article>`;
}

function renderSoftware(software, hostId, limit = software.length) {
  const host = document.querySelector(`#${hostId}`);
  if (!host) {
    return;
  }
  const items = Array.isArray(software) ? software.slice(0, limit) : [];
  if (!items.length) {
    host.innerHTML = "<p>No software entries yet.</p>";
    return;
  }
  host.innerHTML = items.map(renderSoftwareCard).join("");
  initReveal();
}

function safeYear(value) {
  return Number.isFinite(value) ? value : 0;
}

function sortPublications(items) {
  const rolePriority = {
    "first-author": 0,
    "co-first-author": 1,
    "corresponding-author": 2,
    "co-author": 3
  };

  return [...items].sort((a, b) => {
    const yearDiff = safeYear(b.year) - safeYear(a.year);
    if (yearDiff !== 0) {
      return yearDiff;
    }
    const roleDiff = (rolePriority[a.role] ?? 99) - (rolePriority[b.role] ?? 99);
    if (roleDiff !== 0) {
      return roleDiff;
    }
    return (a.title || "").localeCompare(b.title || "");
  });
}

function groupByYear(items) {
  const map = new Map();
  items.forEach((item) => {
    const key = String(item.year || "Unknown");
    const arr = map.get(key) || [];
    arr.push(item);
    map.set(key, arr);
  });
  return map;
}

function renderPublicationItem(item, index) {
  const primaryLink = resolvePrimaryLink(item);
  const year = item.year ? String(item.year) : "n.d.";
  const roles = roleLabels(item);
  const roleText = roles.length ? ` / ${roles.join(" / ")}` : "";
  const roleTags = roles.map((role) => `<span class="publication-tag">${escapeHtml(role)}</span>`).join("");
  const citation = Number.isFinite(item.citations) ? `<span class="publication-tag">${formatNumber(item.citations)} citations</span>` : "";
  const source = item.source ? `<span class="publication-tag">${escapeHtml(item.source)}</span>` : "";
  return `
<article class="publication-item publication-item-biblio">
  <div class="publication-index">[${index}]</div>
  <div class="publication-body">
    ${renderTitle(item.title, primaryLink, "publication-title")}
    <p class="publication-authors">${item.authors || ""}</p>
    <p class="publication-venue"><em>${item.venue || ""}</em> (${year})${roleText}</p>
    <div class="publication-links">
      ${renderLinks(item)}
      ${item.selected ? '<span class="publication-tag">Representative</span>' : ""}
      ${roleTags}
      ${citation}
      ${source}
    </div>
  </div>
</article>`;
}

function renderAllPublications(items, filters = {}) {
  const host = document.querySelector("#publications-list");
  const countHost = document.querySelector("#publication-count");
  if (!host) {
    return;
  }

  const year = filters.year || "all";
  const role = filters.role || "all";
  const selectedOnly = Boolean(filters.selectedOnly);

  const filtered = sortPublications(
    items.filter((item) => {
      const yearMatch = year === "all" || String(item.year) === year;
      const roleMatch = role === "all" || hasRole(item, role);
      const selectedMatch = !selectedOnly || Boolean(item.selected);
      return yearMatch && roleMatch && selectedMatch;
    })
  );

  if (countHost) {
    countHost.textContent = `${filtered.length} entries shown`;
  }

  if (!filtered.length) {
    host.innerHTML = "<p>No publications found for this filter.</p>";
    return;
  }

  const grouped = groupByYear(filtered);
  const years = [...grouped.keys()].sort((a, b) => {
    if (a === "Unknown") {
      return 1;
    }
    if (b === "Unknown") {
      return -1;
    }
    return Number(b) - Number(a);
  });

  let counter = 1;
  host.innerHTML = years
    .map((yearValue) => {
      const entries = grouped.get(yearValue) || [];
      const html = entries.map((entry) => {
        const current = counter;
        counter += 1;
        return renderPublicationItem(entry, current);
      });
      return `<h2 class="publication-year-block">${yearValue}</h2>${html.join("")}`;
    })
    .join("");
}

function fillYearFilter(items) {
  const select = document.querySelector("#year-filter");
  if (!select) {
    return;
  }
  const years = [...new Set(items.map((item) => item.year).filter((val) => Number.isFinite(val)))].sort((a, b) => b - a);
  years.forEach((y) => {
    const op = document.createElement("option");
    op.value = String(y);
    op.textContent = String(y);
    select.appendChild(op);
  });
}

function initPublicationFilters(publications) {
  fillYearFilter(publications);
  const yearFilter = document.querySelector("#year-filter");
  const roleFilter = document.querySelector("#role-filter");
  const selectedOnly = document.querySelector("#selected-only");

  const rerender = () => {
    renderAllPublications(publications, {
      year: yearFilter ? yearFilter.value : "all",
      role: roleFilter ? roleFilter.value : "all",
      selectedOnly: selectedOnly ? selectedOnly.checked : false
    });
  };

  rerender();
  yearFilter?.addEventListener("change", rerender);
  roleFilter?.addEventListener("change", rerender);
  selectedOnly?.addEventListener("change", rerender);
}

function renderPeerReviewSummary(profile = {}) {
  const host = document.querySelector("#peer-review-summary");
  if (!host) {
    return;
  }
  const summary = profile.peer_review_summary || {};
  host.innerHTML = `
<strong>${formatNumber(summary.reviews || 0)}</strong>
<span>reviews across ${formatNumber(summary.items || 0)} ORCID peer-review items.</span>
${summary.source ? `<p class="meta">Source: ${escapeHtml(summary.source)}</p>` : ""}`;
}

function renderSourceNotes(profile = {}) {
  const host = document.querySelector("#source-notes");
  if (!host) {
    return;
  }
  const notes = profile.source_notes || [];
  host.innerHTML = notes.map((note) => `<p>${escapeHtml(note)}</p>`).join("");
}

function renderHome(data = {}) {
  const profile = data.profile || {};
  const careerItems = [...(profile.employment || []), ...(profile.education || [])].sort((a, b) =>
    String(b.start || "").localeCompare(String(a.start || ""))
  );
  renderTimeline("home-profile-timeline", careerItems);
  renderResearchCards("research-preview-list", profile);
  renderNews(data.news || [], 5);
  renderSoftware(data.software || [], "software-preview", 3);
  renderRepresentativeWorks(data.representative_works || [], 6);
}

function renderResearch(data = {}) {
  const profile = data.profile || {};
  renderResearchCards("research-focus-list", profile);
  renderKeywordChips("research-keywords", profile.research_interests || []);
}

function renderSoftwarePage(data = {}) {
  renderSoftware(data.software || [], "software-list");
}

function renderContact(data = {}) {
  const profile = data.profile || {};
  renderTimeline("employment-list", profile.employment || []);
  renderPeerReviewSummary(profile);
  renderSourceNotes(profile);
}

function renderPublicationsPage(data = {}) {
  renderStats(data.profile || {});
  const publications = Array.isArray(data.publications) ? data.publications : [];
  initPublicationFilters(publications);
}

function fillCurrentYear() {
  setText("current-year", String(new Date().getFullYear()));
}

function renderLoadError(message) {
  const targets = [
    "#publication-stats",
    "#home-profile-timeline",
    "#research-preview-list",
    "#news-list",
    "#software-preview",
    "#representative-works-list",
    "#research-focus-list",
    "#software-list",
    "#employment-list",
    "#publications-list"
  ];
  targets.forEach((selector) => {
    const host = document.querySelector(selector);
    if (host) {
      host.innerHTML = `<p class="meta">Could not load data (${escapeHtml(message)}).</p>`;
    }
  });
}

async function loadPublicationData() {
  const dataPath = `${withBase("data/publications.json")}?v=${DATA_VERSION}`;
  try {
    const response = await fetch(dataPath, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    hydrateProfile(data.profile || {});

    if (PAGE === "home") {
      renderHome(data);
    } else if (PAGE === "research") {
      renderResearch(data);
    } else if (PAGE === "software") {
      renderSoftwarePage(data);
    } else if (PAGE === "contact") {
      renderContact(data);
    } else if (PAGE === "publications") {
      renderPublicationsPage(data);
    }
  } catch (error) {
    renderLoadError(error.message);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  fillCurrentYear();
  initMobileNav();
  initReveal();
  loadPublicationData();
});
