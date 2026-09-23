import { useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from 'motion/react'
import './AboutChapters.css'

const chapterDuration = 0.7
const pathWidth = 520
const pathHeight = 480

const chapters = [
  { id: 'education', number: '01', label: 'Education', previewTitle: 'Where it started.', previewSummary: 'University of Toronto · Rotman Commerce', tint: '#c5eaff', ring: '#78bee8' },
  { id: 'interests', number: '02', label: 'Interests', previewTitle: 'Outside the office.', previewSummary: 'A few things I enjoy away from work.', tint: '#ffd5df', ring: '#ec96a9' },
  { id: 'working', number: '03', label: 'What I’m Working On', previewTitle: 'Always learning.', previewSummary: 'A few personal experiments and skills in progress.', tint: '#f8e5a0', ring: '#e9cc6f' },
]

function ChapterDetails({ chapter }) {
  if (chapter.id === 'education') {
    return <>
      <h3>University of Toronto</h3>
      <p className="about-chapter-lede">Bachelor of Commerce with Distinction</p>
      <div className="about-chapter-rule" />
      <dl className="about-education-facts">
        <div><dt>Focus</dt><dd>Finance &amp; Economics Specialist, Rotman Commerce</dd></div>
        <div><dt>Years</dt><dd>2011–2015</dd></div>
      </dl>
    </>
  }

  if (chapter.id === 'interests') {
    return <>
      <h3>Outside the office.</h3>
      <p className="about-chapter-lede">Badminton, climbing, skiing, and riding motorcycles.</p>
      <ul className="about-interest-list" aria-label="Interests">
        {['Badminton', 'Climbing', 'Skiing', 'Motorcycles'].map((interest, index) => (
          <li key={interest}><span>{String(index + 1).padStart(2, '0')}</span>{interest}</li>
        ))}
      </ul>
    </>
  }

  return <>
    <h3>What I’m working on.</h3>
    <p className="about-chapter-lede">Examples in progress. These are draft notes, not finished projects.</p>
    <ul className="about-working-list" aria-label="Examples in progress">
      <li><h4>TRML &amp; NAS</h4><p>Learning to use TRML and configuring my NAS.</p></li>
      <li><h4>Python</h4><p>Learning Python for personal projects.</p></li>
      <li><h4>AI for personal projects</h4><p>Exploring how AI can help me develop and test ideas.</p></li>
    </ul>
  </>
}

function SwitchingCopy({ chapter, reduceMotion, children }) {
  return <AnimatePresence mode="wait" initial={false}>
    <motion.div
      key={chapter.id}
      initial={{ opacity: reduceMotion ? 1 : 0, x: reduceMotion ? 0 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: reduceMotion ? 1 : 0, x: reduceMotion ? 0 : -12, transition: { duration: reduceMotion ? 0 : 0.12 } }}
      transition={{ duration: reduceMotion ? 0 : 0.4, delay: reduceMotion ? 0 : chapterDuration }}
    >
      <p className="about-eyebrow">Chapter {chapter.number} / {chapter.label}</p>
      {children}
    </motion.div>
  </AnimatePresence>
}

export default function AboutChapters() {
  const [activeChapterId, setActiveChapterId] = useState('education')
  const [chapterOpen, setChapterOpen] = useState(false)
  const reduceMotion = useReducedMotion()
  const duration = reduceMotion ? 0 : chapterDuration
  const activeChapterIndex = chapters.findIndex(({ id }) => id === activeChapterId)
  const chapter = chapters[activeChapterIndex]
  const chapterProgress = chapters.length > 1 ? activeChapterIndex / (chapters.length - 1) : 0
  const pathRef = useRef(null)
  const travelProgress = useMotionValue(0)
  const orbitLeft = useMotionValue('0%')
  const orbitTop = useMotionValue('0%')
  const chapterVisualStyle = {
    '--orbit-tint': chapter.tint,
    '--orbit-ring': chapter.ring,
  }

  useLayoutEffect(() => {
    const path = pathRef.current
    if (!path) return undefined

    const pathLength = path.getTotalLength()
    const updateOrbitPosition = (progress) => {
      const point = path.getPointAtLength(pathLength * progress)
      // The SVG stretches with the art area; percentages keep the circle on that same curve.
      orbitLeft.set(`${point.x / pathWidth * 100}%`)
      orbitTop.set(`${point.y / pathHeight * 100}%`)
    }

    const unsubscribe = travelProgress.on('change', updateOrbitPosition)
    updateOrbitPosition(travelProgress.get())

    if (reduceMotion) {
      travelProgress.set(chapterProgress)
      return unsubscribe
    }

    const journey = animate(travelProgress, chapterProgress, {
      duration: chapterDuration,
      ease: 'easeInOut',
    })

    return () => {
      journey.stop()
      unsubscribe()
    }
  }, [chapterProgress, reduceMotion, travelProgress, orbitLeft, orbitTop])

  return <div className="about-content">
    <motion.header
      className="about-intro"
      initial={false}
      animate={{ height: chapterOpen ? 0 : 'auto', opacity: chapterOpen ? 0 : 1 }}
      transition={{ duration, ease: 'easeInOut' }}
      style={{ overflow: 'hidden' }}
      aria-hidden={chapterOpen}
      inert={chapterOpen}
    >
      <p className="about-eyebrow">A little more about me</p>
      <h2 id="about-title">Beyond the numbers<span aria-hidden="true">.</span></h2>
      <p>My background and the interests that keep me curious, one chapter at a time.</p>
    </motion.header>

    <div className={`about-chapter${chapterOpen ? ' about-chapter--open' : ''}`} style={chapterVisualStyle}>
      <div className="about-chapter-topline">
        <nav className="about-chapter-nav" aria-label="About chapters">
          {chapters.map(({ id, number, label }) => <button
            className="about-chapter-nav-button"
            type="button"
            key={id}
            aria-pressed={activeChapterId === id}
            onClick={() => setActiveChapterId(id)}
          ><span>{number}</span> {label}</button>)}
        </nav>
        <button
          className="about-chapter-toggle"
          type="button"
          aria-expanded={chapterOpen}
          aria-controls="about-chapter-details"
          onClick={() => setChapterOpen((open) => !open)}
        >
          {chapterOpen ? '← Back to About' : `Explore ${chapter.label} ↗`}
        </button>
      </div>

      <div className="about-chapter-scene">
        <div className="about-chapter-art" aria-hidden="true">
          <svg className="about-chapter-path" viewBox={`0 0 ${pathWidth} ${pathHeight}`} preserveAspectRatio="none">
            <path ref={pathRef} d="M 85 230 C 165 185 220 265 290 225 S 370 195 405 220" />
          </svg>
          <motion.div
            className="about-chapter-orbit"
            initial={false}
            style={{ left: orbitLeft, top: orbitTop, x: '-50%', y: '-50%' }}
            animate={{ rotate: chapterOpen ? 65 : 0 }}
            transition={{ duration, ease: [0.76, 0, 0.24, 1] }}
          ><span /><span /><span /></motion.div>
          <span className="about-chapter-star">✳</span>
          <span className="about-chapter-spark">✧</span>
        </div>

        <div className="about-chapter-copy">
          <motion.div
            className="about-chapter-preview"
            initial={false}
            animate={{ opacity: chapterOpen ? 0 : 1 }}
            transition={{ duration: reduceMotion ? 0 : 0.15 }}
            aria-hidden={chapterOpen}
            inert={chapterOpen}
          >
            <SwitchingCopy chapter={chapter} reduceMotion={reduceMotion}>
              <h3>{chapter.previewTitle}</h3>
              <p>{chapter.previewSummary}</p>
            </SwitchingCopy>
          </motion.div>

          <motion.div
            className="about-chapter-details"
            id="about-chapter-details"
            initial={false}
            animate={{ opacity: chapterOpen ? 1 : 0 }}
            transition={{ duration: reduceMotion ? 0 : chapterOpen ? 0.4 : 0.15, delay: chapterOpen && !reduceMotion ? chapterDuration : 0 }}
            aria-hidden={!chapterOpen}
            inert={!chapterOpen}
          >
            <SwitchingCopy chapter={chapter} reduceMotion={reduceMotion}>
              <ChapterDetails chapter={chapter} />
            </SwitchingCopy>
          </motion.div>
        </div>
      </div>
    </div>
  </div>
}
