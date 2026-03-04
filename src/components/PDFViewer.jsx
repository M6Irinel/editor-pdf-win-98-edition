import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import TextEditor from './TextEditor'
import PenTool from './PenTool'
import './PDFViewer.css'

// Configurazione pdfjs
if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`
}

const PDFViewer = forwardRef(({ pdfBytes, currentPage, onPageChange, mode, onModification }, ref) => {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [pdfDoc, setPdfDoc] = useState(null)
  const [pageNum, setPageNum] = useState(1)
  const [numPages, setNumPages] = useState(0)
  const [scale, setScale] = useState(1.5)
  const [pdfLibDoc, setPdfLibDoc] = useState(null)
  const overlayCanvasRef = useRef(null)
  const isLoadingRef = useRef(false)
  const lastPdfBytesRef = useRef(null)

  // Espone metodi al componente genitore
  useImperativeHandle(ref, () => ({
    getModifiedPDF: async () => {
      if (!pdfLibDoc) return null
      return await pdfLibDoc.save()
    },
    loadPDFBytes: async (bytes) => {
      // Quando undo/redo viene chiamato, ricarichiamo tutto
      loadPDF(bytes)
    }
  }))

  // Caricamento iniziale e aggiornamenti esterni (undo/redo, file load)
  useEffect(() => {
    // Evita di ricaricare se il riferimento all'array di bytes è identico
    if (pdfBytes && pdfBytes !== lastPdfBytesRef.current && !isLoadingRef.current) {
        lastPdfBytesRef.current = pdfBytes;
        loadPDF(pdfBytes)
    }
  }, [pdfBytes])

  // Gestione del caricamento PDF
  const loadPDF = async (bytes) => {
    if (isLoadingRef.current) return
    isLoadingRef.current = true

    try {
      // 1. Carica il documento per la visualizzazione (pdf.js)
      // Passiamo una copia dei bytes per sicurezza
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(bytes) })
      const pdf = await loadingTask.promise
      setPdfDoc(pdf)
      setNumPages(pdf.numPages)
      
      // Mantiene la pagina corrente se valida, altrimenti torna alla 1
      const targetPage = pageNum > pdf.numPages ? 1 : pageNum
      setPageNum(targetPage)
      onPageChange(targetPage, pdf.numPages)

      // 2. Carica il documento per la modifica (pdf-lib)
      const pdfLib = await PDFDocument.load(bytes)
      setPdfLibDoc(pdfLib)
      
    } catch (error) {
      console.error('Errore caricamento PDF:', error)
      // Ignora errori di rete/worker non critici
      if (error.name !== 'DataCloneError' && !error.message?.includes('worker')) {
         alert('Errore nel caricamento del PDF')
      }
    } finally {
      isLoadingRef.current = false
    }
  }

  // Rendering della pagina
  useEffect(() => {
    const render = async () => {
      if (!pdfDoc || !pageNum || !canvasRef.current) return

      try {
        const page = await pdfDoc.getPage(pageNum)
        const viewport = page.getViewport({ scale })
        const canvas = canvasRef.current
        const context = canvas.getContext('2d')

        canvas.height = viewport.height
        canvas.width = viewport.width

        // Pulisci il canvas prima di renderizzare
        context.clearRect(0, 0, canvas.width, canvas.height);

        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise

        // Aggiorna dimensioni overlay
        if (overlayCanvasRef.current) {
          overlayCanvasRef.current.width = viewport.width
          overlayCanvasRef.current.height = viewport.height
        }
      } catch (error) {
        console.error('Errore rendering pagina:', error)
      }
    }

    render()
  }, [pdfDoc, pageNum, scale])

  // Gestione navigazione e zoom
  const handlePrevPage = () => {
    if (pageNum > 1) {
      const newPage = pageNum - 1
      setPageNum(newPage)
      onPageChange(newPage, numPages)
    }
  }

  const handleNextPage = () => {
    if (pageNum < numPages) {
      const newPage = pageNum + 1
      setPageNum(newPage)
      onPageChange(newPage, numPages)
    }
  }

  const handleZoomIn = () => setScale(s => Math.min(s + 0.25, 3))
  const handleZoomOut = () => setScale(s => Math.max(s - 0.25, 0.5))

  // AGGIUNTA TESTO
  const handleTextAdd = async (textData) => {
    if (!pdfLibDoc || !pdfDoc) return

    try {
      const pageIndex = pageNum - 1
      const pages = pdfLibDoc.getPages()
      const page = pages[pageIndex]
      const { width, height } = page.getSize()

      // Recupera dimensioni viewport attuale per calcolare la scala
      const pdfPage = await pdfDoc.getPage(pageNum)
      const viewport = pdfPage.getViewport({ scale })

      // Calcola scala tra visualizzazione e PDF reale
      const scaleX = width / viewport.width
      const scaleY = height / viewport.height

      // Coordinate PDF (origine in basso a sinistra)
      const pdfX = textData.x * scaleX
      const pdfY = height - (textData.y * scaleY)

      // Dimensione font scalata
      const fontSize = textData.fontSize * scaleX

      // Embed font
      const font = await pdfLibDoc.embedFont(
        textData.fontFamily === 'bold' ? StandardFonts.HelveticaBold : StandardFonts.Helvetica
      )

      // Disegna il testo
      const adjustedY = Math.max(0, pdfY - fontSize);
      page.drawText(textData.text, {
        x: pdfX,
        y: adjustedY, // Aggiusta baseline
        size: fontSize,
        font: font,
        color: rgb(textData.color.r / 255, textData.color.g / 255, textData.color.b / 255),
      })

      // Salva e notifica modifica
      // Questo scatenerà l'aggiornamento in App.jsx -> useEffect([pdfBytes]) -> loadPDF -> re-render
      const modifiedBytes = await pdfLibDoc.save()
      
      // Aggiorna il riferimento per evitare loop o mancati aggiornamenti
      // IMPORTANT: Resettiamo il riferimento così l'effect lo vede come "nuovo" se necessario,
      // ma in realtà ci affidiamo al fatto che modifiedBytes sarà diverso.
      // Tuttavia, in App.jsx setPdfBytes aggiornerà lo stato e l'effect qui lo rileverà.
      
      onModification(modifiedBytes)

    } catch (error) {
      console.error('Errore aggiunta testo:', error)
      alert('Impossibile aggiungere il testo: ' + (error.message || error))
    }
  }

  // DISEGNO PENNA
  const handlePenDraw = async (drawingData) => {
    if (!pdfLibDoc || !pdfDoc) return

    try {
      const pageIndex = pageNum - 1
      const pages = pdfLibDoc.getPages()
      const page = pages[pageIndex]
      const { width, height } = page.getSize()

      const pdfPage = await pdfDoc.getPage(pageNum)
      const viewport = pdfPage.getViewport({ scale })
      
      const scaleX = width / viewport.width
      const scaleY = height / viewport.height

      drawingData.paths.forEach(path => {
        const points = path.points.map(p => ({
          x: p.x * scaleX,
          y: height - (p.y * scaleY)
        }))

        // Disegna segmenti
        for (let i = 0; i < points.length - 1; i++) {
          page.drawLine({
            start: points[i],
            end: points[i + 1],
            thickness: path.thickness * scaleX,
            color: rgb(0, 0, 0),
          })
        }
      })

      const modifiedBytes = await pdfLibDoc.save()
      onModification(modifiedBytes)

    } catch (error) {
      console.error('Errore disegno:', error)
      alert('Impossibile salvare il disegno')
    }
  }

  if (!pdfDoc) {
    return <div className="pdf-viewer-loading">Caricamento PDF...</div>
  }

  return (
    <div className="pdf-viewer-container" ref={containerRef}>
      <div className="pdf-controls">
        <button onClick={handlePrevPage} disabled={pageNum <= 1}>
          ← Precedente
        </button>
        <span className="page-info">
          Pagina {pageNum} di {numPages}
        </span>
        <button onClick={handleNextPage} disabled={pageNum >= numPages}>
          Successiva →
        </button>
        <div className="zoom-controls">
          <button onClick={handleZoomOut}>-</button>
          <span style={{margin: '0 0.5rem'}}>{Math.round(scale * 100)}%</span>
          <button onClick={handleZoomIn}>+</button>
        </div>
      </div>
      <div className="pdf-canvas-wrapper">
        <canvas ref={canvasRef} className="pdf-canvas" />
        <canvas ref={overlayCanvasRef} className="pdf-overlay" />
        {mode === 'text' && (
          <TextEditor
            canvasRef={canvasRef}
            onTextAdd={handleTextAdd}
          />
        )}
        {mode === 'pen' && (
          <PenTool
            canvasRef={canvasRef}
            onDraw={handlePenDraw}
          />
        )}
      </div>
    </div>
  )
})

PDFViewer.displayName = 'PDFViewer'

export default PDFViewer
