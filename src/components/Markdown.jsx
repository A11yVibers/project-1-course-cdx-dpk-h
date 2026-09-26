import React from 'react'

const INLINE_PATTERN = /(\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\))/g

let inlineKey = 0
function renderInline(text) {
  if (!text) return text
  const nodes = []
  let lastIndex = 0
  let match

  while ((match = INLINE_PATTERN.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index))
    }

    if (match[2] !== undefined) {
      nodes.push(<strong key={inlineKey++}>{match[2]}</strong>)
    } else if (match[3] !== undefined) {
      nodes.push(<em key={inlineKey++}>{match[3]}</em>)
    } else if (match[4] !== undefined) {
      nodes.push(<code key={inlineKey++}>{match[4]}</code>)
    } else if (match[5] !== undefined && match[6] !== undefined) {
      nodes.push(
        <a key={inlineKey++} href={match[6]} target="_blank" rel="noreferrer">
          {match[5]}
        </a>,
      )
    }

    lastIndex = INLINE_PATTERN.lastIndex
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex))
  }

  return nodes
}

function isTableLine(line) {
  const trimmed = line.trim()
  return trimmed.startsWith('|') && trimmed.endsWith('|')
}

function parseTableRows(lines, startIndex) {
  const rows = []
  let index = startIndex
  rows.push(lines[index])

  if (index + 1 < lines.length && /^\s*\|?[\s:|-]+\|?\s*$/.test(lines[index + 1])) {
    index += 1
  }

  while (index + 1 < lines.length && isTableLine(lines[index + 1])) {
    index += 1
    rows.push(lines[index])
  }

  return { rows, nextIndex: index }
}

function splitTableCells(line) {
  let content = line.trim()
  if (content.startsWith('|')) content = content.slice(1)
  if (content.endsWith('|')) content = content.slice(0, -1)
  return content.split('|').map((cell) => cell.trim())
}

export default function Markdown({ source }) {
  if (!source) return null
  const lines = source.replace(/\r\n/g, '\n').split('\n')
  const blocks = []
  let index = 0

  while (index < lines.length) {
    const line = lines[index]
    const trimmed = line.trim()

    if (trimmed === '') {
      index += 1
      continue
    }

    if (isTableLine(trimmed)) {
      const { rows, nextIndex } = parseTableRows(lines, index)
      const headerCells = splitTableCells(rows[0])
      const bodyRows = rows.slice(1)
      blocks.push(
        <div className="md-table-wrap" key={blocks.length}>
          <table>
            <thead>
              <tr>
                {headerCells.map((cell, cellIndex) => (
                  <th key={cellIndex}>{renderInline(cell)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bodyRows.map((row, rowIndex) => {
                const cells = splitTableCells(row)
                return (
                  <tr key={rowIndex}>
                    {cells.map((cell, cellIndex) => (
                      <td key={cellIndex}>{renderInline(cell)}</td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>,
      )
      index = nextIndex + 1
      continue
    }

    if (/^#{1,6}\s+/.test(trimmed)) {
      const level = trimmed.match(/^#+/)[0].length
      const content = trimmed.replace(/^#{1,6}\s+/, '')
      const key = blocks.length
      blocks.push(
        level === 1 ? (
          <h1 key={key} className="md-h1">{renderInline(content)}</h1>
        ) : level === 2 ? (
          <h2 key={key} className="md-h2">{renderInline(content)}</h2>
        ) : (
          <h3 key={key} className="md-h3">{renderInline(content)}</h3>
        ),
      )
      index += 1
      continue
    }

    if (/^\s*(?:[-*_]\s*){3,}$/.test(trimmed)) {
      blocks.push(<hr key={blocks.length} />)
      index += 1
      continue
    }

    if (/^\s*[-*+]\s+/.test(trimmed)) {
      const items = []
      while (index < lines.length && /^\s*[-*+]\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^\s*[-*+]\s+/, ''))
        index += 1
      }
      blocks.push(
        <ul key={blocks.length}>
          {items.map((item, itemIndex) => (
            <li key={itemIndex}>{renderInline(item)}</li>
          ))}
        </ul>,
      )
      continue
    }

    if (/^\s*\d+[.)]\s+/.test(trimmed)) {
      const items = []
      while (index < lines.length && /^\s*\d+[.)]\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^\s*\d+[.)]\s+/, ''))
        index += 1
      }
      blocks.push(
        <ol key={blocks.length}>
          {items.map((item, itemIndex) => (
            <li key={itemIndex}>{renderInline(item)}</li>
          ))}
        </ol>,
      )
      continue
    }

    const paragraphLines = [trimmed]
    index += 1
    while (
      index < lines.length &&
      lines[index].trim() !== '' &&
      !/^#{1,6}\s+/.test(lines[index].trim()) &&
      !/^\s*(?:[-*_]\s*){3,}$/.test(lines[index].trim()) &&
      !/^\s*[-*+]\s+/.test(lines[index].trim()) &&
      !/^\s*\d+[.)]\s+/.test(lines[index].trim()) &&
      !isTableLine(lines[index].trim())
    ) {
      paragraphLines.push(lines[index].trim())
      index += 1
    }

    blocks.push(<p key={blocks.length}>{renderInline(paragraphLines.join(' '))}</p>)
  }

  return <div className="markdown">{blocks}</div>
}
