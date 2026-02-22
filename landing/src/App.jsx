import { useState, useEffect, useRef } from 'react'

const GITHUB_URL = 'https://github.com/blueberry-adii/linguastik'

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'CLI', href: '#cli' },
  { label: 'Extension', href: '#extension' },
  { label: 'Get Started', href: '#quickstart' },
]

const CLI_FEATURES = [
  {
    icon: '⚡',
    title: 'Real-time Translation',
    desc: 'Wrap any command — npm, git, docker — and read its output in your language as it streams, line by line.',
    code: 'lingo npm install\nlingo git status\nlingo docker compose up',
  },
  {
    icon: '🎯',
    title: 'Precise Mode',
    desc: 'Capture the full output first, then send it all at once for a context-aware, accurate translation.',
    code: 'lingo -p npm help\nlingo --precise git log',
  },
  {
    icon: '💾',
    title: 'Smart Caching',
    desc: 'Translations are cached on disk. Repeat commands are instant and never hit the API again.',
    code: 'lingo --lang ja\nlingo --key <api-key>',
  },
]

const EXT_FEATURES = [
  {
    icon: '🌍',
    title: 'Multi-Lingual Search',
    desc: 'Every Google search triggers parallel searches in your target language. Results from different regions are merged side by side.',
  },
  {
    icon: '✏️',
    title: 'Inline Translation',
    desc: "Highlight any text → click translate → it's replaced in-place. Bold, links, emojis all preserved. Hover to revert.",
  },
  {
    icon: '🤖',
    title: 'AI Summaries',
    desc: 'Top search results are summarised and translated into your native language automatically via Lingo.dev.',
  },
  {
    icon: '📸',
    title: 'Vision Search',
    desc: 'Paste an image in the popup. Gemini AI identifies what\'s in it and searches across languages on your behalf.',
  },
  {
    icon: '🌐',
    title: 'Localised UI',
    desc: 'The extension\'s own interface adapts to your chosen language — menus, buttons, status messages, all of it.',
  },
  {
    icon: '🔍',
    title: 'Instant Detection',
    desc: 'Language is auto-detected from selections — no configuration needed per site.',
  },
]

const STEPS = [
  { n: '01', title: 'Clone & Install', desc: 'Clone the repo and run npm install from the root.' },
  { n: '02', title: 'Add API Keys', desc: 'Set your Lingo.dev key in the CLI. Add Serper + Lingo + Gemini keys in the extension popup.' },
  { n: '03', title: 'Use the CLI', desc: 'npm link the CLI package and prefix any command with lingo.' },
  { n: '04', title: 'Load the Extension', desc: 'Chrome → chrome://extensions → Load unpacked → select packages/extension/dist.' },
]

const KEYS = [
  { name: 'Lingo.dev', href: 'https://lingo.dev', usage: 'CLI + Extension (translation)', color: 'from-violet-500 to-indigo-600' },
  { name: 'Serper', href: 'https://serper.dev', usage: 'Extension (web search)', color: 'from-cyan-500 to-blue-600' },
  { name: 'Google Gemini', href: 'https://ai.google.dev', usage: 'Extension (Vision AI)', color: 'from-emerald-500 to-teal-600' },
]

