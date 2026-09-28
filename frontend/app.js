const API_ANALYSIS_URL = "http://127.0.0.1:8000/api/v1/analyze-claim";
const API_CHAT_URL = "http://127.0.0.1:8000/api/v1/chat"; // Backend AI endpoint or webhook

// DOM Elements
const fileInput = document.getElementById("imageFile");
const fileNameDisplay = document.getElementById("file-name-display");

const chatWidget = document.getElementById("chat-widget");
const chatClose = document.getElementById("chat-close");
const openChatBtn = document.getElementById("open-chat-btn");
const heroChatTrigger = document.getElementById("hero-chat-trigger");
const floatingChatTrigger = document.getElementById("floating-chat-trigger");

const chatInput = document.getElementById("chat-input");
const chatSendBtn = document.getElementById("chat-send-btn");
const chatMessages = document.getElementById("chat-messages");

const navLinks = document.querySelectorAll(".nav-link");
const tabContents = document.querySelectorAll(".tab-content");

// 1. Navigation Tab Switching
navLinks.forEach(link => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const targetTab = link.getAttribute("data-tab");

    navLinks.forEach(l => l.classList.remove("active"));
    tabContents.forEach(t => t.classList.remove("active"));

    link.classList.add("active");
    document.getElementById(`tab-${targetTab}`).classList.add("active");
  });
});

// 2. File Selection Display
fileInput.addEventListener("change", () => {
  if (fileInput.files.length > 0) {
    fileNameDisplay.textContent = `Selected File: ${fileInput.files[0].name}`;
  }
});

// 3. Chat Visibility Toggle
function toggleChat() {
  if (chatWidget.style.display === "none" || chatWidget.style.display === "") {
    chatWidget.style.display = "flex";
    chatInput.focus();
  } else {
    chatWidget.style.display = "none";
  }
}

openChatBtn.addEventListener("click", toggleChat);
heroChatTrigger.addEventListener("click", toggleChat);
floatingChatTrigger.addEventListener("click", toggleChat);
chatClose.addEventListener("click", () => {
  chatWidget.style.display = "none";
});

// 4. Send Chat Message to FastAPI Backend Bot
async function sendChatMessage() {
  const text = chatInput.value.trim();
  if (!text) return;

  // Add User Message Bubble
  const userBubble = document.createElement("div");
  userBubble.className = "chat-bubble user-bubble";
  userBubble.textContent = text;
  chatMessages.appendChild(userBubble);

  chatInput.value = "";
  chatMessages.scrollTop = chatMessages.scrollHeight;

  // Add Loading Bubble
  const loadingBubble = document.createElement("div");
  loadingBubble.className = "chat-bubble bot-bubble";
  loadingBubble.textContent = "Thinking...";
  chatMessages.appendChild(loadingBubble);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  try {
    const response = await fetch(API_CHAT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text })
    });

    if (response.ok) {
      const data = await response.json();
      loadingBubble.textContent = data.response || data.message || "Message received!";
    } else {
      // Fallback bot message if offline
      loadingBubble.textContent = "I'm ready to inspect your claim! Please upload damage evidence in the Claim Verification form.";
    }
  } catch (err) {
    // Graceful offline fallback message
    loadingBubble.textContent = "Hello! I am your AI assistant. Fill out the inspection form on the left or upload damage photos to begin verification!";
  }

  chatMessages.scrollTop = chatMessages.scrollHeight;
}

chatSendBtn.addEventListener("click", sendChatMessage);
chatInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendChatMessage();
});

// 5. Claim Analysis Form Submission
document.getElementById("claim-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const submitBtn = document.getElementById("submit-btn");
  const resultsContainer = document.getElementById("results-container");

  if (!fileInput.files || fileInput.files.length === 0) {
    alert("Please select an image file to analyze.");
    return;
  }

  const selectedFile = fileInput.files[0];
  const previewUrl = URL.createObjectURL(selectedFile);

  submitBtn.disabled = true;
  submitBtn.textContent = "Running Analysis...";

  resultsContainer.innerHTML = `
    <div class="empty-state">
      <div class="placeholder-icon">⚡</div>
      <h3>Analyzing Claim Evidence</h3>
      <p>Parsing metadata and processing image bytes through AI vision models...</p>
    </div>
  `;

  try {
    const formData = new FormData();
    formData.append("file", selectedFile);

    const response = await fetch(API_ANALYSIS_URL, {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.detail || `Server status: ${response.status}`);
    }

    const data = await response.json();
    renderResults(data, previewUrl);
  } catch (error) {
    resultsContainer.innerHTML = `
      <div style="color: #b91c1c; padding: 1rem; background: #fef2f2; border-radius: 8px; border: 1px solid #fecaca;">
        <strong>Audit Failed:</strong> ${error.message}
      </div>
    `;
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Run ClaimShield Analysis";
  }
});

function renderResults(data, imageUrl) {
  const container = document.getElementById("results-container");

  const resultData = data.data || {};
  const analysis = resultData.vision_analysis || {};
  const exif = resultData.exif_metadata || {};

  const riskScore = analysis.risk_score ?? 0;
  const summary = analysis.investigation_summary || "No investigation summary available.";
  const indicators = analysis.fraud_indicators || [];

  let badgeClass = "badge-low";
  let badgeText = "Low Risk";
  if (riskScore >= 70) {
    badgeClass = "badge-high";
    badgeText = "High Risk";
  } else if (riskScore >= 35) {
    badgeClass = "badge-medium";
    badgeText = "Medium Risk";
  }

  let evidenceHtml = "<li>No specific indicators flagged.</li>";
  if (Array.isArray(indicators) && indicators.length > 0) {
    evidenceHtml = indicators.map(item => `<li>${item}</li>`).join("");
  } else if (typeof indicators === "string" && indicators.trim() !== "") {
    evidenceHtml = `<li>${indicators}</li>`;
  }

  container.innerHTML = `
    <img src="${imageUrl}" class="preview-img" alt="Submitted Claim Image" />

    <div class="score-row">
      <span style="font-size: 0.9rem; color: #475569;">Fraud Risk Score: <strong style="color: #0f172a; font-size: 1.1rem;">${riskScore} / 100</strong></span>
      <span class="risk-badge ${badgeClass}">${badgeText}</span>
    </div>

    <div class="result-box">
      <h4>Summary</h4>
      <p>${summary}</p>
    </div>

    <div class="result-box">
      <h4>Fraud Indicators</h4>
      <ul>${evidenceHtml}</ul>
    </div>

    <div class="result-box">
      <h4>EXIF Metadata</h4>
      <p>Camera: <strong>${exif.camera_make || 'N/A'} ${exif.camera_model || ''}</strong></p>
      <p>Date Taken: <strong>${exif.date_taken || 'N/A'}</strong></p>
    </div>
  `;
}