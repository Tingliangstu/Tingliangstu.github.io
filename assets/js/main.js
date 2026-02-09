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
  setText("affiliation-text", profile.affiliation);
  setText("email-domain-text", profile.verified_email_domain);
  setText("contact-email-domain", profile.verified_email_domain);

  const stats = profile.stats || {};
  setText("stat-publications", formatNumber(stats.publications));
  setText("stat-citations", formatNumber(stats.cited_by));
  setText("stat-hindex", formatNumber(stats.h_index));
  setText("stat-i10", formatNumber(stats.i10_index));

  updateKeywords(profile.keywords);
}

function formatLinks(item = {}) {
  const links = item.links || {};
  const blocks = [];

  if (links.scholar) {
    blocks.push(`<a href="${links.scholar}" target="_blank" rel="noreferrer">Scholar</a>`);
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
  if (links.cited_by) {
    const citedLabel = item.cited_by && item.cited_by > 0 ? `Cited by ${item.cited_by}` : "Cited by";
    blocks.push(`<a href="${links.cited_by}" target="_blank" rel="noreferrer">${citedLabel}</a>`);
  } else if (item.cited_by && item.cited_by > 0) {
    blocks.push(`<span>Cited by ${item.cited_by}</span>`);
  }

  return blocks.join("");
}

function renderPublicationItem(item) {
  const yearText = item.year ? String(item.year) : "n.d.";
  return `
<article class="publication-item">
  <div class="section-heading">
    <h3 class="publication-title">${item.title}</h3>
    ${item.selected ? '<span class="publication-tag">Selected</span>' : ""}
  </div>
  <p class="publication-authors">${item.authors || ""}</p>
  <p class="publication-venue">${item.venue || ""} (${yearText})</p>
  <div class="publication-links">${formatLinks(item)}</div>
</article>
  `;
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
    const citedDiff = (b.cited_by || 0) - (a.cited_by || 0);
    if (citedDiff !== 0) {
      return citedDiff;
    }
    return (a.title || "").localeCompare(b.title || "");
  });
}

function renderSelectedPublications(items) {
  const host = document.querySelector("#selected-publications-list");
  if (!host) {
    return;
  }

  const selected = sortPublications(items.filter((item) => item.selected)).slice(0, 10);
  if (!selected.length) {
    host.innerHTML = "<p>No selected publications yet. Edit data/publications.json to add entries.</p>";
    return;
  }

  host.innerHTML = selected.map(renderPublicationItem).join("");
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

function renderAllPublications(items, yearFilter = "all", selectedOnly = false) {
  const host = document.querySelector("#publications-list");
  const countHost = document.querySelector("#publication-count");
  if (!host) {
    return;
  }

  const filtered = sortPublications(
    items.filter((item) => {
      const yearMatch = yearFilter === "all" || String(item.year) === yearFilter;
      const selectedMatch = !selectedOnly || item.selected;
      return yearMatch && selectedMatch;
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

async function loadPublications() {
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
      renderSelectedPublications(publications);
      return;
    }

    fillYearFilter(publications);
    renderAllPublications(publications);

    const yearFilter = document.querySelector("#year-filter");
    const selectedOnly = document.querySelector("#selected-only");

    const rerender = () => {
      renderAllPublications(
        publications,
        yearFilter ? yearFilter.value : "all",
        selectedOnly ? selectedOnly.checked : false
      );
    };

    if (yearFilter) {
      yearFilter.addEventListener("change", rerender);
    }
    if (selectedOnly) {
      selectedOnly.addEventListener("change", rerender);
    }
  } catch (error) {
    const homeHost = document.querySelector("#selected-publications-list");
    const fullHost = document.querySelector("#publications-list");
    const message = `<p>Could not load publication data (${error.message}).</p>`;
    if (homeHost) {
      homeHost.innerHTML = message;
    }
    if (fullHost) {
      fullHost.innerHTML = message;
    }
  }
}

function fillCurrentYear() {
  const year = new Date().getFullYear();
  const host = document.querySelector("#current-year");
  if (host) {
    host.textContent = String(year);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  fillCurrentYear();
  initMobileNav();
  initReveal();
  loadPublications();
});
