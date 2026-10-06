# 🤖 RAG Document Chatbot

> **Chat with your own PDFs using AI!**  
> An intelligent, document-powered chatbot that reads your documents and answers questions accurately with zero guessing, all through a sleek, modern ChatGPT-like web interface.

---

## 🌟 What is this Project? (Explained Simply)

Imagine taking an open-book exam:
- **A normal AI (like standard ChatGPT)** relies only on its general memory from the internet. If you ask about your own personal documents, resume, or company manuals, it might guess or make up answers ("hallucinate").
- **A RAG Chatbot (Retrieval-Augmented Generation)** is like giving the AI your exact documents during an open-book test. When you ask a question:
  1. 🔍 It searches your documents for relevant paragraphs.
  2. 📖 It reads those specific paragraphs.
  3. 💬 It formulates a smart, natural-language answer using **only your facts**.

### Key Highlights:
- ⚡ **Two AI Options**: Use **Google Gemini** (blazing fast, cloud-based, free tier available) or run **Mistral-7B** (100% offline & private on your own computer without an internet connection).
- 🎨 **Modern Web Interface**: Clean, ChatGPT-inspired user interface built with responsive web tech, plus a built-in Gradio backup interface.
- 📚 **Custom Document Support**: Simply drop any PDF into a folder and turn it into the chatbot's knowledge base.

---

## 🔍 Note on Git & Files After Cloning

When you clone this project, you will notice that a few things are **not** included:
- ❌ **No `.env` file**: To keep sensitive API keys private. (A template `.env.example` is provided instead).
- ❌ **No `Vectorstore/` folder**: Database files are generated locally from your documents.
- ❌ **No large model weights (`.gguf`)**: 4GB+ AI models are not stored in Git.

Don't worry! Following the steps below will automatically generate everything you need in under 5 minutes.

---

## 📋 Prerequisites

