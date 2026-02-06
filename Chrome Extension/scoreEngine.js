// scoreEngine.js
export function calculateKeywordMatch(resume, job) {
  const resumeWords = new Set(resume.toLowerCase().split(/\W+/));
  const jobWords = new Set(job.toLowerCase().split(/\W+/));

  let matched = 0;
  let missing = [];

  jobWords.forEach(word => {
    if (resumeWords.has(word)) matched++;
    else if (word.length > 3) missing.push(word);
  });

  return {
    keywordScore: Math.round((matched / jobWords.size) * 100),
    missingKeywords: missing.slice(0, 15)
  };
}
