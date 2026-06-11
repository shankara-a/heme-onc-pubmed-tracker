/* Heme/Onc PubMed Tracker - client-side app (no backend, calls NCBI E-utilities directly). */

const EUTILS_BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/";
const RETMAX = 60;

const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";
const CLAUDE_MODEL = "claude-haiku-4-5-20251001";
const SUMMARY_HOVER_DELAY = 500;

const MONTH_MAP = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12
};

let state = {
  field: "hematology",
  diseaseId: "multiple-myeloma",
  customTerms: "",
  days: 7,
  sortBy: "impact",
  institution: "Stanford"
};

let currentArticles = [];

const summaryCache = new Map();
let summaryHoverTimer = null;
let summaryRequestToken = 0;

const els = {};

document.addEventListener("DOMContentLoaded", () => {
  cacheElements();
  populateDiseaseSelect();
  bindEvents();
  loadSettingsFromStorage();
  runSearch();
});

function cacheElements() {
  els.fieldButtons = document.querySelectorAll(".toggle-btn");
  els.diseaseSelect = document.getElementById("disease-select");
  els.customTerms = document.getElementById("custom-terms");
  els.timeSelect = document.getElementById("time-select");
  els.sortSelect = document.getElementById("sort-select");
  els.institutionInput = document.getElementById("institution-input");
  els.apiKeyInput = document.getElementById("api-key-input");
  els.claudeKeyInput = document.getElementById("claude-key-input");
  els.searchBtn = document.getElementById("search-btn");
  els.status = document.getElementById("status");
  els.results = document.getElementById("results");
  els.summaryPanel = document.getElementById("summary-panel");
}

function bindEvents() {
  els.fieldButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      els.fieldButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      state.field = btn.dataset.field;
      populateDiseaseSelect();
      runSearch();
    });
  });

  els.diseaseSelect.addEventListener("change", () => {
    state.diseaseId = els.diseaseSelect.value;
    runSearch();
  });

  els.customTerms.addEventListener("change", () => {
    state.customTerms = els.customTerms.value.trim();
    runSearch();
  });

  els.timeSelect.addEventListener("change", () => {
    state.days = parseInt(els.timeSelect.value, 10);
    runSearch();
  });

  els.sortSelect.addEventListener("change", () => {
    state.sortBy = els.sortSelect.value;
    sortArticles(currentArticles, state.sortBy);
    renderArticles();
  });

  let highlightTimer;
  els.institutionInput.addEventListener("input", () => {
    clearTimeout(highlightTimer);
    highlightTimer = setTimeout(() => {
      state.institution = els.institutionInput.value.trim();
      saveSettingsToStorage();
      renderArticles();
    }, 250);
  });

  els.apiKeyInput.addEventListener("change", () => {
    saveSettingsToStorage();
  });

  els.claudeKeyInput.addEventListener("change", () => {
    saveSettingsToStorage();
  });

  els.searchBtn.addEventListener("click", runSearch);
}

function populateDiseaseSelect() {
  const diseases = DISEASES[state.field];
  els.diseaseSelect.innerHTML = "";
  diseases.forEach((d) => {
    const opt = document.createElement("option");
    opt.value = d.id;
    opt.textContent = d.label;
    els.diseaseSelect.appendChild(opt);
  });

  const exists = diseases.some((d) => d.id === state.diseaseId);
  state.diseaseId = exists ? state.diseaseId : diseases[0].id;
  els.diseaseSelect.value = state.diseaseId;
}

function loadSettingsFromStorage() {
  try {
    const saved = JSON.parse(localStorage.getItem("hemeOncTrackerSettings") || "{}");
    if (saved.institution !== undefined) {
      state.institution = saved.institution;
      els.institutionInput.value = saved.institution;
    }
    if (saved.apiKey) {
      els.apiKeyInput.value = saved.apiKey;
    }
    if (saved.claudeApiKey) {
      els.claudeKeyInput.value = saved.claudeApiKey;
    }
  } catch (e) {
    /* ignore corrupt storage */
  }
}

function saveSettingsToStorage() {
  localStorage.setItem(
    "hemeOncTrackerSettings",
    JSON.stringify({
      institution: els.institutionInput.value.trim(),
      apiKey: els.apiKeyInput.value.trim(),
      claudeApiKey: els.claudeKeyInput.value.trim()
    })
  );
}

