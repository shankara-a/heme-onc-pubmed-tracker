/*
 * Static reference data for the Heme/Onc PubMed Tracker.
 *
 * DISEASES: search definitions grouped by field. Each entry's `query`
 * is a PubMed search term combining a MeSH heading with common
 * Title/Abstract synonyms. Add/edit entries here to change the
 * available "disease flags".
 *
 * IMPACT_FACTORS: a manually curated lookup of approximate journal
 * impact factors (most recent published JCR figures at time of
 * writing). These are NOT pulled live - Clarivate's JCR data is not
 * freely available via API. Edit this list periodically, or add
 * journals you care about. Journal names are matched after
 * normalization (lowercase, periods stripped, whitespace collapsed),
 * and both the full journal title and the common ISO abbreviation
 * (as returned by PubMed) are included as keys where useful.
 */

const DISEASES = {
  hematology: [
    {
      id: "multiple-myeloma",
      label: "Multiple Myeloma",
      query: '("Multiple Myeloma"[MeSH Terms] OR "multiple myeloma"[Title/Abstract] OR "plasma cell myeloma"[Title/Abstract])'
    },
    {
      id: "aml",
      label: "Acute Myeloid Leukemia",
      query: '("Leukemia, Myeloid, Acute"[MeSH Terms] OR "acute myeloid leukemia"[Title/Abstract] OR "AML"[Title/Abstract])'
    },
    {
      id: "all",
      label: "Acute Lymphoblastic Leukemia",
      query: '("Precursor Cell Lymphoblastic Leukemia-Lymphoma"[MeSH Terms] OR "acute lymphoblastic leukemia"[Title/Abstract] OR "ALL"[Title/Abstract])'
    },
    {
      id: "cll",
      label: "Chronic Lymphocytic Leukemia",
      query: '("Leukemia, Lymphocytic, Chronic, B-Cell"[MeSH Terms] OR "chronic lymphocytic leukemia"[Title/Abstract] OR "CLL"[Title/Abstract])'
    },
    {
      id: "cml",
      label: "Chronic Myeloid Leukemia",
      query: '("Leukemia, Myelogenous, Chronic, BCR-ABL Positive"[MeSH Terms] OR "chronic myeloid leukemia"[Title/Abstract] OR "CML"[Title/Abstract])'
    },
    {
      id: "mds",
      label: "Myelodysplastic Syndromes",
      query: '("Myelodysplastic Syndromes"[MeSH Terms] OR "myelodysplastic syndrome"[Title/Abstract] OR "MDS"[Title/Abstract])'
    },
    {
      id: "mpn",
      label: "Myeloproliferative Neoplasms",
      query: '("Myeloproliferative Disorders"[MeSH Terms] OR "myeloproliferative neoplasm"[Title/Abstract] OR "polycythemia vera"[Title/Abstract] OR "essential thrombocythemia"[Title/Abstract])'
    },
    {
      id: "myelofibrosis",
      label: "Myelofibrosis",
      query: '("Primary Myelofibrosis"[MeSH Terms] OR "myelofibrosis"[Title/Abstract])'
    },
    {
      id: "hodgkin",
      label: "Hodgkin Lymphoma",
      query: '("Hodgkin Disease"[MeSH Terms] OR "Hodgkin lymphoma"[Title/Abstract])'
    },
    {
      id: "nhl",
      label: "Non-Hodgkin Lymphoma",
      query: '("Lymphoma, Non-Hodgkin"[MeSH Terms] OR "non-Hodgkin lymphoma"[Title/Abstract])'
    },
    {
      id: "dlbcl",
      label: "Diffuse Large B-Cell Lymphoma",
      query: '("Lymphoma, Large B-Cell, Diffuse"[MeSH Terms] OR "diffuse large B-cell lymphoma"[Title/Abstract] OR "DLBCL"[Title/Abstract])'
    },
    {
      id: "follicular",
      label: "Follicular Lymphoma",
      query: '("Lymphoma, Follicular"[MeSH Terms] OR "follicular lymphoma"[Title/Abstract])'
    },
    {
      id: "mcl",
      label: "Mantle Cell Lymphoma",
      query: '("Lymphoma, Mantle-Cell"[MeSH Terms] OR "mantle cell lymphoma"[Title/Abstract])'
    },
    {
      id: "amyloidosis",
      label: "AL Amyloidosis",
      query: '("Immunoglobulin Light-chain Amyloidosis"[MeSH Terms] OR "AL amyloidosis"[Title/Abstract] OR "light chain amyloidosis"[Title/Abstract])'
    },
    {
      id: "aplastic-anemia",
      label: "Aplastic Anemia",
      query: '("Anemia, Aplastic"[MeSH Terms] OR "aplastic anemia"[Title/Abstract])'
    },
    {
      id: "sickle-cell",
      label: "Sickle Cell Disease",
      query: '("Anemia, Sickle Cell"[MeSH Terms] OR "sickle cell disease"[Title/Abstract])'
    },
    {
      id: "hemophilia",
      label: "Hemophilia",
      query: '("Hemophilia A"[MeSH Terms] OR "Hemophilia B"[MeSH Terms] OR "hemophilia"[Title/Abstract])'
    }
  ],
  oncology: [
    {
      id: "breast",
      label: "Breast Cancer",
      query: '("Breast Neoplasms"[MeSH Terms] OR "breast cancer"[Title/Abstract])'
    },
    {
      id: "nsclc",
      label: "Non-Small Cell Lung Cancer",
      query: '("Carcinoma, Non-Small-Cell Lung"[MeSH Terms] OR "non-small cell lung cancer"[Title/Abstract] OR "NSCLC"[Title/Abstract])'
    },
    {
      id: "sclc",
      label: "Small Cell Lung Cancer",
      query: '("Small Cell Lung Carcinoma"[MeSH Terms] OR "small cell lung cancer"[Title/Abstract] OR "SCLC"[Title/Abstract])'
    },
    {
      id: "crc",
      label: "Colorectal Cancer",
      query: '("Colorectal Neoplasms"[MeSH Terms] OR "colorectal cancer"[Title/Abstract])'
    },
    {
      id: "pancreatic",
      label: "Pancreatic Cancer",
      query: '("Pancreatic Neoplasms"[MeSH Terms] OR "pancreatic cancer"[Title/Abstract])'
    },
    {
      id: "prostate",
      label: "Prostate Cancer",
      query: '("Prostatic Neoplasms"[MeSH Terms] OR "prostate cancer"[Title/Abstract])'
    },
    {
      id: "melanoma",
      label: "Melanoma",
      query: '("Melanoma"[MeSH Terms] OR "melanoma"[Title/Abstract])'
    },
    {
      id: "ovarian",
      label: "Ovarian Cancer",
      query: '("Ovarian Neoplasms"[MeSH Terms] OR "ovarian cancer"[Title/Abstract])'
    },
    {
      id: "rcc",
      label: "Renal Cell Carcinoma",
      query: '("Carcinoma, Renal Cell"[MeSH Terms] OR "renal cell carcinoma"[Title/Abstract])'
    },
    {
      id: "bladder",
      label: "Bladder Cancer",
      query: '("Urinary Bladder Neoplasms"[MeSH Terms] OR "bladder cancer"[Title/Abstract])'
    },
    {
      id: "hcc",
      label: "Hepatocellular Carcinoma",
      query: '("Carcinoma, Hepatocellular"[MeSH Terms] OR "hepatocellular carcinoma"[Title/Abstract])'
    },
    {
      id: "gastric",
      label: "Gastric Cancer",
      query: '("Stomach Neoplasms"[MeSH Terms] OR "gastric cancer"[Title/Abstract])'
    },
    {
      id: "hnscc",
      label: "Head and Neck Squamous Cell Carcinoma",
      query: '("Squamous Cell Carcinoma of Head and Neck"[MeSH Terms] OR "head and neck squamous cell carcinoma"[Title/Abstract] OR "HNSCC"[Title/Abstract])'
    },
    {
      id: "glioblastoma",
      label: "Glioblastoma",
      query: '("Glioblastoma"[MeSH Terms] OR "glioblastoma"[Title/Abstract])'
    },
    {
      id: "sarcoma",
      label: "Sarcoma",
      query: '("Sarcoma"[MeSH Terms] OR "sarcoma"[Title/Abstract])'
    },
    {
      id: "cervical",
      label: "Cervical Cancer",
      query: '("Uterine Cervical Neoplasms"[MeSH Terms] OR "cervical cancer"[Title/Abstract])'
    },
    {
      id: "esophageal",
      label: "Esophageal Cancer",
      query: '("Esophageal Neoplasms"[MeSH Terms] OR "esophageal cancer"[Title/Abstract])'
    }
  ]
};

