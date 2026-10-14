import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Tiles } from "../components/Tiles";
import { codonInfo, normalizeCodon } from "../dnaLogic";
import { askAssistant, codonQuestion } from "../ai";

function builtinText(info) {
  if (info.isStop) return `${info.codon} is a stop codon. It does not code for an amino acid; it tells the ribosome to end translation.`;
  const start = info.isStart ? " It is also the start codon, where translation begins." : "";
  const more = info.synonyms.length
    ? ` ${info.name} has ${info.synonyms.length} other codon${info.synonyms.length > 1 ? "s" : ""}: ${info.synonyms.join(", ")}.`
    : ` ${info.name} has no other codons.`;
  return `${info.codon} codes for ${info.name} (${info.aa}).${start}${more}`;
}

// Opened by scanning a codon QR code: shows only that one codon.
export default function CodonScan() {
  const { codon: raw } = useParams();
  const codon = normalizeCodon(raw || "");
  const info = codon ? codonInfo(codon) : null;
  const [ai, setAi] = useState({ status: "idle" });

  useEffect(() => {
    if (!codon) return;
    let live = true;
    setAi({ status: "loading" });
    askAssistant(codonQuestion(codon), builtinText(codonInfo(codon))).then((r) => {
      if (live) setAi({ status: "done", ...r });
    });
    return () => { live = false; };
  }, [codon]);

  if (!info) {
    return (
      <div className="page">
        <h1>Codon not found</h1>
        <p className="lead">"{raw}" is not a valid codon. <Link to="/codon-analyzer">Open the Codon Analyzer</Link>.</p>
      </div>
    );
  }

  const kind = info.isStart ? "Start codon" : info.isStop ? "Stop codon" : "Codon";

  return (
    <div className="page scan">
      <p className="panel-tag">AI panel 1 of 2 · {kind}</p>
      <h1>{info.codon}</h1>
      <div className="panel">
        <Tiles seq={info.codon} label={`Codon ${info.codon}`} />
        <h2>
          {info.isStop ? "Stop signal" : info.name}
          {!info.isStop && <span className="abbr"> ({info.aa})</span>}
        </h2>
        <p>
          {info.isStart && "Start codon: translation begins here. "}
          {info.isStop && "This codon does not make an amino acid. It ends translation. "}
          {!info.isStop && !info.isStart && "A regular codon: it adds this amino acid to the protein. "}
          {info.synonyms.length > 0
            ? `Other codons for the same result: ${info.synonyms.join(", ")}.`
            : "No other codon gives this result."}
        </p>
        <div className="explain" aria-live="polite">
          {ai.status === "loading" && <p>Asking the AI…</p>}
          {ai.status === "done" && (
            <>
              <p>{ai.text}</p>
              <small>{ai.source === "ai" ? "Explained by AI." : "AI is not reachable, so this is a built-in explanation."}</small>
            </>
          )}
        </div>
      </div>
      <p className="next"><Link to="/codon-analyzer">See other codons</Link> · <Link to="/mutation-lab">AI Mutation Simulator</Link></p>
    </div>
  );
}
