import { useState, useRef, useEffect } from 'react'
import './PenTool.css'

function PenTool({ canvasRef, onDraw }) {
  const [thickness, setThickness] = useState(2)
  const overlayRef = useRef(null)
  const isDrawingRef = useRef(false)
  const currentPathRef = useRef([])
  const thicknessRef = useRef(thickness)

  useEffect(() => {
    thicknessRef.current = thickness
  }, [thickness])

  useEffect(() => {
    const canvas = canvasRef.current
    const overlay = overlayRef.current
    if (!canvas || !overlay) return

    const updateOverlay = () => {
      overlay.width = canvas.width
      overlay.height = canvas.height
      overlay.style.position = 'absolute'
      overlay.style.left = canvas.offsetLeft + 'px'
      overlay.style.top = canvas.offsetTop + 'px'
    }

    updateOverlay()
    window.addEventListener('resize', updateOverlay)

    const ctx = overlay.getContext('2d')
    ctx.strokeStyle = '#000000'
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    const startDrawing = (e) => {
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      isDrawingRef.current = true
      currentPathRef.current = [{ x, y }]
      ctx.beginPath()
      ctx.moveTo(x, y)
    }

    const draw = (e) => {
      if (!isDrawingRef.current) return

      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      currentPathRef.current.push({ x, y })
      ctx.lineTo(x, y)
      ctx.lineWidth = thicknessRef.current
      ctx.stroke()
    }

    const stopDrawing = () => {
      if (isDrawingRef.current && currentPathRef.current.length > 0) {
        onDraw({
          paths: [{ points: [...currentPathRef.current], thickness: thicknessRef.current }]
        })
        // Pulisci l'overlay dopo aver salvato il disegno
        ctx.clearRect(0, 0, overlay.width, overlay.height)
        currentPathRef.current = []
      }
      isDrawingRef.current = false
    }

    overlay.addEventListener('mousedown', startDrawing)
    overlay.addEventListener('mousemove', draw)
    overlay.addEventListener('mouseup', stopDrawing)
    overlay.addEventListener('mouseleave', stopDrawing)

    return () => {
      window.removeEventListener('resize', updateOverlay)
      overlay.removeEventListener('mousedown', startDrawing)
      overlay.removeEventListener('mousemove', draw)
      overlay.removeEventListener('mouseup', stopDrawing)
      overlay.removeEventListener('mouseleave', stopDrawing)
    }
  }, [canvasRef, onDraw])

  return (
    <>
      <canvas
        ref={overlayRef}
        className="pen-overlay"
        style={{ pointerEvents: 'auto', cursor: 'crosshair' }}
      />
      <div className="window pen-controls">
        <div className="title-bar">
          <div className="title-bar-text" style={{padding: "0.5rem"}}>Penna</div>
        </div>
        <div className="window-body">
          <div className="field-row" style={{margin: '0.7rem 0'}}>
            <label>Spessore:</label>
            <input
              type="range"
              min="1"
              max="10"
              value={thickness}
              onChange={(e) => setThickness(Number(e.target.value))}
            />
            <span>{thickness}px</span>
          </div>
        </div>
      </div>
    </>
  )
}

export default PenTool
