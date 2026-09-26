import React, { useMemo, useState } from 'react'
import MaterialViewer from './MaterialViewer.jsx'
import { getClassesByCourse, getMaterialsByClass, materials, formatDate } from '../data.js'

const TYPE_META = {
  pdf: { label: 'Reading', short: 'PDF' },
  video: { label: 'Lecture video', short: 'Video' },
  youtube: { label: 'Lecture video', short: 'Video' },
  md: { label: 'Assignment', short: 'Docs' },
}

function MaterialIcon({ type }) {
  if (type === 'pdf') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M6 2h8l4 4v16H6z" />
        <path d="M14 2v5h5" />
        <path d="M9 13h6M9 17h6" />
      </svg>
    )
  }
  if (type === 'video' || type === 'youtube') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M10 9l5 3-5 3z" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M5 3h11l3 3v15H5z" />
      <path d="M8 3v4h8V3M9 13h6M9 17h6" />
    </svg>
  )
}

function CourseDefaultView({ course }) {
  return (
    <div className="course-default">
      <div className="course-default__media">
        <img src={course.imageUrl} alt={`${course.name} course image`} />
      </div>
      <div className="course-default__caption">
        <p className="eyebrow">Course image</p>
        <h2>{course.name}</h2>
        <p className="course-default__hint">
          Select a material from the syllabus to view it here without leaving this page.
        </p>
      </div>
    </div>
  )
}

export default function CoursePage({ course, onBack }) {
  const [collapsed, setCollapsed] = useState(false)
  const [selectedMaterialId, setSelectedMaterialId] = useState(null)

  const classes = useMemo(() => getClassesByCourse(course.id), [course.id])
  const selectedMaterial = useMemo(
    () => materials.find((material) => material.id === selectedMaterialId) ?? null,
    [selectedMaterialId],
  )

  return (
    <div className="course-page">
      <header className="course-bar">
        <button type="button" className="back-link" onClick={onBack}>
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Course catalog
        </button>
        <button
          type="button"
          className="collapse-toggle"
          onClick={() => setCollapsed((value) => !value)}
          aria-expanded={!collapsed}
        >
          {collapsed ? 'Show course details' : 'Hide course details'}
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            {collapsed ? (
              <path d="M8 10l4 4 4-4" />
            ) : (
              <path d="M8 14l4-4 4 4" />
            )}
          </svg>
        </button>
      </header>

      <div className={`course-layout${collapsed ? ' course-layout--collapsed' : ''}`}>
        <aside className="course-panel" aria-label="Course information and syllabus">
          <section className="course-info">
            <div className="course-info__image">
              <img src={course.imageUrl} alt="" />
            </div>
            <div className="course-info__body">
              <div className="course-info__id">{course.id}</div>
              <h1 className="course-info__title">{course.name}</h1>
              {course.instructor && (
                <div className="course-info__instructor">
                  <img src={course.instructor.photoUrl} alt="" />
                  <div>
                    <span className="course-info__instructor-name">{course.instructor.name}</span>
                    <span className="course-info__instructor-email">{course.instructor.email}</span>
                  </div>
                </div>
              )}
              <p className="course-info__description">{course.longDescription}</p>
              <dl className="course-info__meta">
                <div>
                  <dt>Classes</dt>
                  <dd>{course.numberOfClasses}</dd>
                </div>
                <div>
                  <dt>Weeks</dt>
                  <dd>{course.numberOfWeeks}</dd>
                </div>
                <div>
                  <dt>Format</dt>
                  <dd>Online</dd>
                </div>
              </dl>
            </div>
          </section>

          <section className="syllabus">
            <div className="syllabus__heading">
              <div>
                <p className="eyebrow">Course syllabus</p>
                <h2>Schedule &amp; materials</h2>
              </div>
              <span className="syllabus__count">{classes.length} classes</span>
            </div>

            <div className="syllabus-table-wrap">
              <table className="syllabus-table">
                <thead>
                  <tr>
                    <th scope="col">Week</th>
                    <th scope="col">Date</th>
                    <th scope="col">Class content</th>
                  </tr>
                </thead>
                <tbody>
                  {classes.map((classItem) => {
                    const classMaterials = getMaterialsByClass(classItem.id)
                    return (
                      <tr key={classItem.id}>
                        <td className="syllabus-table__week">Week {classItem.weekNumber}</td>
                        <td className="syllabus-table__date">{formatDate(classItem.date)}</td>
                        <td className="syllabus-table__content">
                          <h3 className="syllabus-table__title">{classItem.title}</h3>
                          {classMaterials.length > 0 ? (
                            <ul className="material-list">
                              {classMaterials.map((material) => (
                                <li key={material.id}>
                                  <button
                                    type="button"
                                    className={`material-item${
                                      selectedMaterialId === material.id
                                        ? ' material-item--active'
                                        : ''
                                    }`}
                                    onClick={() => setSelectedMaterialId(material.id)}
                                    aria-pressed={selectedMaterialId === material.id}
                                  >
                                    <span className="material-item__icon">
                                      <MaterialIcon type={material.type} />
                                    </span>
                                    <span className="material-item__body">
                                      <span className="material-item__title">{material.title}</span>
                                      <span className="material-item__type">
                                        {TYPE_META[material.type]?.label ?? material.type}
                                      </span>
                                    </span>
                                    <span className="material-item__arrow" aria-hidden="true">
                                      →
                                    </span>
                                  </button>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="syllabus-table__empty">
                              No materials have been posted for this class.
                            </p>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </aside>

        <section className="viewer-pane" aria-label="Material viewing area">
          {selectedMaterial ? (
            <MaterialViewer key={selectedMaterial.id} material={selectedMaterial} />
          ) : (
            <CourseDefaultView course={course} />
          )}
        </section>
      </div>
    </div>
  )
}
