import { useMemo, useState } from 'react'

const weekOptions = [
  { label: 'Any length', value: 'all' },
  { label: '5 weeks', value: '5' },
  { label: '6 weeks', value: '6' },
  { label: '7 weeks', value: '7' },
  { label: '8 weeks', value: '8' },
]

const sortOptions = [
  { label: 'Course title', value: 'title' },
  { label: 'Shortest first', value: 'weeks' },
  { label: 'Most classes', value: 'classes' },
]

function CourseCard({ course, instructor, onOpen }) {
  return (
    <article className="course-card">
      <button className="course-card__hit" type="button" onClick={() => onOpen(course.id)}>
        <span className="sr-only">Open {course.title}</span>
      </button>
      <div className="course-card__media">
        <img src={course.imageUrl} alt="" loading="lazy" />
        <span className="course-card__weeks">{course.weekCount} weeks</span>
      </div>
      <div className="course-card__body">
        <p className="eyebrow">{course.id}</p>
        <h2>{course.title}</h2>
        <p className="course-card__description">{course.shortDescription}</p>
        <div className="course-card__footer">
          <span>{instructor?.name ?? 'Faculty'}</span>
          <span>{course.classCount} classes</span>
        </div>
      </div>
    </article>
  )
}

export default function Catalog({ courses, instructors, onOpenCourse }) {
  const [query, setQuery] = useState('')
  const [instructorId, setInstructorId] = useState('all')
  const [weekFilter, setWeekFilter] = useState('all')
  const [sortBy, setSortBy] = useState('title')

  const filteredCourses = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const matches = courses.filter((course) => {
      const instructor = instructors.find((item) => item.id === course.instructorId)
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [
          course.title,
          course.shortDescription,
          course.longDescription,
          course.id,
          instructor?.name ?? '',
        ]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery)
      const matchesInstructor = instructorId === 'all' || course.instructorId === instructorId
      const matchesWeeks = weekFilter === 'all' || String(course.weekCount) === weekFilter
      return matchesQuery && matchesInstructor && matchesWeeks
    })

    return matches.sort((a, b) => {
      if (sortBy === 'weeks') return a.weekCount - b.weekCount || a.title.localeCompare(b.title)
      if (sortBy === 'classes') return b.classCount - a.classCount || a.title.localeCompare(b.title)
      return a.title.localeCompare(b.title)
    })
  }, [courses, instructors, instructorId, query, sortBy, weekFilter])

  return (
    <div className="catalog-page">
      <header className="catalog-hero">
        <div className="catalog-hero__content">
          <p className="kicker">The History Commons</p>
          <h1>Study the past, one archive at a time.</h1>
          <p>
            Explore twelve courses built around original readings, lectures, maps, and primary
            documents.
          </p>
        </div>
      </header>

      <section className="catalog-shell" aria-label="Course catalog">
        <div className="catalog-tools">
          <label className="search-field">
            <span className="sr-only">Search courses</span>
            <span aria-hidden="true" className="search-field__icon">⌕</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by course, topic, or instructor"
            />
          </label>

          <label className="filter-field">
            <span>Instructor</span>
            <select
              value={instructorId}
              onChange={(event) => setInstructorId(event.target.value)}
            >
              <option value="all">All instructors</option>
              {instructors.map((instructor) => (
                <option key={instructor.id} value={instructor.id}>
                  {instructor.name}
                </option>
              ))}
            </select>
          </label>

          <label className="filter-field">
            <span>Length</span>
            <select value={weekFilter} onChange={(event) => setWeekFilter(event.target.value)}>
              {weekOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="filter-field">
            <span>Sort</span>
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="catalog-summary" aria-live="polite">
          <p>
            Showing <strong>{filteredCourses.length}</strong> of {courses.length} courses
          </p>
          {(query || instructorId !== 'all' || weekFilter !== 'all') && (
            <button
              className="text-button"
              type="button"
              onClick={() => {
                setQuery('')
                setInstructorId('all')
                setWeekFilter('all')
              }}
            >
              Clear filters
            </button>
          )}
        </div>

        {filteredCourses.length > 0 ? (
          <div className="course-grid">
            {filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                instructor={instructors.find((item) => item.id === course.instructorId)}
                onOpen={onOpenCourse}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h2>No courses match those filters.</h2>
            <p>Try a broader search or clear the current filters.</p>
          </div>
        )}
      </section>
    </div>
  )
}
