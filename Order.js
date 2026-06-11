// ===== PURE ZONE — ORDER PAGE JAVASCRIPT =====

// ----- Service Registry -----
const SERVICES = {
  'cleaning':      { name: 'خدمات النظافة',              icon: 'fa-broom',             nameEn: 'Cleaning Services' },
  'landscaping':   { name: 'تنسيق المسطحات الخضراء',    icon: 'fa-seedling',           nameEn: 'Landscaping Services' },
  'pest-control':  { name: 'مكافحة الحشرات والآفات',    icon: 'fa-bug',                nameEn: 'Pest Control Services' },
  'catering':      { name: 'خدمات البوفيه والضيافة',     icon: 'fa-bell-concierge',    nameEn: 'Catering & Hospitality' },
  'sterilization': { name: 'خدمات التعقيم والتطهير',    icon: 'fa-spray-can-sparkles', nameEn: 'Sterilization Services' },
  'maintenance':   { name: 'خدمات الصيانة العامة',      icon: 'fa-screwdriver-wrench', nameEn: 'General Maintenance' },
};

const WHATSAPP_NUMBER = '201019484929';

// ▼ Google Apps Script deployed Web App URL — paste your /exec URL here
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwPuZidC3ejJvMiw8T99ryKySwC_FAQP2asyxFz1_D9G-cFCb69P7Q13-GRrNpdPIPVgg/exec';

// ----- DOM References -----
const orderForm        = document.getElementById('orderForm');
const summaryModal     = document.getElementById('summaryModal');
const modalClose       = document.getElementById('modalClose');
const summaryBlock     = document.getElementById('summaryBlock');
const copyBtn          = document.getElementById('copyBtn');
const whatsappBtn      = document.getElementById('whatsappBtn');
const toastEl          = document.getElementById('toastNotification');
const toastText        = document.getElementById('toastText');

// Service display elements
const heroBadgeText       = document.getElementById('heroBadgeText');
const heroBadgeIcon       = document.getElementById('heroBadgeIcon');
const serviceIcon         = document.getElementById('serviceIcon');
const serviceNameDisplay  = document.getElementById('serviceNameDisplay');
const serviceInput        = document.getElementById('serviceInput');

// ----- Service Selector DOM -----
const serviceSelectorGroup = document.getElementById('serviceSelectorGroup');
const serviceSelect        = document.getElementById('serviceSelect');

// ----- Resolve Service from URL Params or Show Selector -----
function initService() {
  const params  = new URLSearchParams(window.location.search);
  const key     = params.get('service') || '';
  const service = SERVICES[key];

  if (service) {
    // Update page title
    document.title = `احجز ${service.name} | بيور زون`;

    // Hero badge
    heroBadgeText.textContent = service.name;
    heroBadgeIcon.className   = `fas ${service.icon}`;

    // Sidebar
    serviceIcon.innerHTML        = `<i class="fas ${service.icon}"></i>`;
    serviceNameDisplay.textContent = service.name;

    // Hidden input
    serviceInput.value = service.name;

    // Hide selector, show hidden input
    if (serviceSelectorGroup) serviceSelectorGroup.style.display = 'none';
  } else {
    // No service selected — show service selector dropdown
    heroBadgeText.textContent      = 'اختر خدمتك';
    serviceNameDisplay.textContent = 'اختر خدمتك من القائمة';
    serviceInput.value             = '';

    if (serviceSelectorGroup) serviceSelectorGroup.style.display = 'block';
  }
}

// ----- Service Selector Change Handler -----
if (serviceSelect) {
  serviceSelect.addEventListener('change', function() {
    const key = this.value;
    if (key && SERVICES[key]) {
      const s = SERVICES[key];
      heroBadgeText.textContent = s.name;
      heroBadgeIcon.className   = `fas ${s.icon}`;
      serviceIcon.innerHTML        = `<i class="fas ${s.icon}"></i>`;
      serviceNameDisplay.textContent = s.name;
      serviceInput.value = s.name;
    } else {
      heroBadgeText.textContent = 'اختر خدمتك';
      serviceNameDisplay.textContent = 'اختر خدمتك من القائمة';
      serviceInput.value = '';
    }
  });
}

// ----- Validation Helpers -----
function setError(fieldId, errorId, message) {
  const field = document.getElementById(fieldId);
  const error = document.getElementById(errorId);
  if (!field || !error) return;
  field.classList.add('error');
  error.innerHTML = message ? `<i class="fas fa-exclamation-circle"></i> ${message}` : '';
}

