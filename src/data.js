import coursesCsv from '../project-assets/history_courses.csv?raw'
import classesCsv from '../project-assets/history_classes.csv?raw'
import instructorsCsv from '../project-assets/history_instructors.csv?raw'
import materialsCsv from '../project-assets/course_materials.csv?raw'

import lectureNotesPdfUrl from '../project-assets/materials/silk_roads_class_01_lecture.pdf?url'
import lectureVideoUrl from '../project-assets/materials/silk_roads_class_01_lecture.mp4?url'
import assignmentMarkdown from '../project-assets/materials/silk_roads_class_02_assignment.md?raw'

const LOCAL_MATERIAL_URLS = Object.freeze({
  'materials/silk_roads_class_01_lecture.pdf': lectureNotesPdfUrl,
  'materials/silk_roads_class_01_lecture.mp4': lectureVideoUrl,
})

const LOCAL_MARKDOWN = Object.freeze({
  'materials/silk_roads_class_02_assignment.md': assignmentMarkdown,
})

function parseCsv(source) {
  const text = source.replace(/^\uFEFF/, '')
  const rows = []
  let row = []
  let value = ''
  let quoted = false

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index]

    if (quoted) {
      if (character === '"') {
        if (text[index + 1] === '"') {
          value += '"'
          index += 1
        } else {
          quoted = false
        }
      } else {
        value += character
      }
      continue
    }

    if (character === '"') {
      quoted = true
    } else if (character === ',') {
      row.push(value)
      value = ''
    } else if (character === '\n') {
      row.push(value)
      rows.push(row)
      row = []
      value = ''
    } else if (character !== '\r') {
      value += character
    }
  }

  if (value.length > 0 || row.length > 0) {
    row.push(value)
    rows.push(row)
  }

  return rows.filter((candidateRow) => candidateRow.length > 1 || candidateRow[0] !== '')
}

function recordsFrom(csvText) {
  const rows = parseCsv(csvText)
  if (rows.length < 2) return []
  const headers = rows[0]
  return rows.slice(1).map((cells) => {
    const record = {}
    headers.forEach((header, index) => {
      record[header] = cells[index] ?? ''
    })
    return record
  })
}

const courseRows = recordsFrom(coursesCsv)
const classRows = recordsFrom(classesCsv)
const instructorRows = recordsFrom(instructorsCsv)
const materialRows = recordsFrom(materialsCsv)

const instructorsById = Object.freeze(
  Object.fromEntries(instructorRows.map((instructor) => [instructor.instructor_id, instructor])),
)

const classesByCourseId = classRows.reduce((groups, classRow) => {
  const courseId = classRow.course_id
  if (!groups[courseId]) groups[courseId] = []
  groups[courseId].push({
    courseId,
    classId: classRow.class_id,
    weekNumber: Number(classRow.week_number),
    date: classRow.date,
    title: classRow.class_name,
  })
  return groups
}, {})

const materialsByClassId = materialRows.reduce((groups, materialRow) => {
  const classId = materialRow.class_id
  const filePath = materialRow.file_path
  const isRemote = /^https?:\/\//i.test(filePath)
  const isMarkdown = materialRow.material_type === 'md'

  if (!groups[classId]) groups[classId] = []

  groups[classId].push({
    id: materialRow.material_id,
    courseId: materialRow.course_id,
    classId,
    displayOrder: Number(materialRow.display_order),
    title: materialRow.material_title,
    type: materialRow.material_type,
    filePath,
    url: isRemote ? filePath : LOCAL_MATERIAL_URLS[filePath] ?? '',
    markdown: isMarkdown ? LOCAL_MARKDOWN[filePath] ?? '' : '',
  })

  return groups
}, {})

for (const materials of Object.values(materialsByClassId)) {
  materials.sort((a, b) => a.displayOrder - b.displayOrder)
}

const courses = courseRows.map((course) => ({
  id: course.course_id,
  name: course.name,
  shortDescription: course.short_description,
  longDescription: course.long_description,
  numberOfClasses: Number(course.number_of_classes),
  numberOfWeeks: Number(course.number_of_weeks),
  instructorId: course.instructor_id,
  imageUrl: course.image_url,
}))

export const COURSES = Object.freeze(courses)
export const CLASSES_BY_COURSE = Object.freeze(classesByCourseId)
export const MATERIALS_BY_CLASS = Object.freeze(materialsByClassId)
export const INSTRUCTORS = Object.freeze(instructorsById)

export function getCourse(courseId) {
  return COURSES.find((course) => course.id === courseId)
}

export function getInstructor(course) {
  return instructorsById[course.instructorId]
}

export function getCourseClasses(courseId) {
  return [...(classesByCourseId[courseId] ?? [])].sort((a, b) => {
    if (a.weekNumber !== b.weekNumber) return a.weekNumber - b.weekNumber
    return a.date.localeCompare(b.date)
  })
}

export function getClassMaterials(classId) {
  return materialsByClassId[classId] ?? []
}

export function getFeaturedCourse() {
  return getCourse('HIST111')
}
