# 💾 Mio Editor PDF - Windows 98 Edition

Un'applicazione desktop minimale per modificare file PDF, realizzata con l'iconica estetica di Windows 98. L'applicazione non si appoggia a nessun server online, funziona interamente offline e non sovrascrive mai i tuoi file originali.

## 🌟 Funzionalità

- 📄 **Caricamento PDF**: Visualizza i tuoi PDF all'interno di una UI nostalgica.
- ✏️ **Aggiunta Testo**: Posiziona il testo cliccando dove preferisci. Modifica dimensione, spessore e colore. (Dispone di un sistema di pulizia anti-crash per i caratteri non supportati).
- ✍️ **Penna/Firma**: Strumento di disegno libero per firmare documenti. Scegli lo spessore del tratto.
- ↶ **Annulla**: Ritorna al passo precedente se sbagli.
- 💾 **Salvataggio**: Crea un nuovo file PDF (con dicitura "_modificato") mantenendo l'originale intatto.

## 🛠 Tecnologie Utilizzate

- **React + Vite**: Interfaccia reattiva e compilazione veloce.
- **Electron**: Impacchettamento per avere una vera app desktop `.exe`.
- **98.css**: Tema CSS per la grafica stile Windows 98.
- **pdf.js & pdf-lib**: Visualizzazione e modifica strutturale dei file PDF.

---

## 🚀 Come testare e compilare il programma

### Prerequisiti

Assicurati di avere [Node.js](https://nodejs.org/) installato sul tuo computer.

### 1. Installazione

Apri il terminale nella cartella del progetto ed esegui:

```bash
npm install
```

or

```bash
npm i
```

### 2. Modalità Sviluppo (Test in tempo reale)

Se vuoi testare l'app in una finestra desktop e vedere le modifiche al codice aggiornarsi istantaneamente, apri **due terminali separati**:

**Terminale 1:** Avvia il compilatore React

```bash
npm run dev
```

**Terminale 2:** Lancia la finestra del programma Electron

```bash
npm run electron:dev
```

### 3. Compilazione dell'eseguibile (.exe)

Quando sei soddisfatto del programma e vuoi creare l'applicazione vera e propria:

```bash
npm run electron:build
```

Una volta terminato il processo, verrà creata una cartella chiamata `**dist-electron**` nel tuo progetto.
Al suo interno troverai un file (es. `Mio Editor PDF Setup 1.0.0.exe`). Fai doppio click su di esso per installarlo o eseguirlo come una normale applicazione Windows!