function clearError(fieldId, errorId) {
  const field = document.getElementById(fieldId);
  const error = document.getElementById(errorId);
  if (!field || !error) return;
  field.classList.remove('error');
  error.innerHTML = '';
}

function isValidEgyptianPhone(phone) {
  // Accepts 01x-xxxxxxxx format (11 digits starting with 01)
  return /^01[0-9]{9}$/.test(phone.replace(/\s+/g, ''));
}

function validateForm() {
  let valid = true;

  // Service (if selector is visible)
  if (serviceSelectorGroup && serviceSelectorGroup.style.display !== 'none') {
    const svc = serviceSelect ? serviceSelect.value : '';
    if (!svc || !SERVICES[svc]) {
      setError('serviceSelect', 'serviceSelectError', 'يرجى اختيار الخدمة المطلوبة');
      valid = false;
    } else {
      clearError('serviceSelect', 'serviceSelectError');
    }
  }

  // Full Name
  const name = document.getElementById('fullName').value.trim();
  if (!name) {
    setError('fullName', 'fullNameError', 'الاسم الكامل مطلوب');
    valid = false;
  } else if (name.length < 3) {
    setError('fullName', 'fullNameError', 'الاسم يجب أن يكون 3 أحرف على الأقل');
    valid = false;
  } else {
    clearError('fullName', 'fullNameError');
  }

  // Address
  const address = document.getElementById('address').value.trim();
  if (!address) {
    setError('address', 'addressError', 'العنوان الكامل مطلوب');
    valid = false;
  } else if (address.length < 10) {
    setError('address', 'addressError', 'يرجى إدخال عنوان أكثر تفصيلاً');
    valid = false;
  } else {
    clearError('address', 'addressError');
  }

  // Primary Phone
  const primaryPhone = document.getElementById('primaryPhone').value.trim();
  if (!primaryPhone) {
    setError('primaryPhone', 'primaryPhoneError', 'رقم الهاتف الأساسي مطلوب');
    valid = false;
  } else if (!isValidEgyptianPhone(primaryPhone)) {
    setError('primaryPhone', 'primaryPhoneError', 'يرجى إدخال رقم هاتف مصري صحيح (01xxxxxxxxx)');
    valid = false;
  } else {
    clearError('primaryPhone', 'primaryPhoneError');
  }

  // Alt Phone (optional, but validate format if provided)
  const altPhone = document.getElementById('altPhone').value.trim();
  if (altPhone && !isValidEgyptianPhone(altPhone)) {
    setError('altPhone', 'altPhoneError', 'يرجى إدخال رقم هاتف صحيح أو ترك الحقل فارغاً');
    valid = false;
  } else {
    clearError('altPhone', 'altPhoneError');
  }

  // Preferred Time
  const preferredTime = document.getElementById('preferredTime').value;
  if (!preferredTime) {
    setError('preferredTime', 'preferredTimeError', 'الوقت والتاريخ المفضل مطلوب');
    valid = false;
  } else {
    const selected = new Date(preferredTime);
    const now      = new Date();
    if (selected <= now) {
      setError('preferredTime', 'preferredTimeError', 'يرجى اختيار وقت في المستقبل');
      valid = false;
    } else {
      clearError('preferredTime', 'preferredTimeError');
    }
  }

  // Space Area
  const area = parseFloat(document.getElementById('spaceArea').value);
  if (!document.getElementById('spaceArea').value) {
    setError('spaceArea', 'spaceAreaError', 'المساحة التقريبية مطلوبة');
    valid = false;
  } else if (isNaN(area) || area <= 0) {
    setError('spaceArea', 'spaceAreaError', 'يرجى إدخال مساحة صحيحة وأكبر من صفر');
    valid = false;
  } else {
    clearError('spaceArea', 'spaceAreaError');
  }

  return valid;
}

// ----- Format Date to Readable Arabic String -----
function formatDateTime(datetimeStr) {
  try {
    const date = new Date(datetimeStr);
    return date.toLocaleString('ar-EG', {
      weekday: 'long',
      year:    'numeric',
      month:   'long',
      day:     'numeric',
      hour:    '2-digit',
      minute:  '2-digit',
    });
  } catch {
    return datetimeStr;
  }
}

