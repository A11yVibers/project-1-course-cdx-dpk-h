import React from 'react'

export default function CourseCard({ course, onOpen }) {
  return (
    <button type="button" className="course-card" onClick={onOpen} aria-label={`Open ${course.name}`}>
      <div className="course-card__media">
        <img src={course.imageUrl} alt="" loading="lazy" />
        <div className="course-card__badge">
          {course.numberOfClasses} classes · {course.numberOfWeeks} weeks
        </div>
      </div>
      <div className="course-card__body">
        <div className="course-card__id">{course.id}</div>
        <h3 className="course-card__title">{course.name}</h3>
        <p className="course-card__description">{course.shortDescription}</p>
        {course.instructor && (
          <div className="course-card__instructor">
            <img src={course.instructor.photoUrl} alt="" />
            <span>{course.instructor.name}</span>
          </div>
        )}
      </div>
    </button>
  )
}
