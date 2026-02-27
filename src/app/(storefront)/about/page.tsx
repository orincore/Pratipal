"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function AboutPage() {
  useEffect(() => {
    // Marquee
    const items = ["Heal Yourself", "Heal Others", "Ancient Wisdom · Modern Life", "Transform from Within", "Medicine-Free Living", "Every Moment, A Companion", "15+ Healing Modalities", "Reiki · EFT · Tarot · Naturopathy"];
    const track = document.getElementById('mq');
    if (track) {
      const all = [...items, ...items];
      track.innerHTML = all.map(t => `<span class="mq-item">${t}<span class="mq-dot"> ✦ </span></span>`).join('');
    }

    // Reveal on scroll
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('on'); });
    }, { threshold: .1 });
    document.querySelectorAll('.rv,.rvl,.rvr').forEach(el => io.observe(el));
  }, []);

  return (
    <>
      <style jsx>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        :root{
          --b:#2d5fa6;
          --t:#1B7F79;
          --g:#1a8a4a;
          --grad:linear-gradient(135deg,#2d5fa6 0%,#1B7F79 50%,#1a8a4a 100%);
          --grad-text:linear-gradient(135deg,#4a9ff5,#1B7F79,#2dc77a);
          --ink:#0d0d0d;
          --cream:#f8faf9;
          --white:#fff;
        }
        html{scroll-behavior:smooth;}
        body{font-family:'DM Sans',sans-serif;color:var(--ink);background:#fff;overflow-x:hidden;}
        .serif{font-family:'Cormorant Garamond',serif;}
        .gt{background:var(--grad-text);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}

        /* ── REVEAL ── */
        .rv{opacity:0;transform:translateY(40px);transition:opacity .9s cubic-bezier(.16,1,.3,1),transform .9s cubic-bezier(.16,1,.3,1);}
        .rvl{opacity:0;transform:translateX(-48px);transition:opacity .9s cubic-bezier(.16,1,.3,1),transform .9s cubic-bezier(.16,1,.3,1);}
        .rvr{opacity:0;transform:translateX(48px);transition:opacity .9s cubic-bezier(.16,1,.3,1),transform .9s cubic-bezier(.16,1,.3,1);}
        .on{opacity:1!important;transform:none!important;}

        /* ── HERO ── */
        #hero{
          position:relative;min-height:100vh;display:flex;align-items:flex-end;
          background:url('https://worldofoorja.com/cdn/shop/files/DSC0725.jpg?v=1758892916&width=1200') center top/cover no-repeat;
          overflow:hidden;
        }
        #hero::before{
          content:'';position:absolute;inset:0;
          background:linear-gradient(to bottom,
            rgba(8,24,20,.35) 0%,
            rgba(8,24,20,.1) 30%,
            rgba(8,24,20,.55) 60%,
            rgba(8,24,20,.97) 100%);
        }
        #hero::after{
          content:'';position:absolute;inset:0;
          background:radial-gradient(ellipse 60% 80% at 5% 50%,rgba(27,127,121,.25),transparent 60%),
                     radial-gradient(ellipse 40% 50% at 95% 20%,rgba(45,95,166,.2),transparent 60%);
        }
        .hero-inner{position:relative;z-index:2;width:100%;max-width:1200px;margin:0 auto;padding:0 40px 80px;}
        .hero-tag{display:inline-flex;align-items:center;gap:8px;padding:7px 20px;border-radius:100px;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.07);backdrop-filter:blur(8px);color:rgba(255,255,255,.8);font-size:.78rem;letter-spacing:.14em;text-transform:uppercase;margin-bottom:28px;}
        .hero-tag span{width:6px;height:6px;border-radius:50%;background:var(--grad);display:inline-block;}
        .hero-h1{font-family:'Cormorant Garamond',serif;font-size:clamp(3.5rem,8vw,7rem);font-weight:300;line-height:1.02;color:#fff;margin-bottom:24px;text-shadow:0 2px 40px rgba(0,0,0,.3);}
        .hero-h1 em{font-style:italic;background:linear-gradient(90deg,#6dd5c8,#8be8a4);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
        .hero-sub{color:rgba(255,255,255,.65);font-size:1.15rem;line-height:1.8;max-width:520px;margin-bottom:44px;font-weight:300;}
        .hero-chips{display:flex;gap:16px;flex-wrap:wrap;margin-bottom:48px;}
        .chip{padding:10px 22px;border-radius:100px;background:rgba(255,255,255,.09);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.15);color:rgba(255,255,255,.8);font-size:.85rem;font-weight:400;}
        .hero-btns{display:flex;gap:14px;flex-wrap:wrap;}
        .btn-g{display:inline-flex;align-items:center;gap:9px;padding:15px 34px;background:var(--grad);color:#fff;border-radius:100px;font-size:.95rem;font-weight:500;text-decoration:none;letter-spacing:.03em;transition:all .3s;}
        .btn-g:hover{transform:translateY(-2px);box-shadow:0 16px 48px rgba(27,127,121,.45);}
        .btn-o{display:inline-flex;align-items:center;gap:9px;padding:13px 28px;border:1.5px solid rgba(255,255,255,.3);color:rgba(255,255,255,.85);border-radius:100px;font-size:.95rem;text-decoration:none;transition:all .3s;}
        .btn-o:hover{border-color:rgba(255,255,255,.8);color:#fff;}

        /* scroll indicator */
        .scroll-ind{position:absolute;bottom:36px;right:40px;z-index:3;display:flex;flex-direction:column;align-items:center;gap:8px;color:rgba(255,255,255,.4);font-size:.72rem;letter-spacing:.12em;text-transform:uppercase;}
        .scroll-line{width:1px;height:48px;background:linear-gradient(to bottom,rgba(255,255,255,.4),transparent);animation:scrollpulse 2s ease-in-out infinite;}
        @keyframes scrollpulse{0%,100%{opacity:.4}50%{opacity:1}}

        /* ── MARQUEE ── */
        .mq{overflow:hidden;padding:18px 0;background:linear-gradient(90deg,#2d5fa6,#1B7F79,#1a8a4a,#1B7F79,#2d5fa6);}
        .mq-track{display:flex;gap:52px;animation:mq 24s linear infinite;width:max-content;}
        @keyframes mq{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        .mq-item{white-space:nowrap;font-family:'Cormorant Garamond',serif;font-size:1.1rem;font-style:italic;color:rgba(255,255,255,.85);letter-spacing:.06em;}
        .mq-dot{color:rgba(255,255,255,.35);margin:0 4px;}

        /* ── STATS BELT ── */
        .stats-belt{background:var(--cream);padding:0;}
        .stats-grid{display:grid;grid-template-columns:repeat(4,1fr);border-top:1px solid #e8eeec;}
        .stat-item{padding:44px 24px;text-align:center;border-right:1px solid #e8eeec;position:relative;overflow:hidden;transition:background .3s;}
        .stat-item:last-child{border-right:none;}
        .stat-item:hover{background:#fff;}
        .stat-item::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:var(--grad);transform:scaleX(0);transition:transform .4s;transform-origin:left;}
        .stat-item:hover::before{transform:scaleX(1);}
        .stat-n{font-family:'Cormorant Garamond',serif;font-size:3rem;font-weight:600;background:var(--grad-text);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;line-height:1;}
        .stat-l{color:#444;font-weight:500;font-size:.9rem;margin:8px 0 4px;}
        .stat-s{color:#aaa;font-size:.78rem;}

        /* ── FOUNDER ── */
        #founder{padding:120px 40px;background:#fff;}
        .founder-wrap{max-width:1140px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center;}
        .founder-img-wrap{position:relative;}
        .founder-img{width:100%;aspect-ratio:3/4;object-fit:cover;border-radius:24px;display:block;position:relative;z-index:1;}
        .founder-img-frame{position:relative;}
        .founder-img-frame::before{content:'';position:absolute;inset:-4px;border-radius:28px;background:var(--grad);z-index:0;}
        .founder-img-frame>div{position:relative;z-index:1;border-radius:24px;overflow:hidden;}
        .founder-badge{position:absolute;bottom:-24px;left:32px;right:32px;z-index:2;background:rgba(8,18,15,.82);backdrop-filter:blur(20px);border-radius:18px;padding:22px 26px;border:1px solid rgba(255,255,255,.1);}
        .founder-badge-name{font-family:'Cormorant Garamond',serif;color:#fff;font-size:1.5rem;font-weight:400;}
        .founder-badge-role{color:rgba(255,255,255,.45);font-size:.78rem;letter-spacing:.1em;text-transform:uppercase;margin-top:4px;}
        .exp-tags{display:flex;gap:8px;margin-top:16px;flex-wrap:wrap;}
        .exp-tag{padding:5px 14px;background:rgba(27,127,121,.2);border:1px solid rgba(27,127,121,.3);border-radius:100px;color:#6dd5c8;font-size:.72rem;letter-spacing:.06em;}

        .founder-bio{padding-top:24px;}
        .section-label{display:inline-flex;align-items:center;gap:8px;padding:7px 18px;border-radius:100px;border:1px solid rgba(27,127,121,.25);background:rgba(27,127,121,.06);color:var(--t);font-size:.75rem;letter-spacing:.14em;text-transform:uppercase;font-weight:500;margin-bottom:20px;}
        .section-h{font-family:'Cormorant Garamond',serif;font-size:clamp(2rem,4vw,3rem);font-weight:300;line-height:1.2;margin-bottom:8px;}
        .section-sub{color:#888;margin-bottom:24px;font-size:.95rem;}
        .divline{width:52px;height:2px;background:var(--grad);border-radius:2px;margin-bottom:28px;}
        .bio-p{color:#555;line-height:1.9;font-size:1rem;margin-bottom:18px;}
        .ach-box{background:var(--cream);border-radius:20px;padding:26px 28px;border:1px solid #e8eeec;margin-top:8px;}
        .ach-title{color:#111;font-weight:500;font-size:.82rem;letter-spacing:.1em;text-transform:uppercase;margin-bottom:18px;}
        .ach-item{display:flex;align-items:flex-start;gap:14px;padding:12px 0;border-bottom:1px solid #eef2ef;}
        .ach-item:last-child{border:none;}
        .ach-dot{width:8px;height:8px;border-radius:50%;background:var(--grad);flex-shrink:0;margin-top:6px;}
        .ach-text{color:#555;font-size:.9rem;line-height:1.65;}

        /* ── STORY ── */
        #story{
          position:relative;padding:140px 40px;overflow:hidden;
          background:url('https://worldofoorja.com/cdn/shop/files/DSC0725.jpg?v=1758892916&width=1200') center 30%/cover no-repeat fixed;
        }
        #story::before{content:'';position:absolute;inset:0;background:rgba(5,18,14,.91);}
        #story::after{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 70% 70% at 80% 50%,rgba(27,127,121,.18),transparent 65%),radial-gradient(ellipse 50% 60% at 10% 50%,rgba(45,95,166,.12),transparent 65%);}
        .story-inner{position:relative;z-index:2;max-width:1100px;margin:0 auto;}
        .story-header{text-align:center;margin-bottom:80px;}
        .story-h{font-family:'Cormorant Garamond',serif;font-size:clamp(2.2rem,5vw,4rem);font-weight:300;color:#fff;line-height:1.15;}
        .story-h em{font-style:italic;background:linear-gradient(90deg,#6dd5c8,#8be8a4);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
        .story-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:start;}
        .story-p{color:rgba(255,255,255,.65);line-height:1.9;font-size:1rem;margin-bottom:22px;}
        .story-p:last-child{margin-bottom:0;}
        .qcard{background:rgba(255,255,255,.04);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,.1);border-radius:24px;padding:48px 40px;position:relative;overflow:hidden;}
        .qcard::before{content:'"';position:absolute;top:-20px;left:20px;font-family:'Cormorant Garamond',serif;font-size:160px;color:rgba(27,127,121,.2);line-height:1;pointer-events:none;}
        .qtext{font-family:'Cormorant Garamond',serif;font-size:1.5rem;font-weight:300;font-style:italic;color:#fff;line-height:1.7;position:relative;z-index:1;margin-bottom:28px;}
        .qauthor{display:flex;align-items:center;gap:12px;color:rgba(255,255,255,.4);font-size:.78rem;letter-spacing:.1em;text-transform:uppercase;}
        .qline{width:32px;height:1px;background:linear-gradient(90deg,#1B7F79,#1a8a4a);}
        .vision-card{background:rgba(255,255,255,.04);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,.08);border-radius:20px;padding:28px 32px;margin-top:20px;}
        .vision-text{color:rgba(255,255,255,.65);line-height:1.85;font-size:.98rem;}
        .vision-text strong{color:#6dd5c8;font-weight:500;}

        /* ── APPROACH ── */
        #approach{padding:120px 40px;background:#fff;}
        .approach-header{text-align:center;margin-bottom:72px;}
        .approach-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;max-width:1100px;margin:0 auto;}
        .ac{position:relative;background:#fff;border-radius:22px;padding:38px 30px;border:1px solid #edf2ef;overflow:hidden;transition:transform .35s,box-shadow .35s;cursor:default;}
        .ac::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:var(--grad);transform:scaleX(0);transition:transform .4s;transform-origin:left;}
        .ac:hover::before{transform:scaleX(1);}
        .ac:hover{transform:translateY(-8px);box-shadow:0 32px 80px rgba(27,127,121,.13);}
        .ac-num{font-family:'Cormorant Garamond',serif;font-size:3.5rem;font-weight:300;background:var(--grad-text);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;line-height:1;margin-bottom:18px;opacity:.4;}
        .ac-title{font-family:'Cormorant Garamond',serif;font-size:1.5rem;font-weight:600;color:#111;margin-bottom:12px;}
        .ac-desc{color:#777;font-size:.92rem;line-height:1.78;}

        /* ── PHOTO GRID ── */
        #gallery{padding:0;background:var(--cream);display:grid;grid-template-columns:2fr 1fr 1fr;grid-template-rows:380px 280px;overflow:hidden;}
        .gp{position:relative;overflow:hidden;}
        .gp img{width:100%;height:100%;object-fit:cover;transition:transform .8s cubic-bezier(.16,1,.3,1);}
        .gp:hover img{transform:scale(1.06);}
        .gp::after{content:'';position:absolute;inset:0;background:linear-gradient(to top,rgba(8,24,20,.6),transparent 50%);}
        .gp.main{grid-row:1/3;}
        .gp-label{position:absolute;bottom:20px;left:22px;z-index:1;color:rgba(255,255,255,.8);font-size:.78rem;letter-spacing:.1em;text-transform:uppercase;}
        .gp-stat{position:absolute;bottom:20px;right:22px;z-index:1;}
        .gp-stat-n{font-family:'Cormorant Garamond',serif;font-size:2rem;font-weight:600;color:#fff;line-height:1;}
        .gp-stat-l{color:rgba(255,255,255,.5);font-size:.7rem;letter-spacing:.08em;text-transform:uppercase;}
        /* overlay card on main */
        .gp.main .gp-overlay{position:absolute;bottom:32px;left:28px;right:28px;z-index:2;background:rgba(8,18,15,.78);backdrop-filter:blur(16px);border-radius:18px;padding:22px 26px;border:1px solid rgba(255,255,255,.08);}
        .gp-overlay-name{font-family:'Cormorant Garamond',serif;color:#fff;font-size:1.5rem;font-weight:400;}
        .gp-overlay-role{color:rgba(255,255,255,.45);font-size:.78rem;letter-spacing:.1em;text-transform:uppercase;margin-top:4px;}
        .gp-overlay-tags{display:flex;gap:6px;margin-top:12px;flex-wrap:wrap;}
        .gp-overlay-tag{padding:4px 12px;background:rgba(27,127,121,.25);border:1px solid rgba(27,127,121,.4);border-radius:100px;color:#6dd5c8;font-size:.7rem;}

        /* teal fill cells */
        .gp.fill-t{background:linear-gradient(135deg,#1B7F79,#2d5fa6);display:flex;align-items:center;justify-content:center;flex-direction:column;gap:8px;}
        .gp.fill-t .big-n{font-family:'Cormorant Garamond',serif;font-size:4rem;font-weight:600;color:#fff;line-height:1;}
        .gp.fill-t .big-l{color:rgba(255,255,255,.6);font-size:.8rem;letter-spacing:.1em;text-transform:uppercase;text-align:center;padding:0 16px;}

        /* ── MODALITIES ── */
        #mod{padding:100px 40px;background:#fff;}
        .mod-header{text-align:center;margin-bottom:52px;}
        .pills{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;max-width:800px;margin:0 auto;}
        .pill{display:inline-flex;align-items:center;gap:8px;padding:11px 22px;border-radius:100px;border:1.5px solid rgba(27,127,121,.25);color:var(--t);font-size:.85rem;font-weight:400;letter-spacing:.03em;transition:all .28s;cursor:default;}
        .pill::before{content:'';width:5px;height:5px;border-radius:50%;background:var(--grad);display:inline-block;flex-shrink:0;}
        .pill:hover{background:var(--t);color:#fff;border-color:var(--t);transform:scale(1.05);}

        /* ── CTA ── */
        #cta{
          position:relative;padding:140px 40px;overflow:hidden;
          background:url('https://worldofoorja.com/cdn/shop/files/DSC0725.jpg?v=1758892916&width=1200') center 20%/cover no-repeat;
        }
        #cta::before{content:'';position:absolute;inset:0;background:rgba(5,14,12,.93);}
        #cta::after{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 60% 70% at 50% 50%,rgba(27,127,121,.2),transparent 65%);}
        .cta-inner{position:relative;z-index:2;max-width:680px;margin:0 auto;text-align:center;}
        .cta-logo{width:70px;height:70px;margin:0 auto 28px;border-radius:50%;border:1px solid rgba(27,127,121,.4);display:flex;align-items:center;justify-content:center;background:rgba(27,127,121,.1);}
        .cta-logo svg{width:38px;height:38px;}
        .cta-h{font-family:'Cormorant Garamond',serif;font-size:clamp(2.2rem,5vw,3.8rem);font-weight:300;color:#fff;line-height:1.18;margin-bottom:20px;}
        .cta-h em{font-style:italic;background:linear-gradient(90deg,#6dd5c8,#8be8a4);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
        .cta-p{color:rgba(255,255,255,.55);font-size:1.05rem;line-height:1.8;margin-bottom:40px;font-weight:300;}
        .cta-btns{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;}

        /* ── UTIL ── */
        .center{text-align:center;}
        .divline-cx{width:52px;height:2px;background:var(--grad);border-radius:2px;margin:20px auto 0;}

        @media(max-width:900px){
          .founder-wrap,.story-grid,.approach-grid{grid-template-columns:1fr!important;}
          #gallery{grid-template-columns:1fr 1fr!important;grid-template-rows:auto!important;}
          .gp.main{grid-row:auto!important;grid-column:1/-1;}
          .stats-grid{grid-template-columns:repeat(2,1fr)!important;}
          .stat-item{border-bottom:1px solid #e8eeec;}
        }
        @media(max-width:600px){
          .hero-h1{font-size:3rem;}
          #hero,#story,#cta{padding-left:20px;padding-right:20px;}
          #founder,#approach,#mod{padding-left:20px;padding-right:20px;}
          .stats-grid{grid-template-columns:1fr 1fr!important;}
          #gallery{grid-template-columns:1fr!important;}
        }
      `}</style>

      {/* ══════════ HERO ══════════ */}
      <section id="hero">
        <div className="hero-inner">
          <div className="hero-tag rv"><span></span> About Pratipal Healing</div>
          <h1 className="hero-h1 rv" style={{transitionDelay:'.1s'}}>
            Every Moment,<br/>
            <em>A Companion</em><br/>
            in Healing
          </h1>
          <p className="hero-sub rv" style={{transitionDelay:'.2s'}}>
            Dr. Aparnaa Singh bridges ancient healing wisdom and modern life — making holistic wellness simple, practical, and accessible to every seeker.
          </p>
          <div className="hero-chips rv" style={{transitionDelay:'.25s'}}>
            <div className="chip">9+ Years Practice</div>
            <div className="chip">1000+ Families</div>
            <div className="chip">15 Modalities</div>
            <div className="chip">Reiki Grand Master</div>
          </div>
          <div className="hero-btns rv" style={{transitionDelay:'.3s'}}>
            <Link href="/booking" className="btn-g">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
              Book a Session
            </Link>
            <Link href="/shop" className="btn-o">
              Shop Products
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
          </div>
        </div>
        <div className="scroll-ind">
          <div className="scroll-line"></div>
          <span>Scroll</span>
        </div>
      </section>

      {/* ══════════ MARQUEE ══════════ */}
      <div className="mq">
        <div className="mq-track" id="mq"></div>
      </div>

      {/* ══════════ STATS ══════════ */}
      <div className="stats-belt">
        <div className="stats-grid">
          <div className="stat-item rv">
            <div className="stat-n">1000+</div>
            <div className="stat-l">Families Guided</div>
            <div className="stat-s">Towards medicine-free living</div>
          </div>
          <div className="stat-item rv" style={{transitionDelay:'.08s'}}>
            <div className="stat-n">500+</div>
            <div className="stat-l">Healers Empowered</div>
            <div className="stat-s">Launched their spiritual business</div>
          </div>
          <div className="stat-item rv" style={{transitionDelay:'.16s'}}>
            <div className="stat-n">15+</div>
            <div className="stat-l">Healing Modalities</div>
            <div className="stat-s">Certified & practiced</div>
          </div>
          <div className="stat-item rv" style={{transitionDelay:'.24s'}}>
            <div className="stat-n">9+</div>
            <div className="stat-l">Years Experience</div>
            <div className="stat-s">In holistic energy healing</div>
          </div>
        </div>
      </div>

      {/* ══════════ FOUNDER ══════════ */}
      <section id="founder">
        <div className="founder-wrap">
          {/* image */}
          <div className="founder-img-frame rvl">
            <div>
              <img className="founder-img" src="https://worldofoorja.com/cdn/shop/files/DSC0725.jpg?v=1758892916&width=800" alt="Dr. Aparnaa Singh" />
            </div>
            <div className="founder-badge">
              <div className="founder-badge-name">Dr. Aparnaa Singh</div>
              <div className="founder-badge-role">Founder & CEO · Pratipal Healing</div>
              <div className="exp-tags">
                <span className="exp-tag">Reiki Grand Master</span>
                <span className="exp-tag">Naturopathy Dr.</span>
                <span className="exp-tag">Fertility Coach</span>
              </div>
            </div>
          </div>

          {/* bio */}
          <div className="founder-bio rvr">
            <div className="section-label">✦ The Founder</div>
            <h2 className="section-h gt">Dr. Aparnaa Singh</h2>
            <p className="section-sub">Integrative Healing & Consciousness Coach</p>
            <div className="divline"></div>
            <p className="bio-p">Dr. Aparnaa Singh is an Integrative Healing & Consciousness Coach and certified Naturopathy Practitioner with over 9 years of experience in holistic and energy-based healing. Her work seamlessly blends science, spirituality, and natural therapies to help individuals restore harmony across body, mind, and soul.</p>
            <p className="bio-p">With a doctorate in Naturopathy & Yoga, qualified practitioner & trainer of Acupressure (Ayurvedic & Chinese), Reiki Grand Master, Fertility Coach & a healer of 15 various healing techniques — she is on a mission to reform & revolutionise the costly, non-affordable wellness industry.</p>
            <p className="bio-p">As the founder of Reiki Magic and Pratipal, Dr. Aparnaa creates safe, nurturing spaces where clients can realign their energy, deepen self-awareness, and manifest a more empowered life.</p>
            <div className="ach-box">
              <div className="ach-title">Key Achievements</div>
              <div className="ach-item"><div className="ach-dot"></div><div className="ach-text">Successful assistance to women in overcoming health & infertility challenges</div></div>
              <div className="ach-item"><div className="ach-dot"></div><div className="ach-text">Empowering 500+ healers in launching their spiritual businesses</div></div>
              <div className="ach-item"><div className="ach-dot"></div><div className="ach-text">Mentored 1000+ families towards a medicine-free life</div></div>
              <div className="ach-item"><div className="ach-dot"></div><div className="ach-text">Doctorate in Naturopathy & Yoga with 15+ certified healing modalities</div></div>
              <div className="ach-item"><div className="ach-dot"></div><div className="ach-text">Certified Acupressure (Ayurvedic & Chinese), Reiki Grand Master, Fertility Coach</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ VISUAL PHOTO GRID ══════════ */}
      <div id="gallery">
        <div className="gp main">
          <img src="https://worldofoorja.com/cdn/shop/files/DSC0725.jpg?v=1758892916&width=900" alt="Dr. Aparnaa" />
          <div className="gp-overlay">
            <div className="gp-overlay-name">Dr. Aparnaa Singh</div>
            <div className="gp-overlay-role">Integrative Healing & Consciousness Coach</div>
            <div className="gp-overlay-tags">
              <span className="gp-overlay-tag">Reiki Grand Master</span>
              <span className="gp-overlay-tag">Naturopathy</span>
              <span className="gp-overlay-tag">EFT Tapping</span>
              <span className="gp-overlay-tag">Tarot</span>
            </div>
          </div>
        </div>
        <div className="gp fill-t">
          <div className="big-n">9+</div>
          <div className="big-l">Years of Dedicated Healing Practice</div>
        </div>
        <div className="gp" style={{background:'linear-gradient(135deg,#f7f9f8,#e8f0ec)'}}>
          <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'24px',textAlign:'center',zIndex:2}}>
            <div style={{fontFamily:'Cormorant Garamond,serif',fontSize:'1.3rem',fontStyle:'italic',color:'#1B7F79',lineHeight:1.6,marginBottom:'16px'}}>&ldquo;Healing is not a luxury. It is your birthright.&rdquo;</div>
            <div style={{width:'32px',height:'1px',background:'linear-gradient(90deg,#1B7F79,#1a8a4a)',marginBottom:'10px'}}></div>
            <div style={{color:'#aaa',fontSize:'.72rem',letterSpacing:'.1em',textTransform:'uppercase'}}>Dr. Aparnaa Singh</div>
          </div>
        </div>
        <div className="gp fill-t" style={{background:'linear-gradient(135deg,#1a8a4a,#1B7F79)'}}>
          <div className="big-n">1000+</div>
          <div className="big-l">Families Living Medicine-Free</div>
        </div>
        <div className="gp" style={{background:'linear-gradient(135deg,#0d1f1c,#0a2f28)'}}>
          <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'24px',textAlign:'center',zIndex:2}}>
            <div style={{fontSize:'2rem',marginBottom:'12px'}}>🌿</div>
            <div style={{fontFamily:'Cormorant Garamond,serif',fontSize:'1.15rem',color:'rgba(255,255,255,.8)',lineHeight:1.5,fontStyle:'italic'}}>&ldquo;Ancient wisdom, modern life — made simple.&rdquo;</div>
          </div>
        </div>
      </div>

      {/* ══════════ STORY ══════════ */}
      <section id="story">
        <div className="story-inner">
          <div className="story-header rv">
            <div className="section-label" style={{background:'rgba(27,127,121,.15)',borderColor:'rgba(27,127,121,.35)',color:'rgba(255,255,255,.7)',marginBottom:'20px'}}>✦ Our Story</div>
            <h2 className="story-h">The <em>Pratipal</em> Journey</h2>
            <div className="divline-cx"></div>
          </div>
          <div className="story-grid">
            <div>
              <p className="story-p rvl">In an ever-evolving and hyper-dynamic world, one vital aspect that has quietly receded to the background — both in thought and action — is our physical and mental well-being. The modern individual, perpetually short on time, finds quick fixes in allopathic medicines, while the ancient wisdom of practices like meditation gathers dust, dismissed for lack of time.</p>
              <p className="story-p rvl" style={{transitionDelay:'.1s'}}>The irony runs deep: we understand the need for change, we&apos;ve heard echoes of the solution — through our elders, in books, or across the internet — but a truly holistic, accessible, and enduring approach remains elusive. What we find are fragments: an acupressure centre here, an Ayurveda clinic there — all in isolation, often beyond affordable reach.</p>
              <p className="story-p rvl" style={{transitionDelay:'.2s'}}>Before founding Pratipal, Dr. Aparnaa spent six years immersed in diverse courses of study, followed by three years of practical experience — treating patients, mentoring aspiring healers, and even producing healing candles and salts tailored to specific ailments. The growing demand compelled the next step: launching this platform to serve many more.</p>
            </div>
            <div>
              <div className="qcard rvr">
                <p className="qtext">Our vision is to nurture a community of healers and seekers — providing structured training, collective treatments, retreat camps, and personalized guidance for day-to-day challenges.</p>
                <div className="qauthor"><div className="qline"></div><span>Dr. Aparnaa Singh</span></div>
              </div>
              <div className="vision-card rvr" style={{transitionDelay:'.15s'}}>
                <p className="vision-text">At Pratipal, our approach emphasises <strong>simplicity</strong> — introducing daily rituals that integrate seamlessly into one&apos;s existing lifestyle, without disrupting its rhythm, yet <strong>gently transforming it from within.</strong></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ APPROACH ══════════ */}
      <section id="approach">
        <div style={{maxWidth:'1100px',margin:'0 auto'}}>
          <div className="approach-header rv">
            <div className="section-label" style={{marginBottom:'20px'}}>✦ The Pratipal Way</div>
            <h2 className="section-h gt" style={{fontSize:'clamp(2rem,5vw,3.4rem)',fontWeight:300}}>Our Approach</h2>
            <p style={{color:'#777',maxWidth:'460px',margin:'12px auto 0',lineHeight:1.75,fontSize:'1rem'}}>Healing should be simple, practical, and accessible to everyone</p>
            <div className="divline-cx"></div>
          </div>
          <div className="approach-grid">
            <div className="ac rv"><div className="ac-num">01</div><div className="ac-title">Simple</div><p className="ac-desc">No complexity, no overwhelm — just intuitive tools and easy-to-follow guidance that anyone can use from day one.</p></div>
            <div className="ac rv" style={{transitionDelay:'.07s'}}><div className="ac-num">02</div><div className="ac-title">Practical</div><p className="ac-desc">Designed to integrate seamlessly into busy modern lives without disrupting your existing rhythm or routine.</p></div>
            <div className="ac rv" style={{transitionDelay:'.14s'}}><div className="ac-num">03</div><div className="ac-title">Accessible</div><p className="ac-desc">Affordable, understandable, and available to anyone seeking inner growth — no prior experience required.</p></div>
            <div className="ac rv" style={{transitionDelay:'.21s'}}><div className="ac-num">04</div><div className="ac-title">Energy-Driven</div><p className="ac-desc">Every session is intentionally charged to support specific emotional, physical and spiritual outcomes.</p></div>
            <div className="ac rv" style={{transitionDelay:'.28s'}}><div className="ac-num">05</div><div className="ac-title">Holistic</div><p className="ac-desc">We address the root — not just symptoms — across emotional, mental, physical, and spiritual layers of being.</p></div>
            <div className="ac rv" style={{transitionDelay:'.35s'}}><div className="ac-num">06</div><div className="ac-title">Transformative</div><p className="ac-desc">Real, lasting change through consistent practice, personalized guidance, and genuine compassion.</p></div>
          </div>
        </div>
      </section>

      {/* ══════════ MODALITIES ══════════ */}
      <section id="mod" style={{background:'var(--cream)'}}>
        <div style={{maxWidth:'860px',margin:'0 auto'}}>
          <div className="mod-header rv">
            <div className="section-label" style={{marginBottom:'16px'}}>✦ Modalities</div>
            <h2 className="section-h gt" style={{fontSize:'clamp(1.8rem,4vw,3rem)',fontWeight:300,marginBottom:'8px'}}>What Dr. Aparnaa Practices</h2>
            <p style={{color:'#888',marginBottom:'36px'}}>Certified in 15+ healing modalities across ancient and modern traditions</p>
            <div className="divline-cx" style={{marginBottom:'44px'}}></div>
          </div>
          <div className="pills rv" style={{transitionDelay:'.1s'}}>
            <span className="pill">Reiki Grand Master</span>
            <span className="pill">Naturopathy</span>
            <span className="pill">Acupressure (Ayurvedic)</span>
            <span className="pill">Acupressure (Chinese)</span>
            <span className="pill">EFT Tapping</span>
            <span className="pill">Tarot Reading</span>
            <span className="pill">Fertility Coaching</span>
            <span className="pill">Past Life Regression</span>
            <span className="pill">Chakra Balancing</span>
            <span className="pill">Sound Healing</span>
            <span className="pill">Yoga</span>
            <span className="pill">Crystal Therapy</span>
            <span className="pill">NLP Techniques</span>
            <span className="pill">Breathwork</span>
            <span className="pill">Meditation Guidance</span>
          </div>
        </div>
      </section>

      {/* ══════════ CTA ══════════ */}
      <section id="cta">
        <div className="cta-inner rv">
          <div className="cta-logo">
            <svg viewBox="0 0 60 60" fill="none">
              <circle cx="30" cy="30" r="28" stroke="url(#cg)" strokeWidth="1.5"/>
              <path d="M18 30c0-6.6 5.4-12 12-12s12 5.4 12 12-5.4 12-12 12" stroke="url(#cg)" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="30" cy="30" r="4" fill="url(#cg)"/>
              <defs><linearGradient id="cg" x1="0" y1="0" x2="60" y2="60"><stop stopColor="#2d5fa6"/><stop offset=".5" stopColor="#1B7F79"/><stop offset="1" stopColor="#1a8a4a"/></linearGradient></defs>
            </svg>
          </div>
          <h2 className="cta-h">Ready to Begin<br/><em>Your Healing Journey?</em></h2>
          <p className="cta-p">Join our community and discover the transformative power of holistic healing — simple, practical, and made for your life.</p>
          <div className="cta-btns">
            <Link href="/booking" className="btn-g">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
              Book a Session
            </Link>
            <Link href="/shop" className="btn-o">Shop Products <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg></Link>
          </div>
        </div>
      </section>
    </>
  );
}