/* Heme/Onc PubMed Tracker - client-side app (no backend, calls NCBI E-utilities directly). */

const EUTILS_BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/";
const ICITE_BASE = "https://icite.od.nih.gov/api/pubs";
const RETMAX = 60;

const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";
const CLAUDE_MODEL = "claude-haiku-4-5-20251001";
const CLAUDE_DIGEST_MODEL = "claude-sonnet-4-6";
const SUMMARY_HOVER_DELAY = 500;

const DIGEST_HISTORY_KEY = "hemeOncDigestHistory";
const DIGEST_HISTORY_MAX = 3;

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const MONTH_MAP = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12
};

let state = {
  field: "hematology",
  diseaseId: "multiple-myeloma",
  customTerms: "",
  days: 7,
  sortBy: "sjr",
  institution: "Stanford"
};

let currentArticles = [];
let digestPlainText = "";
let digestHistory = [];

const summaryCache = new Map();
let summaryHoverTimer = null;
let summaryRequestToken = 0;

const els = {};

document.addEventListener("DOMContentLoaded", () => {
  cacheElements();
  populateDiseaseSelect();
  bindEvents();
  loadSettingsFromStorage();
  loadDigestHistory();
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

  els.digestBtn = document.getElementById("digest-btn");
  els.digestPanel = document.getElementById("digest-panel");
  els.digestBackBtn = document.getElementById("digest-back-btn");
  els.digestMeta = document.getElementById("digest-meta");
  els.digestContent = document.getElementById("digest-content");
  els.digestActions = document.getElementById("digest-actions");
  els.digestCopyBtn = document.getElementById("digest-copy-btn");
  els.digestEmailInput = document.getElementById("digest-email-input");
  els.digestEmailBtn = document.getElementById("digest-email-btn");

  els.digestHistory = document.getElementById("digest-history");
  els.digestHistoryList = document.getElementById("digest-history-list");
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

  els.digestBtn.addEventListener("click", generateDigest);
  els.digestBackBtn.addEventListener("click", hideDigestPanel);

  els.digestCopyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(digestPlainText);
      const original = els.digestCopyBtn.textContent;
      els.digestCopyBtn.textContent = "Copied!";
      setTimeout(() => {
        els.digestCopyBtn.textContent = original;
      }, 1500);
    } catch (e) {
      console.error(e);
    }
  });

  els.digestEmailBtn.addEventListener("click", () => {
    const email = els.digestEmailInput.value.trim();
    const subject = `Research Digest: ${els.digestMeta.textContent}`;
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(digestPlainText)}`;
    window.location.href = mailtoUrl;
  });

  els.digestHistoryList.addEventListener("click", (e) => {
    const btn = e.target.closest(".digest-history-item");
    if (!btn) return;
    const entry = digestHistory[parseInt(btn.dataset.index, 10)];
    if (entry) restoreDigest(entry);
  });
}

function populateDiseaseSelect() {
  const diseases = DISEASES[state.field];
  els.diseaseSelect.innerHTML = "";

  const allOpt = document.createElement("option");
  allOpt.value = "all";
  allOpt.textContent = state.field === "bioinformatics" ? "All Categories" : "All Diseases";
  els.diseaseSelect.appendChild(allOpt);

  diseases.forEach((d) => {
    const opt = document.createElement("option");
    opt.value = d.id;
    opt.textContent = d.label;
    els.diseaseSelect.appendChild(opt);
  });

  const exists = state.diseaseId === "all" || diseases.some((d) => d.id === state.diseaseId);
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
  if (state.diseaseId === "all") {
    const label = state.field === "bioinformatics" ? "All Categories" : "All Diseases";
    const query = DISEASES[state.field].map((d) => `(${d.query})`).join(" OR ");
    return { id: "all", label, query };
  }
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
  els.digestBtn.disabled = true;
  hideDigestPanel();
  resetSummaryPanel();

  try {
    const term = buildSearchTerm();
    const esearchParams = new URLSearchParams({
      db: "pubmed",
      retmode: "json",
      retmax: String(RETMAX),
      datetype: "pdat",
      reldate: String(state.days),
      sort: "pub_date",
      term
    });
    const apiKey = els.apiKeyInput.value.trim();
    if (apiKey) esearchParams.set("api_key", apiKey);

    // POST avoids URL-length limits when "All Diseases" combines many queries.
    const esearchResp = await fetch(`${EUTILS_BASE}esearch.fcgi`, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: esearchParams.toString()
    });
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
    await fetchCitationCounts(currentArticles);
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
    els.digestBtn.disabled = false;
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
    const sjr = lookupSJR(journal);
    const githubUrl = extractGithubUrl(abstract);

    return { pmid, title, journal, timestamp, dateDisplay, authors, abstract, impactFactor, sjr, githubUrl, citationCount: null };
  });
}

async function fetchCitationCounts(articles) {
  if (articles.length === 0) return;

  try {
    const pmids = articles.map((a) => a.pmid).join(",");
    const resp = await fetch(`${ICITE_BASE}?pmids=${pmids}`);
    if (!resp.ok) return;

    const data = await resp.json();
    const counts = new Map((data.data || []).map((d) => [String(d.pmid), d.citation_count]));
    articles.forEach((a) => {
      const count = counts.get(a.pmid);
      a.citationCount = typeof count === "number" ? count : null;
    });
  } catch (e) {
    /* citation counts are best-effort (iCite) - leave as null on failure */
  }
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

function lookupSJR(journalName) {
  const normalized = normalizeJournalName(journalName);
  if (normalized in JOURNAL_RANKS) return JOURNAL_RANKS[normalized];
  return null;
}

function extractGithubUrl(abstract) {
  if (!abstract) return null;
  const match = abstract.match(/https?:\/\/(?:www\.)?github\.com\/[^\s)]+/i);
  if (!match) return null;
  return match[0].replace(/[.,;:]+$/, "");
}

function sortArticles(articles, sortBy) {
  if (sortBy === "date") {
    articles.sort((a, b) => b.timestamp - a.timestamp);
  } else if (sortBy === "impact") {
    articles.sort((a, b) => {
      const ifA = a.impactFactor === null ? -1 : a.impactFactor;
      const ifB = b.impactFactor === null ? -1 : b.impactFactor;
      if (ifB !== ifA) return ifB - ifA;
      return b.timestamp - a.timestamp;
    });
  } else if (sortBy === "citations") {
    articles.sort((a, b) => {
      const cA = a.citationCount === null ? -1 : a.citationCount;
      const cB = b.citationCount === null ? -1 : b.citationCount;
      if (cB !== cA) return cB - cA;
      return b.timestamp - a.timestamp;
    });
  } else {
    articles.sort((a, b) => {
      const sjrA = a.sjr === null ? -1 : a.sjr;
      const sjrB = b.sjr === null ? -1 : b.sjr;
      if (sjrB !== sjrA) return sjrB - sjrA;
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

function getInstitutionMatches(article, institution) {
  const needle = (institution || "").trim().toLowerCase();
  if (!needle) return [];

  const matches = [];
  article.authors.forEach((author, idx) => {
    const matchedAffiliation = author.affiliations.find((aff) => aff.toLowerCase().includes(needle));
    if (matchedAffiliation) {
      matches.push({ idx, name: author.name || "Unknown author", affiliation: matchedAffiliation });
    }
  });
  return matches;
}

function renderArticles() {
  els.results.innerHTML = "";

  if (currentArticles.length === 0) return;

  const fragment = document.createDocumentFragment();

  currentArticles.forEach((article) => {
    const matches = getInstitutionMatches(article, state.institution);
    const matchedIndices = new Set(matches.map((m) => m.idx));
    const hasMatch = matches.length > 0;

    const card = document.createElement("article");
    card.className = "card" + (hasMatch ? " highlighted" : "");

    const sjrLabel = article.sjr !== null ? `SJR ${article.sjr.toFixed(1)}` : "SJR N/A";
    const ifLabel = article.impactFactor !== null ? `IF ${article.impactFactor.toFixed(1)}` : "IF N/A";
    const citationsLabel = article.citationCount !== null
      ? `${article.citationCount} citation${article.citationCount === 1 ? "" : "s"}`
      : "Citations N/A";

    const authorsHtml = article.authors
      .map((author, idx) => {
        const name = escapeHtml(author.name || "Unknown author");
        return matchedIndices.has(idx)
          ? `<span class="author-match">${name}</span>`
          : name;
      })
      .join(", ");

    card.innerHTML = `
      ${hasMatch ? `<div class="badge institution-badge">${escapeHtml(state.institution.trim())} affiliation</div>` : ""}
      <h2 class="card-title">
        <a href="https://pubmed.ncbi.nlm.nih.gov/${encodeURIComponent(article.pmid)}/" target="_blank" rel="noopener">
          ${escapeHtml(article.title)}
        </a>
      </h2>
      <div class="card-meta">
        <span class="journal">${escapeHtml(article.journal)}</span>
        <span class="badge if-badge">${sjrLabel}</span>
        <span class="badge if-badge secondary">${ifLabel}</span>
        <span class="badge if-badge secondary">${citationsLabel}</span>
        <span class="date">${escapeHtml(article.dateDisplay)}</span>
        ${article.githubUrl ? `
          <a class="badge github-badge" href="${escapeHtml(article.githubUrl)}" target="_blank" rel="noopener">
            GitHub ↗
          </a>
        ` : ""}
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
  const institutionMatches = getInstitutionMatches(article, state.institution);

  const apiKey = els.claudeKeyInput.value.trim();
  if (!apiKey) {
    renderSummaryPanel({ state: "no-key" }, institutionMatches);
    return;
  }

  if (summaryCache.has(article.pmid)) {
    renderSummaryPanel({ state: "ready", text: summaryCache.get(article.pmid) }, institutionMatches);
    return;
  }

  const requestToken = ++summaryRequestToken;
  renderSummaryPanel({ state: "loading" }, institutionMatches);

  try {
    const summary = await fetchClaudeSummary(article, apiKey);
    summaryCache.set(article.pmid, summary);
    if (requestToken === summaryRequestToken) {
      renderSummaryPanel({ state: "ready", text: summary }, institutionMatches);
    }
  } catch (err) {
    console.error(err);
    if (requestToken === summaryRequestToken) {
      renderSummaryPanel({ state: "error", message: err.message }, institutionMatches);
    }
  }
}

