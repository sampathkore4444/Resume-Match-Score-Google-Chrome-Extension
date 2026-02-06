const dropArea     = document.getElementById('drop-area');
const fileInput    = document.getElementById('resume-file');
const fileNameDiv  = document.getElementById('file-name');
const jobInput     = document.getElementById('job');
const analyzeBtn   = document.getElementById('analyze');
const resultDiv    = document.getElementById('result');

let resumeText = '';

// Click to open file dialog
dropArea.addEventListener('click', () => fileInput.click());

// Drag & drop support
dropArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropArea.style.borderColor = '#0066cc';
});
dropArea.addEventListener('dragleave', () => {
  dropArea.style.borderColor = '#aaa';
});
dropArea.addEventListener('drop', (e) => {
  e.preventDefault();
  dropArea.style.borderColor = '#aaa';
  const file = e.dataTransfer.files[0];
  if (file) handleFile(file);
});

// File selected via input or drop
fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) handleFile(file);
});

function handleFile(file) {
  fileNameDiv.textContent = `Selected: ${file.name}`;
  const reader = new FileReader();

  if (file.name.toLowerCase().endsWith('.txt')) {
    reader.onload = (e) => {
      resumeText = e.target.result;
      resultDiv.textContent = 'Resume loaded. Ready to analyze.';
    };
    reader.readAsText(file);
  } else if (file.name.toLowerCase().endsWith('.pdf')) {
    reader.onload = (e) => {
      const arrayBuffer = e.target.result;
      resumeText = extractTextFromPDF(arrayBuffer);
      if (resumeText.trim() === '') {
        resultDiv.innerHTML = '<span class="error">Could not extract text from PDF (maybe scanned/image-based? Try .txt instead).</span>';
      } else {
        resultDiv.textContent = 'PDF text extracted. Ready to analyze.';
      }
    };
    reader.readAsArrayBuffer(file);
  } else {
    resultDiv.innerHTML = '<span class="error">Only .txt and .pdf files supported.</span>';
  }
}

// Very basic PDF text extraction (works for simple text PDFs, not scanned/images)
function extractTextFromPDF(buffer) {
  const uint8 = new Uint8Array(buffer);
  let text = '';
  let inString = false;
  let str = '';

  for (let i = 0; i < uint8.length; i++) {
    const byte = uint8[i];
    if (byte === 0x28) { // '(' start of string
      inString = true;
      str = '';
    } else if (byte === 0x29 && inString) { // ')' end
      inString = false;
      text += str + ' ';
    } else if (inString) {
      if (byte === 0x5c) { // escape
        i++;
        const next = uint8[i];
        if (next === 0x6e) str += '\n';
        else if (next === 0x72) str += '\r';
        else if (next === 0x74) str += '\t';
        else str += String.fromCharCode(next);
      } else {
        str += String.fromCharCode(byte);
      }
    }
  }
  return text.replace(/\s+/g, ' ').trim();
}

analyzeBtn.addEventListener('click', async () => {
  const job = jobInput.value.trim();

  if (!resumeText) {
    resultDiv.innerHTML = '<span class="error">Please upload a resume file first.</span>';
    return;
  }
  if (!job) {
    resultDiv.innerHTML = '<span class="error">Please enter the job description.</span>';
    return;
  }

  resultDiv.textContent = 'Analyzing with local Ollama model...';
  analyzeBtn.disabled = true;

  try {
    const response = await chrome.runtime.sendMessage({
      action: 'getMatchScore',
      resume: resumeText,
      job
    });

    if (response.error) {
      resultDiv.innerHTML = `<span class="error">Error: ${response.error}</span>`;
    } else {
      resultDiv.innerHTML = `
        <div id="score">${response.score}/100</div>
        <br>
        <strong>Explanation:</strong><br>
        ${response.explanation.replace(/\n/g, '<br>')}
      `;
    }
  } catch (err) {
    resultDiv.innerHTML = `<span class="error">Connection failed: ${err.message}</span>`;
  } finally {
    analyzeBtn.disabled = false;
  }
});