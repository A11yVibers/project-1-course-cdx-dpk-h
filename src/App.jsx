import { useEffect, useState } from 'react'
import Catalog from './components/Catalog.jsx'
import CoursePage from './components/CoursePage.jsx'
import { courses, instructors } from './data.js'

function readHashRoute() {
  const hash = window.location.hash.replace(/^#\/?/, '')
  return hash.split('?')[0]
}

function App() {
  const [route, setRoute] = useState(readHashRoute)

  useEffect(() => {
    const handleRouteChange = () => {
      setRoute(readHashRoute())
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    window.addEventListener('hashchange', handleRouteChange)
    return () => window.removeEventListener('hashchange', handleRouteChange)
  }, [])

  const courseMatch = route.match(/^course\/([^/]+)/)
  const activeCourseId = courseMatch?.[1] ?? null

  function openCourse(courseId) {
    window.location.hash = `/course/${courseId}`
  }

  function openCatalog() {
    window.location.hash = '/'
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="#/" onClick={openCatalog}>
          <span className="brand__mark" aria-hidden="true">◆</span>
          <span>
            <strong>Chronicle</strong>
            <small>History learning</small>
          </span>
        </a>
        <span className="site-header__tagline">Archives · Primary sources · Ideas</span>
      </header>

      {activeCourseId ? (
        <CoursePage courseId={activeCourseId} onBack={openCatalog} />
      ) : (
        <Catalog courses={courses} instructors={instructors} onOpenCourse={openCourse} />
      )}
    </div>
  )
}

export default App
