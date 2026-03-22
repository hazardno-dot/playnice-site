import React from "react";

const featuredFragrances = [
  {
    name: "Creed Aventus Cologne",
    vibe: "Fresh luxury icon with effortless confidence.",
    price5: "€15",
    price10: "€28",
    accent: "gold",
  },
  {
    name: "Givenchy Gentleman Réserve Privée",
    vibe: "Boozy elegance with dark sophistication.",
    price5: "€9",
    price10: "€16",
    accent: "silver",
  },
  {
    name: "Mancera Cedrat Boisé",
    vibe: "Citrus, woods and niche mass appeal.",
    price5: "€8",
    price10: "€14",
    accent: "bronze",
  },
  {
    name: "Gisada Ambassador",
    vibe: "Smooth, modern and dangerously complimented.",
    price5: "€8",
    price10: "€14",
    accent: "gold",
  },
  {
    name: "Armaf Club de Nuit Intense",
    vibe: "Bold projection with legendary value.",
    price5: "€4",
    price10: "€7",
    accent: "silver",
  },
  {
    name: "Afnan 9PM",
    vibe: "Night-out energy with addictive sweetness.",
    price5: "€4",
    price10: "€7",
    accent: "bronze",
  },
];

const reasons = [
  {
    title: "Try before you buy",
    text: "Test the fragrance on your skin in real life before committing to a full bottle.",
  },
  {
    title: "Curated selection",
    text: "Only carefully chosen niche, designer and Arabic fragrances make it into PlayNice.",
  },
  {
    title: "Luxury experience",
    text: "From visuals to packaging, every detail is designed to feel premium.",
  },
  {
    title: "Limited stock drops",
    text: "We keep things selective, desirable and worth paying attention to.",
  },
];

const steps = [
  {
    number: "01",
    title: "Choose your scent",
    text: "Pick from our curated selection of standout fragrances.",
  },
  {
    number: "02",
    title: "Order a decant",
    text: "Get 5ml or 10ml and experience the fragrance properly.",
  },
  {
    number: "03",
    title: "Wear it for real",
    text: "See how it performs on your skin, in your day, in your moments.",
  },
  {
    number: "04",
    title: "Decide with confidence",
    text: "No blind buying. Only smart fragrance decisions.",
  },
];

const faqs = [
  {
    q: "What is PlayNice?",
    a: "PlayNice is a curated fragrance concept focused on premium 5ml and 10ml decants so you can discover fragrances the right way.",
  },
  {
    q: "Why buy a decant first?",
    a: "Because wearing a fragrance on your skin tells you more than one store test ever will.",
  },
  {
    q: "How do I order?",
    a: "Send us a DM on Instagram or email us directly and we’ll guide you through the order.",
  },
];