async function fetchClaudeSummary(article, apiKey) {
  const abstractText = article.abstract || "(No abstract available - summarize based on the title alone.)";
  const prompt =
    "Summarize this paper for a hematology/oncology clinician quickly scanning recent literature. " +
    'Respond with 2-3 bullet points (each starting with "- "), each a single terse clause of roughly ' +
    "8-12 words, covering the key finding(s) and clinical relevance. The title is already shown to the " +
    "reader, so don't restate it or its main result - lead with the detail or implication. " +
    "Output only the bullet points, no preamble or closing remarks.\n\n" +
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

function renderInstitutionMatchHtml(institutionMatches) {
  if (!institutionMatches || institutionMatches.length === 0) return "";

  const items = institutionMatches
    .map((m) => `<li><span class="author-match">${escapeHtml(m.name)}</span> - ${escapeHtml(m.affiliation)}</li>`)
    .join("");

  return `
    <div class="institution-match">
      <h4>${escapeHtml(state.institution.trim())} affiliation</h4>
      <ul>${items}</ul>
    </div>
  `;
}

function renderSummaryPanel(status, institutionMatches) {
  const matchHtml = renderInstitutionMatchHtml(institutionMatches);

  if (status.state === "no-key") {
    els.summaryPanel.innerHTML =
      matchHtml + '<p class="summary-loading">Add a Claude API key in the sidebar to enable AI summaries.</p>';
    return;
  }

  if (status.state === "loading") {
    els.summaryPanel.innerHTML = matchHtml + '<p class="summary-loading">Generating summary...</p>';
    return;
  }

  if (status.state === "error") {
    els.summaryPanel.innerHTML =
      matchHtml + `<p class="summary-error">Couldn't generate summary: ${escapeHtml(status.message)}</p>`;
    return;
  }

  const bullets = status.text
    .split("\n")
    .map((line) => line.replace(/^[\s*-]+/, "").trim())
    .filter(Boolean);

  const bodyHtml = bullets.length
    ? `<ul>${bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join("")}</ul>`
    : `<p>${escapeHtml(status.text)}</p>`;

  els.summaryPanel.innerHTML = matchHtml + bodyHtml;
}

function showDigestPanel() {
  els.status.hidden = true;
  els.results.hidden = true;
  els.digestPanel.hidden = false;
}

function hideDigestPanel() {
  els.digestPanel.hidden = true;
  els.status.hidden = false;
  els.results.hidden = false;
}

function formatDateRange(days) {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);

  const formatDay = (d) => `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`;

  if (start.getFullYear() === end.getFullYear()) {
    return `${formatDay(start)} – ${formatDay(end)}, ${end.getFullYear()}`;
  }
  return `${formatDay(start)}, ${start.getFullYear()} – ${formatDay(end)}, ${end.getFullYear()}`;
}

