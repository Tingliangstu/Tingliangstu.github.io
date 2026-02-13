function initMobileNav() {
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector("#site-nav");
  if (!toggle || !nav) {
    return;
  }

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });
}

function initReveal() {
  const elements = document.querySelectorAll(".reveal");
  if (!elements.length) {
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
    { threshold: 0.1 }
  );

  elements.forEach((el) => observer.observe(el));
}

function formatNumber(value) {
  if (!Number.isFinite(value)) {
    return "0";
  }
  return value.toLocaleString("en-US");
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
    el.setAttribute("href", value);
  }
}

function updateKeywords(keywords) {
  const host = document.querySelector("#research-keywords");
  if (!host || !Array.isArray(keywords)) {
    return;
  }
  host.innerHTML = keywords.map((item) => `<span class="chip">${item}</span>`).join("");
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

function hydrateHomeProfile(profile = {}) {
  setHref("scholar-link", profile.scholar_url);
  setHref("github-link", profile.github_url);
  setHref("orcid-link", profile.orcid_url);
  setHref("cv-link", profile.cv_url);
  setHref("contact-scholar-link", profile.scholar_url);
  setHref("contact-github-link", profile.github_url);
  setHref("contact-orcid-link", profile.orcid_url);
  setHref("contact-cv-link", profile.cv_url);
  setHref("peer-orcid-link", profile.orcid_url);

  setText("affiliation-text", profile.affiliation);
  setText("email-text", profile.email);
  setText("backup-email-text", profile.backup_email);

  const stats = profile.stats || {};
  setText("stat-publications", formatNumber(stats.publications));
  setText("stat-citations", formatNumber(stats.cited_by));
  setText("stat-hindex", formatNumber(stats.h_index));
  setText("stat-i10", formatNumber(stats.i10_index));

  updateKeywords(profile.research_interests || []);
}

function resolvePrimaryLink(item = {}) {
  const links = item.links || {};
  return links.journal || links.doi || links.scholar || "";
}

function renderTitle(title, href, cls = "publication-title") {
  if (!href) {
    return `<h3 class="${cls}">${title}</h3>`;
  }
  return `<h3 class="${cls}"><a class="paper-title-link" href="${href}" target="_blank" rel="noreferrer">${title}</a></h3>`;
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
  if (links.pdf) {
    rows.push(`<a href="${links.pdf}" target="_blank" rel="noreferrer">PDF</a>`);
  }
  if (links.scholar) {
    rows.push(`<a href="${links.scholar}" target="_blank" rel="noreferrer">Scholar</a>`);
  }
  return rows.join("");
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

function renderNews(news) {
  const host = document.querySelector("#news-list");
  if (!host) {
    return;
  }
  if (!Array.isArray(news) || !news.length) {
    host.innerHTML = "<li>No news items yet.</li>";
    return;
  }

  host.innerHTML = news
    .map((item) => `<li><time>${item.date || ""}</time> ${item.text || ""}</li>`)
    .join("");
}

function renderRepresentativeWorks(works) {
  const host = document.querySelector("#representative-works-list");
  if (!host) {
    return;
  }
  if (!Array.isArray(works) || !works.length) {
    host.innerHTML = "<p>Representative works will appear here.</p>";
    return;
  }

  host.innerHTML = works
    .map((item) => {
      const titleLink = resolvePrimaryLink(item);
      const icon = item.icon || "assets/img/work-placeholder.svg";
      return `
<article class="work-card">
  <img class="work-thumb" src="${icon}" alt="Representative work icon" onerror="this.src='assets/img/work-placeholder.svg'">
  ${renderTitle(item.title, titleLink, "work-title")}
  <p class="work-meta">${item.authors || ""}</p>
  <p class="work-meta">${item.venue || ""} (${item.year || "n.d."})</p>
  <p class="work-summary">${item.summary || ""}</p>
  <div class="publication-links">${renderLinks(item)}</div>
</article>
`;
    })
    .join("");
}

function renderSoftware(software) {
  const host = document.querySelector("#software-list");
  if (!host) {
    return;
  }
  if (!Array.isArray(software) || !software.length) {
    host.innerHTML = "<p>No software entries yet.</p>";
    return;
  }

  host.innerHTML = software
    .map((item) => {
      const starText = Number.isFinite(item.stars) ? `${item.stars} stars` : "";
      return `
<article class="software-card">
  <img class="software-logo" src="${item.logo || "assets/img/work-placeholder.svg"}" alt="${item.name || "Software"} logo" onerror="this.src='assets/img/work-placeholder.svg'">
  <div class="software-content">
    <h3 class="software-title">${item.name || ""}</h3>
    <p class="software-tagline">${item.tagline || ""}</p>
    <p class="software-description">${item.description || ""}</p>
    <p class="software-meta">${item.language || ""}${item.language && starText ? " | " : ""}${starText}</p>
    <div class="publication-links">
      ${item.repository ? `<a href="${item.repository}" target="_blank" rel="noreferrer">GitHub</a>` : ""}
      ${item.homepage ? `<a href="${item.homepage}" target="_blank" rel="noreferrer">Docs</a>` : ""}
      ${item.paper ? `<a href="${item.paper}" target="_blank" rel="noreferrer">Paper</a>` : ""}
      ${item.publications ? `<a href="${item.publications}" target="_blank" rel="noreferrer">Publications</a>` : ""}
    </div>
  </div>
</article>
`;
    })
    .join("");
}

function renderPeerReviews(reviews) {
  const host = document.querySelector("#peer-reviews-list");
  if (!host) {
    return;
  }
  if (!Array.isArray(reviews) || !reviews.length) {
    host.innerHTML = "<li>No peer-review records available.</li>";
    return;
  }

  host.innerHTML = reviews
    .map((item) => `<li><span>${item.journal}</span><strong>${item.count}</strong></li>`)
    .join("");
}

function renderPublicationItem(item, index) {
  const primaryLink = resolvePrimaryLink(item);
  const year = item.year ? String(item.year) : "n.d.";
  const role = roleLabel(item.role);
  return `
<article class="publication-item publication-item-biblio">
  <div class="publication-index">[${index}]</div>
  <div class="publication-body">
    ${renderTitle(item.title, primaryLink, "publication-title")}
    <p class="publication-authors">${item.authors || ""}</p>
    <p class="publication-venue"><em>${item.venue || ""}</em> (${year})${role ? ` | ${role}` : ""}</p>
    <div class="publication-links">
      ${renderLinks(item)}
      ${item.selected ? '<span class="publication-tag">Representative</span>' : ""}
    </div>
  </div>
</article>
`;
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
      const roleMatch = role === "all" || item.role === role;
      const selectedMatch = !selectedOnly || Boolean(item.selected);
      return yearMatch && roleMatch && selectedMatch;
    })
  );

  if (countHost) {
    countHost.textContent = `${filtered.length} entries`;
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
      return `<h3 class="publication-year-block">${yearValue}</h3>${html.join("")}`;
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

async function loadPublicationData() {
  const page = document.body.dataset.page;
  if (!["home", "publications"].includes(page)) {
    return;
  }

  const dataPath = page === "publications" ? "../data/publications.json" : "data/publications.json";
  try {
    const response = await fetch(dataPath);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    const profile = data.profile || {};
    const publications = Array.isArray(data.publications) ? data.publications : [];

    if (page === "home") {
      hydrateHomeProfile(profile);
      renderNews(data.news || []);
      renderRepresentativeWorks(data.representative_works || []);
      renderSoftware(data.software || []);
      renderPeerReviews(data.peer_reviews || []);
      return;
    }

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
    if (yearFilter) {
      yearFilter.addEventListener("change", rerender);
    }
    if (roleFilter) {
      roleFilter.addEventListener("change", rerender);
    }
    if (selectedOnly) {
      selectedOnly.addEventListener("change", rerender);
    }
  } catch (error) {
    const homeTargets = ["#news-list", "#representative-works-list", "#software-list", "#peer-reviews-list"];
    homeTargets.forEach((selector) => {
      const host = document.querySelector(selector);
      if (host) {
        host.innerHTML = `<li>Could not load data (${error.message}).</li>`;
      }
    });
    const pubHost = document.querySelector("#publications-list");
    if (pubHost) {
      pubHost.innerHTML = `<p>Could not load publication data (${error.message}).</p>`;
    }
  }
}

function fillCurrentYear() {
  setText("current-year", String(new Date().getFullYear()));
}

document.addEventListener("DOMContentLoaded", () => {
  fillCurrentYear();
  initMobileNav();
  initReveal();
  loadPublicationData();
});
