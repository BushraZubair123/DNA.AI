import { Link } from "react-router-dom";
import { Tiles, Chain } from "../components/Tiles";
import { EXAMPLES, transcribe, translate, TYPE_INFO } from "../dnaLogic";

const STEPS = [
  ["dna", "DNA"],
  ["transcription", "Transcription"],
  ["translation", "Translation"],
  ["mutations", "Mutations"],
  ["code", "Genetic code"],
];

const MUTATION_ROWS = [
  ["silent", "GGC → GGA", "Gly → Gly"],
  ["missense", "TTT → TTA", "Phe → Leu"],
  ["nonsense", "TTA → TAA", "Leu → Stop"],
  ["frameshift", "Delete one base", "Reading frame shifts"],
];

export default function Learn() {
  const dna = EXAMPLES.coding;
  const mrna = transcribe(dna, "coding");
  const { codons } = translate(mrna);
  const jump = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="page prose-page">
      <h1>How a gene becomes a protein</h1>
      <p className="lead">Five ideas, in the order a cell uses them. The same example gene is used throughout.</p>

      <div className="subnav" role="group" aria-label="Jump to a topic">
        {STEPS.map(([id, label]) => (
          <button key={id} type="button" className="ghost small" onClick={() => jump(id)}>{label}</button>
        ))}
      </div>

      <article id="dna" className="topic">
        <h2>DNA stores the instructions</h2>
        <p>DNA is written with four bases: A, T, G and C. A <b>gene</b> is a stretch of DNA that holds the instructions for one protein. The order of the bases is the information.</p>
        <Tiles seq={dna} label="Example gene" />
        <p className="note">Colors: A green, T red, G amber, C blue. Bases are grouped in threes because the cell reads them in threes.</p>
      </article>

      <article id="transcription" className="topic">
        <h2>Transcription copies the gene into mRNA</h2>
        <p>An enzyme called RNA polymerase reads the gene and builds a matching strand of <b>messenger RNA (mRNA)</b>. RNA uses <b>U</b> (uracil) in place of T. The mRNA then carries the message to the ribosome.</p>
        <Tiles seq={mrna} label="mRNA copy" />
        <p className="note">Here the mRNA letters match the coding strand, with U instead of T. The enzyme actually reads the other (template) strand, which is complementary.</p>
      </article>

      <article id="translation" className="topic">
        <h2>Translation builds the protein</h2>
        <p>The ribosome reads the mRNA one <b>codon</b> (three bases) at a time. Each codon calls for one amino acid, and transfer RNA (tRNA) brings it. Translation begins at the start codon <b>AUG</b> and ends at a stop codon.</p>
        <Chain codons={codons} />
      </article>

      <article id="mutations" className="topic">
        <h2>Mutations change the sequence</h2>
        <p>A mutation is a change in the DNA. Whether it changes the protein depends on what the new codon codes for.</p>
        <div className="scroll">
          <table className="tbl">
            <thead>
              <tr><th>Type</th><th>What happens</th><th>Example</th><th>Result</th></tr>
            </thead>
            <tbody>
              {MUTATION_ROWS.map(([type, change, result]) => (
                <tr key={type}>
                  <th scope="row">{TYPE_INFO[type].label.replace(" mutation", "")}</th>
                  <td>{TYPE_INFO[type].summary}</td>
                  <td>{change}</td>
                  <td>{result}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="note">Not every mutation changes a protein, and not every mutation causes a disease.</p>
        <p><Link to="/mutation-lab">Try it yourself in the Mutation Lab</Link></p>
      </article>

      <article id="code" className="topic">
        <h2>The genetic code</h2>
        <p>There are 64 possible codons but only 20 amino acids, so several codons code for the same amino acid. This is called <b>redundancy</b>, and it is why silent mutations exist. One codon (AUG) is the start signal, and three (UAA, UAG, UGA) are stop signals.</p>
        <p><Link to="/codon-analyzer">Explore the start, stop and key codons</Link></p>
      </article>
    </div>
  );
}
