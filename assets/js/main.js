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
    { threshold: 0.12 }
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
  const host = document.querySelector(`#${id}`);
  if (host && value !== undefined && value !== null) {
    host.textContent = String(value);
  }
}

function setHref(id, value) {
  const host = document.querySelector(`#${id}`);
  if (host && value) {
    host.setAttribute("href", value);
  }
}

function updateKeywords(keywords) {
  const host = document.querySelector("#research-keywords");
  if (!host || !Array.isArray(keywords) || !keywords.length) {
    return;
  }
  host.innerHTML = keywords.map((word) => `<span class="chip">${word}</span>`).join("");
}

function hydrateHomeProfile(profile = {}) {
  setHref("scholar-link", profile.scholar_url);
  setHref("github-link", profile.github_url);
  setHref("cv-link", profile.cv_url);
  setHref("contact-scholar-link", profile.scholar_url);
  setHref("contact-github-link", profile.github_url);
  setHref("contact-cv-link", profile.cv_url);

  setText("affiliation-text", profile.affiliation);
  setText("email-text", profile.email);
  setText("email-domain-text", profile.verified_email_domain);

  const stats = profile.stats || {};
  setText("stat-publications", formatNumber(stats.publications));
  setText("stat-citations", formatNumber(stats.cited_by));
  setText("stat-hindex", formatNumber(stats.h_index));
  setText("stat-i10", formatNumber(stats.i10_index));

  updateKeywords(profile.research_interests || profile.keywords || []);
}

function resolvePrimaryLink(item = {}) {
  const links = item.links || {};
  return links.journal || links.doi || links.scholar || "";
}

function renderTitle(title, href, className = "publication-title") {
  if (!href) {
    return `<h3 class="${className}">${title}</h3>`;
  }
  return `<h3 class="${className}"><a class="paper-title-link" href="${href}" target="_blank" rel="noreferrer">${title}</a></h3>`;
}

function formatPublicationLinks(item = {}) {
  const links = item.links || {};
  const blocks = [];

  if (links.journal) {
    blocks.push(`<a href="${links.journal}" target="_blank" rel="noreferrer">Journal</a>`);
  }
  if (links.doi) {
    blocks.push(`<a href="${links.doi}" target="_blank" rel="noreferrer">DOI</a>`);
  }
  if (links.pdf) {
    blocks.push(`<a href="${links.pdf}" target="_blank" rel="noreferrer">PDF</a>`);
  }
  if (links.code) {
    blocks.push(`<a href="${links.code}" target="_blank" rel="noreferrer">Code</a>`);
  }
  if (links.scholar) {
    blocks.push(`<a href="${links.scholar}" target="_blank" rel="noreferrer">Scholar</a>`);
  }
  if (links.cited_by) {
    const citedLabel = item.cited_by && item.cited_by > 0 ? `Cited by ${item.cited_by}` : "Cited by";
    blocks.push(`<a href="${links.cited_by}" target="_blank" rel="noreferrer">${citedLabel}</a>`);
  }
  return blocks.join("");
}

function safeYear(value) {
  return Number.isFinite(value) ? value : 0;
}

function sortPublications(items) {
  return [...items].sort((a, b) => {
    const yearDiff = safeYear(b.year) - safeYear(a.year);
    if (yearDiff !== 0) {
      return yearDiff;
    }
    const selectedDiff = Number(Boolean(b.selected)) - Number(Boolean(a.selected));
    if (selectedDiff !== 0) {
      return selectedDiff;
    }
    return (a.title || "").localeCompare(b.title || "");
  });
}

