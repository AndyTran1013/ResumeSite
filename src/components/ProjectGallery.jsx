import { useEffect, useLayoutEffect, useRef } from 'react'
import { animate, LayoutGroup, motion, useReducedMotion } from 'motion/react'
import { projects } from '../data/projects'
import { scrollWindowTo } from '../utils/scrollWindowTo'
import './ProjectGallery.css'

const projectTransitionMs = 850
const detailRevealDelay = (projectTransitionMs / 1000) * 0.8

export default function ProjectGallery({ expandedProjectId, onToggleProject }) {
  const gallery = useRef(null)
  const pendingWidths = useRef(null)
  const widthAnimations = useRef(new Map())
  const reduceMotion = useReducedMotion()
  const featuredProjectId = projects.find((project) => !project.placeholder)?.id
  const numberedProjects = projects.map((project, index) => ({ project, index }))
  const displayedProjects = expandedProjectId
    ? [
        ...numberedProjects.filter(({ project }) => project.id === expandedProjectId),
        ...numberedProjects.filter(({ project }) => project.id !== expandedProjectId),
      ]
    : numberedProjects

  const toggleProject = (projectId) => {
    pendingWidths.current = new Map(
      [...gallery.current.querySelectorAll('.project-slot')].map((slot) => [
        slot.dataset.projectId,
        {
          width: slot.querySelector('.project-card').getBoundingClientRect().width,
          offset: slot.querySelector('.project-card').getBoundingClientRect().left - slot.getBoundingClientRect().left,
        },
      ]),
    )
    widthAnimations.current.forEach((animation) => animation.stop())
    widthAnimations.current.clear()
    onToggleProject(projectId)
  }

  useLayoutEffect(() => {
    const widths = pendingWidths.current
    pendingWidths.current = null
    if (!widths) return

    gallery.current.querySelectorAll('.project-slot').forEach((slot) => {
      const card = slot.querySelector('.project-card')
      const start = widths.get(slot.dataset.projectId)
      slot.classList.remove('project-slot--resizing')
      card.style.width = ''
      card.style.marginLeft = ''
      const targetWidth = card.getBoundingClientRect().width
      const targetOffset = card.getBoundingClientRect().left - slot.getBoundingClientRect().left
      if (reduceMotion || !start || (Math.abs(targetWidth - start.width) < 1 && Math.abs(targetOffset - start.offset) < 1)) return

      slot.classList.add('project-slot--resizing')
      card.style.width = `${start.width}px`
      card.style.marginLeft = `${start.offset}px`
      const animation = animate(card, { width: [start.width, targetWidth], marginLeft: [start.offset, targetOffset] }, {
        duration: projectTransitionMs / 1000,
        ease: 'easeInOut',
        onComplete: () => {
          card.style.width = ''
          card.style.marginLeft = ''
          slot.classList.remove('project-slot--resizing')
          widthAnimations.current.delete(slot.dataset.projectId)
        },
      })
      widthAnimations.current.set(slot.dataset.projectId, animation)
    })
  }, [expandedProjectId, reduceMotion])

  useEffect(() => {
    if (!expandedProjectId) return undefined

    let stopScroll
    const frame = window.requestAnimationFrame(() => {
      const section = gallery.current?.closest('section')
      if (!section) return
      const sectionTop = section.getBoundingClientRect().top + window.scrollY
      stopScroll = scrollWindowTo(sectionTop, { duration: projectTransitionMs / 1000 })
    })

    return () => {
      window.cancelAnimationFrame(frame)
      stopScroll?.()
    }
  }, [expandedProjectId])

  return (
    <div className={`projects-content${expandedProjectId ? ' projects-content--expanded' : ''}`}>
      <div className="projects-art" aria-hidden="true">
        <div className="projects-art-scene">
          <svg viewBox="0 0 520 850" preserveAspectRatio="none">
            <path d="M 40 150 C 340 70 90 430 450 700" />
          </svg>
          <span className="home-orbit home-orbit--blue"><span /><span /></span>
          <span className="home-orbit home-orbit--rose"><span /><span /></span>
          <span className="home-orbit home-orbit--yellow"><span /><span /></span>
        </div>
      </div>
      <motion.header
        className="projects-intro"
        initial={false}
        animate={{ height: expandedProjectId ? 0 : 'auto', opacity: expandedProjectId ? 0 : 1 }}
        transition={{ duration: reduceMotion ? 0 : projectTransitionMs / 1000, ease: 'easeInOut' }}
        style={{ overflow: 'hidden' }}
        aria-hidden={Boolean(expandedProjectId)}
        inert={Boolean(expandedProjectId)}
      >
        <div className="projects-intro-inner">
          <p className="projects-eyebrow">Projects and ideas</p>
          <h2 id="projects-title">Projects, with a purpose</h2>
          <p>Live work and clearly marked ideas. Pick a project to explore.</p>
        </div>
      </motion.header>

      <LayoutGroup id="projects-gallery">
        <div className={`project-gallery${expandedProjectId ? ' project-gallery--expanded' : ''}`} ref={gallery} style={{ '--project-expansion-duration': `${reduceMotion ? 0 : projectTransitionMs}ms` }}>
          {displayedProjects.map(({ project, index }) => {
            const isExpanded = expandedProjectId === project.id
            const detailId = `${project.id}-details`

            return (
              <motion.div
                className={`project-slot${!expandedProjectId && project.id === featuredProjectId ? ' project-slot--featured' : ''}${isExpanded ? ' project-slot--expanded' : ''}`}
                key={project.id}
                data-project-id={project.id}
                layout="position"
                transition={{ layout: { duration: reduceMotion ? 0 : projectTransitionMs / 1000, ease: 'easeInOut' } }}
              >
                <article className={`project-card${isExpanded ? ' project-card--expanded' : ''}`}>
                  <button
                    className="project-card-trigger"
                    type="button"
                    aria-expanded={isExpanded}
                    aria-controls={detailId}
                    aria-label={`${isExpanded ? 'Close' : 'Explore'} ${project.title} project details`}
                    onClick={() => toggleProject(project.id)}
                  >
                    <span className="project-preview">
                      {project.preview ? (
                        <img src={`${import.meta.env.BASE_URL}${project.preview}`} alt={project.previewAlt} />
                      ) : (
                        <span className={`project-preview-sample project-preview-sample--${project.previewTheme}`} aria-hidden="true">
                          <span className="project-preview-sample-label">Layout sample</span>
                          <span className="project-preview-sample-chart"><span /><span /><span /><span /></span>
                        </span>
                      )}
                    </span>
                    <span className="project-card-heading">
                      <span className="project-number">{String(index + 1).padStart(2, '0')} / {project.category}</span>
                      <span className="project-title">{project.title}</span>
                      <span className="project-teaser">{project.teaser}</span>
                    </span>
                    <span className="project-skills" aria-label={project.placeholder ? 'Possible technologies and skills' : 'Technologies and skills'}>
                      {project.skills.map((skill) => <span key={skill}>{skill}</span>)}
                    </span>
                  </button>

                  <motion.div
                    className="project-details"
                    id={detailId}
                    initial={false}
                    animate={{ height: isExpanded ? 'auto' : 0 }}
                    transition={{ duration: reduceMotion ? 0 : projectTransitionMs / 1000, ease: 'easeInOut' }}
                    aria-hidden={!isExpanded}
                    inert={!isExpanded}
                  >
                    <motion.div
                      className="project-details-inner"
                      initial={false}
                      animate={{ opacity: isExpanded ? 1 : 0, x: isExpanded || reduceMotion ? 0 : 16 }}
                      transition={{
                        duration: reduceMotion ? 0 : isExpanded ? 0.8 : 0.12,
                        delay: isExpanded && !reduceMotion ? detailRevealDelay : 0,
                        ease: 'easeInOut',
                      }}
                    >
                      <p className="projects-eyebrow">{project.placeholder ? 'Project concept · Not built' : 'Inside the project'}</p>
                      <h3>{project.title}</h3>
                      <dl>
                        <div><dt>{project.placeholder ? 'Possible problem' : 'The problem'}</dt><dd>{project.problem}</dd></div>
                        <div><dt>{project.approachLabel ?? (project.placeholder ? 'Possible approach' : 'What I built')}</dt><dd>{project.approach}</dd></div>
                        <div><dt>{project.placeholder ? 'Next step' : 'The result'}</dt><dd>{project.result}</dd></div>
                      </dl>
                      {project.process && <p className="project-process">{project.process}</p>}
                      {(project.liveUrl || project.sourceUrl) && (
                        <div className="project-links">
                          {project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">View live site ↗</a>}
                          {project.sourceUrl && <a href={project.sourceUrl} target="_blank" rel="noopener noreferrer">View source ↗</a>}
                        </div>
                      )}
                    </motion.div>
                  </motion.div>
                </article>
              </motion.div>
            )
          })}
        </div>
      </LayoutGroup>
    </div>
  )
}
