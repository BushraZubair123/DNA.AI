import { TYPE_INFO } from "./dnaLogic";

const BASE = import.meta.env.VITE_API_URL;

async function post(path, payload) {
  if (!BASE) throw new Error("VITE_API_URL is not set");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(`${BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Server returned ${res.status}`);
    const data = await res.json();
    if (!data.text) throw new Error("Empty answer");
    return data.text;
  } finally {
    clearTimeout(timer);
  }
}

// ---- Mutation Lab ---------------------------------------------------
// The mutation type is calculated by our code and sent to the AI,
// so the AI only has to explain it.
export async function explainMutation(payload) {
  try {
    return { text: await post("/api/explain", payload), source: "ai" };
  } catch {
    const { mutationType, originalProtein, mutatedProtein } = payload;
    return {
      text: `Original protein: ${originalProtein}. Mutated protein: ${mutatedProtein}. ${TYPE_INFO[mutationType].summary}`,
      source: "builtin",
    };
  }
}

// ---- Codon Analyzer + Assistant --------------------------------------
export const codonQuestion = (codon) =>
  `What does the mRNA codon ${codon} code for? Explain in 2-3 simple sentences for a school student.`;

const FAQ = [
  { keys: ["dna to protein", "central dogma", "gene expression", "simple words"],
    answer: "DNA stores the instructions. In transcription, a gene is copied into mRNA. In translation, a ribosome reads the mRNA three bases at a time (codons) and joins the matching amino acids into a protein." },
  { keys: ["frameshift"],
    answer: "A frameshift happens when bases are inserted or deleted in a number that is not a multiple of 3. The reading frame moves, so every codon after that point can change. This usually changes the protein a lot." },
  { keys: ["nonsense"],
    answer: "A nonsense mutation changes a codon into a stop codon (UAA, UAG or UGA). Translation ends early, so the protein is shorter than normal." },
  { keys: ["missense"],
    answer: "A missense mutation changes one codon so that it codes for a different amino acid. The protein may work differently, or may be affected very little." },
  { keys: ["silent"],
    answer: "A silent mutation changes a base, but the codon still codes for the same amino acid (for example GGC to GGA, both glycine). The protein stays the same, because the genetic code is redundant." },
  { keys: ["mutation", "mutate"],
    answer: "A mutation is a change in the DNA sequence. It can change a codon and therefore an amino acid, but not always: some mutations are silent. The main types are silent, missense, nonsense and frameshift." },
  { keys: ["start codon", "what does aug", "aug code"],
    answer: "AUG is the start codon. It codes for methionine and marks the place where translation begins." },
  { keys: ["stop codon", "uaa", "uag", "uga"],
    answer: "UAA, UAG and UGA are stop codons. They do not code for an amino acid. They tell the ribosome to end translation and release the protein." },
  { keys: ["transcription"],
    answer: "Transcription is the copying of a gene from DNA into messenger RNA (mRNA). An enzyme called RNA polymerase reads the template strand and builds the mRNA, using U instead of T." },
  { keys: ["translation"],
    answer: "Translation is the building of a protein from mRNA. The ribosome reads the mRNA one codon at a time, tRNA molecules bring the matching amino acids, and the chain grows until a stop codon is reached." },
  { keys: ["codon"],
    answer: "A codon is a group of three bases in mRNA. Each codon codes for one amino acid or for a stop signal. There are 64 codons in total." },
  { keys: ["ribosome"],
    answer: "The ribosome is the molecular machine that performs translation. It reads the mRNA codon by codon and joins amino acids into a protein chain." },
  { keys: ["mrna", "messenger"],
    answer: "mRNA (messenger RNA) is a temporary copy of a gene. It carries the instructions from the DNA to the ribosome, where the protein is made." },
  { keys: ["amino acid"],
    answer: "Amino acids are the building blocks of proteins. Cells use 20 different amino acids, and the order in which they are joined decides the protein's shape and job." },
  { keys: ["genetic code", "degenerate", "redundan"],
    answer: "The genetic code is the set of rules that links codons to amino acids. It is redundant: 64 codons code for only 20 amino acids plus stop, so several codons can give the same amino acid." },
  { keys: ["dna"],
    answer: "DNA is the molecule that stores genetic information. It is written with four bases (A, T, G and C), and a gene is a stretch of DNA that holds the instructions for one protein." },
  { keys: ["protein"],
    answer: "A protein is a chain of amino acids folded into a specific shape. Proteins do most of the work in cells, for example as enzymes, building materials and signals." },
];

export function faqAnswer(question) {
  const q = question.toLowerCase();
  const hit = FAQ.find((f) => f.keys.some((k) => q.includes(k)));
  return hit
    ? hit.answer
    : "I can answer questions about DNA, transcription, translation, codons, amino acids and mutations. Try asking, for example: What is a codon?";
}

export async function askAssistant(question, fallbackText) {
  try {
    return { text: await post("/api/ask", { question }), source: "ai" };
  } catch {
    return { text: fallbackText ?? faqAnswer(question), source: "builtin" };
  }
}