// Approximate journal impact factors (edit freely; keys are normalized
// at lookup time via normalizeJournalName in app.js).
const IMPACT_FACTORS = {
  "new england journal of medicine": 96.2,
  "n engl j med": 96.2,
  "lancet": 98.4,
  "lancet oncology": 41.6,
  "lancet oncol": 41.6,
  "lancet haematology": 30.6,
  "lancet haematol": 30.6,
  "nature": 64.8,
  "nature medicine": 58.7,
  "nat med": 58.7,
  "nature reviews clinical oncology": 67.4,
  "nat rev clin oncol": 67.4,
  "journal of clinical oncology": 42.1,
  "j clin oncol": 42.1,
  "jama": 63.1,
  "jama oncology": 28.4,
  "jama oncol": 28.4,
  "cancer cell": 48.8,
  "cancer discovery": 28.2,
  "cancer discov": 28.2,
  "nature cancer": 23.5,
  "nat cancer": 23.5,
  "blood": 20.3,
  "blood cancer journal": 12.0,
  "blood cancer j": 12.0,
  "blood advances": 7.0,
  "blood adv": 7.0,
  "leukemia": 12.6,
  "leukemia & lymphoma": 2.4,
  "leuk lymphoma": 2.4,
  "journal of hematology & oncology": 28.5,
  "j hematol oncol": 28.5,
  "annals of oncology": 50.5,
  "ann oncol": 50.5,
  "haematologica": 10.1,
  "british journal of haematology": 6.5,
  "br j haematol": 6.5,
  "american journal of hematology": 10.1,
  "am j hematol": 10.1,
  "bone marrow transplantation": 4.7,
  "bone marrow transplant": 4.7,
  "clinical cancer research": 11.5,
  "clin cancer res": 11.5,
  "cancer research": 12.5,
  "cancer res": 12.5,
  "european journal of cancer": 8.4,
  "eur j cancer": 8.4,
  "international journal of cancer": 6.3,
  "int j cancer": 6.3,
  "cancer": 6.1,
  "hemasphere": 7.6,
  "journal of the national cancer institute": 11.6,
  "j natl cancer inst": 11.6,
  "clinical lymphoma, myeloma and leukemia": 2.4,
  "clin lymphoma myeloma leuk": 2.4,
  "frontiers in oncology": 3.5,
  "front oncol": 3.5,
  "plos one": 3.7,
  "cell": 64.5,
  "scientific reports": 4.6,
  "sci rep": 4.6,
  "annals of hematology": 3.0,
  "ann hematol": 3.0,
  "npj precision oncology": 9.0,
  "npj precis oncol": 9.0,
  "therapeutic advances in hematology": 4.0,
  "ther adv hematol": 4.0,
  "journal of clinical medicine": 3.0,
  "j clin med": 3.0,
  "cancers": 4.5,
  "cancers (basel)": 4.5,
  "frontiers in immunology": 5.7,
  "front immunol": 5.7,
  "transplantation and cellular therapy": 4.2,
  "transplant cell ther": 4.2
};
