import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { KEY_CODONS, CODON_GROUPS, pageUrl, codonPath, mutationPath } from "../links";
import { CODON_TABLE } from "../dnaLogic";

const isLocal = (u) => /^(https?:\/\/)?(localhost|127\.|192\.168\.|10\.)/i.test(u);

function Qr({ url, title, caption }) {
  const [src, setSrc] = useState("");
  useEffect(() => {
    let live = true;
    QRCode.toDataURL(url, { width: 360, margin: 2, errorCorrectionLevel: "M" })
      .then((d) => live && setSrc(d))
      .catch(() => live && setSrc(""));
    return () => { live = false; };
  }, [url]);
  return (
    <figure className="qr">
      {src ? <img src={src} width="180" height="180" alt={`QR code: ${title}`} /> : <div className="qr-empty" />}
      <figcaption><strong>{title}</strong><span>{caption}</span></figcaption>
    </figure>
  );
}

export default function QrCodes() {
  const [base, setBase] = useState(window.location.origin);
  const clean = base.trim();
  const valid = /^https?:\/\/.+/i.test(clean);

  return (
    <div className="page">
      <h1>QR codes for the model</h1>
      <p className="lead">Print these and stick them on the panels. Each code opens the right page of this website.</p>

      <div className="panel noprint">
        <label className="field" htmlFor="base">Website address</label>
        <input id="base" type="text" value={base} onChange={(e) => setBase(e.target.value)} spellCheck="false" inputMode="url" aria-invalid={!valid} />
        {!valid && <p className="error" role="alert">Start the address with https://</p>}
        {valid && isLocal(clean) && (
          <p className="error" role="alert">This address only works on this computer. Deploy the site, then paste its https address here so phones can open the codes.</p>
        )}
        <button type="button" className="ghost" onClick={() => window.print()}>Print this page</button>
      </div>

      {valid && (
        <>
          <h2 className="gap">Panel 1: AI Genetic Code Analyzer</h2>
          {CODON_GROUPS.map((g) => (
            <div key={g}>
              <h3>{g}</h3>
              <div className="qr-grid">
                {KEY_CODONS.filter((k) => k.group === g).map(({ codon, note }) => (
                  <Qr key={codon} url={pageUrl(clean, codonPath(codon))} title={codon} caption={`${CODON_TABLE[codon]} (${note})`} />
                ))}
              </div>
            </div>
          ))}

          <h2 className="gap">Panel 2: AI Mutation Simulator</h2>
          <div className="qr-grid">
            <Qr url={pageUrl(clean, mutationPath)} title="What could happen if this DNA base changes?" caption="Opens the mutation and asks the AI" />
          </div>
        </>
      )}
    </div>
  );
}
