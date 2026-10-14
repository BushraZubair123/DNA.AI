// All the exact, rule-based science lives here (no AI involved).

const ORDER = "UCAG";
const AA = "FFLLSSSSYY**CC*WLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG";
const NAMES = {
  F: "Phe", L: "Leu", S: "Ser", Y: "Tyr", C: "Cys", W: "Trp", P: "Pro",
  H: "His", Q: "Gln", R: "Arg", I: "Ile", M: "Met", T: "Thr", N: "Asn",
  K: "Lys", V: "Val", A: "Ala", D: "Asp", E: "Glu", G: "Gly", "*": "Stop",
};

// 64-codon table, keyed by mRNA codon, e.g. CODON_TABLE["AUG"] === "Met"
export const CODON_TABLE = {};
for (let i = 0; i < 4; i++)
  for (let j = 0; j < 4; j++)
    for (let k = 0; k < 4; k++)
      CODON_TABLE[ORDER[i] + ORDER[j] + ORDER[k]] = NAMES[AA[16 * i + 4 * j + k]];

export const EXAMPLES = {
  coding: "ATGGGCTTTTAA",   // -> AUG GGC UUU UAA -> Met-Gly-Phe-Stop
  template: "TACCCGAAAATT", // same gene, template strand written 3'->5'
};

export const MAX_LENGTH = 60;

export const cleanDNA = (text) => text.toUpperCase().replace(/\s+/g, "");

const COMPLEMENT = { A: "U", T: "A", G: "C", C: "G" };

export function transcribe(dna, strand) {
  if (strand === "template") return [...dna].map((b) => COMPLEMENT[b]).join("");
  return dna.replace(/T/g, "U");
}

// Reads from the first AUG until a stop codon.
export function translate(mrna) {
  const start = mrna.indexOf("AUG");
  const codons = [];
  let stopped = false;
  if (start !== -1) {
    for (let i = start; i + 3 <= mrna.length; i += 3) {
      const codon = mrna.slice(i, i + 3);
      const aa = CODON_TABLE[codon];
      codons.push({ codon, aa });
      if (aa === "Stop") { stopped = true; break; }
    }
  }
  return { start, codons, protein: codons.map((c) => c.aa), stopped };
}

export const TYPE_INFO = {
  silent: {
    label: "Silent mutation",
    summary: "The amino acids are the same, so the protein does not change. The genetic code is redundant: several codons can code for one amino acid.",
  },
  missense: {
    label: "Missense mutation",
    summary: "One amino acid was swapped for another. The protein may work differently, or may hardly change at all.",
  },
  nonsense: {
    label: "Nonsense mutation",
    summary: "A stop codon appeared early, so the protein is cut short.",
  },
  frameshift: {
    label: "Frameshift mutation",
    summary: "A base was added or removed, so every codon after that point is read differently.",
  },
  inframe: {
    label: "In-frame insertion or deletion",
    summary: "A whole codon's worth of bases was added or removed, so the codons after it keep their reading frame.",
  },
  startLost: {
    label: "Start codon lost",
    summary: "The AUG start codon is gone, so this sequence has no starting point for translation.",
  },
  stopLost: {
    label: "Stop codon lost",
    summary: "The stop signal was changed, so the protein could continue past its normal end.",
  },
};

export function classify(originalDNA, mutatedDNA, strand) {
  if (originalDNA === mutatedDNA) return "none";
  const o = translate(transcribe(originalDNA, strand));
  const m = translate(transcribe(mutatedDNA, strand));

  if (o.start !== -1 && m.start === -1) return "startLost";
  if (o.protein.join("-") === m.protein.join("-")) return "silent";

  const diff = mutatedDNA.length - originalDNA.length;
  if (diff !== 0) return diff % 3 !== 0 ? "frameshift" : "inframe";

  let d = 0;
  const n = Math.max(o.protein.length, m.protein.length);
  while (d < n && o.protein[d] === m.protein[d]) d++;
  if (o.protein[d] === "Stop") return "stopLost";
  if (m.protein[d] === "Stop") return "nonsense";
  return "missense";
}

export const proteinText = (t) =>
  t.protein.length ? t.protein.join("-") : "No protein (no AUG start codon)";

// ---------- helpers for the Codon Analyzer page ----------
export const FULL_NAMES = {
  Phe: "Phenylalanine", Leu: "Leucine", Ser: "Serine", Tyr: "Tyrosine",
  Cys: "Cysteine", Trp: "Tryptophan", Pro: "Proline", His: "Histidine",
  Gln: "Glutamine", Arg: "Arginine", Ile: "Isoleucine", Met: "Methionine",
  Thr: "Threonine", Asn: "Asparagine", Lys: "Lysine", Val: "Valine",
  Ala: "Alanine", Asp: "Aspartic acid", Glu: "Glutamic acid", Gly: "Glycine",
  Stop: "Stop signal",
};

export const ALL_CODONS = Object.keys(CODON_TABLE); // 64 codons, U-C-A-G order

// Accepts DNA (T) or RNA (U) letters. Returns an mRNA codon or null.
export function normalizeCodon(text) {
  const c = text.toUpperCase().replace(/\s+/g, "").replace(/T/g, "U");
  return /^[ACGU]{3}$/.test(c) ? c : null;
}

export function codonInfo(codon) {
  const aa = CODON_TABLE[codon];
  return {
    codon,
    aa,
    name: FULL_NAMES[aa],
    isStart: codon === "AUG",
    isStop: aa === "Stop",
    synonyms: ALL_CODONS.filter((c) => CODON_TABLE[c] === aa && c !== codon),
  };
}
