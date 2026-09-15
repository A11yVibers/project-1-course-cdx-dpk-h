import { useEffect, useMemo, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  COURSES,
  getClassMaterials,
  getCourse,
  getCourseClasses,
  getInstructor,
} from './data.js'

function useHashRoute() {
  const [route, setRoute] = useState(readRoute)

  useEffect(() => {
    const handleHashChange = () => setRoute(readRoute())
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  return route
}

function readRoute() {
  const parts = window.location.hash.replace(/^#/, '').split('/').filter(Boolean)
  if (parts[0] === 'courses' && parts[1]) {
    return { name: 'course', courseId: parts[1] }
  }
  return { name: 'catalog' }
}

function navigate(path) {
  window.location.hash = path
}

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 12H5m7-7-7 7 7 7" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  )
}

function ChevronIcon({ collapsed = false }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={collapsed ? 'is-flipped' : ''}>
      <path d="m9 5 7 7-7 7" />
    </svg>
  )
}

function ImageIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="2" />
      <path d="m4 18 5-4 3 2 3-4 5 5" />
    </svg>
  )
}

function DocumentIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 3h7l4 4v14H7z" />
      <path d="M14 3v5h5M10 12h5M10 15h5" />
    </svg>
  )
}

function VideoIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="6" width="13" height="12" rx="2" />
      <path d="m16 10 5-3v10l-5-3" />
    </svg>
  )
}

function MarkdownIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path d="M8 9v6m-2 0 2-2 2 2m3-6v6m3-6-2 3 2 3" />
    </svg>
  )
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 5.5v13l11-6.5z" />
    </svg>
  )
}

function MaterialTypeIcon({ type }) {
  if (type === 'pdf') return <DocumentIcon />
  if (type === 'video') return <VideoIcon />
  if (type === 'youtube') return <PlayIcon />
  if (type === 'md') return <MarkdownIcon />
  return <ImageIcon />
}

function toYouTubeEmbed(url) {
  const match = url.match(/(?:youtu\.be\/|v=)([A-Za-z0-9_-]{6,})/)
  if (!match) return url
  return `https://www.youtube.com/embed/${match[1]}?rel=0`
}

function formatDate(value) {
  if (!value) return 'Date TBD'
  const date = new Date(`${value}T12:00:00`)
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
}

export default function App() {
  const route = useHashRoute()
  const course = route.name === 'course' ? getCourse(route.courseId) : null

  if (route.name === 'course' && course) {
    return <CoursePage course={course} onBack={() => navigate('/')} />
  }

  return <CatalogPage onSelectCourse={(courseId) => navigate(`/courses/${courseId}`)} />
}

