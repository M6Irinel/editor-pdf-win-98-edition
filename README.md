# 💾 My PDF Editor - Windows 98 Edition

A minimal desktop application for editing PDF files, featuring the iconic Windows 98 aesthetic. The application doesn't rely on any online servers, works entirely offline, and never overwrites your original files.

## 🌟 Features

- 📄 **PDF Loading**: View your PDFs within a nostalgic UI.
- ✏️ **Add Text**: Place text by clicking wherever you prefer. Edit size, weight, and color. (Includes a crash-prevention system for unsupported characters).
- ✍️ **Pen/Signature**: Freehand drawing tool for signing documents. Choose the stroke thickness.
- ↶ **Undo**: Go back to the previous step if you make a mistake.
- 💾 **Save**: Create a new PDF file (with "_modified" suffix) keeping the original intact.

## 🛠 Technologies Used

- **React + Vite**: Reactive interface and fast compilation.
- **Electron**: Packaging to create a real desktop `.exe` application.
- **98.css**: CSS theme for Windows 98-style graphics.
- **pdf.js & pdf-lib**: PDF file viewing and structural editing.

---

## 🚀 Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed on your computer.

### Installation

Open a terminal in the project folder and run:

```bash
npm install
```

This command will install all the required dependencies listed in `package.json`.

---

## 🧪 Development Mode

You have two options for development:

### Option 1: Browser Development

For quick testing in your web browser:

```bash
npm run dev
```

This starts the Vite development server, which compiles your React code and serves it on a local port (usually `http://localhost:5173`). Open the URL in your browser to see the app.

**What it does:**
- Compiles React components
- Enables hot module replacement (HMR) for instant updates
- Serves the frontend application in the browser

### Option 2: Electron Desktop Testing

To test the app as a desktop application and verify everything works:

```bash
npm run electron:dev
```

This single command does everything automatically:
1. Builds the React app using Vite (`vite build`)
2. Sets the environment to development mode
3. Launches the Electron desktop application window

**What it does:**
- Creates a build of your React app
- Opens the Electron window displaying your application
- Perfect for testing the desktop experience

**Note:** You only need one terminal for this command. Close it with `Ctrl+C` when you're done.

---

## 📦 Building the Executable (.exe)

When you're satisfied with the program and want to create the actual application:

```bash
npm run build
```

**What this command does:**
1. Builds the React application using Vite (`vite build`)
2. Packages everything into an Electron app using electron-builder (`electron-builder`)
3. Cleans up temporary build files (`rmdir /s /q dist`)

**Output:**
Once the process completes, a folder called `app-build` will be created in your project directory. Inside it, you'll find an installer file (e.g., `My Editor PDF Setup 1.0.0.exe`). Double-click it to install or run it like a normal Windows application!

**Note:** The build process may take a few minutes depending on your system. The final `.exe` file will be ready for distribution.

---

## 📋 Available Commands Summary

| Command | Description |
|---------|-------------|
| `npm install` | Install all project dependencies |
| `npm run dev` | Start the Vite development server for browser testing |
| `npm run electron:dev` | Build and launch Electron app in development mode (all-in-one command) |
| `npm run build` | Create the final executable (.exe) installer |

---

## 🎯 Quick Start Guide

1. **Clone or download** this repository
2. **Open terminal** in the project directory
3. **Install dependencies**: `npm install`
4. **For development**: 
   - Browser testing: `npm run dev` (opens in browser)
   - Desktop testing: `npm run electron:dev` (opens Electron window)
5. **For production**: `npm run build`

---

## 📝 Notes

- The application works completely offline - no internet connection required
- Original PDF files are never modified - all changes are saved to new files with "_modified" suffix
- The Windows 98 aesthetic is purely visual - the app runs on modern Windows systems
