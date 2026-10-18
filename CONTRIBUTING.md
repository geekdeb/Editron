# Contributing to Editron 🚀

Thank you for your interest in contributing to **Editron**! We welcome contributions from developers of all skill levels. Whether you are fixing bugs, improving documentation, designing new tools, or proposing new features, your help is appreciated.

---

## 🛠 Getting Started

### Prerequisites

Make sure you have the following installed on your machine:
- **Node.js**: v18.0.0 or later (LTS recommended)
- **Rust & Cargo**: Latest stable toolchain ([Install Rust via rustup](https://rustup.rs/))
- **Windows Build Tools** (for Windows): Visual Studio C++ build tools installed.

### Local Development Setup

1. **Fork & Clone the repository:**
   ```bash
   git clone https://github.com/geekdeb/Editron.git
   cd Editron
   ```

2. **Install frontend dependencies:**
   ```bash
   npm install
   ```

3. **Run the desktop application in development mode:**
   ```bash
   npm run tauri dev
   ```
   *This starts the Vite local dev server and launches the native Tauri desktop window with hot module reloading.*

4. **Run web-only frontend development (optional):**
   ```bash
   npm run dev
   ```

---

## 🏗 Architecture Overview

Editron uses a high-performance modern desktop architecture:
- **Core Engine / Backend**: [Rust](https://www.rust-lang.org/) + [Tauri v2](https://v2.tauri.app/) — Handles fast native filesystem I/O, dialogs, and OS window management with a tiny runtime footprint (~3.9MB).
- **Frontend Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vitejs.dev/).
- **Editor Engine**: [CodeMirror 6](https://codemirror.net/) — Syntax highlighting, multiple selections, bracket matching, and code folding.
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) with persistence middleware — Automatically saves open tabs, active document, and opened folder across restarts.
- **Styling**: Vanilla CSS custom properties with curated dark & light themes.

---

## 📋 Development Guidelines

### Creating a Feature or Bugfix Branch
Always create a descriptive branch for your work:
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-description
```

### Commit Messages
We follow standard semantic commit guidelines:
- `feat: add new timestamp converter format`
- `fix: prevent duplicate tabs when reopening existing files`
- `docs: update contribution guidelines`
- `style: refine menubar spacing`

### Testing Your Changes
Before submitting a pull request, ensure the codebase builds cleanly without any errors or warnings:
```bash
# Type check and build frontend
npm run build

# Check Rust backend
cd src-tauri && cargo check && cd ..

# Verify complete desktop production bundle
npm run tauri build
```

---

## 📦 Pull Request Process

1. Push your branch to your forked GitHub repository.
2. Open a Pull Request against the `main` branch of `geekdeb/Editron`.
3. Provide a clear description of the problem solved or feature added, including screenshots or GIFs if UI changes were made.
4. Maintainers will review your PR and provide feedback or merge it!

---

## 💬 Community & Questions

If you encounter a bug or have a feature idea:
- Open an issue on GitHub: [Issues Tracker](https://github.com/geekdeb/Editron/issues)
- Join discussions: [Discussions](https://github.com/geekdeb/Editron/discussions)

Thank you for helping make Editron the fastest and most elegant developer text editor!
