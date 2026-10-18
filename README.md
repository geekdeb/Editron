# Editron ⚡

<p align="center">
  <img src="public/editron-logo.png" alt="Editron Logo" width="96" height="96" />
</p>

<p align="center">
  <strong>Lightning-fast text editor & developer swiss-army knife for modern workflows.</strong>
</p>

<p align="center">
  <a href="https://github.com/geekdeb/Editron/releases/latest"><img src="https://img.shields.io/github/v/release/geekdeb/Editron?style=flat-square&color=00d2ff" alt="Latest Release" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square" alt="License: MIT" /></a>
  <img src="https://img.shields.io/badge/Built%20with-Tauri%20v2%20%2B%20Rust-orange?style=flat-square" alt="Tauri v2 + Rust" />
  <img src="https://img.shields.io/badge/Frontend-React%2019%20%2B%20TypeScript-61dafb?style=flat-square" alt="React + TypeScript" />
  <img src="https://img.shields.io/badge/Platform-Windows%20(x64)-0078d4?style=flat-square" alt="Platform Windows" />
</p>

---

## 🌟 Overview

**Editron** is a lightweight, blazing-fast desktop text editor with a built-in suite of developer utility tools. Engineered with **Tauri v2** and **Rust** on the backend and **React 19**, **TypeScript**, and **CodeMirror 6** on the frontend, Editron starts in milliseconds with a tiny **~3.9 MB** installer footprint.

Whether you need a quick distraction-free scratchpad, a markdown previewer, or instant tools for formatting JSON, decoding JWT tokens, hashing strings, or testing regular expressions—Editron provides everything locally without sending your data to the cloud.

---

## 🚀 Download & Installation

Choose your preferred format from our official [GitHub Releases (v1.0.0)](https://github.com/geekdeb/Editron/releases/latest):

| Format | File | Size | Architecture | Description | Download |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Installer** | `Editron_1.0.0_x64-setup.exe` | ~4.1 MB | Windows x64 | Standard NSIS setup installer with Start Menu & Desktop shortcuts | [⬇️ **Download Installer**](https://github.com/geekdeb/Editron/releases/download/v1.0.0/Editron_1.0.0_x64-setup.exe) |
| **Portable** | `Editron_1.0.0_x64_portable.zip` | ~4.3 MB | Windows x64 | Standalone zero-install archive (extract and run immediately) | [⬇️ **Download Portable**](https://github.com/geekdeb/Editron/releases/download/v1.0.0/Editron_1.0.0_x64_portable.zip) |

> [!TIP]
> **Zero External Dependencies**: Editron is self-contained with its native Rust engine. It runs instantly on 64-bit Windows 10 and Windows 11.

---

## ✨ Features

- ⚡ **Micro-Footprint & Native Speed**: Sub-4MB installer size, near-instant startup, and ultra-low RAM usage powered by Rust.
- 💾 **Intelligent State Persistence**:
  - Automatically saves all open tabs, buffer contents, and active cursor positions.
  - Remembers your opened Explorer folder across application and system restarts.
  - Re-opens exactly where you left off, even if closed abruptly.
- 📁 **Native File Explorer**:
  - Browse workspace directories with file type icons and clean folder hierarchies.
  - Automatically switches to already open files without creating duplicate tabs.
  - Configurable default save directory (`Documents\Editron\datafiles`) with built-in folder browser.
- 🛠 **Developer Swiss-Army Knife**:
  - **JSON, XML & YAML Formatters**: Format, validate, and minify structured documents with customizable indentation.
  - **Base64 & URL Encoders/Decoders**: Effortless string conversions.
  - **JWT Token Inspector**: Decode JWT header and payload claims offline with expiration detection.
  - **Cryptographic Hashes**: Generate MD5, SHA-1, SHA-256, and SHA-512 hashes instantly.
  - **RegEx Tester**: Real-time regular expression tester with capture group breakdown.
  - **Timestamp Converter**: Convert UNIX epoch timestamps to human dates and ISO-8601 in both directions.
  - **Unicode Inspector**: Inspect character codes, byte lengths, and unicode categories.
- 📝 **Live Markdown Preview**: Split-screen live preview with GitHub-flavored markdown formatting and syntax-highlighted code blocks.
- 🎨 **Modern Themes**: Carefully tailored **Cyber Dark** and **Frost Light** themes.
- 🔒 **100% Private & Offline**: Zero telemetry, zero analytics, zero external network requests. Your code and data never leave your computer.

---

## ⌨️ Keyboard Shortcuts

| Action | Shortcut |
| :--- | :--- |
| **New File** | <kbd>Ctrl</kbd> + <kbd>N</kbd> |
| **Open File** | <kbd>Ctrl</kbd> + <kbd>O</kbd> |
| **Save File** | <kbd>Ctrl</kbd> + <kbd>S</kbd> |
| **Save As...** | <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>S</kbd> |
| **Close Tab** | <kbd>Ctrl</kbd> + <kbd>W</kbd> |
| **Find in File** | <kbd>Ctrl</kbd> + <kbd>F</kbd> |
| **Find & Replace** | <kbd>Ctrl</kbd> + <kbd>H</kbd> |
| **Command Palette** | <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>P</kbd> |
| **Toggle File Explorer** | <kbd>Ctrl</kbd> + <kbd>B</kbd> |
| **Toggle Developer Tools** | <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>T</kbd> |
| **Toggle Markdown Preview** | <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>V</kbd> |
| **Toggle Word Wrap** | <kbd>Alt</kbd> + <kbd>Z</kbd> |
| **Zen Mode** | <kbd>Ctrl</kbd> + <kbd>K</kbd> <kbd>Z</kbd> / <kbd>F11</kbd> |
| **Open Preferences** | <kbd>Ctrl</kbd> + <kbd>,</kbd> |
| **Help & Guide** | <kbd>F1</kbd> |

---

## 🛠️ Building from Source

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Rust & Cargo](https://rustup.rs/) (latest stable)
- Visual Studio C++ Build Tools (on Windows)

### Build Steps

```bash
# Clone the repository
git clone https://github.com/geekdeb/Editron.git
cd Editron

# Install dependencies
npm install

# Run in development mode
npm run tauri dev

# Build the release installer (.exe)
npm run tauri build
```

The resulting executable and setup installer will be placed in:
`src-tauri/target/release/bundle/nsis/`

---

## 🤝 Contributing

Contributions are warmly welcomed! Please see our [Contributing Guide](CONTRIBUTING.md) for details on code style, branch structure, and pull requests.

---

## 📄 License

Editron is open-source software licensed under the **[MIT License](LICENSE)**.
Created with ❤️ by [Debashis Paul (geekdeb)](https://github.com/geekdeb).
