// Replace this with your n8n Production or Test Webhook URL
const API_URL = "http://localhost:5678/webhook-test/claim-intake";

// DOM Elements
const fileInput = document.getElementById("claimImage");
const fileNameDisplay = document.getElementById("fileSelected");

const chatWidget = document.getElementById("chatWidget");
const chatInput = document.getElementById("chatInput");

const navLinks = document.querySelectorAll(".nav-link");
const tabContents = document.querySelectorAll(".tab-content");

// Navigation Tab Switching
navLinks.forEach((link, index) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const tabs = ["verify", "audit", "dashboard"];
    const targetTab = tabs[index];

    navLinks.forEach(l => l.classList.remove("active"));
    tabContents.forEach(t => t.classList.remove("active"));

    link.classList.add("active");
    document.getElementById(`tab-${targetTab}`).classList.add("active");
  });
});

// File Selection Label
fileInput.addEventListener("change", () => {
  if (fileInput.files.length > 0) {
    fileNameDisplay.textContent = `Selected File: ${fileInput.files[0].name}`;
  }
});

// Chat Visibility Toggle
function toggleChat() {
  if (chatWidget.style.display === "none" || chatWidget.style.display === "") {
    chatWidget.style.display = "flex";
    chatInput.focus();
  } else {
    chatWidget.style.display = "none";
  }
}

// Form Submission -> Sends Payload directly to n8n Webhook
document.getElementById("claimForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const submitBtn = document.getElementById("submitBtn");
  const emptyState = document.getElementById("emptyState");
  const resultsContent = document.getElementById("resultsContent");

  if (!fileInput.files || fileInput.files.length === 0) {
    alert("Please select a claim photo to upload.");
    return;
  }

  const selectedFile = fileInput.files[0];
  const previewUrl = URL.createObjectURL(selectedFile);

  const claimantName = document.getElementById("claimantName").value;
  const policyId = document.getElementById("policyNumber").value;
  const incidentNarrative = document.getElementById("incidentDescription").value;

  submitBtn.disabled = true;
  submitBtn.textContent = "Pipeline Active (Processing via n8n)...";

  emptyState.style.display = "block";
  resultsContent.style.display = "none";
  emptyState.innerHTML = `
    <div class="placeholder-icon">⚡</div>
    <h3>Routing Through n8n Pipeline</h3>
    <p>Analyzing metadata, running Gemini Vision evaluation, logging audit row, and routing notifications...</p>
  `;

  try {
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("claimant_name", claimantName);
    formData.append("policy_number", policyId);
    formData.append("description", incidentNarrative);
    formData.append("claim_id", `CLM-${Math.floor(100000 + Math.random() * 900000)}`);

    const response = await fetch(API_URL, {
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
    emptyState.style.display = "block";
    resultsContent.style.display = "none";
    emptyState.innerHTML = `
      <div style="color: #b91c1c; padding: 1rem; background: #fef2f2; border-radius: 8px; border: 1px solid #fecaca;">
        <strong>Pipeline Execution Error:</strong> ${error.message}
      </div>
    `;
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Run ClaimShield Analysis";
  }
});

function renderResults(data, imageUrl) {
  const emptyState = document.getElementById("emptyState");
  const resultsContent = document.getElementById("resultsContent");

  emptyState.style.display = "none";
  resultsContent.style.display = "block";

  // Handle various response wrappers returned from n8n
  let rawOutput = data;
  if (Array.isArray(data) && data.length > 0) {
    rawOutput = data[0];
  }
  if (rawOutput.json) {
    rawOutput = rawOutput.json;
  }

  // Parse embedded JSON if stringified by n8n AI Agent or Tool node
  let analysis = {};
  const outputField = rawOutput.output || rawOutput.text || rawOutput.message || rawOutput;
  
  if (typeof outputField === "string") {
    try {
      const cleanJson = outputField.replace(/```json/g, "").replace(/```/g, "").trim();
      analysis = JSON.parse(cleanJson);
    } catch (e) {
      analysis = { 
        investigation_summary: outputField,
        risk_score: 85,
        visual_match: false,
        has_exif_anomaly: true
      };
    }
  } else if (typeof outputField === "object" && outputField !== null) {
    analysis = outputField;
  } else {
    analysis = rawOutput;
  }

  const riskScore = analysis.risk_score ?? analysis["Risk Score"] ?? rawOutput["Risk Score"] ?? 85;
  const summary = analysis.investigation_summary || analysis["Investigation Summary"] || rawOutput["Investigation Summary"] || "Potential anomalies detected in image evidence.";
  const visualMatch = analysis.visual_match ?? analysis["Visual Match"] ?? false;
  const exifAnomaly = analysis.has_exif_anomaly ?? analysis["EXIF Anomaly"] ?? true;

  const riskBadge = document.getElementById("riskBadge");
  if (riskScore >= 50) {
    riskBadge.className = "risk-badge high-risk";
    riskBadge.textContent = "HIGH RISK (ROUTED TO SLACK)";
  } else {
    riskBadge.className = "risk-badge badge-low";
    riskBadge.textContent = "LOW RISK (AUTO-APPROVED VIA GMAIL)";
  }

  document.getElementById("resultImagePreview").src = imageUrl;
  document.getElementById("riskScoreVal").textContent = riskScore;
  document.getElementById("investigationSummaryText").textContent = summary;
  document.getElementById("visualMatchText").innerHTML = visualMatch ? '✅ Confirmed' : '❌ Mismatch Detected';
  document.getElementById("exifAnomalyText").innerHTML = exifAnomaly ? '⚠️ Flagged' : '✅ Clear';
}