function CatalogPage({ onSelectCourse }) {
  const [query, setQuery] = useState('')
  const [instructorFilter, setInstructorFilter] = useState('all')
  const [weekFilter, setWeekFilter] = useState('all')

  const instructors = useMemo(() => {
    const unique = new Map()
    COURSES.forEach((course) => {
      const instructor = getInstructor(course)
      if (instructor) unique.set(instructor.instructor_id, instructor)
    })
    return [...unique.values()].sort((a, b) => a.name.localeCompare(b.name))
  }, [])

  const weekOptions = useMemo(() => {
    return [...new Set(COURSES.map((course) => course.numberOfWeeks))].sort((a, b) => a - b)
  }, [])

  const filteredCourses = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return COURSES.filter((course) => {
      const instructor = getInstructor(course)
      const searchableText = [
        course.name,
        course.shortDescription,
        course.longDescription,
        instructor?.name ?? '',
      ].join(' ').toLowerCase()

      const matchesQuery = !normalizedQuery || searchableText.includes(normalizedQuery)
      const matchesInstructor =
        instructorFilter === 'all' || course.instructorId === instructorFilter
      const matchesWeeks =
        weekFilter === 'all' || course.numberOfWeeks === Number(weekFilter)

      return matchesQuery && matchesInstructor && matchesWeeks
    }).sort((a, b) => {
      if (a.id === 'HIST111') return -1
      if (b.id === 'HIST111') return 1
      return a.name.localeCompare(b.name)
    })
  }, [instructorFilter, query, weekFilter])

  const hasActiveFilters = query.trim() !== '' || instructorFilter !== 'all' || weekFilter !== 'all'

  function clearFilters() {
    setQuery('')
    setInstructorFilter('all')
    setWeekFilter('all')
  }

  return (
    <div className="catalog-page">
      <header className="catalog-hero">
        <div className="hero-copy">
          <p className="eyebrow">History Commons</p>
          <h1>Learn history through its connected worlds.</h1>
          <p className="hero-text">
            Explore primary sources, lectures, and archival readings across twelve
            courses built from the ancient world to the modern age.
          </p>
        </div>
        <div className="hero-mark" aria-hidden="true">
          <span>XII</span>
          <small>courses</small>
        </div>
      </header>

      <section className="catalog-toolbar" aria-label="Course catalog filters">
        <label className="search-field">
          <span className="visually-hidden">Search courses</span>
          <SearchIcon />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search courses, themes, or instructors"
          />
        </label>

        <label className="filter-field">
          <span>Instructor</span>
          <select
            value={instructorFilter}
            onChange={(event) => setInstructorFilter(event.target.value)}
          >
            <option value="all">All instructors</option>
            {instructors.map((instructor) => (
              <option key={instructor.instructor_id} value={instructor.instructor_id}>
                {instructor.name}
              </option>
            ))}
          </select>
        </label>

        <label className="filter-field">
          <span>Duration</span>
          <select value={weekFilter} onChange={(event) => setWeekFilter(event.target.value)}>
            <option value="all">Any length</option>
            {weekOptions.map((weeks) => (
              <option key={weeks} value={weeks}>
                {weeks} weeks
              </option>
            ))}
          </select>
        </label>

        {hasActiveFilters && (
          <button className="clear-button" type="button" onClick={clearFilters}>
            Clear filters
          </button>
        )}
      </section>

      <section className="results-bar" aria-live="polite">
        <p>
          Showing <strong>{filteredCourses.length}</strong>{' '}
          {filteredCourses.length === 1 ? 'course' : 'courses'}
        </p>
        <p className="results-hint">Select a course to open its syllabus and materials.</p>
      </section>

      <section className="course-grid" aria-label="Available history courses">
        {filteredCourses.map((course) => (
          <CourseCard key={course.id} course={course} onSelect={() => onSelectCourse(course.id)} />
        ))}
      </section>

      {filteredCourses.length === 0 && (
        <section className="empty-state">
          <h2>No courses match those filters.</h2>
          <p>Try a broader search or clear the active filters.</p>
          <button type="button" onClick={clearFilters}>Clear filters</button>
        </section>
      )}
    </div>
  )
}

function CourseCard({ course, onSelect }) {
  const instructor = getInstructor(course)

  return (
    <article className={`course-card${course.id === 'HIST111' ? ' is-featured' : ''}`}>
      <div className="card-image">
        <img src={course.imageUrl} alt="" loading="lazy" />
        {course.id === 'HIST111' && <span className="featured-badge">Featured example</span>}
      </div>
      <div className="card-body">
        <p className="card-meta">
          {course.numberOfWeeks} weeks · {course.numberOfClasses} classes
        </p>
        <h2>{course.name}</h2>
        <p>{course.shortDescription}</p>
        <div className="instructor-line">
          {instructor?.photo_url && (
            <img src={instructor.photo_url} alt="" className="instructor-avatar" />
          )}
          <span>{instructor?.name ?? 'Faculty'}</span>
        </div>
      </div>
      <button className="card-action" type="button" onClick={onSelect}>
        View course
        <ChevronIcon />
      </button>
    </article>
  )
}

