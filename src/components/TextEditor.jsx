import { useState, useRef, useEffect } from 'react'
import './TextEditor.css'

function TextEditor({ canvasRef, onTextAdd }) {
  const [isEditing, setIsEditing] = useState(false)
  const [text, setText] = useState('')
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [fontSize, setFontSize] = useState(16)
  const [fontFamily, setFontFamily] = useState('normal')
  const [fontWeight, setFontWeight] = useState('normal')
  const [color, setColor] = useState({ r: 0, g: 0, b: 0 })
  const inputRef = useRef(null)
  const controlsRef = useRef(null)

  useEffect(() => {
    const handleCanvasClick = (e) => {
      if (!isEditing) {
        const canvas = canvasRef.current
        if (!canvas) return

        const rect = canvas.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        setPosition({ x, y })
        setIsEditing(true)
        setText('')
      }
    }

    const canvas = canvasRef.current
    if (canvas) {
      canvas.addEventListener('click', handleCanvasClick)
      return () => canvas.removeEventListener('click', handleCanvasClick)
    }
  }, [canvasRef, isEditing])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isEditing])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isEditing && 
          inputRef.current && 
          !inputRef.current.contains(e.target) &&
          controlsRef.current && 
          !controlsRef.current.contains(e.target)) {
        // Cliccato fuori sia dall'input che dai controlli, quindi salva e chiudi
        handleTextSubmit()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isEditing, text, position, fontSize, fontWeight, color]) // Dipendenze per avere lo stato aggiornato in handleTextSubmit

  const handleTextSubmit = () => {
    if (text.trim()) {
      onTextAdd({
        text,
        x: position.x,
        y: position.y,
        fontSize,
        fontFamily: fontWeight === 'bold' ? 'bold' : 'normal',
        fontWeight,
        color
      })
    }
    setIsEditing(false)
    setText('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleTextSubmit()
    } else if (e.key === 'Escape') {
      setIsEditing(false)
      setText('')
    }
  }

  const getFontStyle = () => {
    return {
      fontSize: `${fontSize}px`,
      fontFamily: 'Arial, sans-serif',
      fontWeight: fontWeight,
      color: `rgb(${color.r}, ${color.g}, ${color.b})`,
      left: `${position.x}px`,
      top: `${position.y}px`
    }
  }

  return (
    <>
      {isEditing && (
        <>
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="text-input"
            style={getFontStyle()}
            placeholder="Scrivi qui..."
          />
          <div ref={controlsRef} className="window text-controls">
            <div className="title-bar">
              <div className="title-bar-text" style={{padding: "0.5rem"}}>Proprietà Testo</div>
            </div>
            <div className="window-body">
              <div className="field-row" style={{margin: '1.2rem 0 1.2rem'}}>
                <label>Dimensione:</label>
                <input
                  type="range"
                  min="8"
                  max="72"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                />
                <span>{fontSize}px</span>
              </div>
              <div className="field-row" style={{marginBottom: '1rem'}}>
                <label>Spessore:</label>
                <select
                  value={fontWeight}
                  onChange={(e) => setFontWeight(e.target.value)}
                >
                  <option value="normal">Normale</option>
                  <option value="bold">Grassetto</option>
                </select>
              </div>
              <div className="field-row" style={{marginBottom: '1rem'}}>
                <label>Colore:</label>
                <input
                  type="color"
                  value={`#${[color.r, color.g, color.b].map(x => {
                    const hex = x.toString(16)
                    return hex.length === 1 ? '0' + hex : hex
                  }).join('')}`}
                  onChange={(e) => {
                    const hex = e.target.value.replace('#', '')
                    setColor({
                      r: parseInt(hex.substr(0, 2), 16),
                      g: parseInt(hex.substr(2, 2), 16),
                      b: parseInt(hex.substr(4, 2), 16)
                    })
                  }}
                />
              </div>
              <div className="field-row" style={{justifyContent: 'flex-end'}}>
                <button onClick={handleTextSubmit} className="apply-btn">
                  Applica
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}

export default TextEditor
