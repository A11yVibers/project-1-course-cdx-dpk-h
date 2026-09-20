import { useEffect, useMemo, useState } from 'react'
import MaterialViewer from './MaterialViewer.jsx'
import {
  getClassesForCourse,
  getCourseById,
  getInstructorById,
  getMaterialsForClass,
} from '../data.js'

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
})

function formatClassDate(dateValue) {
  if (!dateValue) return ''
  return dateFormatter.format(new Date(`${dateValue}T00:00:00Z`))
}

function MaterialButton({ material, classItem, isActive, onSelect }) {
  const typeLabels = {
    pdf: 'PDF reading',
    video: 'Lecture video',
    youtube: 'Video',
    md: 'Assignment',
  }

  return (
    <li>
      <button
        className={`material-button${isActive ? ' is-active' : ''}`}
        type="button"
        onClick={() => onSelect(material, classItem)}
        aria-pressed={isActive}
      >
        <span className="material-button__type">{typeLabels[material.type] ?? material.type}</span>
        <span className="material-button__title">{material.title}</span>
        <span className="material-button__arrow" aria-hidden="true">↗</span>
      </button>
    </li>
  )
}

function SyllabusRow({ classItem, materials, selectedMaterialId, onSelectMaterial }) {
  const rowIsSelected = materials.some((material) => material.id === selectedMaterialId)

  return (
    <tr className={rowIsSelected ? 'is-selected' : ''}>
      <td className="week-cell" data-label="Week">
        <span>Week {classItem.weekNumber}</span>
      </td>
      <td className="date-cell" data-label="Date">
        {formatClassDate(classItem.date)}
      </td>
      <td className="content-cell" data-label="Class content">
        <h3>{classItem.title}</h3>
        {materials.length > 0 ? (
          <ul className="material-list">
            {materials.map((material) => (
              <MaterialButton
                key={material.id}
                material={material}
                classItem={classItem}
                isActive={selectedMaterialId === material.id}
                onSelect={onSelectMaterial}
              />
            ))}
          </ul>
        ) : (
          <p className="muted-note">No materials have been posted for this class yet.</p>
        )}
      </td>
    </tr>
  )
}

export default function CoursePage({ courseId, onBack }) {
  const course = getCourseById(courseId)
  const instructor = getInstructorById(course?.instructorId ?? '')
  const classes = useMemo(() => getClassesForCourse(courseId), [courseId])
  const [leftCollapsed, setLeftCollapsed] = useState(false)
  const [selected, setSelected] = useState({ material: null, classItem: null })

  useEffect(() => {
    setSelected({ material: null, classItem: null })
    setLeftCollapsed(false)
  }, [courseId])

  if (!course) {
    return (
      <main className="not-found">
        <h1>Course not found</h1>
        <p>The course archive you are looking for is unavailable.</p>
        <button className="primary-action" type="button" onClick={onBack}>
          Return to catalog
        </button>
      </main>
    )
  }

  function selectMaterial(material, classItem) {
    setSelected({ material, classItem })
  }

  function clearMaterial() {
    setSelected({ material: null, classItem: null })
  }

  return (
    <main className="course-page">
      <aside className={`course-sidebar${leftCollapsed ? ' is-collapsed' : ''}`}>
        {leftCollapsed ? (
          <button
            className="sidebar-expand"
            type="button"
            onClick={() => setLeftCollapsed(false)}
            aria-expanded={!leftCollapsed}
          >
            <span aria-hidden="true">☰</span>
            <span className="sr-only">Expand course information and syllabus</span>
          </button>
        ) : (
          <div className="course-sidebar__inner">
            <button
              className="sidebar-collapse"
              type="button"
              onClick={() => setLeftCollapsed(true)}
              aria-expanded={!leftCollapsed}
            >
              <span aria-hidden="true">‹</span> Collapse
            </button>

            <button className="back-link" type="button" onClick={onBack}>
              <span aria-hidden="true">←</span> All courses
            </button>

            <div className="course-info">
              <img className="course-info__image" src={course.imageUrl} alt="" />
              <p className="eyebrow">{course.id}</p>
              <h1>{course.title}</h1>
              <p className="course-info__short">{course.shortDescription}</p>

              <div className="course-stats" aria-label="Course overview">
                <div>
                  <strong>{course.classCount}</strong>
                  <span>classes</span>
                </div>
                <div>
                  <strong>{course.weekCount}</strong>
                  <span>weeks</span>
                </div>
              </div>

              <div className="instructor-card">
                <img src={instructor?.photoUrl} alt="" />
                <div>
                  <span>Course instructor</span>
                  <strong>{instructor?.name ?? 'Faculty'}</strong>
                  {instructor?.email && <a href={`mailto:${instructor.email}`}>{instructor.email}</a>}
                </div>
              </div>

              <p className="course-info__long">{course.longDescription}</p>
            </div>

            <section className="syllabus-section" aria-labelledby="syllabus-heading">
              <div className="section-heading">
                <p className="eyebrow">Syllabus</p>
                <h2 id="syllabus-heading">Course schedule</h2>
              </div>

              <div className="syllabus-scroll">
                <table className="syllabus-table">
                  <thead>
                    <tr>
                      <th scope="col">Week</th>
                      <th scope="col">Date</th>
                      <th scope="col">Class content</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classes.map((classItem) => (
                      <SyllabusRow
                        key={classItem.id}
                        classItem={classItem}
                        materials={getMaterialsForClass(classItem.id)}
                        selectedMaterialId={selected.material?.id ?? null}
                        onSelectMaterial={selectMaterial}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
      </aside>

      <section className="material-stage" aria-live="polite">
        <MaterialViewer
          course={course}
          classItem={selected.classItem}
          material={selected.material}
          onClear={clearMaterial}
        />
      </section>
    </main>
  )
}