function getDisease() {
  return DISEASES[state.field].find((d) => d.id === state.diseaseId);
}

function buildSearchTerm() {
  const disease = getDisease();
  let term = disease.query;
  if (state.customTerms) {
    term += ` AND (${state.customTerms})`;
  }
  return term;
}

function apiKeyParam() {
  const key = els.apiKeyInput.value.trim();
  return key ? `&api_key=${encodeURIComponent(key)}` : "";
}

async function runSearch() {
  setStatus("Searching PubMed...", "loading");
  els.results.innerHTML = "";
  els.searchBtn.disabled = true;
  resetSummaryPanel();

  try {
    const term = buildSearchTerm();
    const esearchUrl =
      `${EUTILS_BASE}esearch.fcgi?db=pubmed&retmode=json&retmax=${RETMAX}` +
      `&datetype=pdat&reldate=${state.days}&sort=pub_date` +
      `&term=${encodeURIComponent(term)}${apiKeyParam()}`;

    const esearchResp = await fetch(esearchUrl);
    if (!esearchResp.ok) throw new Error(`esearch failed (HTTP ${esearchResp.status})`);
    const esearchData = await esearchResp.json();
    const ids = esearchData?.esearchresult?.idlist || [];
    const totalCount = parseInt(esearchData?.esearchresult?.count || "0", 10);

    if (ids.length === 0) {
      currentArticles = [];
      setStatus("No publications found for this combination of filters and time period.", "empty");
      return;
    }

    const efetchUrl =
      `${EUTILS_BASE}efetch.fcgi?db=pubmed&retmode=xml&rettype=abstract` +
      `&id=${ids.join(",")}${apiKeyParam()}`;

    const efetchResp = await fetch(efetchUrl);
    if (!efetchResp.ok) throw new Error(`efetch failed (HTTP ${efetchResp.status})`);
    const xmlText = await efetchResp.text();

    currentArticles = parseArticles(xmlText);
    sortArticles(currentArticles, state.sortBy);
    renderArticles();

    const shownNote = totalCount > ids.length
      ? ` (showing ${ids.length} most recent of ${totalCount} total)`
      : "";
    setStatus(`Found ${currentArticles.length} publication${currentArticles.length === 1 ? "" : "s"}${shownNote}.`, "ok");
  } catch (err) {
    console.error(err);
    setStatus(
      `Error fetching from PubMed: ${err.message}. ` +
      `If this persists, it may be a temporary NCBI rate limit - try again in a few seconds, ` +
      `or add an NCBI API key in the settings field above.`,
      "error"
    );
  } finally {
    els.searchBtn.disabled = false;
  }
}

function setStatus(message, kind) {
  els.status.textContent = message;
  els.status.className = `status ${kind || ""}`;
}

function parseArticles(xmlText) {
  const doc = new DOMParser().parseFromString(xmlText, "text/xml");
  if (doc.querySelector("parsererror")) {
    throw new Error("Could not parse PubMed response");
  }

  const nodes = Array.from(doc.querySelectorAll("PubmedArticle"));
  return nodes.map((node) => {
    const pmid = node.querySelector("PMID")?.textContent || "";
    const titleNode = node.querySelector("ArticleTitle");
    const title = titleNode ? titleNode.textContent.trim() : "(No title)";

    const journal =
      node.querySelector("Journal Title")?.textContent ||
      node.querySelector("Journal ISOAbbreviation")?.textContent ||
      "Unknown journal";

    const { timestamp, display: dateDisplay } = parsePubDate(node);

    const authors = Array.from(node.querySelectorAll("AuthorList > Author")).map((a) => {
      const lastName = a.querySelector("LastName")?.textContent || "";
      const foreName = a.querySelector("ForeName")?.textContent || "";
      const collective = a.querySelector("CollectiveName")?.textContent || "";
      const name = (lastName || foreName) ? `${foreName} ${lastName}`.trim() : collective;
      const affiliations = Array.from(a.querySelectorAll("AffiliationInfo > Affiliation")).map(
        (aff) => aff.textContent.trim()
      );
      return { name, affiliations };
    });

    const abstract = Array.from(node.querySelectorAll("Abstract > AbstractText"))
      .map((n) => {
        const label = n.getAttribute("Label");
        const text = n.textContent.trim();
        return label ? `${label}: ${text}` : text;
      })
      .join(" ");

    const impactFactor = lookupImpactFactor(journal);

    return { pmid, title, journal, timestamp, dateDisplay, authors, abstract, impactFactor };
  });
}

