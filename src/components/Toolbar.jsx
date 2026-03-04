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
      // Resetta il valore dell'input per permettere di selezionare lo stesso file e scatenare l'onChange
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  return (
    <div className="toolbar">
      <div className="toolbar-left">
        <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileSelect} style={{ display: "none" }} />
        <button onClick={handleLoadClick}>Carica PDF</button>
      </div>

      {pdfLoaded && (
        <div className="toolbar-center">
          <div className="field-row">
            <input type="checkbox" id="mode-text" checked={mode === "text"} onChange={() => onModeChange(mode === "text" ? null : "text")} />
            <label htmlFor="mode-text" style={{ marginRight: "1rem" }}>
              Aggiungi Testo
            </label>

            <input type="checkbox" id="mode-pen" checked={mode === "pen"} onChange={() => onModeChange(mode === "pen" ? null : "pen")} />
            <label htmlFor="mode-pen">Penna/Firma</label>
          </div>
        </div>
      )}

      {pdfLoaded && (
        <div className="toolbar-right">
          <button onClick={onUndo} disabled={!canUndo} title="Annulla ultima modifica">
            Annulla
          </button>
          <button onClick={onSave}>Salva PDF</button>
        </div>
      )}
    </div>
  );
}

export default Toolbar;
