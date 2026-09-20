import { renderMarkdown } from '../data.js'

function getYouTubeEmbedUrl(url) {
  const match = url?.match(/(?:youtu\.be\/|v=)([\w-]{6,})/)
  return match ? `https://www.youtube-nocookie.com/embed/${match[1]}` : null
}

function MaterialContent({ material }) {
  if (material.type === 'md') {
    return (
      <article
        className="markdown-document"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(material.markdown) }}
      />
    )
  }

  if (material.type === 'pdf') {
    return (
      <div className="viewer-frame viewer-frame--pdf">
        <iframe src={material.url} title={material.title} />
      </div>
    )
  }

  if (material.type === 'video') {
    return (
      <div className="viewer-frame viewer-frame--video">
        <video controls preload="metadata" src={material.url} aria-label={material.title}>
          Your browser does not support embedded video.
        </video>
      </div>
    )
  }

  if (material.type === 'youtube') {
    const embedUrl = getYouTubeEmbedUrl(material.url)
    return (
      <div className="viewer-frame viewer-frame--youtube">
        {embedUrl ? (
          <iframe
            src={embedUrl}
            title={material.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <p>
            This resource is not available as an embedded viewer.{' '}
            <a href={material.url} target="_blank" rel="noreferrer">
              Open it in a new tab
            </a>
            .
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="viewer-link">
      <p>This material is best viewed in a separate window.</p>
      <a className="primary-action" href={material.url} target="_blank" rel="noreferrer">
        Open resource
      </a>
    </div>
  )
}

export default function MaterialViewer({ course, classItem, material, onClear }) {
  if (!material) {
    return (
      <div className="viewer-pane viewer-pane--image">
        <div className="viewer-pane__topbar">
          <p className="eyebrow">Course image</p>
          <h2>{course.title}</h2>
        </div>
        <figure className="course-portrait">
          <img src={course.imageUrl} alt={course.title} />
          <figcaption>
            <span>{course.classCount} classes</span>
            <span>{course.weekCount} weeks</span>
          </figcaption>
        </figure>
      </div>
    )
  }

  return (
    <div className="viewer-pane viewer-pane--material">
      <header className="viewer-pane__topbar">
        <div>
          <p className="eyebrow">
            Week {classItem?.weekNumber} · {material.type}
          </p>
          <h2>{material.title}</h2>
          {classItem && <p className="viewer-pane__class">{classItem.title}</p>}
        </div>
        <button className="viewer-clear" type="button" onClick={onClear}>
          <span aria-hidden="true">←</span> Course image
        </button>
      </header>
      <div className="viewer-pane__content">
        <MaterialContent material={material} />
      </div>
    </div>
  )
}
