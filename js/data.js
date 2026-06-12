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
 *
 * JOURNAL_RANKS: a manually curated lookup of approximate SCImago
 * Journal Rank (SJR) indicator values, keyed the same way as
 * IMPACT_FACTORS. SJR weights citations by the prestige of the citing
 * journal, so it sits on a different (lower) scale than impact factor
 * and can rank journals differently - e.g. review-heavy journals tend
 * to score relatively lower on SJR than on IF. This is the default
 * sort metric; impact factor remains available as an alternative.
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
  ],
  bioinformatics: [
    {
      id: "bio-tools",
      label: "Bioinformatics Tools & Software",
      query: '("software"[Title/Abstract] OR "tool"[Title/Abstract] OR "toolkit"[Title/Abstract] OR ' +
        '"pipeline"[Title/Abstract] OR "framework"[Title/Abstract] OR "algorithm"[Title/Abstract]) AND ' +
        '("Computational Biology"[MeSH Terms] OR "High-Throughput Nucleotide Sequencing"[MeSH Terms] OR ' +
        '"genomics"[Title/Abstract] OR "bioinformatics"[Title/Abstract])'
    },
    {
      id: "dna-seq",
      label: "DNA Sequencing & Genomics",
      query: '("High-Throughput Nucleotide Sequencing"[MeSH Terms] OR "Whole Genome Sequencing"[MeSH Terms] OR ' +
        '"Exome Sequencing"[MeSH Terms] OR "whole genome sequencing"[Title/Abstract] OR ' +
        '"whole exome sequencing"[Title/Abstract] OR "long-read sequencing"[Title/Abstract] OR ' +
        '"nanopore sequencing"[Title/Abstract] OR "variant calling"[Title/Abstract] OR ' +
        '"copy number variation"[Title/Abstract])'
    },
    {
      id: "rna-seq",
      label: "RNA Sequencing & Single-Cell",
      query: '("Sequence Analysis, RNA"[MeSH Terms] OR "RNA-Seq"[Title/Abstract] OR ' +
        '"RNA sequencing"[Title/Abstract] OR "single-cell RNA sequencing"[Title/Abstract] OR ' +
        '"scRNA-seq"[Title/Abstract] OR "single-cell transcriptomics"[Title/Abstract] OR ' +
        '"spatial transcriptomics"[Title/Abstract])'
    },
    {
      id: "proteomics",
      label: "Proteomics & Mass Spectrometry",
      query: '("Proteomics"[MeSH Terms] OR "Mass Spectrometry"[MeSH Terms] OR "proteomics"[Title/Abstract] OR ' +
        '"mass spectrometry"[Title/Abstract] OR "LC-MS/MS"[Title/Abstract] OR ' +
        '"shotgun proteomics"[Title/Abstract])'
    },
    {
      id: "ptm-ms",
      label: "Post-Translational Modification (PTM-MS)",
      query: '("Protein Processing, Post-Translational"[MeSH Terms] OR ' +
        '"post-translational modification"[Title/Abstract] OR "phosphoproteomics"[Title/Abstract] OR ' +
        '"ubiquitylome"[Title/Abstract] OR "glycoproteomics"[Title/Abstract] OR ' +
        '"acetylome"[Title/Abstract]) AND ("Mass Spectrometry"[MeSH Terms] OR "mass spectrometry"[Title/Abstract])'
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
  "transplant cell ther": 4.2,

  // Bioinformatics / methods / proteomics journals
  "nature methods": 36.1,
  "nat methods": 36.1,
  "nature biotechnology": 33.1,
  "nat biotechnol": 33.1,
  "nature communications": 14.7,
  "nat commun": 14.7,
  "genome biology": 12.3,
  "genome biol": 12.3,
  "nucleic acids research": 14.9,
  "nucleic acids res": 14.9,
  "briefings in bioinformatics": 9.5,
  "brief bioinform": 9.5,
  "genome medicine": 10.7,
  "genome med": 10.7,
  "genome research": 6.2,
  "genome res": 6.2,
  "cell systems": 7.0,
  "cell reports methods": 6.0,
  "gigascience": 8.0,
  "bioinformatics": 4.4,
  "bmc bioinformatics": 2.9,
  "bmc genomics": 3.5,
  "plos computational biology": 3.8,
  "plos comput biol": 3.8,
  "molecular & cellular proteomics": 4.8,
  "mol cell proteomics": 4.8,
  "journal of proteome research": 3.8,
  "j proteome res": 3.8
};

// Approximate SCImago Journal Rank (SJR) indicators (edit freely; keys
// are normalized at lookup time via normalizeJournalName in app.js).
const JOURNAL_RANKS = {
  "new england journal of medicine": 19.7,
  "n engl j med": 19.7,
  "lancet": 18.4,
  "lancet oncology": 9.6,
  "lancet oncol": 9.6,
  "lancet haematology": 5.4,
  "lancet haematol": 5.4,
  "nature": 17.7,
  "nature medicine": 14.2,
  "nat med": 14.2,
  "nature reviews clinical oncology": 13.8,
  "nat rev clin oncol": 13.8,
  "journal of clinical oncology": 8.9,
  "j clin oncol": 8.9,
  "jama": 13.9,
  "jama oncology": 8.5,
  "jama oncol": 8.5,
  "cancer cell": 14.6,
  "cancer discovery": 12.8,
  "cancer discov": 12.8,
  "nature cancer": 9.4,
  "nat cancer": 9.4,
  "blood": 3.7,
  "blood cancer journal": 2.0,
  "blood cancer j": 2.0,
  "blood advances": 1.6,
  "blood adv": 1.6,
  "leukemia": 3.2,
  "leukemia & lymphoma": 0.9,
  "leuk lymphoma": 0.9,
  "journal of hematology & oncology": 3.8,
  "j hematol oncol": 3.8,
  "annals of oncology": 6.4,
  "ann oncol": 6.4,
  "haematologica": 2.3,
  "british journal of haematology": 1.6,
  "br j haematol": 1.6,
  "american journal of hematology": 2.7,
  "am j hematol": 2.7,
  "bone marrow transplantation": 1.3,
  "bone marrow transplant": 1.3,
  "clinical cancer research": 4.8,
  "clin cancer res": 4.8,
  "cancer research": 5.3,
  "cancer res": 5.3,
  "european journal of cancer": 2.7,
  "eur j cancer": 2.7,
  "international journal of cancer": 2.3,
  "int j cancer": 2.3,
  "cancer": 2.1,
  "hemasphere": 2.0,
  "journal of the national cancer institute": 4.2,
  "j natl cancer inst": 4.2,
  "clinical lymphoma, myeloma and leukemia": 0.9,
  "clin lymphoma myeloma leuk": 0.9,
  "frontiers in oncology": 0.9,
  "front oncol": 0.9,
  "plos one": 0.8,
  "cell": 19.0,
  "scientific reports": 0.9,
  "sci rep": 0.9,
  "annals of hematology": 1.1,
  "ann hematol": 1.1,
  "npj precision oncology": 2.0,
  "npj precis oncol": 2.0,
  "therapeutic advances in hematology": 1.0,
  "ther adv hematol": 1.0,
  "journal of clinical medicine": 0.9,
  "j clin med": 0.9,
  "cancers": 1.1,
  "cancers (basel)": 1.1,
  "frontiers in immunology": 1.9,
  "front immunol": 1.9,
  "transplantation and cellular therapy": 1.4,
  "transplant cell ther": 1.4,

  // Bioinformatics / methods / proteomics journals
  "nature methods": 14.0,
  "nat methods": 14.0,
  "nature biotechnology": 15.0,
  "nat biotechnol": 15.0,
  "nature communications": 6.0,
  "nat commun": 6.0,
  "genome biology": 6.5,
  "genome biol": 6.5,
  "nucleic acids research": 6.5,
  "nucleic acids res": 6.5,
  "briefings in bioinformatics": 4.5,
  "brief bioinform": 4.5,
  "genome medicine": 5.0,
  "genome med": 5.0,
  "genome research": 5.5,
  "genome res": 5.5,
  "cell systems": 3.5,
  "cell reports methods": 3.0,
  "gigascience": 3.0,
  "bioinformatics": 2.8,
  "bmc bioinformatics": 1.3,
  "bmc genomics": 1.4,
  "plos computational biology": 1.8,
  "plos comput biol": 1.8,
  "molecular & cellular proteomics": 2.2,
  "mol cell proteomics": 2.2,
  "journal of proteome research": 1.5,
  "j proteome res": 1.5
};
