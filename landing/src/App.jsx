import { useState, useEffect, useRef } from 'react'

const GITHUB_URL = 'https://github.com/blueberry-adii/linguastik'
const EXT_ZIP_URL = 'https://github.com/blueberry-adii/linguastik/releases/download/v1.0.0/dist.zip'
const NPM_URL = 'https://www.npmjs.com/package/@linguastik/cli'

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'CLI', href: '#cli' },
  { label: 'Extension', href: '#extension' },
  { label: 'Install', href: '#install' },
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
    desc: "Paste an image in the popup. Gemini AI identifies what's in it and searches across languages on your behalf.",
  },
  {
    icon: '🌐',
    title: 'Localised UI',
    desc: "The extension's own interface adapts to your chosen language — menus, buttons, status messages, all of it.",
  },
  {
    icon: '🔍',
    title: 'Instant Detection',
    desc: 'Language is auto-detected from selections — no configuration needed per site.',
  },
]

const CLI_STEPS = [
  {
    n: '01',
    title: 'Install the CLI',
    content: (
      <div className="space-y-3">
        <p className="text-white/60 text-sm">Install globally from npm:</p>
        <code className="block bg-black/60 border border-white/10 rounded-lg px-4 py-3 text-cyan-400 font-mono text-sm">
          npm install -g @linguastik/cli
        </code>
        <a href={NPM_URL} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-xs text-cyan-400/70 hover:text-cyan-400 transition-colors">
          <span>📦</span> View on npm →
        </a>
      </div>
    ),
  },
  {
    n: '02',
    title: 'Add your Lingo.dev API key',
    content: (
      <div className="space-y-3">
        <p className="text-white/60 text-sm">Get your free key at <a href="https://lingo.dev" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">lingo.dev</a>, then:</p>
        <code className="block bg-black/60 border border-white/10 rounded-lg px-4 py-3 text-cyan-400 font-mono text-sm">
          lingo --key {'<your-api-key>'}
        </code>
      </div>
    ),
  },
  {
    n: '03',
    title: 'Set your language',
    content: (
      <div className="space-y-3">
        <p className="text-white/60 text-sm">Pick a target language using its BCP-47 code:</p>
        <code className="block bg-black/60 border border-white/10 rounded-lg px-4 py-3 text-cyan-400 font-mono text-sm whitespace-pre">{`lingo --lang ja   # Japanese
lingo --lang es   # Spanish
lingo --lang fr   # French`}</code>
      </div>
    ),
  },
  {
    n: '04',
    title: 'Wrap any command',
    content: (
      <div className="space-y-3">
        <p className="text-white/60 text-sm">Prefix any terminal command with <span className="text-cyan-400 font-mono">lingo</span>:</p>
        <code className="block bg-black/60 border border-white/10 rounded-lg px-4 py-3 font-mono text-sm whitespace-pre">
          <span className="text-cyan-400">lingo git status</span>{'\n'}
          <span className="text-emerald-400">ブランチ main — クリーン</span>{'\n\n'}
          <span className="text-cyan-400">lingo -p npm help</span>{'\n'}
          <span className="text-emerald-400">✦ 正確なコンテキスト対応の翻訳...</span>
        </code>
      </div>
    ),
  },
]

