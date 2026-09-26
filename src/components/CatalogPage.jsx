import React, { useMemo, useState } from 'react'
import CourseCard from './CourseCard.jsx'
import { courses, instructors } from '../data.js'

const WEEK_OPTIONS = [null, 5, 6, 7, 8]

export default function CatalogPage({ onOpenCourse }) {
  const [query, setQuery] = useState('')
  const [instructorFilter, setInstructorFilter] = useState('all')
  const [weeksFilter, setWeeksFilter] = useState('all')

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return courses.filter((course) => {
      const haystack = [
        course.name,
        course.shortDescription,
        course.longDescription,
        course.id,
        course.instructor?.name ?? '',
      ]
        .join(' ')
        .toLowerCase()

      const matchesQuery = needle === '' || haystack.includes(needle)
      const matchesInstructor =
        instructorFilter === 'all' || course.instructorId === instructorFilter
      const matchesWeeks =
        weeksFilter === 'all' || course.numberOfWeeks === Number(weeksFilter)

      return matchesQuery && matchesInstructor && matchesWeeks
    })
  }, [query, instructorFilter, weeksFilter])

  const hasFilters = query.trim() !== '' || instructorFilter !== 'all' || weeksFilter !== 'all'

  function clearFilters() {
    setQuery('')
    setInstructorFilter('all')
    setWeeksFilter('all')
  }

  return (
    <div className="catalog">
      <section className="hero">
        <div className="hero__content">
          <p className="hero__kicker">Online history courses</p>
          <h1 className="hero__title">Study the past with scholars, sources, and stories.</h1>
          <p className="hero__summary">
            Twelve carefully structured courses move chronologically across empires,
            ideas, and everyday lives — from pharaohs to the age of revolutions.
          </p>
        </div>
      </section>

      <section className="catalog__toolbar" aria-label="Course catalog controls">
        <div className="search-field">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <circle cx="11" cy="11" r="7" />
            <line x1="16.5" y1="16.5" x2="21" y2="21" />
          </svg>
          <input
            type="search"
            placeholder="Search by title, era, theme, or instructor"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Search courses"
          />
        </div>

        <div className="filter-group">
          <label className="field">
            <span>Instructor</span>
            <select
              value={instructorFilter}
              onChange={(event) => setInstructorFilter(event.target.value)}
            >
              <option value="all">All instructors</option>
              {Object.values(instructors).map((instructor) => (
                <option key={instructor.id} value={instructor.id}>
                  {instructor.name}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Length</span>
            <select value={weeksFilter} onChange={(event) => setWeeksFilter(event.target.value)}>
              <option value="all">Any length</option>
              {WEEK_OPTIONS.filter(Boolean).map((weeks) => (
                <option key={weeks} value={weeks}>
                  {weeks} weeks
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <div className="catalog__summary" aria-live="polite">
        <span>
          {filtered.length} {filtered.length === 1 ? 'course' : 'courses'}
        </span>
        {hasFilters && (
          <button type="button" className="clear-button" onClick={clearFilters}>
            Clear filters
          </button>
        )}
      </div>

      {filtered.length > 0 ? (
        <div className="course-grid">
          {filtered.map((course) => (
            <CourseCard key={course.id} course={course} onOpen={() => onOpenCourse(course.id)} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h2>No courses match your search.</h2>
          <p>Try a broader term or clear the active filters.</p>
          <button type="button" className="button button--outline" onClick={clearFilters}>
            Clear all filters
          </button>
        </div>
      )}
    </div>
  )
}