function App() {
  return (
    <>
      <style>{`
        :root{
          --bg:#060606;
          --bg-soft:#0d0d0d;
          --panel:rgba(255,255,255,0.04);
          --panel-2:rgba(255,255,255,0.06);
          --text:#f5f1e8;
          --muted:#b8aea0;
          --gold:#d4af37;
          --gold-soft:#8f6d1f;
          --line:rgba(212,175,55,0.18);
          --shadow:0 20px 60px rgba(0,0,0,0.45);
          --radius:22px;
          --max:1200px;
        }

        *{box-sizing:border-box}
        html{scroll-behavior:smooth}
        body{
          margin:0;
          font-family: Inter, Arial, Helvetica, sans-serif;
          background:
            radial-gradient(circle at top left, rgba(212,175,55,0.12), transparent 25%),
            radial-gradient(circle at 80% 20%, rgba(212,175,55,0.08), transparent 20%),
            linear-gradient(180deg, #050505 0%, #090909 35%, #050505 100%);
          color:var(--text);
        }

        a{
          color:inherit;
          text-decoration:none;
        }

        .app{
          min-height:100vh;
          overflow:hidden;
        }

        .container{
          width:min(var(--max), calc(100% - 32px));
          margin:0 auto;
        }

        .topbar{
          position:sticky;
          top:0;
          z-index:50;
          backdrop-filter: blur(14px);
          background:rgba(6,6,6,0.7);
          border-bottom:1px solid rgba(255,255,255,0.04);
        }

        .topbar-inner{
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:16px;
          padding:14px 0;
        }

        .brand{
          display:flex;
          align-items:center;
          gap:12px;
          letter-spacing:0.18em;
          text-transform:uppercase;
          font-size:12px;
        }

        .brand-mark{
          width:34px;
          height:34px;
          border-radius:999px;
          border:1px solid var(--line);
          display:grid;
          place-items:center;
          color:var(--gold);
          box-shadow: inset 0 0 20px rgba(212,175,55,0.08);
          font-weight:700;
        }

        .nav{
          display:flex;
          gap:22px;
          align-items:center;
          color:var(--muted);
          font-size:14px;
        }

        .nav a:hover{
          color:var(--text);
        }

        .btn{
          display:inline-flex;
          align-items:center;
          justify-content:center;
          gap:10px;
          min-height:48px;
          padding:0 20px;
          border-radius:999px;
          font-weight:700;
          letter-spacing:0.04em;
          transition:0.25s ease;
          cursor:pointer;
          border:1px solid transparent;
        }

        .btn-gold{
          background:linear-gradient(180deg, #f0cf6c 0%, #d4af37 55%, #a07b19 100%);
          color:#111;
          box-shadow:0 10px 30px rgba(212,175,55,0.22);
        }

        .btn-gold:hover{
          transform:translateY(-2px);
          box-shadow:0 16px 36px rgba(212,175,55,0.28);
        }

        .btn-dark{
          background:rgba(255,255,255,0.03);
          border-color:rgba(255,255,255,0.08);
          color:var(--text);
        }

        .btn-dark:hover{
          background:rgba(255,255,255,0.06);
          transform:translateY(-2px);
        }

        .hero{
          position:relative;
          padding:72px 0 48px;
        }

        .hero-grid{
          display:grid;
          grid-template-columns:1.1fr 0.9fr;
          gap:32px;
          align-items:center;
        }

        .eyebrow{
          display:inline-flex;
          align-items:center;
          gap:10px;
          padding:10px 14px;
          border:1px solid var(--line);
          border-radius:999px;
          color:var(--gold);
          background:rgba(255,255,255,0.02);
          font-size:12px;
          letter-spacing:0.14em;
          text-transform:uppercase;
          margin-bottom:20px;
        }

        h1{
          margin:0;
          font-family: Georgia, "Times New Roman", serif;
          font-size:clamp(42px, 8vw, 88px);
          line-height:0.95;
          letter-spacing:-0.04em;
        }

        .gold{
          color:var(--gold);
        }

        .hero p{
          max-width:640px;
          color:var(--muted);
          font-size:18px;
          line-height:1.7;
          margin:22px 0 30px;
        }

        .hero-actions{
          display:flex;
          gap:14px;
          flex-wrap:wrap;
          margin-bottom:28px;
        }

        .hero-metrics{
          display:grid;
          grid-template-columns:repeat(3, minmax(0,1fr));
          gap:14px;
          margin-top:26px;
        }

        .metric{
          background:linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02));
          border:1px solid rgba(255,255,255,0.05);
          border-radius:18px;
          padding:18px;
          box-shadow:var(--shadow);
        }

        .metric strong{
          display:block;
          font-size:24px;
          color:var(--gold);
          margin-bottom:6px;
        }

        .metric span{
          color:var(--muted);
          font-size:14px;
        }

        .hero-visual{
          position:relative;
          min-height:560px;
          border-radius:32px;
          border:1px solid var(--line);
          background:
            radial-gradient(circle at 50% 20%, rgba(212,175,55,0.22), transparent 22%),
            radial-gradient(circle at 50% 100%, rgba(212,175,55,0.10), transparent 35%),
            linear-gradient(180deg, #131313 0%, #090909 100%);
          box-shadow:var(--shadow);
          overflow:hidden;
          display:flex;
          align-items:flex-end;
          justify-content:center;
          padding:30px;
        }

        .smoke{
          position:absolute;
          inset:auto -10% 15% -10%;
          height:180px;
          background:radial-gradient(circle, rgba(255,255,255,0.10), transparent 60%);
          filter:blur(28px);
          opacity:0.22;
        }

        .bottle-stage{
          position:relative;
          width:100%;
          height:100%;
          display:flex;
          align-items:flex-end;
          justify-content:center;
          gap:18px;
        }

        .bottle{
          position:relative;
          width:clamp(90px, 18vw, 150px);
          border-radius:24px 24px 18px 18px;
          border:1px solid rgba(255,255,255,0.08);
          background:linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,255,255,0.03));
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.12),
            0 20px 50px rgba(0,0,0,0.45);
          display:flex;
          align-items:flex-end;
          justify-content:center;
          padding:16px 12px;
        }

        .bottle::before{
          content:"";
          position:absolute;
          top:-22px;
          left:50%;
          transform:translateX(-50%);
          width:42%;
          height:20px;
          border-radius:8px 8px 2px 2px;
          background:linear-gradient(180deg, #191919, #080808);
          border:1px solid rgba(255,255,255,0.08);
        }

        .bottle::after{
          content:"";
          position:absolute;
          inset:10px;
          border-radius:18px;
          border:1px solid rgba(255,255,255,0.05);
          pointer-events:none;
        }

        .bottle.center{
          height:320px;
          transform:translateY(-10px);
        }

        .bottle.left,
        .bottle.right{
          height:250px;
          opacity:0.88;
        }

        .bottle-label{
          text-align:center;
          font-size:11px;
          letter-spacing:0.15em;
          text-transform:uppercase;
          color:var(--gold);
        }

        .reflection{
          position:absolute;
          bottom:6px;
          left:50%;
          transform:translateX(-50%);
          width:80%;
          height:38px;
          background:radial-gradient(circle, rgba(212,175,55,0.22), transparent 65%);
          filter:blur(16px);
        }

        .floating-card{
          position:absolute;
          right:22px;
          top:22px;
          padding:14px 16px;
          border-radius:18px;
          background:rgba(0,0,0,0.45);
          border:1px solid rgba(255,255,255,0.08);
          backdrop-filter:blur(12px);
          max-width:240px;
        }

        .floating-card strong{
          display:block;
          color:var(--gold);
          margin-bottom:6px;
          font-size:12px;
          letter-spacing:0.14em;
          text-transform:uppercase;
        }

        .floating-card span{
          color:var(--text);
          font-size:14px;
          line-height:1.5;
        }

        section{
          padding:28px 0 70px;
        }

        .section-head{
          display:flex;
          justify-content:space-between;
          align-items:end;
          gap:20px;
          margin-bottom:26px;
        }

        .section-head h2{
          margin:0;
          font-family: Georgia, "Times New Roman", serif;
          font-size:clamp(30px, 4vw, 52px);
          line-height:1;
          letter-spacing:-0.03em;
        }

        .section-head p{
          margin:0;
          max-width:560px;
          color:var(--muted);
          line-height:1.7;
        }

        .card-grid{
          display:grid;
          grid-template-columns:repeat(3, minmax(0, 1fr));
          gap:18px;
        }

        .card{
          position:relative;
          overflow:hidden;
          border-radius:24px;
          background:
            linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.03)),
            linear-gradient(180deg, #111 0%, #090909 100%);
          border:1px solid rgba(255,255,255,0.06);
          box-shadow:var(--shadow);
          padding:22px;
        }

        .card::before{
          content:"";
          position:absolute;
          inset:auto -10% -30% auto;
          width:180px;
          height:180px;
          border-radius:50%;
          background:radial-gradient(circle, rgba(212,175,55,0.16), transparent 62%);
          filter:blur(10px);
        }

        .tag{
          display:inline-flex;
          padding:8px 12px;
          border-radius:999px;
          border:1px solid var(--line);
          color:var(--gold);
          font-size:11px;
          text-transform:uppercase;
          letter-spacing:0.14em;
          margin-bottom:18px;
        }

        .fragrance-title{
          font-size:22px;
          line-height:1.2;
          margin:0 0 12px;
          font-family: Georgia, "Times New Roman", serif;
        }

        .fragrance-vibe{
          color:var(--muted);
          line-height:1.7;
          margin:0 0 20px;
          min-height:54px;
        }

        .prices{
          display:flex;
          gap:12px;
          flex-wrap:wrap;
        }

        .price-pill{
          padding:10px 14px;
          border-radius:999px;
          background:rgba(255,255,255,0.04);
          border:1px solid rgba(255,255,255,0.08);
          font-weight:700;
          font-size:14px;
        }

        .steps{
          display:grid;
          grid-template-columns:repeat(4, minmax(0,1fr));
          gap:18px;
        }

        .step-number{
          font-size:42px;
          color:rgba(212,175,55,0.22);
          font-weight:800;
          line-height:1;
          margin-bottom:14px;
        }

        .step-title{
          font-size:22px;
          margin:0 0 10px;
          font-family: Georgia, "Times New Roman", serif;
        }

        .step-text{
          margin:0;
          color:var(--muted);
          line-height:1.7;
        }

        .reason-grid{
          display:grid;
          grid-template-columns:repeat(2, minmax(0,1fr));
          gap:18px;
        }

        .reason-title{
          margin:0 0 10px;
          font-size:22px;
          font-family: Georgia, "Times New Roman", serif;
        }

        .reason-text{
          margin:0;
          color:var(--muted);
          line-height:1.7;
        }

        .split{
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:18px;
        }

        .cta{
          position:relative;
          overflow:hidden;
          border-radius:32px;
          background:
            radial-gradient(circle at top center, rgba(212,175,55,0.16), transparent 30%),
            linear-gradient(180deg, #111 0%, #070707 100%);
          border:1px solid var(--line);
          box-shadow:var(--shadow);
          padding:34px;
        }

        .cta h2{
          margin:0 0 14px;
          font-family: Georgia, "Times New Roman", serif;
          font-size:clamp(30px, 5vw, 56px);
          line-height:1;
        }

        .cta p{
          margin:0 0 24px;
          color:var(--muted);
          max-width:720px;
          line-height:1.8;
          font-size:17px;
        }

        .cta-actions{
          display:flex;
          gap:14px;
          flex-wrap:wrap;
        }

        .faq-item{
          padding:22px;
          border-radius:22px;
          border:1px solid rgba(255,255,255,0.06);
          background:rgba(255,255,255,0.03);
        }

        .faq-item h3{
          margin:0 0 10px;
          font-size:20px;
        }

        .faq-item p{
          margin:0;
          color:var(--muted);
          line-height:1.7;
        }

        .footer{
          padding:28px 0 90px;
          color:var(--muted);
        }

        .footer-inner{
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:18px;
          padding-top:18px;
          border-top:1px solid rgba(255,255,255,0.06);
        }

        .footer-links{
          display:flex;
          gap:18px;
          flex-wrap:wrap;
        }

        .sticky-mobile-cta{
          display:none;
        }

        @media (max-width: 980px){
          .hero-grid,
          .split,
          .reason-grid{
            grid-template-columns:1fr;
          }

          .card-grid{
            grid-template-columns:repeat(2, minmax(0,1fr));
          }

          .steps{
            grid-template-columns:repeat(2, minmax(0,1fr));
          }

          .hero-visual{
            min-height:420px;
          }

          .nav{
            display:none;
          }
        }

        @media (max-width: 640px){
          .container{
            width:min(var(--max), calc(100% - 20px));
          }

          .topbar-inner{
            padding:12px 0;
          }

          .hero{
            padding:42px 0 28px;
          }

          .hero p{
            font-size:16px;
          }

          .hero-metrics,
          .card-grid,
          .steps{
            grid-template-columns:1fr;
          }

          .section-head{
            align-items:start;
            flex-direction:column;
          }

          .cta{
            padding:24px;
            border-radius:26px;
          }

          .footer-inner{
            flex-direction:column;
            align-items:flex-start;
          }

          .sticky-mobile-cta{
            display:block;
            position:fixed;
            left:12px;
            right:12px;
            bottom:12px;
            z-index:80;
          }

          .sticky-mobile-cta a{
            width:100%;
          }
        }
      `}</style>

      <div className="app">
        <header className="topbar">
          <div className="container topbar-inner">
            <a href="#top" className="brand">
              <span className="brand-mark">P</span>
              <span>PlayNice</span>
            </a>

            <nav className="nav">
              <a href="#featured">Featured</a>
              <a href="#how">How it works</a>
              <a href="#why">Why PlayNice</a>
              <a href="#faq">FAQ</a>
            </nav>

            <a
              className="btn btn-gold"
              href="https://www.instagram.com/playnice.me"
              target="_blank"
              rel="noreferrer"
            >
              DM to order
            </a>
          </div>
        </header>

        <main id="top">
          <section className="hero">
            <div className="container hero-grid">
              <div>
                <div className="eyebrow">Luxury fragrance decants</div>

                <h1>
                  Discover fragrances
                  <br />
                  <span className="gold">the right way.</span>
                </h1>

                <p>
                  Niche. Designer. Arabic. Carefully selected fragrances in 5ml
                  and 10ml decants for people who want to test properly before
                  buying a full bottle.
                </p>

                <div className="hero-actions">
                  <a
                    className="btn btn-gold"
                    href="https://www.instagram.com/playnice.me"
                    target="_blank"
                    rel="noreferrer"
                  >
                    DM to order
                  </a>
                  <a className="btn btn-dark" href="#featured">
                    Explore selection
                  </a>
                </div>

                <div className="hero-metrics">
                  <div className="metric">
                    <strong>5ml / 10ml</strong>
                    <span>Smart testing sizes before full-bottle commitment.</span>
                  </div>
                  <div className="metric">
                    <strong>Curated</strong>
                    <span>No random clutter. Only fragrances worth attention.</span>
                  </div>
                  <div className="metric">
                    <strong>Limited</strong>
                    <span>Small-batch drops designed to feel selective.</span>
                  </div>
                </div>
              </div>

              <div className="hero-visual">
                <div className="floating-card">
                  <strong>Remember. PlayNice.</strong>
                  <span>
                    Premium decants for people who prefer confidence over blind
                    buying.
                  </span>
                </div>

                <div className="smoke" />

                <div className="bottle-stage">
                  <div className="bottle left">
                    <div className="bottle-label">
                      PlayNice
                      <br />
                      Selected
                    </div>
                  </div>
                  <div className="bottle center">
                    <div className="bottle-label">
                      PlayNice
                      <br />
                      Discovery
                    </div>
                  </div>
                  <div className="bottle right">
                    <div className="bottle-label">
                      PlayNice
                      <br />
                      Luxury
                    </div>
                  </div>
                  <div className="reflection" />
                </div>
              </div>
            </div>
          </section>

          <section id="featured">
            <div className="container">
              <div className="section-head">
                <div>
                  <h2>Featured fragrances</h2>
                </div>
                <p>
                  A strong first selection for a premium landing page. Easy to
                  scan, easy to desire, easy to order.
                </p>
              </div>

              <div className="card-grid">
                {featuredFragrances.map((item) => (
                  <article key={item.name} className="card">
                    <div className="tag">Limited stock</div>
                    <h3 className="fragrance-title">{item.name}</h3>
                    <p className="fragrance-vibe">{item.vibe}</p>
                    <div className="prices">
                      <span className="price-pill">5ml {item.price5}</span>
                      <span className="price-pill">10ml {item.price10}</span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section id="how">
            <div className="container">
              <div className="section-head">
                <div>
                  <h2>How it works</h2>
                </div>
                <p>
                  The PlayNice model is simple: experience the fragrance first,
                  then decide without regret.
                </p>
              </div>

              <div className="steps">
                {steps.map((step) => (
                  <article key={step.number} className="card">
                    <div className="step-number">{step.number}</div>
                    <h3 className="step-title">{step.title}</h3>
                    <p className="step-text">{step.text}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section id="why">
            <div className="container split">
              <div>
                <div className="section-head" style={{ marginBottom: 18 }}>
                  <div>
                    <h2>Why PlayNice</h2>
                  </div>
                </div>

                <div className="reason-grid">
                  {reasons.map((reason) => (
                    <article key={reason.title} className="card">
                      <h3 className="reason-title">{reason.title}</h3>
                      <p className="reason-text">{reason.text}</p>
                    </article>
                  ))}
                </div>
              </div>

              <div className="card" style={{ minHeight: 100 }}>
                <div className="tag">The concept</div>
                <h3
                  className="fragrance-title"
                  style={{ fontSize: "34px", marginBottom: 14 }}
                >
                  No blind buying.
                  <br />
                  Only smart fragrance moves.
                </h3>
                <p className="fragrance-vibe" style={{ minHeight: "auto" }}>
                  Most people decide too fast. One spray on paper, one quick
                  impression, one expensive mistake. PlayNice slows that down and
                  makes fragrance discovery feel premium, deliberate and worth it.
                </p>
                <p
                  className="fragrance-vibe"
                  style={{ minHeight: "auto", marginBottom: 0 }}
                >
                  This is not mass-market perfume shopping. This is curated
                  access, better testing and a more refined path to finding what
                  actually deserves your money.
                </p>
              </div>
            </div>
          </section>

          <section>
            <div className="container">
              <div className="cta">
                <div className="tag">Ready to order?</div>
                <h2>
                  Limited stock.
                  <br />
                  High attention.
                </h2>
                <p>
                  Explore the current selection, pick your decants, and order by
                  DM or email. Built for fragrance lovers who want premium taste
                  without unnecessary risk.
                </p>
                <div className="cta-actions">
                  <a
                    className="btn btn-gold"
                    href="https://www.instagram.com/playnice.me"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Order via Instagram
                  </a>
                  <a className="btn btn-dark" href="mailto:order@playniceshop.me">
                    order@playniceshop.me
                  </a>
                </div>
              </div>
            </div>
          </section>

          <section id="faq">
            <div className="container">
              <div className="section-head">
                <div>
                  <h2>Frequently asked</h2>
                </div>
                <p>
                  Keep the buying process clear, fast and confidence-building.
                </p>
              </div>

              <div className="card-grid">
                {faqs.map((item) => (
                  <article key={item.q} className="faq-item">
                    <h3>{item.q}</h3>
                    <p>{item.a}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        </main>

        <footer className="footer">
          <div className="container footer-inner">
            <div>
              <strong style={{ color: "#f5f1e8" }}>Remember. PlayNice.</strong>
              <div style={{ marginTop: 8 }}>
                Premium fragrance decants for smarter buying.
              </div>
            </div>

            <div className="footer-links">
              <a
                href="https://www.instagram.com/playnice.me"
                target="_blank"
                rel="noreferrer"
              >
                Instagram
              </a>
              <a href="mailto:order@playniceshop.me">Email</a>
              <a href="#featured">Featured</a>
              <a href="#how">How it works</a>
            </div>
          </div>
        </footer>

        <div className="sticky-mobile-cta">
          <a
            className="btn btn-gold"
            href="https://www.instagram.com/playnice.me"
            target="_blank"
            rel="noreferrer"
          >
            DM to order
          </a>
        </div>
      </div>
    </>
  );
}

export default App;
