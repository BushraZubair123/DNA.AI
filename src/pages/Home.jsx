import { Link } from "react-router-dom";
import { Tiles, Chain } from "../components/Tiles";
import { EXAMPLES, transcribe, translate } from "../dnaLogic";

const TOUR = [
  ["/learn", "Learn", "DNA, transcription, translation and mutations explained step by step."],
  ["/codon-analyzer", "Codon Analyzer", "AI panel 1. See what the start, stop and key codons do."],
  ["/mutation-lab", "Mutation Simulator", "AI panel 2. Change one base and watch the protein change."],
  ["/demo", "Demo", "The five-step presentation guide."],
  ["/qr", "QR codes", "Printable codes for each panel of the model."],
];

export default function Home() {
  const dna = EXAMPLES.coding;
  const mrna = transcribe(dna, "coding");
  const { codons } = translate(mrna);

  return (
    <div className="page">
      <section className="hero">
        <h1>Follow a gene from DNA to protein</h1>
        <p className="lead">
          A cell copies a gene into mRNA and reads it three letters at a time to build a protein.
          Here you can watch each step, then change one letter and see what happens.
        </p>
        <div className="actions">
          <Link className="btn" to="/mutation-lab">Open the Mutation Simulator</Link>
          <Link className="btn ghost" to="/learn">Start with the basics</Link>
        </div>

        <div className="hero-demo panel">
          <h3>DNA</h3>
          <Tiles seq={dna} label="Example DNA" />
          <h3>mRNA</h3>
          <Tiles seq={mrna} label="Example mRNA" />
          <h3>Protein</h3>
          <Chain codons={codons} />
        </div>
      </section>

      <section className="block">
        <h2>Explore the website</h2>
        <ul className="tour">
          {TOUR.map(([to, title, text]) => (
            <li key={to}>
              <Link to={to}><strong>{title}</strong><span>{text}</span></Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="block">
        <h2>Where the AI fits</h2>
        <div className="split">
          <div>
            <h3>The code calculates</h3>
            <p>Transcription, the genetic code table, translation and the mutation type (silent, missense, nonsense, frameshift) are exact rules. A program applies them, so the answer is always the same and always correct.</p>
          </div>
          <div>
            <h3>The AI explains</h3>
            <p>Once the result is calculated, the AI puts it into simple words and answers questions. If the AI is not reachable, the site shows a built-in explanation instead, so nothing breaks.</p>
          </div>
        </div>
      </section>

      <section className="block">
        <h2>Two AI panels on the physical model</h2>
        <p className="prose">
          This website goes with a hands-on model of gene expression. Beside the DNA, mRNA, ribosome and protein
          there are two AI panels, and each one has a QR code that opens its page here.
        </p>
        <ul className="panels3">
          <li>
            <h3>AI Genetic Code Analyzer</h3>
            <p>Scan a start, stop or key codon such as AUG and the AI explains what it does.</p>
            <Link to="/codon-analyzer">Open panel 1</Link>
          </li>
          <li>
            <h3>AI Mutation Simulator</h3>
            <p>One DNA base can be swapped on the model. A green LED shows normal, a red LED shows a mutation.</p>
            <Link to="/mutation-lab">Open panel 2</Link>
          </li>
        </ul>
      </section>
    </div>
  );
}
