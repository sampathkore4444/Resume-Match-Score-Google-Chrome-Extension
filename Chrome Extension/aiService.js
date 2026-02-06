export async function getAIScore(resumeText, jobText) {
  const prompt = `
You are an ATS resume evaluator.

Compare the RESUME and JOB DESCRIPTION.
Return JSON ONLY with:
{
  "semanticScore": number (0-100),
  "strengths": string[],
  "gaps": string[],
  "recommendations": string[]
}

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobText}
`;

  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "deepseek-r1",
      prompt,
      stream: false
    })
  });

  const data = await response.json();
  return JSON.parse(data.response);
}
