import { useState, useRef, useCallback } from 'react'
import PDFViewer from './components/PDFViewer'
import Toolbar from './components/Toolbar'
import './App.css'

function App() {
  const [pdfFile, setPdfFile] = useState(null)
  const [pdfBytes, setPdfBytes] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [mode, setMode] = useState(null) // 'text', 'pen', null
  const [history, setHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const canvasRef = useRef(null)
  const pdfViewerRef = useRef(null)

  const handleFileLoad = useCallback((file, bytes) => {
    setPdfFile(file)
    setPdfBytes(bytes)
    setCurrentPage(1)
    setHistory([bytes])
    setHistoryIndex(0)
  }, [])

  const handlePageChange = useCallback((page, total) => {
    setCurrentPage(page)
    setTotalPages(total)
  }, [])

  const handleSave = useCallback(async () => {
    if (!pdfBytes || !pdfFile) return

    const modifiedBytes = await pdfViewerRef.current?.getModifiedPDF()
    if (!modifiedBytes) return

    const blob = new Blob([modifiedBytes], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    const originalName = pdfFile.name.replace('.pdf', '')
    link.download = `${originalName}_modificato.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [pdfBytes, pdfFile])

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      setPdfBytes(history[newIndex])
    }
  }, [history, historyIndex])

  const addToHistory = useCallback((newBytes) => {
    setHistory(prevHistory => {
      const newHistory = prevHistory.slice(0, historyIndex + 1)
      newHistory.push(newBytes)
      return newHistory
    })
    setHistoryIndex(prevIndex => prevIndex + 1)
    setPdfBytes(newBytes)
  }, [historyIndex])

  const canUndo = historyIndex > 0

  return (
    <div className="window" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="title-bar">
        <div className="title-bar-text">My Editor PDF - Windows 98 Edition</div>
      </div>
      <div className="window-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', margin: 0, padding: 0, minHeight: 0 }}>
        <Toolbar
          onFileLoad={handleFileLoad}
          mode={mode}
          onModeChange={setMode}
          onSave={handleSave}
          onUndo={handleUndo}
          canUndo={canUndo}
          pdfLoaded={!!pdfFile}
        />
        <div className="app-content" style={{ flex: 1, overflow: 'auto', padding: '10px', background: '#c0c0c0', minHeight: 0 }}>
          {pdfFile ? (
            <PDFViewer
              ref={pdfViewerRef}
              pdfBytes={pdfBytes}
              currentPage={currentPage}
              onPageChange={handlePageChange}
              mode={mode}
              onModification={addToHistory}
            />
          ) : (
            <div className="welcome-screen">
              <h1 style={{ fontFamily: 'Pixelated MS Sans Serif', color: '#000' }}>Editor PDF</h1>
              <p style={{ color: '#000' }}>Carica un PDF per iniziare a modificarlo</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
