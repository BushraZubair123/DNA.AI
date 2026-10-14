import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";

const LINKS = [
  ["/", "Home"],
  ["/learn", "Learn"],
  ["/codon-analyzer", "Codon Analyzer"],
  ["/mutation-lab", "Mutation Simulator"],
  ["/demo", "Demo"],
  ["/qr", "QR codes"],
];

export default function Layout() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    setOpen(false);
  }, [pathname]);

  return (
    <div className="site">
      <header className="topbar">
        <div className="wrap bar">
          <Link className="brand" to="/">Gene Expression Lab</Link>
          <button type="button" className="menu" aria-expanded={open} aria-controls="main-nav" onClick={() => setOpen(!open)}>
            {open ? "Close" : "Menu"}
          </button>
          <nav id="main-nav" className={open ? "open" : ""} aria-label="Main">
            {LINKS.map(([to, label]) => (
              <NavLink key={to} to={to} end={to === "/"}>{label}</NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="wrap">
        <Outlet />
      </main>

      <footer className="footer">
        <div className="wrap">
          <p><strong>Gene Expression Lab</strong> is an AI-assisted educational project.</p>
          <p>The app's code calculates transcription, translation and mutation types. The AI only explains the results.</p>
        </div>
      </footer>
    </div>
  );
}
