import { useRef } from "react";
import "./Toolbar.css";

function Toolbar({ onFileLoad, mode, onModeChange, onSave, onUndo, canUndo, pdfLoaded }) {
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      const arrayBuffer = await file.arrayBuffer();
      onFileLoad(file, new Uint8Array(arrayBuffer));
    } else {
      alert("Per favore, seleziona un file PDF valido");
    }
  };

  const handleLoadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  return (
    <div className="toolbar">
      <div className="toolbar-left">
        <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileSelect} style={{ display: "none" }} />
        <button onClick={handleLoadClick}>Upload PDF</button>
      </div>

      {pdfLoaded && (
        <div className="toolbar-center">
          <div className="field-row">
            <input type="checkbox" id="mode-text" checked={mode === "text"} onChange={() => onModeChange(mode === "text" ? null : "text")} />
            <label htmlFor="mode-text" style={{ marginRight: "1rem" }}>
              Add Text
            </label>

            <input type="checkbox" id="mode-pen" checked={mode === "pen"} onChange={() => onModeChange(mode === "pen" ? null : "pen")} />
            <label htmlFor="mode-pen">Pen/Signature</label>
          </div>
        </div>
      )}

      {pdfLoaded && (
        <div className="toolbar-right">
          <button onClick={onUndo} disabled={!canUndo} title="Undo last modification">
            ◄ Undo
          </button>

          <button onClick={onSave} disabled={!canUndo}>Save PDF</button>
        </div>
      )}
    </div>
  );
}

export default Toolbar;