/* ── smooth scroll helper ── */
function handleAnchorClick(e) {
  const href = e.currentTarget.getAttribute('href')
  if (href && href.startsWith('#')) {
    e.preventDefault()
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

/* ── decorative blobs ── */
function GlowOrb({ className }) {
  return <div className={`absolute rounded-full blur-3xl pointer-events-none ${className}`} />
}

function Badge({ children }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-semibold tracking-widest uppercase">
      {children}
    </span>
  )
}

function TerminalWindow({ lines }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/60 backdrop-blur overflow-hidden shadow-2xl shadow-black/50">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/5">
        <span className="w-3 h-3 rounded-full bg-red-500/80" />
        <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
        <span className="w-3 h-3 rounded-full bg-green-500/80" />
        <span className="ml-2 text-xs text-white/30 font-mono">Terminal</span>
      </div>
      <div className="p-5 font-mono text-sm space-y-1">
        {lines.map((l, i) => (
          <div
            key={i}
            className={
              l.startsWith('$')
                ? 'text-cyan-400'
                : l.startsWith('#')
                  ? 'text-white/30'
                  : 'text-emerald-400'
            }
          >
            {l}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── animated connector between two tool cards ── */
function ConnectedToolCards() {
  const [flow, setFlow] = useState(0)
  const rafRef = useRef(null)

  useEffect(() => {
    let start = null
    const tick = (ts) => {
      if (!start) start = ts
      setFlow(((ts - start) / 2400) % 1)   // 0→1 every 2.4 s
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  const tools = [
    {
      icon: '⌨️',
      title: 'Linguastik CLI',
      sub: 'lingo <command>',
      desc: 'Drop-in command wrapper. Prefix any terminal command and read its output in your native language as it streams — in real time.',
      tags: ['Real-time streaming', 'Precise mode', 'Smart caching', 'Persistent config'],
      accent: 'cyan',
      href: '#cli',
    },
    {
      icon: '🔭',
      title: 'Linguastik Lens',
      sub: 'Chrome Extension',
      desc: 'Transforms your browser into a multi-lingual research tool. Parallel searches, inline translation, AI summaries, and vision search.',
      tags: ['Multi-lingual search', 'Inline translate', 'AI summaries', 'Vision AI'],
      accent: 'violet',
      href: '#extension',
    },
  ]

  /* SVG arrow path: left card right-edge → right card left-edge */
  const pathD = 'M 0 50 C 40 50, 60 50, 100 50'
  /* animated dot along a straight line */
  const dotX = flow * 100
  const dotY = 50

  return (
    <div className="relative flex flex-col md:flex-row gap-0 items-stretch">
      {tools.map((tool, idx) => (
        <div key={tool.title} className="flex-1 flex">
          {/* Card */}
          <a
            href={tool.href}
            onClick={handleAnchorClick}
            className={`group relative flex-1 rounded-2xl border
              ${tool.accent === 'cyan' ? 'border-cyan-500/20 bg-gradient-to-br from-cyan-500/8 to-blue-600/8' : 'border-violet-500/20 bg-gradient-to-br from-violet-500/8 to-indigo-600/8'}
              p-8 block transition-all duration-300 ease-out
              hover:scale-[1.025] hover:shadow-2xl
              ${tool.accent === 'cyan' ? 'hover:shadow-cyan-500/10' : 'hover:shadow-violet-500/10'}`}
          >
            <div className="text-5xl mb-4">{tool.icon}</div>
            <div className="font-mono text-xs text-white/30 mb-2">{tool.sub}</div>
            <h3 className="text-2xl font-bold mb-3">{tool.title}</h3>
            <p className="text-white/60 leading-relaxed mb-6">{tool.desc}</p>
            <div className="flex flex-wrap gap-2">
              {tool.tags.map(t => (
                <span key={t} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/50">{t}</span>
              ))}
            </div>
          </a>

          {/* Connector between cards (only after first card) */}
          {idx === 0 && (
            <div className="hidden md:flex items-center justify-center flex-shrink-0 w-24 relative">
              {/* Static dashed line */}
              <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="absolute inset-0 w-full h-full"
              >
                <path
                  d={pathD}
                  fill="none"
                  stroke="url(#connGrad)"
                  strokeWidth="1.5"
                  strokeDasharray="6 4"
                  className="opacity-40"
                />
                {/* Animated glowing dot */}
                <circle
                  cx={dotX}
                  cy={dotY}
                  r="5"
                  fill="url(#dotGrad)"
                  className="drop-shadow-lg"
                />
                <defs>
                  <linearGradient id="connGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#22d3ee" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                  <radialGradient id="dotGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#fff" stopOpacity="0.9" />
                    <stop offset="40%" stopColor="#22d3ee" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                  </radialGradient>
                </defs>
              </svg>

              {/* Centre label */}
              <div className="relative z-10 flex flex-col items-center gap-1">
                <span className="text-xl">🔗</span>
                <span className="text-[9px] text-white/25 font-mono text-center leading-tight">shared<br />engine</span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

/* ── main ── */
export default function App() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      className="min-h-screen bg-[#050810] text-white overflow-x-hidden font-sans"
      style={{ scrollBehavior: 'smooth' }}
    >

      {/* ── NAV ── */}
      <nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled ? 'bg-[#050810]/90 backdrop-blur-md border-b border-white/5 shadow-lg shadow-black/30' : ''
          }`}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="#" onClick={handleAnchorClick} className="flex items-center gap-2.5">
            <span className="text-2xl">🌐</span>
            <span className="font-bold text-lg tracking-tight">
              Lingua<span className="text-cyan-400">stik</span>
            </span>
          </a>

          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(l => (
              <a
                key={l.label}
                href={l.href}
                onClick={handleAnchorClick}
                className="text-sm text-white/55 hover:text-white transition-colors duration-200"
              >
                {l.label}
              </a>
            ))}
          </div>

          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/25 text-sm font-medium transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            GitHub
          </a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center text-center px-6 pt-16">
        {/* Orbs */}
        <GlowOrb className="w-[550px] h-[550px] bg-cyan-500 opacity-[0.12] -top-28 -left-44" />
        <GlowOrb className="w-[450px] h-[450px] bg-violet-600 opacity-[0.13] top-16 -right-28" />
        <GlowOrb className="w-[300px] h-[300px] bg-emerald-500 opacity-[0.08] top-40 left-20" />
        <GlowOrb className="w-[380px] h-[380px] bg-indigo-500 opacity-[0.10] bottom-10 left-1/2 -translate-x-1/2" />

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="mb-6">
            <Badge>✦ Powered by Lingo.dev &amp; Google Gemini</Badge>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight mb-6">
            Break Every
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-500 bg-clip-text text-transparent">
              Language Barrier
            </span>
          </h1>

          <p className="text-xl text-white/55 max-w-2xl mx-auto leading-relaxed mb-10">
            Linguastik brings real-time translation to your terminal and browser.
            Read any webpage, any command output — in your language, instantly.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#quickstart"
              onClick={handleAnchorClick}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-bold text-base hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/30 transition-all duration-300 ease-out"
            >
              Get Started →
            </a>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 rounded-xl border border-white/20 bg-white/5 font-bold text-base hover:bg-white/10 hover:scale-105 hover:border-white/30 transition-all duration-300 ease-out"
            >
              ⭐ Star on GitHub
            </a>
          </div>

          <div className="mt-20 max-w-2xl mx-auto">
            <TerminalWindow lines={[
              '# Translate any command output in real time',
              '$ lingo git status',
              'ブランチ main',
              'コミットする変更はありません',
              '',
              '# Precise mode — full context, one accurate translation',
              '$ lingo -p npm help',
              '✦ Linguastik  正確なコンテキスト対応の翻訳...',
            ]} />
          </div>
        </div>
      </section>

      {/* ── TOOLS OVERVIEW ── */}
      <section id="features" className="py-32 px-6 relative">
        <GlowOrb className="w-[300px] h-[300px] bg-emerald-500 opacity-[0.07] top-20 right-20" />

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge>Two Tools. One Goal.</Badge>
            <h2 className="mt-4 text-4xl md:text-5xl font-extrabold tracking-tight">Everything You Need</h2>
            <p className="mt-4 text-white/50 text-lg max-w-xl mx-auto">
              A CLI wrapper and a browser extension — powered by the same Lingo.dev translation engine.
            </p>
          </div>

          <ConnectedToolCards />
        </div>
      </section>

      {/* ── CLI ── */}
      <section id="cli" className="py-28 px-6 relative">
        <GlowOrb className="w-[480px] h-[480px] bg-cyan-500 opacity-[0.11] top-0 -left-28" />
        <GlowOrb className="w-[200px] h-[200px] bg-emerald-400 opacity-[0.07] bottom-20 right-10" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="mb-16">
            <Badge>CLI</Badge>
            <h2 className="mt-4 text-4xl md:text-5xl font-extrabold tracking-tight">
              Your Terminal,<br />
              <span className="text-cyan-400">Your Language</span>
            </h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {CLI_FEATURES.map(f => (
              <div
                key={f.title}
                className="rounded-2xl border border-white/10 bg-white/[0.02] hover:border-cyan-500/35 hover:bg-white/[0.04] transition-all duration-300 ease-out p-6 flex flex-col gap-4"
              >
                <div className="text-3xl">{f.icon}</div>
                <div>
                  <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
                </div>
                <div className="mt-auto rounded-lg bg-black/50 border border-white/10 p-4 font-mono text-xs text-cyan-400 whitespace-pre">{f.code}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EXTENSION ── */}
      <section id="extension" className="py-28 px-6 relative">
        <GlowOrb className="w-[480px] h-[480px] bg-violet-600 opacity-[0.11] top-0 -right-28" />
        <GlowOrb className="w-[200px] h-[200px] bg-emerald-500 opacity-[0.07] bottom-24 left-12" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="mb-16">
            <Badge>Browser Extension</Badge>
            <h2 className="mt-4 text-4xl md:text-5xl font-extrabold tracking-tight">
              The Web in<br />
              <span className="text-violet-400">Every Language</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {EXT_FEATURES.map(f => (
              <div
                key={f.title}
                className="rounded-2xl border border-white/10 bg-white/[0.02] hover:border-violet-500/35 hover:bg-white/[0.04] transition-all duration-300 ease-out p-6"
              >
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-bold mb-2">{f.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Inline translate deep-dive */}
          <div className="mt-10 rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/8 to-indigo-500/8 p-8 flex flex-col lg:flex-row gap-8 items-center">
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-3">✏️ Inline Translation — Highlight &amp; Replace</h3>
              <p className="text-white/60 leading-relaxed mb-4">
                Select any text on any page — a floating button appears. Click it and the text is translated{' '}
                <em>in place</em>, with bold, links, emojis, and images intact. Hover to reveal the original; one click to revert.
              </p>
              <div className="flex flex-wrap gap-2">
                {['HTML-aware', 'Structure preserved', 'Dashed underline', 'One-click revert'].map(t => (
                  <span key={t} className="px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs text-violet-300">{t}</span>
                ))}
              </div>
            </div>
            <div className="w-full lg:w-80 rounded-xl border border-white/10 bg-black/60 p-5 font-mono text-sm space-y-2">
              <div className="text-white/30 text-xs mb-3">// Before</div>
              <div className="text-white/70">「<span className="text-yellow-400 underline decoration-dashed underline-offset-4">製品が更新されました</span>」</div>
              <div className="text-white/30 text-xs mt-4 mb-3">// After — hover to revert</div>
              <div className="text-white/70">「<span className="text-cyan-400 underline decoration-dashed underline-offset-4 cursor-help">Product has been updated</span>」</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="quickstart" className="py-28 px-6 relative">
        <GlowOrb className="w-[250px] h-[250px] bg-emerald-500 opacity-[0.07] top-10 left-1/2 -translate-x-64" />

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge>Quick Start</Badge>
            <h2 className="mt-4 text-4xl md:text-5xl font-extrabold tracking-tight">Up in 4 Steps</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
            {STEPS.map((s, i) => (
              <div key={s.n} className="relative rounded-2xl border border-white/10 bg-white/[0.02] p-6 hover:border-white/20 transition-all duration-300 ease-out">
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-8 -right-3 text-white/20 text-xl">→</div>
                )}
                <div className="text-4xl font-black text-white/10 mb-4">{s.n}</div>
                <h3 className="font-bold mb-2">{s.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          <TerminalWindow lines={[
            '# Clone & install',
            '$ git clone https://github.com/blueberry-adii/linguastik.git',
            '$ npm install && npm run build',
            '',
            '# Link CLI',
            '$ cd packages/cli && npm link && cd ../..',
            '',
            '# Configure',
            '$ lingo --key <your-lingo-api-key>',
            '$ lingo --lang ja',
            '',
            '# Translate anything',
            '$ lingo git log --oneline',
            '6f3a2b1  機能を追加: インライン翻訳',
            'a2d7c91  バグ修正: サイドバーのリセット',
          ]} />
        </div>
      </section>

      {/* ── API KEYS ── */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Badge>API Keys Required</Badge>
            <h2 className="mt-4 text-3xl md:text-4xl font-extrabold tracking-tight">Three Keys, Unlimited Reach</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {KEYS.map(k => (
              <a
                href={k.href}
                target="_blank"
                rel="noopener noreferrer"
                key={k.name}
                className="group relative rounded-2xl border border-white/10 bg-white/[0.02] hover:scale-105 hover:border-white/20 transition-all duration-300 ease-out p-6 overflow-hidden block"
              >
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-br ${k.color} transition-opacity duration-300`} />
                <h3 className="font-bold text-lg mb-2 relative z-10">{k.name} ↗</h3>
                <p className="text-white/50 text-sm relative z-10">{k.usage}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-28 px-6 relative overflow-hidden">
        <GlowOrb className="w-[550px] h-[550px] bg-cyan-500 opacity-[0.10] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        <GlowOrb className="w-[280px] h-[280px] bg-emerald-500 opacity-[0.07] top-10 right-20" />

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
            Start Reading the Web<br />
            <span className="bg-gradient-to-r from-cyan-400 to-violet-500 bg-clip-text text-transparent">
              Your Way
            </span>
          </h2>
          <p className="text-white/50 text-lg mb-10">Open source. Two tools. Every language.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-10 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-bold text-base hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/30 transition-all duration-300 ease-out"
            >
              ⭐ Star on GitHub
            </a>
            <a
              href="#quickstart"
              onClick={handleAnchorClick}
              className="px-10 py-4 rounded-xl border border-white/20 bg-white/5 font-bold text-base hover:bg-white/10 hover:scale-105 hover:border-white/30 transition-all duration-300 ease-out"
            >
              Quick Start Guide →
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-white/30 text-sm">
          <div className="flex items-center gap-2">
            <span>🌐</span>
            <span className="font-bold text-white/50">Lingua<span className="text-cyan-400/70">stik</span></span>
            <span>— Built for the Lingo.dev Hackathon 2025</span>
          </div>
          <div className="flex items-center gap-6">
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors duration-200">GitHub</a>
            <a href="#features" onClick={handleAnchorClick} className="hover:text-white transition-colors duration-200">Features</a>
            <a href="#quickstart" onClick={handleAnchorClick} className="hover:text-white transition-colors duration-200">Docs</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
