// SiliconSahaaya - Shared Application Utilities

// ==================== TOAST NOTIFICATIONS ====================
function showToast(icon, title, message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.classList.add('toast');
  const colors = { success: '#10b981', error: '#f43f5e', warning: '#f59e0b', info: '#6366f1' };
  toast.style.borderLeft = `3px solid ${colors[type] || colors.info}`;
  toast.innerHTML = `
    <div class="toast-icon">${icon}</div>
    <div class="toast-text">
      <div class="toast-title">${title}</div>
      <div class="toast-msg">${message}</div>
    </div>
    <button onclick="this.parentElement.remove()" style="background:none;border:none;cursor:pointer;color:var(--text-muted);font-size:1rem;padding:0 0 0 8px;">×</button>
  `;
  container.appendChild(toast);
  setTimeout(() => { if (toast.parentElement) toast.remove(); }, 4000);
}

// ==================== AI RESULT ROW HELPER ====================
function makeResultRow(label, value) {
  return `<div class="ai-result-row"><span class="ai-result-label">${label}</span><span class="ai-result-value">${value}</span></div>`;
}

// ==================== LOCAL STORAGE HELPERS ====================
function saveComplaint(complaint) {
  const list = JSON.parse(localStorage.getItem('complaints') || '[]');
  list.unshift(complaint);
  localStorage.setItem('complaints', JSON.stringify(list.slice(0, 50)));
}

function getComplaints() {
  return JSON.parse(localStorage.getItem('complaints') || '[]');
}

// ==================== LANGUAGE NAMES ====================
const LANG_NAMES = {
  en: 'English 🇬🇧',
  hi: 'Hindi 🇮🇳',
  kn: 'Kannada 🇮🇳',
  ta: 'Tamil 🇮🇳',
  te: 'Telugu 🇮🇳'
};

// ==================== DEPARTMENT MAPPING ====================
const DEPARTMENT_MAP = {
  roads: { name: 'Public Works Department', icon: '🛣️', desc: 'Roads, potholes, infrastructure', phone: '080-2299-5000', eta: '3-5 days' },
  garbage: { name: 'BBMP Sanitation', icon: '🗑️', desc: 'Garbage collection & waste', phone: '080-2222-1188', eta: '1-2 days' },
  water: { name: 'BWSSB Water Authority', icon: '💧', desc: 'Water supply & drainage', phone: '1916', eta: '24-48hrs' },
  streetlight: { name: 'BESCOM Electrical Dept', icon: '💡', desc: 'Street lighting & power', phone: '1912', eta: '5-7 days' },
  sewage: { name: 'BWSSB Sewage Division', icon: '🚿', desc: 'Sewage & drainage', phone: '1916', eta: '3-5 days' },
  parks: { name: 'Parks & Recreation', icon: '🌿', desc: 'Public parks & green spaces', phone: '080-2299-4444', eta: '7 days' },
  noise: { name: 'KSPCB (Pollution Board)', icon: '📢', desc: 'Noise & pollution issues', phone: '080-2299-3333', eta: '5-7 days' },
  other: { name: 'General Administration', icon: '🏛️', desc: 'Misc civic issues', phone: '080-2222-0000', eta: '5-10 days' }
};

// ==================== KEYWORD-TO-CATEGORY DETECTION ====================
function detectCategory(text) {
  const t = text.toLowerCase();
  if (/pothole|road|tar|asphalt|crack|गड्ढा|ಗುಂಡಿ|குழி|గుంత/.test(t)) return 'roads';
  if (/garbage|trash|waste|smell|dump|कचरा|ಕಸ|குப்பை|చెత్త/.test(t)) return 'garbage';
  if (/water|leak|pipe|flood|drain|पानी|ನೀರು|நீர்|నీరు/.test(t)) return 'water';
  if (/light|dark|lamp|bulb|streetlight|बत्ती|ದೀಪ/.test(t)) return 'streetlight';
  if (/sewer|sewage|overflow|smell|नाली/.test(t)) return 'sewage';
  if (/park|garden|tree|bench|grass/.test(t)) return 'parks';
  if (/noise|sound|loud|music/.test(t)) return 'noise';
  return 'other';
}

// ==================== PRIORITY SCORING ====================
function calculatePriority(text, category, urgencyKeywords) {
  let score = 40;
  const t = text.toLowerCase();
  if (category === 'water') score += 30;
  else if (category === 'garbage') score += 20;
  else if (category === 'roads') score += 15;
  if (/urgent|emergency|dangerous|critical|severe|खतरनाक|ಅಪಾಯ/.test(t)) score += 20;
  if (/school|hospital|market|traffic|accident/.test(t)) score += 15;
  if (/week|month|days|long time|since/.test(t)) score += 10;
  return Math.min(score, 98);
}

// ==================== DUPLICATE DETECTION (SIMULATED) ====================
function checkDuplicateByCategory(cat) {
  const existingByCategory = {
    roads: [{ id: 'GR-2024-1132', similarity: 94 }, { id: 'GR-2024-1089', similarity: 87 }],
    garbage: [{ id: 'GR-2024-1201', similarity: 91 }],
    water: [{ id: 'GR-2024-1098', similarity: 89 }]
  };
  return existingByCategory[cat] || [];
}

// ==================== FORMAT DATE ====================
function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}

// ==================== GENERATE COMPLAINT ID ====================
function generateComplaintId() {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `GR-2024-${num}`;
}

// ==================== PAGE INIT ====================
document.addEventListener('DOMContentLoaded', () => {
  // Animate page-in
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.3s ease';
  requestAnimationFrame(() => {
    document.body.style.opacity = '1';
  });

  // Active nav link
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href && href === path) a.classList.add('active');
    else if (href && href !== path) a.classList.remove('active');
  });
});
