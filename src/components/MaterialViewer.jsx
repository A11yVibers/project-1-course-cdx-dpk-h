import React from 'react'
import Markdown from './Markdown.jsx'
import { getYouTubeEmbedUrl } from '../data.js'

function MaterialViewer({ material }) {
  if (!material) return null

  const baseUrl = material.type === 'youtube' ? material.filePath : material.localUrl


  return (
    <div className="material-viewer">
      <header className="material-viewer__header">
        <div className="material-viewer__eyebrow">Selected material</div>
        <h2 className="material-viewer__title">{material.title}</h2>
        <div className="material-viewer__meta">
          <span className="chip">{material.type.toUpperCase()}</span>
          {baseUrl && (
            <a className="text-link" href={baseUrl} target="_blank" rel="noreferrer">
              Open in new tab
            </a>
          )}
        </div>
      </header>

      <div className="material-viewer__body">
        {material.type === 'md' && material.rawContent ? (
          <article className="material-document">
            <Markdown source={material.rawContent} />
          </article>
        ) : material.type === 'video' && baseUrl ? (
          <div className="media-shell">
            <video controls playsInline preload="metadata" src={baseUrl}>
              Your browser does not support embedded video.
            </video>
            <p className="media-caption">Lecture video — {material.title}</p>
          </div>
        ) : material.type === 'pdf' && baseUrl ? (
          <div className="media-shell media-shell--pdf">
            <iframe
              title={material.title}
              src={baseUrl}
              className="pdf-frame"
              loading="lazy"
            />
          </div>
        ) : material.type === 'youtube' && baseUrl ? (
          <div className="media-shell media-shell--video">
            <iframe
              title={material.title}
              src={getYouTubeEmbedUrl(baseUrl)}
              className="video-frame"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="material-placeholder">
            <p>This material has {material.type === 'md' ? 'no readable content' : 'no file link'} available.</p>
            {baseUrl && (
              <a className="text-link" href={baseUrl} target="_blank" rel="noreferrer">
                Open the {material.type} file
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default MaterialViewer
