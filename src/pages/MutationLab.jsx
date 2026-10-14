import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Tiles, Chain } from "../components/Tiles";
import {
  EXAMPLES, MAX_LENGTH, TYPE_INFO,
  cleanDNA, transcribe, translate, classify, proteinText,
} from "../dnaLogic";
import { explainMutation } from "../ai";
import { MODEL_MUTATION } from "../links";

const BASES = ["A", "T", "G", "C"];

function Led({ color, on, label }) {
  return (
    <span className={`led ${color}${on ? " on" : ""}`} role="img" aria-label={`${label} LED ${on ? "on" : "off"}`} />
  );
}

export default function MutationLab() {
  const [params] = useSearchParams();
  const [input, setInput] = useState(EXAMPLES.coding);
  const [strand, setStrand] = useState("coding");
  const [mutated, setMutated] = useState(null); // null = not mutated yet
  const [sel, setSel] = useState(null);
  const [edit, setEdit] = useState(null);       // { index, kind }
  const [ai, setAi] = useState({ status: "idle" });
  const [preset, setPreset] = useState(MODEL_MUTATION); // the removable base on the physical model
  const [notice, setNotice] = useState("");
  const autoDone = useRef(false);

  const invalid = /[^ATGC\s]/i.test(input);
  const original = useMemo(
    () => (invalid ? "" : cleanDNA(input).slice(0, MAX_LENGTH)),
    [input, invalid]
  );
  const current = mutated ?? original;

  const orig = useMemo(() => translate(transcribe(original, strand)), [original, strand]);
  const mrna = useMemo(() => transcribe(current, strand), [current, strand]);
  const mut = useMemo(() => translate(mrna), [mrna]);
  const type = useMemo(() => classify(original, current, strand), [original, current, strand]);
  const isMutated = type !== "none";

  const resetEdits = () => { setMutated(null); setSel(null); setEdit(null); setNotice(""); setAi({ status: "idle" }); };
  const changeInput = (v) => { setInput(v); resetEdits(); };
  const changeStrand = (s) => { setStrand(s); setInput(EXAMPLES[s]); resetEdits(); };

  const applyEdit = (next, kind, index) => {
    setMutated(next);
    setEdit({ kind, index });
    setSel(next.length ? Math.min(index, next.length - 1) : null);
    setNotice("");
    setAi({ status: "idle" });
  };
  const substitute = (b) => applyEdit(current.slice(0, sel) + b + current.slice(sel + 1), "sub", sel);
  const insertBefore = (b) => applyEdit(current.slice(0, sel) + b + current.slice(sel), "ins", sel);
  const remove = () => applyEdit(current.slice(0, sel) + current.slice(sel + 1), "del", sel);

  const askAi = async (dna, mutDna) => {
    setAi({ status: "loading" });
    const o = translate(transcribe(dna, strand));
    const m = translate(transcribe(mutDna, strand));
    const result = await explainMutation({
      mutationType: classify(dna, mutDna, strand),
      originalDNA: dna,
      mutatedDNA: mutDna,
      originalProtein: proteinText(o),
      mutatedProtein: proteinText(m),
    });
    setAi({ status: "done", ...result });
  };
  const explain = () => askAi(original, current);

  // The MUTATION button on the model: replace the removable base.
  const pressMutation = (explainNow = false) => {
    const idx = preset.position - 1;
    if (idx < 0 || idx >= original.length) { setNotice("That position is outside your DNA sequence."); return; }
    if (original[idx] === preset.base) {
      setNotice(`Base ${preset.position} is already ${preset.base}. Choose a different base to replace it with.`);
      return;
    }
    const next = original.slice(0, idx) + preset.base + original.slice(idx + 1);
    applyEdit(next, "sub", idx);
    if (explainNow) askAi(original, next);
  };

  // QR code opens  /mutation-lab?mutate=1  -> press MUTATION and ask the AI.
  useEffect(() => {
    if (autoDone.current || params.get("mutate") !== "1") return;
    autoDone.current = true;
    pressMutation(true);
  }, [params]);

  const flagIndex = edit && edit.kind !== "del" ? edit.index : null;
  const tooShort = !invalid && original.length < 3;
  const offFrame = !invalid && original.length >= 3 && original.length % 3 !== 0;

  // First codon (in the reading frame) that is different after the mutation.
  const changedAt = useMemo(() => {
    if (!isMutated) return -1;
    const n = Math.max(orig.codons.length, mut.codons.length);
    for (let i = 0; i < n; i++) if (orig.codons[i]?.codon !== mut.codons[i]?.codon) return i;
    return -1;
  }, [isMutated, orig, mut]);
  const oc = changedAt >= 0 ? orig.codons[changedAt] : null;
  const mc = changedAt >= 0 ? mut.codons[changedAt] : null;

  return (
    <div className="page lab">
      <p className="panel-tag">AI panel 2 of 2</p>
      <h1>AI Mutation Simulator</h1>
      <p className="lead">On the model, one DNA base can be taken out and replaced. Do the same here: press MUTATION, or tap any base yourself, and see what happens to the protein.</p>

      <section className="panel switch" aria-labelledby="h-switch">
        <h2 id="h-switch">Model switches</h2>
        <div className="switch-row">
          <button type="button" className="sw sw-normal" onClick={resetEdits}>
            <Led color="green" on={!isMutated} label="Green" /> NORMAL
          </button>
          <button type="button" className="sw sw-mut" onClick={() => pressMutation(false)} disabled={original.length < 3}>
            <Led color="red" on={isMutated} label="Red" /> MUTATION
          </button>
        </div>
        <div className="row preset">
          <span>Removable base on your model</span>
          <label>Position
            <input type="number" min="1" max={Math.max(original.length, 1)} value={preset.position}
              onChange={(e) => setPreset({ ...preset, position: Math.max(1, Number(e.target.value) || 1) })} />
          </label>
          <span>replaced with</span>
          {BASES.map((b) => (
            <button key={b} type="button" className={`pick b-${b}`} aria-pressed={preset.base === b}
              onClick={() => setPreset({ ...preset, base: b })}>{b}</button>
          ))}
        </div>
        {notice && <p className="note" role="status">{notice}</p>}
      </section>

      {original.length >= 3 && (
        <section className="board" aria-label="Normal and mutation sides">
          <div className={`side normal${!isMutated ? " lit" : ""}`}>
            <h2><Led color="green" on={!isMutated} label="Green" /> Normal</h2>
            <p className="path">DNA → mRNA → amino acid → protein</p>
            <h3>DNA</h3>
            <Tiles seq={original} label="Normal DNA" />
            <h3>mRNA</h3>
            <Tiles seq={transcribe(original, strand)} label="Normal mRNA" />
            <h3>Protein</h3>
            <Chain codons={orig.codons} />
          </div>

          <div className={`side mutation${isMutated ? " lit" : ""}`}>
            <h2><Led color="red" on={isMutated} label="Red" /> Mutation</h2>
            <p className="path">DNA change → altered codon → possible amino-acid change</p>
            {!isMutated ? (
              <p className="muted pad">Nothing has changed yet. Press MUTATION, or tap a DNA base below.</p>
            ) : (
              <>
                <h3>DNA change</h3>
                <Tiles seq={current} label="Mutated DNA" flagIndex={flagIndex} />
                <p className="note">
                  {edit?.kind === "sub" && `Base ${edit.index + 1} was replaced.`}
                  {edit?.kind === "ins" && `A base was inserted at position ${edit.index + 1}.`}
                  {edit?.kind === "del" && `The base at position ${edit.index + 1} was deleted.`}
                </p>
                <h3>Altered codon</h3>
                {oc && mc ? (
                  <p className="swap"><b>{oc.codon}</b> <span aria-hidden="true">→</span><span className="sr"> changed to </span> <b>{mc.codon}</b></p>
                ) : oc ? (
                  <p className="swap"><b>{oc.codon}</b> is no longer read</p>
                ) : (
                  <p className="muted">The reading frame changed, so the codons are read differently.</p>
                )}
                <h3>Amino-acid change</h3>
                <p className="swap">
                  {oc && mc
                    ? (oc.aa === mc.aa ? `${oc.aa} stays ${mc.aa}: no change in the protein` : `${oc.aa} becomes ${mc.aa}`)
                    : TYPE_INFO[type].label}
                </p>
                <h3>Protein</h3>
                <Chain codons={mut.codons} compare={orig.codons} />
              </>
            )}
          </div>
        </section>
      )}

      {isMutated && (
        <section className="panel result" aria-labelledby="h-result">
          <h2 id="h-result">{TYPE_INFO[type].label}</h2>
          <p>{TYPE_INFO[type].summary}</p>
          <p className="note">Not every mutation changes a protein. Some are silent or have very little effect.</p>

          <div className="actions">
            <button type="button" onClick={explain} disabled={ai.status === "loading"}>
              {ai.status === "loading" ? "Asking the AI…" : "Ask the AI: what could happen if this base changes?"}
            </button>
            <button type="button" className="ghost" onClick={resetEdits}>Undo all mutations</button>
          </div>

          <div aria-live="polite">
            {ai.status === "done" && (
              <div className="explain">
                <p>{ai.text}</p>
                <small>
                  {ai.source === "ai"
                    ? "Explained by AI. The mutation type was calculated by the app."
                    : "AI is not reachable, so this is a built-in explanation."}
                </small>
              </div>
            )}
          </div>
        </section>
      )}

      <section className="panel" aria-labelledby="h-gene">
        <h2 id="h-gene">Change a base yourself</h2>
        {original.length >= 3 ? (
          <>
            <h3>DNA <span className="hint">tap a base to mutate it</span></h3>
            <Tiles seq={current} label="DNA bases" selected={sel} onPick={setSel} flagIndex={flagIndex} />

            {sel !== null && current[sel] && (
              <div className="tools">
                <p>Base {sel + 1} is <b>{current[sel]}</b>.</p>
                <div className="row">
                  <span>Change it to</span>
                  {BASES.map((b) => (
                    <button key={b} type="button" className={`pick b-${b}`} disabled={b === current[sel]} onClick={() => substitute(b)}>{b}</button>
                  ))}
                </div>
                <div className="row">
                  <span>Insert before it</span>
                  {BASES.map((b) => (
                    <button key={b} type="button" className={`pick b-${b}`} onClick={() => insertBefore(b)}>{b}</button>
                  ))}
                </div>
                <div className="row">
                  <button type="button" className="ghost" onClick={remove}>Delete this base</button>
                </div>
              </div>
            )}
          </>
        ) : (
          <p className="muted">Type at least 3 bases below to start.</p>
        )}
      </section>

      <section className="panel" aria-labelledby="h-input">
        <h2 id="h-input">Your DNA</h2>

        <fieldset className="strand">
          <legend>Which strand are you typing?</legend>
          <label>
            <input type="radio" name="strand" checked={strand === "coding"} onChange={() => changeStrand("coding")} />
            Coding strand (has T, same letters as mRNA)
          </label>
          <label>
            <input type="radio" name="strand" checked={strand === "template"} onChange={() => changeStrand("template")} />
            Template strand (written 3′→5′)
          </label>
        </fieldset>

        <label className="field" htmlFor="dna">DNA sequence (A, T, G, C)</label>
        <textarea
          id="dna" rows={2} spellCheck="false" autoCapitalize="characters"
          value={input} onChange={(e) => changeInput(e.target.value)}
          aria-invalid={invalid}
        />
        {invalid && <p className="error" role="alert">Only the letters A, T, G and C are allowed. Remove any other characters.</p>}
        {tooShort && <p className="note">Type at least 3 bases to make one codon.</p>}
        {offFrame && <p className="note">The length is not a multiple of 3, so the last bases do not form a full codon.</p>}
        {original.length === MAX_LENGTH && <p className="note">Only the first {MAX_LENGTH} bases are used.</p>}
        <button type="button" className="ghost" onClick={() => changeInput(EXAMPLES[strand])}>Load the model's example</button>
      </section>

    </div>
  );
}
