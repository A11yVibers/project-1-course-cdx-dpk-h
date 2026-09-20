import { marked } from 'marked'
import { APPROVED_IMAGES } from './approved-images.js'

import coursesCsv from '../project-assets/history_courses.csv?raw'
import classesCsv from '../project-assets/history_classes.csv?raw'
import materialsCsv from '../project-assets/course_materials.csv?raw'
import instructorsCsv from '../project-assets/history_instructors.csv?raw'

const materialUrlModules = import.meta.glob('../project-assets/materials/*', {
  eager: true,
  query: '?url',
  import: 'default',
})

const materialTextModules = import.meta.glob('../project-assets/materials/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
})

function materialKeyFromModulePath(path) {
  return `materials/${path.split('/').pop()}`
}

const materialUrls = Object.fromEntries(
  Object.entries(materialUrlModules).map(([path, url]) => [materialKeyFromModulePath(path), url]),
)

const materialText = Object.fromEntries(
  Object.entries(materialTextModules).map(([path, text]) => [materialKeyFromModulePath(path), text]),
)

export function parseCsv(source) {
  const rows = []
  let row = []
  let field = ''
  let inQuotes = false

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index]
    const nextChar = source[index + 1]

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          field += '"'
          index += 1
        } else {
          inQuotes = false
        }
      } else {
        field += char
      }
      continue
    }

    if (char === '"') {
      inQuotes = true
    } else if (char === ',') {
      row.push(field)
      field = ''
    } else if (char === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else if (char !== '\r') {
      field += char
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }

  const [headerRow, ...bodyRows] = rows
  if (!headerRow) return []

  const headers = headerRow.map((header) => header.trim())
  return bodyRows
    .filter((values) => values.some((value) => value.trim() !== ''))
    .map((values) =>
      Object.fromEntries(headers.map((header, index) => [header, (values[index] ?? '').trim()])),
    )
}

function toNumber(value, fallback = 0) {
  const parsed = Number.parseInt(value, 10)
  return Number.isNaN(parsed) ? fallback : parsed
}

const instructorRows = parseCsv(instructorsCsv)
const classRows = parseCsv(classesCsv)
const materialRows = parseCsv(materialsCsv)

export const instructors = instructorRows.map((instructor) => ({
  id: instructor.instructor_id,
  name: instructor.name,
  email: instructor.email,
  photoUrl: instructor.photo_url,
}))

const instructorsById = Object.fromEntries(instructors.map((instructor) => [instructor.id, instructor]))

export const courses = parseCsv(coursesCsv).map((course) => ({
  id: course.course_id,
  title: course.name,
  shortDescription: course.short_description,
  longDescription: course.long_description,
  classCount: toNumber(course.number_of_classes),
  weekCount: toNumber(course.number_of_weeks),
  instructorId: course.instructor_id,
  imageUrl: course.image_url,
}))

const coursesById = Object.fromEntries(courses.map((course) => [course.id, course]))

const classes = classRows.map((classItem) => ({
  id: classItem.class_id,
  courseId: classItem.course_id,
  weekNumber: toNumber(classItem.week_number),
  date: classItem.date,
  title: classItem.class_name,
}))

const classesByCourse = courses.reduce((accumulator, course) => {
  accumulator[course.id] = classes
    .filter((classItem) => classItem.courseId === course.id)
    .sort((a, b) => a.weekNumber - b.weekNumber || a.date.localeCompare(b.date))
  return accumulator
}, {})

function resolveMaterialUrl(filePath) {
  if (!filePath) return null
  if (/^https?:\/\//i.test(filePath)) return filePath
  return materialUrls[filePath] ?? null
}

const materials = materialRows
  .map((material) => {
    const filePath = material.file_path || ''
    const isRemote = /^https?:\/\//i.test(filePath)
    const isMarkdown = material.material_type?.toLowerCase() === 'md'
    const resolvedUrl = isMarkdown ? null : resolveMaterialUrl(filePath)
    const markdown = isMarkdown && !isRemote ? materialText[filePath] ?? '' : ''

    return {
      id: material.material_id,
      courseId: material.course_id,
      classId: material.class_id,
      displayOrder: toNumber(material.display_order),
      title: material.material_title,
      type: material.material_type?.toLowerCase() ?? 'resource',
      filePath,
      url: resolvedUrl,
      markdown,
    }
  })
  .sort((a, b) => a.displayOrder - b.displayOrder)

const materialsByClass = classes.reduce((accumulator, classItem) => {
  accumulator[classItem.id] = materials.filter((material) => material.classId === classItem.id)
  return accumulator
}, {})

export function getCourseById(courseId) {
  return coursesById[courseId] ?? null
}

export function getInstructorById(instructorId) {
  return instructorsById[instructorId] ?? null
}

export function getClassesForCourse(courseId) {
  return classesByCourse[courseId] ?? []
}

export function getMaterialsForClass(classId) {
  return materialsByClass[classId] ?? []
}

export function renderMarkdown(source) {
  return marked.parse(source || '', { async: false })
}

export const approvedImages = APPROVED_IMAGES
