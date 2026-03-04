import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import TextEditor from "./TextEditor";
import PenTool from "./PenTool";
import "./PDFViewer.css";

if (typeof window !== "undefined" && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;
}

const PDFViewer = forwardRef(({ pdfBytes, onPageChange, mode, onModification }, ref) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pageNum, setPageNum] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.5);
  const [pdfLibDoc, setPdfLibDoc] = useState(null);
  const overlayCanvasRef = useRef(null);
  const isLoadingRef = useRef(false);
  const lastPdfBytesRef = useRef(null);

  useImperativeHandle(ref, () => ({
    getModifiedPDF: async () => {
      if (!pdfLibDoc) return null;
      return await pdfLibDoc.save();
    },
    loadPDFBytes: async (bytes) => {
      loadPDF(bytes);
    },
  }));

  useEffect(() => {
    if (pdfBytes && pdfBytes !== lastPdfBytesRef.current && !isLoadingRef.current) {
      lastPdfBytesRef.current = pdfBytes;
      loadPDF(pdfBytes);
    }
  }, [pdfBytes]);

  const loadPDF = async (bytes) => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;

    try {
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(bytes) });
      const pdf = await loadingTask.promise;
      setPdfDoc(pdf);
      setNumPages(pdf.numPages);

      const targetPage = pageNum > pdf.numPages ? 1 : pageNum;
      setPageNum(targetPage);
      onPageChange(targetPage, pdf.numPages);

      const pdfLib = await PDFDocument.load(bytes);
      setPdfLibDoc(pdfLib);
    } catch (error) {
      if (error.name !== "DataCloneError" && !error.message?.includes("worker")) {
        alert("Errore nel caricamento del PDF");
      }
    } finally {
      isLoadingRef.current = false;
    }
  };

  useEffect(() => {
    const render = async () => {
      if (!pdfDoc || !pageNum || !canvasRef.current) return;

      try {
        const page = await pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        context.clearRect(0, 0, canvas.width, canvas.height);

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;

        if (overlayCanvasRef.current) {
          overlayCanvasRef.current.width = viewport.width;
          overlayCanvasRef.current.height = viewport.height;
        }
      } catch (error) {
        alert("Errore nel rendering della pagina");
      }
    };

    render();
  }, [pdfDoc, pageNum, scale]);

  const handlePrevPage = () => {
    if (pageNum > 1) {
      const newPage = pageNum - 1;
      setPageNum(newPage);
      onPageChange(newPage, numPages);
    }
  };

  const handleNextPage = () => {
    if (pageNum < numPages) {
      const newPage = pageNum + 1;
      setPageNum(newPage);
      onPageChange(newPage, numPages);
    }
  };

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.25, 3));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.25, 0.5));

  const handleTextAdd = async (textData) => {
    if (!pdfLibDoc || !pdfDoc) return;

    try {
      const pageIndex = pageNum - 1;
      const pages = pdfLibDoc.getPages();
      const page = pages[pageIndex];
      const { width, height } = page.getSize();

      const pdfPage = await pdfDoc.getPage(pageNum);
      const viewport = pdfPage.getViewport({ scale });

      const scaleX = width / viewport.width;
      const scaleY = height / viewport.height;

      const pdfX = textData.x * scaleX;
      const pdfY = height - textData.y * scaleY;

      const fontSize = textData.fontSize * scaleX;

      const font = await pdfLibDoc.embedFont(textData.fontFamily === "bold" ? StandardFonts.HelveticaBold : StandardFonts.Helvetica);

      const adjustedY = Math.max(0, pdfY - fontSize);
      page.drawText(textData.text, {
        x: pdfX,
        y: adjustedY,
        size: fontSize,
        font: font,
        color: rgb(textData.color.r / 255, textData.color.g / 255, textData.color.b / 255),
      });

      const modifiedBytes = await pdfLibDoc.save();

      onModification(modifiedBytes);
    } catch (error) {
      alert("Impossibile aggiungere il testo: " + (error.message || error));
    }
  };

  const handlePenDraw = async (drawingData) => {
    if (!pdfLibDoc || !pdfDoc) return;

    try {
      const pageIndex = pageNum - 1;
      const pages = pdfLibDoc.getPages();
      const page = pages[pageIndex];
      const { width, height } = page.getSize();

      const pdfPage = await pdfDoc.getPage(pageNum);
      const viewport = pdfPage.getViewport({ scale });

      const scaleX = width / viewport.width;
      const scaleY = height / viewport.height;

      drawingData.paths.forEach((path) => {
        const points = path.points.map((p) => ({
          x: p.x * scaleX,
          y: height - p.y * scaleY,
        }));

        for (let i = 0; i < points.length - 1; i++) {
          page.drawLine({
            start: points[i],
            end: points[i + 1],
            thickness: path.thickness * scaleX,
            color: rgb((path.color?.r || 0) / 255, (path.color?.g || 0) / 255, (path.color?.b || 0) / 255),
            opacity: path.opacity || 1,
          });
        }
      });

      const modifiedBytes = await pdfLibDoc.save();
      onModification(modifiedBytes);
    } catch (error) {
      alert("Impossibile salvare il disegno");
    }
  };

  if (!pdfDoc) {
    return <div className="pdf-viewer-loading">Caricamento PDF...</div>;
  }

  return (
    <div className="pdf-viewer-container" ref={containerRef}>
      <div className="pdf-controls">
        <button onClick={handlePrevPage} disabled={pageNum <= 1}>
          ← Previous
        </button>

        <span className="page-info">
          Page {pageNum} of {numPages}
        </span>

        <button onClick={handleNextPage} disabled={pageNum >= numPages}>
          Next →
        </button>

        <div className="zoom-controls">
          <button onClick={handleZoomOut}>-</button>

          <span style={{ margin: "0 0.5rem" }}>{Math.round(scale * 100)}%</span>

          <button onClick={handleZoomIn}>+</button>
        </div>
      </div>

      <div className="pdf-canvas-wrapper">
        <canvas ref={canvasRef} className="pdf-canvas" />

        <canvas ref={overlayCanvasRef} className="pdf-overlay" />

        {mode === "text" && <TextEditor canvasRef={canvasRef} onTextAdd={handleTextAdd} />}

        {mode === "pen" && <PenTool canvasRef={canvasRef} onDraw={handlePenDraw} />}
      </div>
    </div>
  );
});

PDFViewer.displayName = "PDFViewer";

export default PDFViewer;