function buildDigestMeta() {
  const fieldLabel = state.field.charAt(0).toUpperCase() + state.field.slice(1);
  const disease = getDisease();
  const dateRange = formatDateRange(state.days);
  const count = currentArticles.length;
  return `${fieldLabel} – ${disease.label} – ${dateRange} – ${count} publication${count === 1 ? "" : "s"}`;
}

function pubmedUrl(pmid) {
  return `https://pubmed.ncbi.nlm.nih.gov/${encodeURIComponent(pmid)}/`;
}

function buildDigestPrompt(articles) {
  const list = articles
    .map((a, idx) => {
      const sjr = a.sjr !== null ? `SJR ${a.sjr.toFixed(1)}` : "SJR N/A";
      const abstract = (a.abstract || "(No abstract available.)").slice(0, 500);
      return `${idx + 1}. ${a.title} (${a.journal}, ${a.dateDisplay}, ${sjr})\n${abstract}`;
    })
    .join("\n\n");

  return (
    "You are writing a research digest for a hematology/oncology professional reviewing recent " +
    "literature. Below is a numbered list of recent publications. Write a digest of 1-2 paragraphs " +
    "(roughly 150-250 words total) highlighting the most significant findings, trends, and " +
    "connections across these papers - focus on clinically or scientifically meaningful highlights, " +
    'not routine or incremental updates. When you reference a specific paper, cite it using its ' +
    'number in square brackets immediately after the relevant statement, e.g. "...showed improved ' +
    'outcomes [3]." Use adjacent brackets for multi-paper citations, e.g. "[3][7]". Do not include a ' +
    "references list or any heading - output only the narrative paragraph(s).\n\n" +
    `Publications:\n${list}`
  );
}

