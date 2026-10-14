import { Routes, Route, Link } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Learn from "./pages/Learn";
import CodonAnalyzer from "./pages/CodonAnalyzer";
import MutationLab from "./pages/MutationLab";
import CodonScan from "./pages/CodonScan";
import Demo from "./pages/Demo";
import QrCodes from "./pages/QrCodes";

function NotFound() {
  return (
    <div className="page">
      <h1>Page not found</h1>
      <p className="lead">This page does not exist. <Link to="/">Go to the home page</Link>.</p>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="learn" element={<Learn />} />
        <Route path="codon-analyzer" element={<CodonAnalyzer />} />
        <Route path="mutation-lab" element={<MutationLab />} />
        <Route path="codon/:codon" element={<CodonScan />} />
        <Route path="demo" element={<Demo />} />
        <Route path="qr" element={<QrCodes />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
