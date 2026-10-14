// Builds the page addresses that go inside the QR codes.
// The site uses hash routing, so every address looks like  https://site/#/page
// Start, stop and the most important codons used in translation (each has its own QR code).
export const KEY_CODONS = [
  { codon: "AUG", group: "Start codon", note: "Start codon" },
  { codon: "UAA", group: "Stop codons", note: "Stop codon" },
  { codon: "UAG", group: "Stop codons", note: "Stop codon" },
  { codon: "UGA", group: "Stop codons", note: "Stop codon" },
  { codon: "UUU", group: "Basic codons", note: "Phenylalanine" },
  { codon: "GGC", group: "Basic codons", note: "Glycine" },
  { codon: "GCU", group: "Basic codons", note: "Alanine" },
  { codon: "AAA", group: "Basic codons", note: "Lysine" },
  { codon: "GAA", group: "Basic codons", note: "Glutamic acid" },
  { codon: "UGG", group: "Basic codons", note: "Tryptophan" },
];
export const CODON_GROUPS = ["Start codon", "Stop codons", "Basic codons"];

export const MODEL_MUTATION = { position: 5, base: "C" }; // default removable base on the model

export const pageUrl = (origin, path) => `${origin.replace(/\/+$/, "")}/#${path}`;
// Scanning a codon QR code opens that codon's own page.
export const codonPath = (codon) => `/codon/${codon}`;
export const mutationPath = "/mutation-lab?mutate=1";