Before starting, make sure you have:
1. **Windows, macOS, or Linux PC**
2. **Git** installed on your system ([Download Git](https://git-scm.com/downloads))
3. **Python 3.11** installed (*Python 3.11 is strongly recommended for machine learning library compatibility*)
4. *(Optional)* A free **Google Gemini API Key** ([Get free key here](https://aistudio.google.com/))

---

## 🚀 Step-by-Step Setup Guide

Follow these simple steps in order. Open your terminal (e.g., **PowerShell** or **Command Prompt** on Windows, or **Terminal** on Mac/Linux).

---

### Step 1: Clone the Repository

Download the code to your computer:

```bash
git clone <YOUR-REPOSITORY-URL>
cd "Rag Chatbot"
```
*(Replace `<YOUR-REPOSITORY-URL>` with the GitHub URL of this repository).*

---

### Step 2: Install Python 3.11 (Windows)

If you don't already have Python 3.11 installed, you can install it easily on Windows using:

```powershell
winget install Python.Python.3.11
```
> 💡 *Mac/Linux users can use `brew install python@3.11` or download Python 3.11 from [python.org](https://www.python.org/downloads/).*

---

### Step 3: Create & Activate a Virtual Environment

A **virtual environment** is like a safe, isolated container for this project so its dependencies don't interfere with other programs on your computer.

#### On Windows (PowerShell):
```powershell
py -3.11 -m venv .venv
.venv\Scripts\Activate.ps1
```

> ⚠️ **Seeing an "execution of scripts is disabled" error in PowerShell?**  
> Run this single command first to allow scripts for your current session:  
> ```powershell
> Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
> ```  
> Then re-run `.venv\Scripts\Activate.ps1`.

#### On Mac / Linux:
```bash
python3.11 -m venv .venv
source .venv/bin/activate
```

*(You will see `(.venv)` appear at the beginning of your terminal line, meaning it is activated!)*

---

### Step 4: Install Required Packages

Upgrade the installer and install all the libraries the chatbot needs:

```powershell
python -m pip install --upgrade pip
pip install -r requirement.txt
pip install "numpy<2"
```

> 💡 **Why `numpy<2`?** Older deep-learning and vector libraries require NumPy 1.x. Installing `numpy<2` ensures perfect stability and avoids version conflicts.

---

### Step 5: Configure Your Environment (`.env`)

1. In the project folder, locate `.env.example`.
2. Make a copy of `.env.example` and rename the copy to `.env`.
   
   On Windows PowerShell:
   ```powershell
   Copy-Item .env.example .env
   ```
   On Mac / Linux:
   ```bash
   cp .env.example .env
   ```

3. Open `.env` in any text editor (Notepad, VS Code, etc.). It looks like this:

```env
model_path = "./model/mistral-7b-instruct-v0.1.Q2_K.gguf"
UVICORN_HOST = 127.0.0.1
UVICORN_PORT = 7860
SOURCE_DATA = "./source_data"
VECTOR_STORE = "./Vectorstore"
EMBED_MODEL = "BAAI/bge-base-en-v1.5"
GEMINI_API_KEY = "paste-your-gemini-api-here"
gemini_Model = "gemini-2.5-flash"
```

4. **Add your Gemini API Key**:
   - Go to [Google AI Studio](https://aistudio.google.com/) and click **Get API Key** (it takes 30 seconds and is completely free).
   - Paste your key in place of `paste-your-gemini-api-here`.
   - Save and close the file.

---

### Step 6: Add Your Documents (PDFs)

1. Open the `source_data` folder in your file explorer.
2. Put any PDF file(s) you want the chatbot to know about into `source_data/`.  
   *(e.g., your resume, study notes, company policy handbook, product catalog, etc.)*

---

### Step 7: Build the Knowledge Base (Vector Database)

Now, turn your PDF documents into an AI-searchable database:

```powershell
python rebuild_vectorstore.py
```

**What this does behind the scenes:**
- 📄 Reads every page of your PDFs in `source_data/`.
- ✂️ Chunks the text into bite-sized segments with context overlap.
- 🧠 Converts the text into mathematical representations (embeddings) using the `BAAI/bge-base-en-v1.5` model.
- 💾 Saves everything into a local database in `Vectorstore/`.
- 🧪 Runs a quick sanity test to verify everything is working!

---

### Step 8: Launch the Chatbot

Start the web server:

```powershell
python main.py
```

You will see output indicating the server is running:
```
INFO:     Uvicorn running on http://127.0.0.1:7860 (Press CTRL+C to quit)
```

---

### Step 9: Open and Chat!

Open your web browser (Chrome, Edge, Firefox, Brave, etc.) and visit:

- 💬 **Main Web App**: [http://127.0.0.1:7860](http://127.0.0.1:7860)  
  *(A sleek, modern ChatGPT-style conversational interface)*
- 🧪 **Alternative Gradio UI**: [http://127.0.0.1:7860/gradio](http://127.0.0.1:7860/gradio)  
- 📜 **Interactive API Docs**: [http://127.0.0.1:7860/docs](http://127.0.0.1:7860/docs)

Enjoy chatting with your documents! 🎉

---

## 🔄 How to Update or Add New PDFs Later

Whenever you want to add, remove, or edit PDFs:

1. **Stop the running chatbot**:
   - In the terminal running `python main.py`, press `Ctrl + C`.
   - *(Or on Windows PowerShell, force stop if needed)*:
     ```powershell
     Get-Process python | Stop-Process -Force
     ```
   > ⚠️ **CRITICAL (Windows Users)**: Always stop `main.py` before rebuilding! Windows locks the database files while the app is running. If you don't stop it first, the rebuild will fail or save 0 chunks.

2. **Add/Remove PDFs** in the `source_data/` folder.
3. **Rebuild the database**:
   ```powershell
   python rebuild_vectorstore.py
   ```
4. **Restart the app**:
   ```powershell
   python main.py
   ```

---

## 🧠 Choosing Your AI Model

This project gives you full flexibility between Cloud AI and Local Offline AI:

| Feature | ⚡ Google Gemini (Default) | 🔒 Mistral-7B Local |
| :--- | :--- | :--- |
| **Speed** | Super fast (< 1-2 seconds) | Depends on CPU speed (5-20 seconds) |
| **Internet Required** | Yes | **No (100% Offline)** |
| **RAM / Hardware Need** | Very low (any basic laptop) | Recommended 8GB+ RAM |
| **Privacy** | Processed via Google API | Never leaves your device |

### How to use Local Mistral (100% Offline):
1. Download the quantized Mistral model file:
   - [Download Mistral-7B-Instruct-v0.1-GGUF (Q2_K)](https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.1-GGUF/blob/main/mistral-7b-instruct-v0.1.Q2_K.gguf)
2. Place the downloaded `.gguf` file inside the `model/` folder.
3. Open `utils/inference.py` and change line 8 from:
   ```python
   _llm = LLM().get_llm_gemini()
   ```
   to:
   ```python
   _llm = LLM().get_llm()
   ```
4. Save the file and restart `main.py`!

---

## 📁 Project Structure

```
Rag Chatbot/
│
├── static/                   # Frontend assets
│   ├── index.html            # Main web UI
│   ├── style.css             # UI styling & animations
│   └── app.js                # Chat logic, streaming & theme handling
│
├── utils/                    # Core RAG logic
│   ├── build_rag.py          # Document loader & ChromaDB vectorstore interface
│   ├── llm.py                # LLM connectors (Gemini & local CTransformers)
│   └── inference.py          # RAG chain, persona prompt & conversation memory
│
├── source_data/              # 📂 Put your PDFs here!
├── model/                    # 📂 Put local .gguf models here (optional)
├── Vectorstore/              # 📂 Auto-generated Chroma vector database (ignored by git)
│
├── .env.example              # Environment variables template
├── .gitignore                # Protects models, DB, and keys from git
├── main.py                   # FastAPI + Gradio backend server
├── rebuild_vectorstore.py    # Script to index PDFs into Vectorstore
├── requirement.txt           # Python package requirements
└── steps.txt                 # Quick reference commands
```

---

## 🛠️ Frequently Asked Questions & Troubleshooting

<details>
<summary><b>1. "Execution of scripts is disabled on this system" (PowerShell error)</b></summary>

Windows restricts script execution by default for security. In your PowerShell window, run:
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```
Then run `.venv\Scripts\Activate.ps1` again.
</details>

<details>
<summary><b>2. Rebuild says "0 chunks saved" or gives "Permission Denied"</b></summary>

This happens when `main.py` is still running in another window. Windows locks the SQLite database files.
- Close the `main.py` terminal with `Ctrl + C`.
- Or terminate any lingering Python processes:
  ```powershell
  Get-Process python | Stop-Process -Force
  ```
- Run `python rebuild_vectorstore.py` again.
</details>

<details>
<summary><b>3. Port 7860 is already in use</b></summary>

Either an old instance of `main.py` is still running, or another program is using port 7860.
- Kill lingering python tasks: `Get-Process python | Stop-Process -Force`
- Or change the port in `.env` to `7861` (e.g., `UVICORN_PORT = 7861`).
</details>

<details>
<summary><b>4. How to customize the chatbot's persona or prompt?</b></summary>

Open `utils/inference.py` and modify `_template` (starting around line 11). You can change the AI's role, tone of voice, instructions, and rules to match your use case!
</details>

---

## 📄 License

This project is open-source and free to use for personal, educational, and commercial purposes. Feel free to fork, adapt, and build on top of it!
