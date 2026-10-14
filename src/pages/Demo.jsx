import { useState } from "react";
import { Link } from "react-router-dom";
import { codonPath, mutationPath } from "../links";

// The five presentation steps from the project guide.
const STEPS = [
  { title: "DNA", say: "This is DNA, which stores genetic information.", action: "Point to the DNA on the model.", to: "/learn" },
  { title: "Transcription", say: "During transcription, the information in DNA is copied into messenger RNA, or mRNA.", action: "Point to the mRNA on the model.", to: "/learn" },
  { title: "Translation", say: "The mRNA then moves to the ribosome, where translation occurs.", action: "Point to the ribosome, amino acids and protein.", to: "/learn" },
  { title: "AI Genetic Analyzer", say: "Our model goes one step further. We have integrated AI to analyze genetic information.", action: "Scan the codon QR code (for example the start codon AUG) and show that codon's page.", to: codonPath("AUG") },
  { title: "Mutation", say: "Let's see what happens when the DNA sequence changes.", action: "Replace the removable base, press MUTATION so the red LED lights, then scan the mutation QR code.", to: mutationPath },
];

export default function Demo() {
  const [i, setI] = useState(0);
  const step = STEPS[i];

  return (
    <div className="page lab">
      <h1>Presentation guide</h1>
      <p className="lead">The five steps of the demonstration, with the line to say and the page to open.</p>

      <ol className="stepper" aria-label="Steps">
        {STEPS.map((s, k) => (
          <li key={s.title}>
            <button type="button" aria-current={k === i ? "step" : undefined} onClick={() => setI(k)}>
              <span>{k + 1}</span>{s.title}
            </button>
          </li>
        ))}
      </ol>

      <section className="panel step-card" aria-live="polite">
        <h2>Step {i + 1}: {step.title}</h2>
        <h3>Say</h3>
        <p className="quote">{step.say}</p>
        <h3>Do</h3>
        <p>{step.action}</p>
        <div className="actions">
          <Link className="btn" to={step.to}>Open this page</Link>
          <button type="button" className="ghost" onClick={() => setI(Math.max(0, i - 1))} disabled={i === 0}>Previous</button>
          <button type="button" onClick={() => setI(Math.min(STEPS.length - 1, i + 1))} disabled={i === STEPS.length - 1}>Next step</button>
        </div>
      </section>

      <section className="panel">
        <h2>How the two AI panels connect</h2>
        <p>AI Genetic Analyzer: "What does this codon do?" gives an amino acid, a start or a stop. AI Mutation Simulator: "What if the DNA changes?" shows the effect on the protein.</p>
        <p className="note">Say that the AI explains the results. The code calculates them. Avoid saying that every mutation changes a protein or causes a disease.</p>
      </section>
    </div>
  );
}