function CoursePage({ course, onBack }) {
  const [selectedMaterial, setSelectedMaterial] = useState(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const classes = useMemo(() => getCourseClasses(course.id), [course.id])
  const instructor = getInstructor(course)

  useEffect(() => {
    setSelectedMaterial(null)
    setSidebarCollapsed(false)
  }, [course.id])

  function selectMaterial(material, classItem) {
    setSelectedMaterial({
      ...material,
      classTitle: classItem.title,
      weekNumber: classItem.weekNumber,
      date: classItem.date,
    })
  }

  return (
    <div className="course-page">
      <aside className={`course-sidebar${sidebarCollapsed ? ' is-collapsed' : ''}`}>
        {!sidebarCollapsed ? (
          <>
            <div className="sidebar-topbar">
              <button className="back-button" type="button" onClick={onBack}>
                <ArrowLeftIcon />
                All courses
              </button>
              <button
                className="icon-button"
                type="button"
                onClick={() => setSidebarCollapsed(true)}
                aria-label="Collapse syllabus"
                title="Collapse syllabus"
              >
                <ChevronIcon collapsed />
              </button>
            </div>

            <div className="sidebar-scroll">
              <section className="course-brief">
                <div className="brief-image">
                  <img src={course.imageUrl} alt="" />
                </div>
                <p className="eyebrow">{course.id}</p>
                <h1>{course.name}</h1>
                <p className="course-description">{course.longDescription}</p>

                <dl className="course-facts">
                  <div>
                    <dt>Instructor</dt>
                    <dd>
                      <span className="fact-avatar">
                        {instructor?.photo_url && <img src={instructor.photo_url} alt="" />}
                      </span>
                      <span>{instructor?.name ?? 'Faculty'}</span>
                    </dd>
                  </div>
                  <div>
                    <dt>Duration</dt>
                    <dd>{course.numberOfWeeks} weeks</dd>
                  </div>
                  <div>
                    <dt>Classes</dt>
                    <dd>{course.numberOfClasses} sessions</dd>
                  </div>
                </dl>
              </section>

              <section className="syllabus-section">
                <div className="section-heading">
                  <p className="eyebrow">Course sequence</p>
                  <h2>Syllabus</h2>
                </div>
                <div className="syllabus-table">
                  {classes.map((classItem) => {
                    const materials = getClassMaterials(classItem.classId)
                    return (
                      <article className="syllabus-row" key={classItem.classId}>
                        <div className="week-date">
                          <span className="week-pill">Week {classItem.weekNumber}</span>
                          <time dateTime={classItem.date}>{formatDate(classItem.date)}</time>
                        </div>
                        <div className="class-content">
                          <h3>{classItem.title}</h3>
                          {materials.length > 0 ? (
                            <ul className="material-list">
                              {materials.map((material) => (
                                <li key={material.id}>
                                  <button
                                    type="button"
                                    className="material-button"
                                    onClick={() => selectMaterial(material, classItem)}
                                  >
                                    <MaterialTypeIcon type={material.type} />
                                    <span>{material.title}</span>
                                    <ChevronIcon />
                                  </button>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="muted-materials">Materials coming soon.</p>
                          )}
                        </div>
                      </article>
                    )
                  })}
                </div>
              </section>
            </div>
          </>
        ) : (
          <div className="collapsed-rail">
            <button
              className="icon-button rail-open"
              type="button"
              onClick={() => setSidebarCollapsed(false)}
              aria-label="Expand syllabus"
              title="Expand syllabus"
            >
              <ChevronIcon />
            </button>
            <span className="rail-label">Syllabus</span>
          </div>
        )}
      </aside>

      <main className="viewer-area">
        <header className="viewer-toolbar">
          <button className="back-button compact-back" type="button" onClick={onBack}>
            <ArrowLeftIcon />
            All courses
          </button>
          <div className="viewer-title">
            <p className="eyebrow">{course.id}</p>
            <h2>{selectedMaterial ? selectedMaterial.title : course.name}</h2>
          </div>
          {selectedMaterial && (
            <button className="reset-viewer-button" type="button" onClick={() => setSelectedMaterial(null)}>
              <CloseIcon />
              Close material
            </button>
          )}
        </header>

        <section className="viewer-stage">
          {selectedMaterial ? (
            <MaterialViewer material={selectedMaterial} />
          ) : (
            <CourseImageView course={course} />
          )}
        </section>
      </main>
    </div>
  )
}

function CourseImageView({ course }) {
  return (
    <figure className="course-image-view">
      <img src={course.imageUrl} alt="" />
      <figcaption>
        <p className="eyebrow">Course image</p>
        <h2>{course.name}</h2>
        <p>{course.shortDescription}</p>
        <span>Choose a material from the syllabus to begin.</span>
      </figcaption>
    </figure>
  )
}

function MaterialViewer({ material }) {
  const viewerLabel = material.classTitle
    ? `Week ${material.weekNumber} · ${material.classTitle}`
    : material.title

  if (material.type === 'pdf') {
    return (
      <div className="material-frame pdf-view">
        <iframe src={material.url} title={material.title} />
      </div>
    )
  }

  if (material.type === 'video') {
    return (
      <div className="material-frame video-view">
        <video controls src={material.url} />
      </div>
    )
  }

  if (material.type === 'youtube') {
    return (
      <div className="material-frame youtube-view">
        <iframe
          src={toYouTubeEmbed(material.url)}
          title={material.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    )
  }

  if (material.type === 'md') {
    return (
      <article className="markdown-view">
        <header className="markdown-header">
          <p className="eyebrow">{viewerLabel}</p>
          <h2>{material.title}</h2>
        </header>
        <div className="markdown-body">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{material.markdown}</ReactMarkdown>
        </div>
      </article>
    )
  }

  return (
    <div className="fallback-view">
      <p className="eyebrow">{viewerLabel}</p>
      <h2>{material.title}</h2>
      <a href={material.url} target="_blank" rel="noreferrer">Open material</a>
    </div>
  )
}