function parsePubDate(articleNode) {
  let dateNode =
    articleNode.querySelector("ArticleDate") ||
    articleNode.querySelector("Journal JournalIssue PubDate");

  if (!dateNode) return { timestamp: 0, display: "Unknown date" };

  const yearText = dateNode.querySelector("Year")?.textContent;
  const monthText = dateNode.querySelector("Month")?.textContent;
  const dayText = dateNode.querySelector("Day")?.textContent;
  const medlineDate = dateNode.querySelector("MedlineDate")?.textContent;

  let year, month, day;

  if (yearText) {
    year = parseInt(yearText, 10);
    if (monthText) {
      const monthNum = parseInt(monthText, 10);
      month = !isNaN(monthNum) ? monthNum : (MONTH_MAP[monthText.toLowerCase().slice(0, 3)] || 1);
    } else {
      month = 1;
    }
    day = dayText ? parseInt(dayText, 10) : 1;
  } else if (medlineDate) {
    const yearMatch = medlineDate.match(/\d{4}/);
    year = yearMatch ? parseInt(yearMatch[0], 10) : 0;
    const monthMatch = medlineDate.match(/[A-Za-z]{3,}/);
    month = monthMatch ? (MONTH_MAP[monthMatch[0].toLowerCase().slice(0, 3)] || 1) : 1;
    day = 1;
  } else {
    return { timestamp: 0, display: "Unknown date" };
  }

  if (!year) return { timestamp: 0, display: "Unknown date" };

  const timestamp = new Date(year, month - 1, day || 1).getTime();
  const display = `${year}-${String(month).padStart(2, "0")}-${String(day || 1).padStart(2, "0")}`;
  return { timestamp, display };
}