function renderPublicationItem(item) {
  const yearText = item.year ? String(item.year) : "n.d.";
  const primaryLink = resolvePrimaryLink(item);
  return `
<article class="publication-item">
  <div class="section-heading">
    ${renderTitle(item.title, primaryLink, "publication-title")}
    ${item.selected ? '<span class="publication-tag">Selected</span>' : ""}
  </div>
  <p class="publication-authors">${item.authors || ""}</p>
  <p class="publication-venue">${item.venue || ""} (${yearText})${item.role ? ` • ${item.role}` : ""}</p>
  <div class="publication-links">${formatPublicationLinks(item)}</div>
</article>
`;
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
      const primaryLink = resolvePrimaryLink(item);
      return `
<article class="work-card">
  ${renderTitle(item.title, primaryLink, "work-title")}
  <p class="work-meta">${item.authors || ""}</p>
  <p class="work-meta">${item.venue || ""} (${item.year || "n.d."})</p>
  <p class="work-summary">${item.summary || "[Add a short summary here.]"}</p>
  <div class="publication-links">${formatPublicationLinks(item)}</div>
</article>
`;
    })
    .join("");
}

function renderFirstAuthorWorks(works) {
  const host = document.querySelector("#first-author-works-list");
  if (!host) {
    return;
  }

  if (!Array.isArray(works) || !works.length) {
    host.innerHTML = "<p>First-author works will appear here.</p>";
    return;
  }

  host.innerHTML = works
    .map((item) => {
      const primaryLink = resolvePrimaryLink(item);
      const iconPath = item.icon || "assets/img/work-placeholder.svg";
      return `
<article class="project-card">
  <img class="project-icon" src="${iconPath}" alt="Work icon for ${item.title}" onerror="this.src='assets/img/work-placeholder.svg'">
  <div class="project-content">
    ${renderTitle(item.title, primaryLink, "project-title")}
    <p class="project-meta">${item.venue || ""} (${item.year || "n.d."})</p>
    <p class="project-summary">${item.summary || "[Add one-sentence summary of this work here.]"}</p>
    <div class="publication-links">${formatPublicationLinks(item)}</div>
  </div>
</article>
`;
    })
    .join("");
}

function groupByYear(items) {
  const map = new Map();
  items.forEach((item) => {
    const key = String(item.year || "Unknown");
    const list = map.get(key) || [];
    list.push(item);
    map.set(key, list);
  });
  return map;
}

function renderAllPublications(items, filters = {}) {
  const host = document.querySelector("#publications-list");
  const countHost = document.querySelector("#publication-count");
  if (!host) {
    return;
  }

  const yearFilter = filters.year || "all";
  const roleFilter = filters.role || "all";
  const selectedOnly = Boolean(filters.selectedOnly);

  const filtered = sortPublications(
    items.filter((item) => {
      const yearMatch = yearFilter === "all" || String(item.year) === yearFilter;
      const roleMatch = roleFilter === "all" || item.role === roleFilter;
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

  host.innerHTML = years
    .map((year) => {
      const entries = grouped.get(year) || [];
      return `
<h3 class="publication-year-block">${year}</h3>
${entries.map(renderPublicationItem).join("")}
`;
    })
    .join("");
}

function fillYearFilter(items) {
  const select = document.querySelector("#year-filter");
  if (!select) {
    return;
  }

  const years = [...new Set(items.map((item) => item.year).filter((year) => Number.isFinite(year)))].sort((a, b) => b - a);
  years.forEach((year) => {
    const option = document.createElement("option");
    option.value = String(year);
    option.textContent = String(year);
    select.appendChild(option);
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
    const profile = data && typeof data === "object" ? data.profile || {} : {};
    const publications = Array.isArray(data.publications) ? data.publications : [];

    if (page === "home") {
      hydrateHomeProfile(profile);
      renderRepresentativeWorks(data.representative_works || []);
      renderFirstAuthorWorks(data.first_author_works || []);
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
    const homeHosts = ["#representative-works-list", "#first-author-works-list"];
    homeHosts.forEach((selector) => {
      const host = document.querySelector(selector);
      if (host) {
        host.innerHTML = `<p>Could not load data (${error.message}).</p>`;
      }
    });
    const fullHost = document.querySelector("#publications-list");
    if (fullHost) {
      fullHost.innerHTML = `<p>Could not load publication data (${error.message}).</p>`;
    }
  }
}

function fillCurrentYear() {
  const year = new Date().getFullYear();
  setText("current-year", String(year));
}

document.addEventListener("DOMContentLoaded", () => {
  fillCurrentYear();
  initMobileNav();
  initReveal();
  loadPublicationData();
});