const EXT_STEPS = [
  {
    n: '01',
    title: 'Download the extension',
    content: (
      <div className="space-y-3">
        <p className="text-white/60 text-sm">Download the pre-built extension zip:</p>
        <a href={EXT_ZIP_URL}
          className="inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-gradient-to-r from-violet-500/20 to-indigo-500/20 border border-violet-500/30 hover:border-violet-400/50 hover:bg-violet-500/25 text-violet-300 font-semibold text-sm transition-all duration-200 hover:scale-[1.02]">
          <span>📦</span> Download dist.zip
        </a>
      </div>
    ),
  },
  {
    n: '02',
    title: 'Unzip and load in Chrome',
    content: (
      <div className="space-y-3">
        <p className="text-white/60 text-sm">Unzip the file, then in Chrome:</p>
        <ol className="space-y-2 text-sm">
          {[
            'Go to chrome://extensions',
            'Enable Developer Mode (top-right toggle)',
            'Click "Load unpacked"',
            'Select the unzipped dist/ folder',
          ].map((s, i) => (
            <li key={i} className="flex items-start gap-3 text-white/70">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-300 text-xs flex items-center justify-center font-bold">{i + 1}</span>
              {s}
            </li>
          ))}
        </ol>
      </div>
    ),
  },
  {
    n: '03',
    title: 'Enter your API keys',
    content: (
      <div className="space-y-2 text-sm">
        <p className="text-white/60 mb-3">Click the Linguastik icon in Chrome and paste your keys:</p>
        {[
          { key: 'Lingo.dev', url: 'https://lingo.dev', desc: 'For translation' },
          { key: 'Serper', url: 'https://serper.dev', desc: 'For web search' },
          { key: 'Google Gemini', url: 'https://ai.google.dev', desc: 'For image AI' },
        ].map(k => (
          <div key={k.key} className="flex items-center justify-between rounded-lg bg-white/5 border border-white/10 px-4 py-2">
            <div>
              <span className="text-white/80 font-medium">{k.key}</span>
              <span className="text-white/40 ml-2 text-xs">{k.desc}</span>
            </div>
            <a href={k.url} target="_blank" rel="noopener noreferrer" className="text-xs text-violet-400 hover:text-violet-300 transition-colors">Get key →</a>
          </div>
        ))}
      </div>
    ),
  },
  {
    n: '04',
    title: 'Search on Google',
    content: (
      <div className="space-y-3">
        <p className="text-white/60 text-sm">Open Google and search anything. Linguastik automatically:</p>
        <ul className="space-y-2 text-sm">
          {[
            'Searches in your target language in parallel',
            'Merges results in a right sidebar',
            'Summarises top results in your language',
            'Lets you select & translate any text in-page',
          ].map((s, i) => (
            <li key={i} className="flex items-center gap-2 text-white/70">
              <span className="text-violet-400">✓</span> {s}
            </li>
          ))}
        </ul>
      </div>
    ),
  },
]

