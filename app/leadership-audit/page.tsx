'use client'

import { useEffect, useMemo, useRef, useState } from "react";

export default function CPCLeadershipAuditLanding() {
  const [stage, setStage] = useState<"hero" | "lead" | "audit" | "result">("hero");
  const formRef = useRef<HTMLDivElement>(null);
  const whyRef = useRef<HTMLDivElement>(null);
  const auditRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // Lead form state
  const [lead, setLead] = useState({
    name: "",
    email: "",
    company: "",
    role: "",
    teamSize: "1–10",
    challenge: "Improving engagement",
  });
  const [leadSubmitted, setLeadSubmitted] = useState(false);

  // Audit questions
  type Q = { id: string; text: string; category: "Clarity" | "Coaching" | "Performance" | "Scale" };
  const questions: Q[] = [
    { id: "q1", text: "Every team member can clearly state their top 3 priorities for this quarter.", category: "Clarity" },
    { id: "q2", text: "Leaders consistently tie goals to business impact (the ‘why’ is explicit).", category: "Clarity" },
    { id: "q3", text: "Success is measured the same way across teams (clear metrics, visible).", category: "Clarity" },

    { id: "q4", text: "Managers have regular coaching conversations (not just status updates).", category: "Coaching" },
    { id: "q5", text: "Employees leave 1:1s with confidence, ownership, and next steps.", category: "Coaching" },
    { id: "q6", text: "Leaders use a shared framework or toolset to guide coaching (e.g., CLEAR).", category: "Coaching" },

    { id: "q7", text: "Engagement has improved in the last 12 months.", category: "Performance" },
    { id: "q8", text: "Mid‑performer retention is trending up (or regrettable churn is down).", category: "Performance" },
    { id: "q9", text: "Coaching efforts can be linked to execution, productivity, or EBITDA gains.", category: "Performance" },

    { id: "q10", text: "New managers are trained to coach from day one.", category: "Scale" },
    { id: "q11", text: "Coaching is documented and repeatable (playbooks, cards, templates).", category: "Scale" },
    { id: "q12", text: "There’s a pipeline of leaders developing future leaders.", category: "Scale" },
  ];

  // Answers
  const [answers, setAnswers] = useState<Record<string, "Yes" | "No" | null>>(
    () => Object.fromEntries(questions.map((q) => [q.id, null])) as Record<string, "Yes" | "No" | null>
  );
  const [index, setIndex] = useState(0);

  const answeredCount = useMemo(() => Object.values(answers).filter(Boolean).length, [answers]);
  const progress = Math.round((answeredCount / questions.length) * 100);

  function smoothScrollTo(ref: { current: HTMLElement | null }) {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleStart() {
    setStage("lead");
    setTimeout(() => smoothScrollTo(formRef), 50);
  }

  function submitLead(e: React.FormEvent) {
    e.preventDefault();
    if (!lead.name || !lead.email || !lead.company || !lead.role) return;
    setLeadSubmitted(true);
    setStage("audit");
    setTimeout(() => smoothScrollTo(auditRef), 50);
  }

  function setAnswer(id: string, val: "Yes" | "No") {
    setAnswers((prev) => ({ ...prev, [id]: val }));
  }

  function nextQ() {
    if (index < questions.length - 1) setIndex((i) => i + 1);
  }
  function prevQ() {
    if (index > 0) setIndex((i) => i - 1);
  }

  const { score, byCat } = useMemo(() => {
    const yes = Object.entries(answers).filter(([, v]) => v === "Yes").length;
    const cat: Record<string, number> = { Clarity: 0, Coaching: 0, Performance: 0, Scale: 0 };
    questions.forEach((q) => {
      if (answers[q.id] === "Yes") cat[q.category]++;
    });
    return { score: yes, byCat: cat };
  }, [answers]);

  function computeTier(s: number) {
    if (s >= 10)
      return { label: "Coach‑Ready", color: "bg-emerald-500", desc: "You have strong foundations. Focus on scaling and consistency." };
    if (s >= 6) return { label: "Progressing", color: "bg-amber-500", desc: "Good momentum. Address the weakest categories to accelerate results." };
    return { label: "At Risk", color: "bg-rose-500", desc: "Coaching gaps are blocking performance. Prioritize quick wins now." };
  }

  const tier = computeTier(score);

  function submitAudit() {
    if (answeredCount < questions.length) return;
    setStage("result");
    setTimeout(() => smoothScrollTo(resultRef), 50);
  }

  function resetAll() {
    setAnswers(
      Object.fromEntries(questions.map((q) => [q.id, null])) as Record<string, "Yes" | "No" | null>
    );
    setIndex(0);
    setLeadSubmitted(false);
    setStage("hero");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function recos() {
    const pairs = Object.entries(byCat).sort((a, b) => a[1] - b[1]);
    const weakest = pairs.slice(0, 2).map((p) => p[0]);
    const items: Record<string, string[]> = {
      Clarity: [
        "Adopt a single goals format org‑wide (top 3 priorities per person).",
        "Tie every goal to a clear business impact and deadline.",
        "Publish success metrics in a shared dashboard or weekly scorecard.",
      ],
      Coaching: [
        "Introduce a weekly 1:1 coaching cadence (not just status).",
        "Equip leaders with a shared framework (e.g., CLEAR Coaching Cards).",
        "End every 1:1 with ‘owner + next step + when’.",
      ],
      Performance: [
        "Link coaching to 1–2 outcome KPIs (execution speed, quality, retention).",
        "Celebrate small wins publicly to reinforce behavior.",
        "Run a 30‑day sprint to remove 1 execution bottleneck per team.",
      ],
      Scale: [
        "Onboard new managers with a coaching crash course.",
        "Create a simple playbook so coaching is repeatable.",
        "Start a ‘coach the coaches’ circle for peer feedback.",
      ],
    };
    return weakest.flatMap((w) => items[w]).slice(0, 6);
  }

  // ===== Dev sanity tests =====
  useEffect(() => {
    const opts = ["Yes", "No"] as const;
    if (opts.length !== 2) console.error("Tuple mapping failed");
    if (computeTier(11).label !== "Coach‑Ready") console.error("Tier test A failed");
    if (computeTier(7).label !== "Progressing") console.error("Tier test B failed");
    if (computeTier(3).label !== "At Risk") console.error("Tier test C failed");
    // Email body newline test to guard against unterminated strings
    const sample = `Recommendations:\n- ${["A","B"].join('\n- ')}`;
    if (!sample.includes("\n- B")) console.error("Email body newline test failed");
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Nav */}
      <header className="px-6 md:px-10 py-5 flex items-center justify-between border-b border-white/10 sticky top-0 backdrop-blur supports-[backdrop-filter]:bg-neutral-950/70 z-40">
        <div className="flex items-center gap-3 cursor-pointer" onClick={resetAll}>
          <div className="h-7 w-7 rounded-sm bg-orange-500" />
          <span className="font-semibold tracking-wide">CLEAR Performance Coaching</span>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm text-white/80">
          <button className="hover:text-white" onClick={() => { setStage("hero"); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Overview</button>
          <button className="hover:text-white" onClick={() => { setStage("lead"); setTimeout(() => smoothScrollTo(formRef), 50); }}>Start</button>
          <button className="hover:text-white" onClick={() => {
            if (leadSubmitted) { setStage("audit"); setTimeout(() => smoothScrollTo(auditRef), 50); }
            else { setStage("lead"); setTimeout(() => smoothScrollTo(formRef), 50); }
          }}>Questions</button>
          <button className="hover:text-white" onClick={() => {
            if (stage === "result") { setTimeout(() => smoothScrollTo(resultRef), 50); }
            else { setStage("lead"); setTimeout(() => smoothScrollTo(formRef), 50); }
          }}>Results</button>
        </nav>
        <button onClick={handleStart} className="md:inline-flex hidden bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold shadow-lg shadow-orange-500/20 transition">Start Free Audit</button>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-orange-400/10 blur-3xl" />
        </div>
        <div className="mx-auto max-w-7xl px-6 md:px-10 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/60">Free leadership audit</p>
            <h1 className="mt-3 text-4xl md:text-5xl font-extrabold leading-tight">
              Is your organization <span className="text-orange-500">coach‑ready</span>?
            </h1>
            <p className="mt-5 text-lg text-white/80 max-w-xl">
              Take our 3‑minute audit and get an instant score + tailored recommendations to boost clarity, engagement, and execution across your teams.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button onClick={handleStart} className="bg-orange-500 hover:bg-orange-600 px-6 py-3 rounded-xl font-semibold shadow-lg shadow-orange-500/20 transition text-center">Start my free audit</button>
              <button onClick={() => setTimeout(() => smoothScrollTo(whyRef), 50)} className="px-6 py-3 rounded-xl font-semibold ring-1 ring-white/15 hover:ring-white/30 text-white/90 text-center">Why this assessment?</button>
            </div>
            <div className="mt-6 flex items-center gap-4 text-sm text-white/60">
              <div className="flex items-center gap-2"><div className="h-2.5 w-2.5 rounded-full bg-emerald-400" /><span>Instant results</span></div>
              <div className="flex items-center gap-2"><div className="h-2.5 w-2.5 rounded-full bg-emerald-400" /><span>12 quick questions</span></div>
              <div className="flex items-center gap-2"><div className="h-2.5 w-2.5 rounded-full bg-emerald-400" /><span>No cost</span></div>
            </div>
          </div>

          {/* Lead Form */}
          <div ref={formRef} className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl">
            <h2 className="text-2xl font-bold">Start your audit</h2>
            <p className="text-white/70 mt-1 text-sm">Answer a few details to personalize your recommendations.</p>
            <form className="mt-6 grid grid-cols-1 gap-4" onSubmit={submitLead}>
              <div>
                <label className="block text-sm text-white/80 mb-1">Full name</label>
                <input required value={lead.name} onChange={(e) => setLead({ ...lead, name: e.target.value })} type="text" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-orange-500" placeholder="Jane Doe" />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-white/80 mb-1">Work email</label>
                  <input required value={lead.email} onChange={(e) => setLead({ ...lead, email: e.target.value })} type="email" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-orange-500" placeholder="jane@company.com" />
                </div>
                <div>
                  <label className="block text-sm text-white/80 mb-1">Company</label>
                  <input required value={lead.company} onChange={(e) => setLead({ ...lead, company: e.target.value })} type="text" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-orange-500" placeholder="Company Inc." />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-white/80 mb-1">Role</label>
                  <input required value={lead.role} onChange={(e) => setLead({ ...lead, role: e.target.value })} type="text" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-orange-500" placeholder="HR Director, CEO, etc." />
                </div>
                <div>
                  <label className="block text-sm text-white/80 mb-1">Team size</label>
                  <select value={lead.teamSize} onChange={(e) => setLead({ ...lead, teamSize: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-orange-500">
                    <option>1–10</option>
                    <option>11–50</option>
                    <option>51–200</option>
                    <option>201–500</option>
                    <option>500+</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-white/80 mb-1">Primary challenge</label>
                <select value={lead.challenge} onChange={(e) => setLead({ ...lead, challenge: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-orange-500">
                  <option>Improving engagement</option>
                  <option>Reducing turnover</option>
                  <option>Accelerating execution</option>
                  <option>Scaling coaching skills</option>
                  <option>Other</option>
                </select>
              </div>
              <button type="submit" className="mt-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-3 rounded-xl shadow-lg shadow-orange-500/20 transition">
                Continue to questions
              </button>
              <p className="text-xs text-white/60 mt-3">By continuing, you agree to be contacted about CLEAR Performance Coaching. We respect your privacy.</p>
            </form>
          </div>
        </div>
      </section>

      {/* Why This Assessment Matters */}
      <section ref={whyRef} id="why" className="mx-auto max-w-7xl px-6 md:px-10 py-16 md:py-24 border-t border-white/10">
        <div className="grid md:grid-cols-3 gap-8 items-start">
          <div className="md:col-span-2">
            <h2 className="text-3xl md:text-4xl font-bold">Why this assessment matters</h2>
            <p className="text-white/80 mt-4 max-w-2xl">
              Coaching isn’t about vague motivation—it’s about measurable results. This leadership audit helps you uncover blind spots, identify growth opportunities, and prove ROI from coaching investments.
            </p>
            <p className="text-white/80 mt-3 max-w-2xl">
              Complete the audit to get a tailored report on where your leadership team can unlock performance and productivity.
            </p>
            <div className="mt-6">
              <button onClick={handleStart} className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-3 rounded-xl shadow-lg shadow-orange-500/20">Start my audit</button>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-xl font-semibold">What you’ll get</h3>
            <ul className="mt-4 space-y-2 text-white/80 text-sm">
              <li>• Instant score: Coach‑Ready / Progressing / At Risk</li>
              <li>• Per‑category breakdown (Clarity, Coaching, Performance, Scale)</li>
              <li>• Top 3 actions tailored to your gaps</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Audit */}
      <section ref={auditRef} className="mx-auto max-w-4xl px-6 md:px-10 py-12 md:py-16 border-t border-white/10">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl md:text-3xl font-bold">Leadership Audit</h2>
          <div className="text-sm text-white/70">{answeredCount}/{questions.length} answered</div>
        </div>
        <div className="mt-4 h-2 w-full bg-white/10 rounded-full overflow-hidden"><div style={{ width: `${progress}%` }} className="h-full bg-orange-500 transition-[width]"/></div>

        {!leadSubmitted ? (
          <div className="mt-6 bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="text-xl font-semibold">Please complete your details first</div>
            <p className="text-white/70 mt-2">Enter your information above to unlock the questions. This ensures your results and recommendations are personalized.</p>
            <div className="mt-4"><button onClick={handleStart} className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 font-semibold">Go to form</button></div>
          </div>
        ) : (
          <div className="mt-6 bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="text-xs text-white/60 uppercase tracking-widest">{questions[index].category}</div>
            <div className="mt-2 text-xl md:text-2xl font-semibold">{questions[index].text}</div>

            <div className="mt-5 flex flex-wrap gap-3">
              {( ["Yes", "No"] as const ).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setAnswer(questions[index].id, opt)}
                  className={`px-4 py-2 rounded-lg font-semibold ring-1 transition ${
                    answers[questions[index].id] === opt
                      ? "bg-orange-500 ring-orange-500 text-white"
                      : "ring-white/15 hover:ring-white/30 text-white/90"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between">
              <button onClick={prevQ} disabled={index === 0} className="px-4 py-2 rounded-lg ring-1 ring-white/15 hover:ring-white/30 disabled:opacity-40">Back</button>
              {index < questions.length - 1 ? (
                <button onClick={nextQ} className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 font-semibold shadow-lg shadow-orange-500/20">Next</button>
              ) : (
                <button onClick={submitAudit} disabled={answeredCount < questions.length} className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 font-semibold shadow-lg shadow-orange-500/20 disabled:opacity-40">See results</button>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Results */}
      <section ref={resultRef} className="mx-auto max-w-5xl px-6 md:px-10 py-12 md:py-16 border-t border-white/10">
        <h2 className="text-3xl md:text-4xl font-bold">Your Results</h2>
        {stage !== "result" ? (
          <p className="mt-3 text-white/70">Complete all questions to reveal your score and tailored recommendations.</p>
        ) : (
          <div className="mt-6 grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="text-sm text-white/70">Score</div>
              <div className="mt-1 flex items-end gap-3">
                <div className="text-5xl font-extrabold">{score}<span className="text-white/60 text-2xl">/12</span></div>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-semibold ${tier.color}`}>{tier.label}</span>
              </div>
              <p className="mt-3 text-white/80">{tier.desc}</p>

              <div className="mt-6 grid sm:grid-cols-2 gap-4">
                {Object.entries(byCat).map(([cat, val]) => (
                  <div key={cat} className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="text-white/70 text-sm">{cat}</div>
                    <div className="mt-1 text-2xl font-bold">{val}<span className="text-white/60 text-base">/3</span></div>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <div className="text-lg font-semibold">Top Recommendations</div>
                <ul className="mt-3 space-y-2 text-white/80">
                  {recos().map((r, i) => <li key={i}>• {r}</li>)}
                </ul>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col">
              <div className="text-lg font-semibold">Next steps</div>
              <ul className="mt-3 text-white/80 space-y-2 text-sm">
                <li>• Get a 15‑minute consult to review your audit</li>
                <li>• Receive a sample of the CLEAR Coaching tools</li>
                <li>• Align on a 90‑day plan for quick wins</li>
              </ul>
              <a
                href={`mailto:kent@getclearliving.com?subject=CLEAR%20Leadership%20Audit%20Results&body=${encodeURIComponent(
                  `Name: ${lead.name}\nEmail: ${lead.email}\nCompany: ${lead.company}\nRole: ${lead.role}\nTeam size: ${lead.teamSize}\nPrimary challenge: ${lead.challenge}\n\nScore: ${score}/12 (${tier.label})\nBy Category: ${Object.entries(byCat)
                    .map(([k, v]) => `${k}: ${v}/3`)
                    .join(', ')}\n\nRecommendations:\n- ${recos().join('\n- ')}`
                )}`}
                className="mt-5 inline-flex bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-lg shadow-lg shadow-orange-500/20 text-center"
              >
                Email my results
              </a>
              <button onClick={resetAll} className="mt-3 inline-flex ring-1 ring-white/15 hover:ring-white/30 text-white/90 font-semibold px-4 py-2 rounded-lg text-center">Restart audit</button>
            </div>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="px-6 md:px-10 py-12 border-t border-white/10 text-sm text-white/60">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 rounded-sm bg-orange-500" />
            <span>CLEAR Performance Coaching</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Terms</a>
            <button onClick={handleStart} className="hover:text-white">Start Free Audit</button>
          </div>
        </div>
      </footer>
    </div>
  );
}