function normalizeJournalName(name) {
  return (name || "")
    .toLowerCase()
    .replace(/[.,]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function lookupImpactFactor(journalName) {
  const normalized = normalizeJournalName(journalName);
  if (normalized in IMPACT_FACTORS) return IMPACT_FACTORS[normalized];
  return null;
}

function sortArticles(articles, sortBy) {
  if (sortBy === "date") {
    articles.sort((a, b) => b.timestamp - a.timestamp);
  } else {
    articles.sort((a, b) => {
      const ifA = a.impactFactor === null ? -1 : a.impactFactor;
      const ifB = b.impactFactor === null ? -1 : b.impactFactor;
      if (ifB !== ifA) return ifB - ifA;
      return b.timestamp - a.timestamp;
    });
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderArticles() {
  const institution = state.institution.trim().toLowerCase();
  els.results.innerHTML = "";

  if (currentArticles.length === 0) return;

  const fragment = document.createDocumentFragment();

  currentArticles.forEach((article) => {
    const matchedAuthorIndices = new Set();
    if (institution) {
      article.authors.forEach((author, idx) => {
        const hit = author.affiliations.some((aff) => aff.toLowerCase().includes(institution));
        if (hit) matchedAuthorIndices.add(idx);
      });
    }
    const hasMatch = matchedAuthorIndices.size > 0;

    const card = document.createElement("article");
    card.className = "card" + (hasMatch ? " highlighted" : "");

    const ifLabel = article.impactFactor !== null ? `IF ${article.impactFactor.toFixed(1)}` : "IF N/A";

    const authorsHtml = article.authors
      .map((author, idx) => {
        const name = escapeHtml(author.name || "Unknown author");
        return matchedAuthorIndices.has(idx)
          ? `<span class="author-match">${name}</span>`
          : name;
      })
      .join(", ");

    card.innerHTML = `
      ${hasMatch ? `<div class="badge institution-badge">${escapeHtml(state.institution)} affiliation</div>` : ""}
      <h2 class="card-title">
        <a href="https://pubmed.ncbi.nlm.nih.gov/${encodeURIComponent(article.pmid)}/" target="_blank" rel="noopener">
          ${escapeHtml(article.title)}
        </a>
      </h2>
      <div class="card-meta">
        <span class="journal">${escapeHtml(article.journal)}</span>
        <span class="badge if-badge">${ifLabel}</span>
        <span class="date">${escapeHtml(article.dateDisplay)}</span>
      </div>
      <div class="authors">${authorsHtml || "No author information"}</div>
      ${article.abstract ? `
        <details class="abstract">
          <summary>Abstract</summary>
          <p>${escapeHtml(article.abstract)}</p>
        </details>
      ` : ""}
    `;

    card.addEventListener("mouseenter", () => {
      clearTimeout(summaryHoverTimer);
      summaryHoverTimer = setTimeout(() => showSummary(article), SUMMARY_HOVER_DELAY);
    });
    card.addEventListener("mouseleave", () => {
      clearTimeout(summaryHoverTimer);
    });

    fragment.appendChild(card);
  });

  els.results.appendChild(fragment);
}

function resetSummaryPanel() {
  clearTimeout(summaryHoverTimer);
  els.summaryPanel.innerHTML =
    '<p class="summary-placeholder">Hover over a publication to see an AI-generated summary.</p>';
}

async function showSummary(article) {
  const apiKey = els.claudeKeyInput.value.trim();
  if (!apiKey) {
    renderSummaryPanel(article, { state: "no-key" });
    return;
  }

  if (summaryCache.has(article.pmid)) {
    renderSummaryPanel(article, { state: "ready", text: summaryCache.get(article.pmid) });
    return;
  }

  const requestToken = ++summaryRequestToken;
  renderSummaryPanel(article, { state: "loading" });

  try {
    const summary = await fetchClaudeSummary(article, apiKey);
    summaryCache.set(article.pmid, summary);
    if (requestToken === summaryRequestToken) {
      renderSummaryPanel(article, { state: "ready", text: summary });
    }
  } catch (err) {
    console.error(err);
    if (requestToken === summaryRequestToken) {
      renderSummaryPanel(article, { state: "error", message: err.message });
    }
  }
}

async function fetchClaudeSummary(article, apiKey) {
  const abstractText = article.abstract || "(No abstract available - summarize based on the title alone.)";
  const prompt =
    "Summarize this paper for a hematology/oncology clinician quickly scanning recent literature. " +
    'Respond with 2-3 short markdown bullet points (each starting with "- ") covering the key finding(s) ' +
    "and clinical relevance. Output only the bullet points, no preamble or closing remarks.\n\n" +
    `Title: ${article.title}\nJournal: ${article.journal}\nAbstract: ${abstractText}`;

  const resp = await fetch(CLAUDE_API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true"
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }]
    })
  });

  if (!resp.ok) {
    const body = await resp.json().catch(() => null);
    throw new Error(body?.error?.message || `HTTP ${resp.status}`);
  }

  const data = await resp.json();
  const text = data?.content?.[0]?.text?.trim();
  return text || "(No summary returned.)";
}

function renderSummaryPanel(article, status) {
  const titleHtml = `<h3>${escapeHtml(article.title)}</h3>`;

  if (status.state === "no-key") {
    els.summaryPanel.innerHTML =
      titleHtml + '<p class="summary-loading">Add a Claude API key in the sidebar to enable AI summaries.</p>';
    return;
  }

  if (status.state === "loading") {
    els.summaryPanel.innerHTML = titleHtml + '<p class="summary-loading">Generating summary...</p>';
    return;
  }

  if (status.state === "error") {
    els.summaryPanel.innerHTML =
      titleHtml + `<p class="summary-error">Couldn't generate summary: ${escapeHtml(status.message)}</p>`;
    return;
  }

  const bullets = status.text
    .split("\n")
    .map((line) => line.replace(/^[\s*-]+/, "").trim())
    .filter(Boolean);

  const bodyHtml = bullets.length
    ? `<ul>${bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join("")}</ul>`
    : `<p>${escapeHtml(status.text)}</p>`;

  els.summaryPanel.innerHTML = titleHtml + bodyHtml;
}
