chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action !== 'getMatchScore') return;

  // Make the listener async
  (async () => {
    const prompt = `
You are a strict JSON-only responder. Output **ONLY** valid JSON. No explanations, no markdown, no extra text, no backticks, nothing before or after the JSON object.

Required format exactly:
{
  "score": integer between 0 and 100,
  "explanation": "short explanation 3-6 sentences",
  "MATCH_CRITERIA": "   - Required skills match
                        - Years of experience relevance
                        - Tools & technologies
                        - Role responsibilities alignment
                        - Domain knowledge"
}

Respond with JSON only.
`.trim();

    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'qwen2.5:1.5b',          // ← change to 'llama3.2:3b' / 'phi3:mini' for better quality
          prompt: prompt,
          stream: false,
          format: 'json',
          options: {
            temperature: 0.2,
            top_p: 0.9,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama HTTP ${response.status} — ${response.statusText}`);
      }

      const data = await response.json();

      try {
        const json = JSON.parse(data.response.trim());

        console.log(json)

        sendResponse({
          score: json.score || 0,
          explanation: json.explanation || '(no explanation returned)',
          MATCH_CRITERIA: json.MATCH_CRITERIA,
          result: json
        });
      } catch (parseError) {
        sendResponse({ error: 'Invalid JSON from model: ' + parseError.message });
      }

    } catch (err) {
      sendResponse({ error: err.message });
    }
  })();

  return true;  // Keep this — tells Chrome we will respond asynchronously
});