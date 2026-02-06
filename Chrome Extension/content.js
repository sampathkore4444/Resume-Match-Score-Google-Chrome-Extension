function getJobDescription() {
  let text = "";

  // LinkedIn
  const linkedinJD = document.querySelector(".jobs-description-content__text");
  if (linkedinJD) text = linkedinJD.innerText;

  // Indeed
  const indeedJD = document.querySelector("#jobDescriptionText");
  if (indeedJD) text = indeedJD.innerText;

  return text;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "GET_JOB_DESCRIPTION") {
    sendResponse({ jobDescription: getJobDescription() });
  }
});
