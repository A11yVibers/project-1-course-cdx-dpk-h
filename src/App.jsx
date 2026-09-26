import React, { useEffect, useState } from 'react'
import CatalogPage from './components/CatalogPage.jsx'
import CoursePage from './components/CoursePage.jsx'
import { getCourseById } from './data.js'

function parseCourseFromHash() {
  const match = window.location.hash.match(/^#\/course\/([A-Za-z0-9-]+)/)
  return match ? match[1] : null
}

export default function App() {
  const [courseId, setCourseId] = useState(() => parseCourseFromHash())

  useEffect(() => {
    const handleHashChange = () => setCourseId(parseCourseFromHash())
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [courseId])

  useEffect(() => {
    document.title = courseId
      ? `${getCourseById(courseId)?.name ?? 'Course'} · Civitas`
      : 'Civitas · Online History Courses'
  }, [courseId])

  const course = courseId ? getCourseById(courseId) : null

  function openCourse(nextCourseId) {
    setCourseId(nextCourseId)
    window.location.hash = `/course/${nextCourseId}`
  }

  function showCatalog() {
    setCourseId(null)
    window.location.hash = ''
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <button type="button" className="brand" onClick={showCatalog} aria-label="Civitas home">
          <span className="brand__mark" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M3 18L9 6l3 12 3-12 6 12" />
              <path d="M5 14h8M12 14h8" />
            </svg>
          </span>
          <span className="brand__word">Civitas</span>
          <span className="brand__tagline">History, studied together</span>
        </button>
        <nav className="site-nav" aria-label="Primary">
          <span className="site-nav__label">12 courses · 4 scholars</span>
        </nav>
      </header>

      <main className="site-main">
        {course ? (
          <CoursePage course={course} onBack={showCatalog} />
        ) : (
          <CatalogPage onOpenCourse={openCourse} />
        )}
      </main>

      <footer className="site-footer">
        <div className="site-footer__brand">Civitas</div>
        <p>A digital history-learning environment built from archival course records.</p>
      </footer>
    </div>
  )
}