// ----- Generate WhatsApp Message (plain text) -----
function buildMessage(data) {
  const separator = '----------------------------------';
  const altPhone  = data.altPhone || 'N/A';

  return [
    `🚨 *NEW ORDER RECEIVED* 🚨`,
    separator,
    `🧹 *Service:* ${data.service}`,
    `👤 *Customer Name:* ${data.fullName}`,
    `📍 *Address:* ${data.address}`,
    `📞 *Primary Phone:* ${data.primaryPhone}`,
    `📱 *Alt Phone:* ${altPhone}`,
    `⏰ *Preferred Time:* ${data.preferredTime}`,
    `📐 *Space Area:* ${data.spaceArea} sq m`,
    separator,
    `Thank you for your order!`,
  ].join('\n');
}

// ----- Show Toast -----
function showToast(message, duration = 3000) {
  toastText.textContent = message;
  toastEl.classList.add('show');
  setTimeout(() => toastEl.classList.remove('show'), duration);
}

// ----- Open Modal -----
function openModal() {
  summaryModal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

// ----- Close Modal -----
function closeModal() {
  summaryModal.classList.remove('active');
  document.body.style.overflow = '';
}

// ============================================================
// ----- Form Submit (with background Google Sheets save) -----
// ============================================================
orderForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  // ── Collect form data (unchanged from original) ──
  const rawTime = document.getElementById('preferredTime').value;
  const data = {
    service:       serviceInput.value || 'غير محدد',
    fullName:      document.getElementById('fullName').value.trim(),
    address:       document.getElementById('address').value.trim(),
    primaryPhone:  document.getElementById('primaryPhone').value.trim(),
    altPhone:      document.getElementById('altPhone').value.trim() || '',
    preferredTime: formatDateTime(rawTime),
    spaceArea:     document.getElementById('spaceArea').value.trim(),
  };

  // ── Build message + populate modal (unchanged) ──
  const message = buildMessage(data);
  summaryBlock.textContent = message;

  const encoded = encodeURIComponent(message);
  whatsappBtn.href            = `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`;
  whatsappBtn.dataset.message  = message;

  // ════════════════════════════════════════════════════════════
  // ▶ BACKGROUND SAVE — fires silently, never blocks the UX
  //
  //   Sending as JSON with Content-Type:'text/plain' is the most
  //   reliable combination for mode:'no-cors' + Google Apps Script.
  //   • no-cors  → browser sends without CORS preflight (no block)
  //   • text/plain → a "simple" content type; body arrives in
  //                  e.postData.contents inside GAS doPost()
  // ════════════════════════════════════════════════════════════
  fetch(SCRIPT_URL, {
    method:  'POST',
    mode:    'no-cors',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body:    JSON.stringify({
      fullName:     data.fullName,
      primaryPhone: data.primaryPhone,
      altPhone:     data.altPhone,
      address:      data.address,
      service:      data.service,
      spaceArea:    data.spaceArea,
    }),
  }).catch(function(err) {
    console.warn('[PureZone] Background sheet save failed:', err.message);
  });
  // ════════════════════════════════════════════════════════════

  // ▶ Open modal IMMEDIATELY — do NOT wait for the fetch above
  openModal();
});

// ----- Copy to Clipboard -----
copyBtn.addEventListener('click', async () => {
  const text = summaryBlock.textContent;
  try {
    await navigator.clipboard.writeText(text);
    copyBtn.classList.add('copied');
    copyBtn.innerHTML = '<i class="fas fa-check"></i> تم النسخ!';
    showToast('✅ تم نسخ بيانات الطلب بنجاح!');

    setTimeout(() => {
      copyBtn.classList.remove('copied');
      copyBtn.innerHTML = '<i class="fas fa-copy"></i> نسخ النص';
    }, 3000);
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showToast('✅ تم نسخ بيانات الطلب بنجاح!');
  }
});

// ----- Close Modal Handlers -----
modalClose.addEventListener('click', closeModal);

summaryModal.addEventListener('click', (e) => {
  if (e.target === summaryModal) closeModal();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && summaryModal.classList.contains('active')) closeModal();
});

// ----- Real-time Validation (clear errors on input) -----
const fields = ['fullName', 'address', 'primaryPhone', 'altPhone', 'preferredTime', 'spaceArea', 'serviceSelect'];
fields.forEach(id => {
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener('input', () => clearError(id, `${id}Error`));
    el.addEventListener('change', () => clearError(id, `${id}Error`));
  }
});

// ----- Set min datetime to now -----
function setMinDateTime() {
  const dtInput = document.getElementById('preferredTime');
  if (!dtInput) return;
  const now = new Date();
  now.setMinutes(now.getMinutes() + 30); // At least 30 mins from now
  const pad = n => String(n).padStart(2, '0');
  dtInput.min = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

// ----- Init -----
initService();
setMinDateTime();