async function fetchDigest(articles, apiKey) {
  const prompt = buildDigestPrompt(articles);

  const resp = await fetch(CLAUDE_API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true"
    },
    body: JSON.stringify({
      model: CLAUDE_DIGEST_MODEL,
      max_tokens: 700,
      messages: [{ role: "user", content: prompt }]
    })
  });

  if (!resp.ok) {
    const body = await resp.json().catch(() => null);
    throw new Error(body?.error?.message || `HTTP ${resp.status}`);
  }

  const data = await resp.json();
  const text = data?.content?.[0]?.text?.trim();
  return text || "(No digest returned.)";
}

function extractCitedIndices(text) {
  const indices = new Set();
  const regex = /\[(\d+)\]/g;
  let m;
  while ((m = regex.exec(text))) {
    indices.add(parseInt(m[1], 10));
  }
  return Array.from(indices).sort((a, b) => a - b);
}

function renderDigestHtml(text, articles, citedIndices) {
  const linked = escapeHtml(text).replace(/\[(\d+)\]/g, (match, numStr) => {
    const article = articles[parseInt(numStr, 10) - 1];
    if (!article) return match;
    return `<a href="${pubmedUrl(article.pmid)}" target="_blank" rel="noopener">[${numStr}]</a>`;
  });

  const paragraphsHtml = linked
    .split(/\n+/)
    .filter((p) => p.trim())
    .map((p) => `<p>${p}</p>`)
    .join("");

  const sourcesHtml = citedIndices
    .map((num) => {
      const a = articles[num - 1];
      const title = `<a href="${pubmedUrl(a.pmid)}" target="_blank" rel="noopener">${escapeHtml(a.title)}</a>`;
      return `<li>[${num}] ${title} <span class="journal">- ${escapeHtml(a.journal)}</span></li>`;
    })
    .join("");

  return (
    paragraphsHtml +
    `<div class="digest-sources"><h3>Sources</h3><ol>${sourcesHtml}</ol></div>`
  );
}

