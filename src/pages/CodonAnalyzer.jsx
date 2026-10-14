import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Tiles } from "../components/Tiles";
import { CODON_TABLE, codonInfo, normalizeCodon } from "../dnaLogic";
import { askAssistant, codonQuestion } from "../ai";
import { KEY_CODONS, CODON_GROUPS } from "../links";

function builtinText(info) {
  if (info.isStop) return `${info.codon} is a stop codon. It does not code for an amino acid; it tells the ribosome to end translation.`;
  const start = info.isStart ? " It is also the start codon, where translation begins." : "";
  const more = info.synonyms.length
    ? ` ${info.name} has ${info.synonyms.length} other codon${info.synonyms.length > 1 ? "s" : ""}: ${info.synonyms.join(", ")}.`
    : ` ${info.name} has no other codons.`;
  return `${info.codon} codes for ${info.name} (${info.aa}).${start}${more}`;
}

export default function CodonAnalyzer() {
  const [params] = useSearchParams();
  const fromQr = normalizeCodon(params.get("codon") || "");
  const [text, setText] = useState(fromQr || "AUG");
  const [ai, setAi] = useState({ status: "idle" });
  const autoDone = useRef(false);

  const codon = normalizeCodon(text);
  const info = codon ? codonInfo(codon) : null;
  const typed = text.trim().length > 0;

  const runAsk = async (c) => {
    setAi({ status: "loading" });
    const r = await askAssistant(codonQuestion(c), builtinText(codonInfo(c)));
    setAi({ status: "done", ...r });
  };

  // A QR code opens this page with ?codon=AUG&ask=1 -> ask the AI straight away.
  useEffect(() => {
    if (autoDone.current || !fromQr || params.get("ask") !== "1") return;
    autoDone.current = true;
    runAsk(fromQr);
  }, [fromQr, params]);

  const choose = (c) => { setText(c); setAi({ status: "idle" }); };
  const onType = (v) => { setText(v.slice(0, 3)); setAi({ status: "idle" }); };

  return (
    <div className="page">
      <p className="panel-tag">AI panel 1 of 2</p>
      <h1>AI Genetic Code Analyzer</h1>
      <ol className="flow" aria-label="How it works">
        <li>Scan</li><li>Ask AI</li><li>Get result</li>
      </ol>
      <p className="lead">A codon is three mRNA bases. Pick the start codon, a stop codon or one of the basic codons below, or type your own, to see what it does in translation.</p>

      {CODON_GROUPS.map((g) => (
        <div key={g}>
          <h3>{g}</h3>
          <div className="quick" role="group" aria-label={g}>
            {KEY_CODONS.filter((k) => k.group === g).map(({ codon: c, note }) => (
              <button key={c} type="button" className={`quick-btn${c === "AUG" ? " start" : ""}${CODON_TABLE[c] === "Stop" ? " stop" : ""}`} aria-pressed={codon === c} onClick={() => choose(c)}>
                <strong>{c}</strong><span>{CODON_TABLE[c]}</span><small>{note}</small>
              </button>
            ))}
          </div>
        </div>
      ))}

      <div className="panel">
        <label className="field" htmlFor="codon">Codon (3 letters, DNA or RNA)</label>
        <input id="codon" className="codon-input" value={text} onChange={(e) => onType(e.target.value)}
          maxLength={3} spellCheck="false" autoCapitalize="characters" aria-invalid={typed && !codon} />
        {typed && !codon && <p className="error" role="alert">Enter exactly 3 letters from A, U (or T), G and C.</p>}

        {info && (
          <div className="analysis">
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
            <button type="button" onClick={() => runAsk(info.codon)} disabled={ai.status === "loading"}>
              {ai.status === "loading" ? "Asking the AI…" : `Ask the AI: what does ${info.codon} code for?`}
            </button>
            <div aria-live="polite">
              {ai.status === "done" && (
                <div className="explain">
                  <p>{ai.text}</p>
                  <small>{ai.source === "ai" ? "Explained by AI." : "AI is not reachable, so this is a built-in explanation."}</small>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <p className="next">Next on the model: <Link to="/mutation-lab">AI Mutation Simulator</Link>. What happens if a base in this codon changes?</p>
    </div>
  );
}