/* ── smooth scroll ── */
function handleAnchorClick(e) {
  const href = e.currentTarget.getAttribute('href')
  if (href?.startsWith('#')) {
    e.preventDefault()
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
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
          <div key={i} className={l.startsWith('$') ? 'text-cyan-400' : l.startsWith('#') ? 'text-white/30' : 'text-emerald-400'}>
            {l}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── animated accordion step ── */
function AccordionStep({ step, accent, isOpen, onToggle, index }) {
  const bodyRef = useRef(null)
  const [height, setHeight] = useState(0)

  useEffect(() => {
    if (bodyRef.current) {
      setHeight(isOpen ? bodyRef.current.scrollHeight : 0)
    }
  }, [isOpen])

  const accentStyles = {
    cyan: {
      border: isOpen ? 'border-cyan-500/40' : 'border-white/10',
      bg: isOpen ? 'bg-cyan-500/5' : 'bg-white/[0.02]',
      num: 'text-cyan-500/40',
      numOpen: 'text-cyan-400',
      icon: 'text-cyan-400',
      check: 'bg-cyan-500/20 text-cyan-400',
    },
    violet: {
      border: isOpen ? 'border-violet-500/40' : 'border-white/10',
      bg: isOpen ? 'bg-violet-500/5' : 'bg-white/[0.02]',
      num: 'text-violet-500/40',
      numOpen: 'text-violet-400',
      icon: 'text-violet-400',
      check: 'bg-violet-500/20 text-violet-400',
    },
  }[accent]

  return (
    <div
      className={`rounded-2xl border ${accentStyles.border} ${accentStyles.bg} transition-all duration-300 ease-out overflow-hidden`}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 p-5 text-left hover:opacity-90 transition-opacity"
      >
        <span className={`text-2xl font-black ${isOpen ? accentStyles.numOpen : accentStyles.num} transition-colors duration-300 w-10 flex-shrink-0`}>
          {step.n}
        </span>
        <span className="flex-1 font-semibold text-base text-white/90">{step.title}</span>
        <span className={`flex-shrink-0 text-lg transition-transform duration-300 ${isOpen ? 'rotate-45' : 'rotate-0'} ${accentStyles.icon}`}>
          +
        </span>
      </button>

      <div
        style={{ height, transition: 'height 0.35s cubic-bezier(0.4, 0, 0.2, 1)' }}
        className="overflow-hidden"
      >
        <div ref={bodyRef} className="px-5 pb-5 pt-1">
          {step.content}
        </div>
      </div>
    </div>
  )
}

/* ── install section with two tab panels ── */
function InstallSection() {
  const [tab, setTab] = useState('cli')
  const [openStep, setOpenStep] = useState(0)

  const steps = tab === 'cli' ? CLI_STEPS : EXT_STEPS
  const accent = tab === 'cli' ? 'cyan' : 'violet'

  const handleTabChange = (t) => {
    setTab(t)
    setOpenStep(0)
  }

  return (
    <section id="install" className="py-28 px-6 relative">
      <GlowOrb className="w-[350px] h-[350px] bg-emerald-500 opacity-[0.06] top-10 left-1/2 -translate-x-64" />

      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-14">
          <Badge>Get Started</Badge>
          <h2 className="mt-4 text-4xl md:text-5xl font-extrabold tracking-tight">Install in Minutes</h2>
          <p className="mt-4 text-white/50 text-lg max-w-xl mx-auto">
            Pick your tool and follow the steps — expanded one at a time.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 bg-white/[0.04] border border-white/10 rounded-2xl p-1.5 mb-8">
          {[
            { id: 'cli', label: '⌨️  CLI', sub: 'npm install' },
            { id: 'ext', label: '🔭  Extension', sub: 'Chrome' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => handleTabChange(t.id)}
              className={`flex-1 flex flex-col items-center py-3 rounded-xl font-semibold text-sm transition-all duration-200
                ${tab === t.id
                  ? t.id === 'cli'
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-300'
                    : 'bg-gradient-to-r from-violet-500/20 to-indigo-500/20 border border-violet-500/30 text-violet-300'
                  : 'text-white/40 hover:text-white/60 border border-transparent'
                }`}
            >
              <span>{t.label}</span>
              <span className="text-[10px] font-normal opacity-60 mt-0.5">{t.sub}</span>
            </button>
          ))}
        </div>

        {/* Download banner */}
        {tab === 'cli' ? (
          <a href={NPM_URL} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-between mb-6 px-5 py-4 rounded-xl border border-cyan-500/20 bg-cyan-500/5 hover:border-cyan-500/35 hover:bg-cyan-500/8 transition-all duration-200 group">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📦</span>
              <div>
                <div className="font-semibold text-white/90 text-sm">@linguastik/cli</div>
                <div className="text-white/40 text-xs">Available on npm</div>
              </div>
            </div>
            <span className="text-cyan-400 text-sm font-mono group-hover:translate-x-1 transition-transform">→</span>
          </a>
        ) : (
          <a href={EXT_ZIP_URL}
            className="flex items-center justify-between mb-6 px-5 py-4 rounded-xl border border-violet-500/20 bg-violet-500/5 hover:border-violet-500/35 hover:bg-violet-500/8 transition-all duration-200 group">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔭</span>
              <div>
                <div className="font-semibold text-white/90 text-sm">Linguastik Lens v1.0.0</div>
                <div className="text-white/40 text-xs">Chrome extension — dist.zip</div>
              </div>
            </div>
            <span className="text-violet-400 text-sm group-hover:translate-x-1 transition-transform">⬇ Download</span>
          </a>
        )}

        {/* Accordion steps */}
        <div className="space-y-3">
          {steps.map((step, i) => (
            <AccordionStep
              key={`${tab}-${i}`}
              step={step}
              accent={accent}
              isOpen={openStep === i}
              onToggle={() => setOpenStep(openStep === i ? -1 : i)}
              index={i}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── looping dashed-line connector ── */
const LOOP_STYLE = `
  @keyframes flowR { from{background-position:0 0} to{background-position:28px 0} }
  @keyframes flowL { from{background-position:28px 0} to{background-position:0 0} }
  .flow-r { animation: flowR 0.6s linear infinite; }
  .flow-l { animation: flowL 0.6s linear infinite; }
`

function FlowLine({ dir }) {
  const isRight = dir === 'right'
  return (
    <div className="flex items-center px-1 my-3">
      <div className="relative flex-1 h-5 flex items-center">
        <div
          className={`absolute inset-x-4 h-[2px] ${isRight ? 'flow-r' : 'flow-l'}`}
          style={{
            backgroundImage: isRight
              ? 'repeating-linear-gradient(90deg,#22d3ee 0,#22d3ee 8px,transparent 8px,transparent 12px,#818cf8 12px,#818cf8 20px,transparent 20px,transparent 28px)'
              : 'repeating-linear-gradient(90deg,#8b5cf6 0,#8b5cf6 8px,transparent 8px,transparent 12px,#818cf8 12px,#818cf8 20px,transparent 20px,transparent 28px)',
            backgroundSize: '28px 2px',
            opacity: 0.75,
          }}
        />
        <span className={`absolute text-[11px] ${isRight ? 'right-0 text-violet-400/60' : 'left-0 text-cyan-400/60'}`}>
          {isRight ? '▶' : '◀'}
        </span>
      </div>
    </div>
  )
}

function ConnectedToolCards() {
  const tools = [
    {
      icon: '⌨️',
      title: 'Linguastik CLI',
      sub: 'lingo <command>',
      desc: "Drop-in command wrapper. Prefix any terminal command and read its output in your native language as it streams — in real time.",
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

  return (
    <>
      <style>{LOOP_STYLE}</style>
      <FlowLine dir="right" />
      <div className="flex flex-col md:flex-row gap-4">
        {tools.map((tool) => (
          <a
            key={tool.title}
            href={tool.href}
            onClick={handleAnchorClick}
            className={`group relative flex-1 rounded-2xl border
              ${tool.accent === 'cyan'
                ? 'border-cyan-500/20 bg-gradient-to-br from-cyan-500/8 to-blue-600/8'
                : 'border-violet-500/20 bg-gradient-to-br from-violet-500/8 to-indigo-600/8'}
              p-8 block transition-all duration-300 ease-out hover:scale-[1.025]
              ${tool.accent === 'cyan' ? 'hover:shadow-cyan-500/10' : 'hover:shadow-violet-500/10'} hover:shadow-2xl`}
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
        ))}
      </div>
      <FlowLine dir="left" />
    </>
  )
}

const KEYS = [
  { name: 'Lingo.dev', href: 'https://lingo.dev', usage: 'CLI + Extension (translation)', color: 'from-violet-500 to-indigo-600' },
  { name: 'Serper', href: 'https://serper.dev', usage: 'Extension (web search)', color: 'from-cyan-500 to-blue-600' },
  { name: 'Google Gemini', href: 'https://ai.google.dev', usage: 'Extension (Vision AI)', color: 'from-emerald-500 to-teal-600' },
]

export default function App() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <div className="min-h-screen bg-[#050810] text-white overflow-x-hidden font-sans" style={{ scrollBehavior: 'smooth' }}>

      {/* ── NAV ── */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled ? 'bg-[#050810]/90 backdrop-blur-md border-b border-white/5 shadow-lg shadow-black/30' : ''}`}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="#" onClick={handleAnchorClick} className="flex items-center gap-2.5">
            <span className="text-2xl">🌐</span>
            <span className="font-bold text-lg tracking-tight">Lingua<span className="text-cyan-400">stik</span></span>
          </a>
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(l => (
              <a key={l.label} href={l.href} onClick={handleAnchorClick} className="text-sm text-white/55 hover:text-white transition-colors duration-200">{l.label}</a>
            ))}
          </div>
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/25 text-sm font-medium transition-all duration-200">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            GitHub
          </a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center text-center px-6 pt-16">
        <div className="absolute rounded-full blur-3xl pointer-events-none w-[550px] h-[550px] bg-cyan-500 opacity-[0.12] -top-28 -left-44" />
        <div className="absolute rounded-full blur-3xl pointer-events-none w-[450px] h-[450px] bg-violet-600 opacity-[0.13] top-16 -right-28" />
        <div className="absolute rounded-full blur-3xl pointer-events-none w-[300px] h-[300px] bg-emerald-500 opacity-[0.08] top-40 left-20" />
        <div className="absolute rounded-full blur-3xl pointer-events-none w-[380px] h-[380px] bg-indigo-500 opacity-[0.10] bottom-10 left-1/2 -translate-x-1/2" />

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="mb-6">
            <Badge>✦ Powered by Lingo.dev &amp; Google Gemini</Badge>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight mb-6">
            Break Every<br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-500 bg-clip-text text-transparent">Language Barrier</span>
          </h1>
          <p className="text-xl text-white/55 max-w-2xl mx-auto leading-relaxed mb-10">
            Linguastik brings real-time translation to your terminal and browser. Read any webpage, any command output — in your language, instantly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#install" onClick={handleAnchorClick}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-bold text-base hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/30 transition-all duration-300 ease-out">
              Install Now →
            </a>
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer"
              className="px-8 py-4 rounded-xl border border-white/20 bg-white/5 font-bold text-base hover:bg-white/10 hover:scale-105 hover:border-white/30 transition-all duration-300 ease-out">
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
        <div className="absolute rounded-full blur-3xl pointer-events-none w-[300px] h-[300px] bg-emerald-500 opacity-[0.07] top-20 right-20" />
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
        <div className="absolute rounded-full blur-3xl pointer-events-none w-[480px] h-[480px] bg-cyan-500 opacity-[0.11] top-0 -left-28" />
        <div className="absolute rounded-full blur-3xl pointer-events-none w-[200px] h-[200px] bg-emerald-400 opacity-[0.07] bottom-20 right-10" />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="mb-16">
            <Badge>CLI</Badge>
            <h2 className="mt-4 text-4xl md:text-5xl font-extrabold tracking-tight">Your Terminal,<br /><span className="text-cyan-400">Your Language</span></h2>
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            {CLI_FEATURES.map(f => (
              <div key={f.title} className="rounded-2xl border border-white/10 bg-white/[0.02] hover:border-cyan-500/35 hover:bg-white/[0.04] transition-all duration-300 ease-out p-6 flex flex-col gap-4">
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
        <div className="absolute rounded-full blur-3xl pointer-events-none w-[480px] h-[480px] bg-violet-600 opacity-[0.11] top-0 -right-28" />
        <div className="absolute rounded-full blur-3xl pointer-events-none w-[200px] h-[200px] bg-emerald-500 opacity-[0.07] bottom-24 left-12" />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="mb-16">
            <Badge>Browser Extension</Badge>
            <h2 className="mt-4 text-4xl md:text-5xl font-extrabold tracking-tight">The Web in<br /><span className="text-violet-400">Every Language</span></h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {EXT_FEATURES.map(f => (
              <div key={f.title} className="rounded-2xl border border-white/10 bg-white/[0.02] hover:border-violet-500/35 hover:bg-white/[0.04] transition-all duration-300 ease-out p-6">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-bold mb-2">{f.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/8 to-indigo-500/8 p-8 flex flex-col lg:flex-row gap-8 items-center">
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-3">✏️ Inline Translation — Highlight &amp; Replace</h3>
              <p className="text-white/60 leading-relaxed mb-4">
                Select any text → click translate → replaced <em>in place</em> with bold, links, and emojis intact. Hover to see original; one click to revert.
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

      {/* ── INSTALL SECTION ── */}
      <InstallSection />

      {/* ── API KEYS ── */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Badge>API Keys Required</Badge>
            <h2 className="mt-4 text-3xl md:text-4xl font-extrabold tracking-tight">Three Keys, Unlimited Reach</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {KEYS.map(k => (
              <a href={k.href} target="_blank" rel="noopener noreferrer" key={k.name}
                className="group relative rounded-2xl border border-white/10 bg-white/[0.02] hover:scale-105 hover:border-white/20 transition-all duration-300 ease-out p-6 overflow-hidden block">
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
        <div className="absolute rounded-full blur-3xl pointer-events-none w-[550px] h-[550px] bg-cyan-500 opacity-[0.10] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute rounded-full blur-3xl pointer-events-none w-[280px] h-[280px] bg-emerald-500 opacity-[0.07] top-10 right-20" />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
            Start Reading the Web<br />
            <span className="bg-gradient-to-r from-cyan-400 to-violet-500 bg-clip-text text-transparent">Your Way</span>
          </h2>
          <p className="text-white/50 text-lg mb-10">Open source. Two tools. Every language.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#install" onClick={handleAnchorClick}
              className="px-10 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-bold text-base hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/30 transition-all duration-300 ease-out">
              Install Now →
            </a>
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer"
              className="px-10 py-4 rounded-xl border border-white/20 bg-white/5 font-bold text-base hover:bg-white/10 hover:scale-105 hover:border-white/30 transition-all duration-300 ease-out">
              ⭐ Star on GitHub
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
            <a href={NPM_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors duration-200">npm</a>
            <a href={EXT_ZIP_URL} className="hover:text-white transition-colors duration-200">Extension</a>
            <a href="#features" onClick={handleAnchorClick} className="hover:text-white transition-colors duration-200">Features</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