function buildDigestPlainText(text, articles, citedIndices, meta) {
  const sources = citedIndices
    .map((num) => {
      const a = articles[num - 1];
      return `${num}. ${a.title} (${a.journal}) - ${pubmedUrl(a.pmid)}`;
    })
    .join("\n");

  return `${meta}\n\n${text}\n\nSources:\n${sources}`;
}

async function generateDigest() {
  if (currentArticles.length === 0) {
    setStatus("Run a search first to generate a digest.", "empty");
    return;
  }

  showDigestPanel();
  els.digestActions.hidden = true;
  els.digestMeta.textContent = buildDigestMeta();

  const apiKey = els.claudeKeyInput.value.trim();
  if (!apiKey) {
    els.digestContent.innerHTML =
      '<p class="digest-error">Add a Claude API key in the sidebar to generate a digest.</p>';
    return;
  }

  els.digestContent.innerHTML = '<p class="digest-loading">Generating digest...</p>';
  els.digestBtn.disabled = true;

  try {
    const text = await fetchDigest(currentArticles, apiKey);
    const citedIndices = extractCitedIndices(text);
    const contentHtml = renderDigestHtml(text, currentArticles, citedIndices);
    els.digestContent.innerHTML = contentHtml;
    digestPlainText = buildDigestPlainText(text, currentArticles, citedIndices, els.digestMeta.textContent);
    els.digestActions.hidden = false;
    saveDigestToHistory({
      meta: els.digestMeta.textContent,
      contentHtml,
      plainText: digestPlainText,
      timestamp: Date.now()
    });
  } catch (err) {
    console.error(err);
    els.digestContent.innerHTML = `<p class="digest-error">Couldn't generate digest: ${escapeHtml(err.message)}</p>`;
  } finally {
    els.digestBtn.disabled = false;
  }
}

function loadDigestHistory() {
  try {
    const raw = localStorage.getItem(DIGEST_HISTORY_KEY);
    digestHistory = raw ? JSON.parse(raw) : [];
  } catch {
    digestHistory = [];
  }
  renderDigestHistory();
}

function saveDigestToHistory(entry) {
  digestHistory.unshift(entry);
  digestHistory = digestHistory.slice(0, DIGEST_HISTORY_MAX);
  try {
    localStorage.setItem(DIGEST_HISTORY_KEY, JSON.stringify(digestHistory));
  } catch {
    /* localStorage unavailable or quota exceeded - history just won't persist */
  }
  renderDigestHistory();
}

function timeAgo(timestamp) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function renderDigestHistory() {
  if (digestHistory.length === 0) {
    els.digestHistory.hidden = true;
    return;
  }

  els.digestHistory.hidden = false;
  els.digestHistoryList.innerHTML = digestHistory
    .map(
      (entry, idx) => `
        <li>
          <button class="digest-history-item" data-index="${idx}">
            <span class="digest-history-meta">${escapeHtml(entry.meta)}</span>
            <span class="digest-history-time">${timeAgo(entry.timestamp)}</span>
          </button>
        </li>
      `
    )
    .join("");
}

function restoreDigest(entry) {
  els.digestMeta.textContent = entry.meta;
  els.digestContent.innerHTML = entry.contentHtml;
  digestPlainText = entry.plainText;
  els.digestActions.hidden = false;
  showDigestPanel();
}
