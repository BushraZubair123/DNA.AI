// Bases shown in groups of three (codons). Pass onPick to make them tappable.
export function Tiles({ seq, label, selected, onPick, flagIndex }) {
  const starts = [];
  for (let i = 0; i < seq.length; i += 3) starts.push(i);
  return (
    <div className="tiles" role="group" aria-label={label}>
      {starts.map((g) => (
        <div className="codon" key={g}>
          {seq.slice(g, g + 3).split("").map((b, k) => {
            const i = g + k;
            const cls = `tile b-${b}${flagIndex === i ? " flag" : ""}`;
            return onPick ? (
              <button
                key={i} type="button" className={cls}
                aria-pressed={selected === i}
                aria-label={`Base ${i + 1}: ${b}`}
                onClick={() => onPick(i)}
              >{b}</button>
            ) : (
              <span key={i} className={cls}>{b}</span>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// Amino-acid chips. Chips that differ from `compare` are flagged.
export function Chain({ codons, compare }) {
  if (!codons.length) return <p className="muted">No AUG start codon, so no protein is made.</p>;
  return (
    <ol className="chain">
      {codons.map((c, i) => {
        const changed = compare && (!compare[i] || compare[i].aa !== c.aa);
        const cls = `chip${c.aa === "Stop" ? " stop" : ""}${changed ? " diff" : ""}`;
        return (
          <li className={cls} key={i}>
            <strong>{c.aa}</strong>
            <span>{c.codon}</span>
            {changed && <em>changed</em>}
          </li>
        );
      })}
    </ol>
  );
}
