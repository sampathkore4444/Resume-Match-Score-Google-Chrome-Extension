Here is a clear, well-structured **README section** you can add to your Chrome extension's README.md file (or a separate SETUP.md / TROUBLESHOOTING.md).

This covers exactly the quick fix for the 403 error (Chrome extension origin block) and the prerequisite steps to run the Qwen2.5:1.5b model.

Feel free to copy-paste and adapt it (e.g., add your extension name or GitHub repo link).

```markdown
## Setup & Prerequisites

This extension communicates with a **local Ollama server** running on your machine (http://localhost:11434).  
No data is sent to the cloud — everything stays on your device.

### Step 1: Install Ollama

1. Download and install Ollama from the official website:  
   https://ollama.com/download

2. Open a terminal (Command Prompt / PowerShell on Windows, Terminal on macOS/Linux) and pull the model:

   ```bash
   ollama pull qwen2.5:1.5b
   ```

   → This downloads the ~1 GB quantized model. You only need to do this once.

### Step 2: Start Ollama with Chrome Extension Support

Chrome extensions send requests from a special origin (`chrome-extension://…`), which Ollama blocks by default → causing **HTTP 403 Forbidden** errors.

**Quick fix (for testing – easiest method)**

1. **Completely stop** any running Ollama:
   - Windows: Task Manager → end all `ollama.exe` processes
   - macOS/Linux: `pkill ollama` or quit the app

2. In a terminal, run this exact command:

   ```bash
   OLLAMA_ORIGINS=chrome-extension://* ollama serve
   ```

   - This starts the Ollama server **and allows all Chrome extensions** to connect.
   - Keep this terminal window open (Ollama runs in the foreground).

3. Reload your Chrome extension popup (or reopen it) and test again — the 403 error should disappear.

**Permanent setup (recommended – no need to run special command every time)**

Choose instructions for your operating system:

#### Windows (permanent environment variable)

1. Quit Ollama completely.
2. Press `Win + R` → type `sysdm.cpl` → Enter.
3. Go to **Advanced** tab → **Environment Variables**.
4. Under **User variables** → click **New**:
   - Variable name:  `OLLAMA_ORIGINS`
   - Variable value:  `chrome-extension://*`
5. Click OK → OK → OK.
6. Restart your computer (or log out/in) for the change to take effect.
7. Start Ollama normally:
   - Double-click the Ollama app, or run `ollama serve` in any terminal.

#### macOS (permanent via launchctl – survives reboots better with plist)

Temporary (until reboot):

```bash
launchctl setenv OLLAMA_ORIGINS "chrome-extension://*"
```

Then restart Ollama app.

For **permanent** setup (recommended):

Create a plist file:

```bash
mkdir -p ~/Library/LaunchAgents
cat << EOF > ~/Library/LaunchAgents/com.user.ollama-env.plist
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.user.ollama-env</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/launchctl</string>
    <string>setenv</string>
    <string>OLLAMA_ORIGINS</string>
    <string>chrome-extension://*</string>
  </array>
  <key>RunAtLoad</key>
  <true/>
</dict>
</plist>
EOF
```

Then:

```bash
launchctl load ~/Library/LaunchAgents/com.user.ollama-env.plist
```

Restart Ollama app or computer.

#### Linux (systemd service – most common)

If Ollama runs as a service:

```bash
sudo systemctl edit ollama
```

Add under `[Service]`:

```
Environment="OLLAMA_ORIGINS=chrome-extension://*"
```

Then reload & restart:

```bash
sudo systemctl daemon-reload
sudo systemctl restart ollama
```

### Step 3: Verify Everything Works

1. Ollama is running (check http://localhost:11434 in browser → should say "Ollama is running")
2. Model is available:

   ```bash
   ollama list
   ```

   → You should see `qwen2.5:1.5b`

3. Test a simple API call (optional but recommended):

   ```bash
   curl http://localhost:11434/api/generate -d '{
     "model": "qwen2.5:1.5b",
     "prompt": "Hello",
     "stream": false
   }'
   ```

   → Should return JSON with a response.

### Step 4: Use the Extension

- Load the extension in Chrome (`chrome://extensions/` → Load unpacked)
- Click the extension icon
- Upload resume (.txt or .pdf) + paste job description → Calculate Match Score

**Troubleshooting**

- Still 403? → Double-check `OLLAMA_ORIGINS` is set correctly and Ollama was restarted.
- Model not found? → Run `ollama pull qwen2.5:1.5b` again.
- Slow / no response? → Try a stronger model like `ollama pull llama3.2:3b` and update `background.js` model name.

Enjoy using local AI-powered resume matching! 🚀
```

You can place this under a heading like:

```markdown
# Resume Match Score Chrome Extension

[...other sections...]

## Setup & Prerequisites
[the content above]
```

Let me know if you want to add sections like "Features", "Screenshots", "Future Improvements", or make it shorter/longer!