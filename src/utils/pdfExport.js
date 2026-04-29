import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { format } from 'date-fns';

const OKLCH_COLORS = {
  'oklch(70% 0.15 160)': '#22c55e',
  'oklch(70% 0.15 150)': '#16a34a',
  'oklch(70% 0.18 150)': '#15803d',
  'oklch(98% 0.02 200)': '#f9fafb',
  'oklch(95% 0.02 200)': '#f3f4f6',
  'oklch(90% 0.02 200)': '#e5e7eb',
  'oklch(20% 0.02 250)': '#0f172a',
  'oklch(20% 0.02 240)': '#0f1f14',
  'oklch(30% 0.02 240)': '#1a2e1f',
  'oklch(98% 0 0)': '#ffffff',
  'oklch(95% 0 0)': '#fafafa',
  'oklch(90% 0 0)': '#f4f4f5',
  'oklch(50% 0.15 160)': '#16a34a',
  'oklch(60% 0.18 150)': '#22c55e',
  'oklch(40% 0.07 250)': '#3b82f6',
  'oklch(55% 0.22 290)': '#8b5cf6',
  'oklch(65% 0.18 20)': '#ef4444',
  'oklch(50% 0.18 45)': '#f59e0b',
  'oklch(65% 0.15 320)': '#ec4899',
};

const COMMON_OKLCH_PATTERNS = [
  /oklch\(\s*[\d.]+%?\s+[\d.]+%?\s+[\d.]+\s*\)/gi,
  /oklch\(\s*[\d.]+%?\s+[\d.]+%?\s+[\d.]+\s*\/\s*[\d.]+%?\s*\)/gi,
  /oklch\(\s*[\d.]+%\s+[\d.]+\s+[\d.]+\s*\)/gi,
  /oklch\(\s*[\d.]+%\s+[\d.]+\s+[\d.]+\s*\/\s*[\d.]+\s*\)/gi,
];

function ensureChartDimensions() {
  const charts = document.querySelectorAll('.recharts-wrapper');
  charts.forEach(chart => {
    const parent = chart.parentElement;
    if (parent && (parent.clientWidth === 0 || parent.clientHeight === 0)) {
      parent.style.minWidth = '400px';
      parent.style.minHeight = '300px';
    }
  });
}

function convertOklchToHex(colorStr) {
  if (!colorStr || typeof colorStr !== 'string') return colorStr;
  
  const normalized = colorStr.toLowerCase().replace(/\s+/g, ' ').trim();
  
  for (const [oklch, hex] of Object.entries(OKLCH_COLORS)) {
    const regex = new RegExp(oklch.replace(/([()])/g, '\\$1').replace(/ /g, '\\s+'), 'gi');
    if (regex.test(normalized)) {
      return hex;
    }
  }
  
  const oklchRegex = /oklch\(\s*[\d.]+%\s+[\d.]+\s+[\d.]+\s*(?:\/\s*[\d.]+)?\s*\)/gi;
  if (oklchRegex.test(normalized)) {
    return '#16a34a';
  }
  return colorStr;
}

function replaceOklchInString(str, fallbackColor = '#16a34a') {
  if (!str || typeof str !== 'string') return str;
  let result = str;
  
  for (const [oklch, hex] of Object.entries(OKLCH_COLORS)) {
    const escaped = oklch.replace(/([()])/g, '\\$1');
    const regex = new RegExp(escaped, 'gi');
    result = result.replace(regex, hex);
  }
  
  for (const pattern of COMMON_OKLCH_PATTERNS) {
    result = result.replace(pattern, fallbackColor);
  }
  
  return result;
}

function sanitizeStyles(element) {
  const allElements = element.querySelectorAll('*');
  allElements.forEach(el => {
    const style = el.getAttribute('style');
    if (style) {
      let newStyle = replaceOklchInString(style);
      
      // Also replace CSS variable references that might contain oklch
      newStyle = newStyle.replace(/var\(--[\w-]+\)/gi, '#111827');
      newStyle = newStyle.replace(/rgba\(\s*var\(--[\w-]+\)/gi, 'rgba(255,255,255,0.9)');
      newStyle = newStyle.replace(/rgb\(\s*var\(--[\w-]+\)/gi, 'rgb(255,255,255)');
      
      if (newStyle !== style) {
        el.setAttribute('style', newStyle);
      }
    }
    
    const fillAttr = el.getAttribute('fill');
    if (fillAttr && fillAttr.includes('oklch')) {
      el.setAttribute('fill', '#16a34a');
    }
    
    const strokeAttr = el.getAttribute('stroke');
    if (strokeAttr && strokeAttr.includes('oklch')) {
      el.setAttribute('stroke', '#16a34a');
    }
    
    // Handle color CSS property
    const color = el.style?.color;
    if (color && color.includes('var(')) {
      el.style.color = '#111827';
    }
    
    // Handle background CSS property
    const bg = el.style?.background;
    if (bg && bg.includes('var(')) {
      el.style.background = '#ffffff';
    }
    
    // Handle backgroundColor
    const bgColor = el.style?.backgroundColor;
    if (bgColor && bgColor.includes('var(')) {
      el.style.backgroundColor = '#ffffff';
    }
  });
}

function injectOklchOverrideStyles(clonedDoc) {
  const style = clonedDoc.createElement('style');
  style.textContent = `
    :root {
      --color-primary: #16a34a !important;
      --color-primary-light: #22c55e !important;
      --color-primary-dark: #15803d !important;
      --color-glass: rgba(255, 255, 255, 0.1) !important;
      --color-bg-dark: #f9fafb !important;
      --color-bg-light: #f3f4f6 !important;
    }
    * {
      color: #111827 !important;
      background-color: #ffffff !important;
    }
    html, body {
      color: #111827 !important;
      background-color: #ffffff !important;
    }
    [style*="oklch"] {
      color: #111827 !important;
      background-color: #ffffff !important;
    }
    [style*="--color"] {
      color: #111827 !important;
    }
    .glass, .glass-card {
      background: rgba(255, 255, 255, 0.95) !important;
      border: 1px solid #e5e7eb !important;
      backdrop-filter: none !important;
    }
    .text-white, [class*="text-white"] {
      color: #111827 !important;
    }
    .text-gray-50, .text-gray-100, .text-gray-200, .text-gray-300, .text-gray-400, .text-gray-500, .text-gray-600, .text-gray-700, .text-gray-800, .text-gray-900 {
      color: #111827 !important;
    }
    .text-green-300, .text-green-400, .text-green-500, .text-green-600, .text-green-700 {
      color: #16a34a !important;
    }
    .text-green-800, .text-green-900 {
      color: #166534 !important;
    }
    .bg-green-50, .bg-green-100, .bg-green-200, .bg-green-300, .bg-green-400 {
      background-color: #dcfce7 !important;
    }
    .bg-green-500, .bg-green-600, .bg-green-700, .bg-green-800, .bg-green-900 {
      background-color: #16a34a !important;
    }
    .bg-gray-50, .bg-gray-100, .bg-gray-200, .bg-gray-300, .bg-gray-400, .bg-gray-500, .bg-gray-600, .bg-gray-700, .bg-gray-800, .bg-gray-900 {
      background-color: #f3f4f6 !important;
    }
    .bg-gradient-to-br {
      background: #f9fafb !important;
    }
    .bg-\\# {
      background-color: #ffffff !important;
    }
    .rounded-xl, .rounded-2xl, .rounded-3xl {
      border: 1px solid #e5e7eb !important;
    }
    .border {
      border-color: #e5e7eb !important;
    }
    .border-green-500, [class*="border-green-500"] {
      border-color: #16a34a !important;
    }
    button, [class*="button"] {
      background-color: #16a34a !important;
      color: #ffffff !important;
    }
    svg {
      background: transparent !important;
    }
    svg path[fill]:not([fill="none"]), svg circle[fill]:not([fill="none"]) {
      fill: #16a34a !important;
    }
    svg path[stroke]:not([stroke="none"]) {
      stroke: #16a34a !important;
    }
    .recharts-text {
      fill: #111827 !important;
    }
    .recharts-cartesian-axis-tick-value {
      fill: #111827 !important;
    }
    .recharts-cartesian-grid line {
      stroke: #e5e7eb !important;
    }
    .recharts-tooltip-wrapper {
      background: #ffffff !important;
      border: 1px solid #e5e7eb !important;
    }
  `;
  clonedDoc.head.appendChild(style);
}

export async function exportToPDF(elementId, options = {}) {
  const {
    fileName = `Waste-Management-Report-${format(new Date(), 'yyyy-MM-dd')}.pdf`,
    orientation = 'landscape',
    scale = 2,
    headerHTML = '',
  } = options;

  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`);
  }

  document.body.classList.add('pdf-generating');
  document.body.classList.add('pdf-mode');

  const originalBackground = element.style.background;
  element.style.background = '#ffffff';

  ensureChartDimensions();
  sanitizeStyles(element);

  // Critical: Override CSS custom properties at the document level before html2canvas parses
  const root = document.documentElement;
  const originalColorPrimary = root.style.getPropertyValue('--color-primary');
  const originalColorPrimaryLight = root.style.getPropertyValue('--color-primary-light');
  const originalColorPrimaryDark = root.style.getPropertyValue('--color-primary-dark');
  const originalColorBgDark = root.style.getPropertyValue('--color-bg-dark');
  const originalColorBgLight = root.style.getPropertyValue('--color-bg-light');
  const originalColorGlass = root.style.getPropertyValue('--color-glass');

  root.style.setProperty('--color-primary', '#16a34a', 'important');
  root.style.setProperty('--color-primary-light', '#22c55e', 'important');
  root.style.setProperty('--color-primary-dark', '#15803d', 'important');
  root.style.setProperty('--color-bg-dark', '#f9fafb', 'important');
  root.style.setProperty('--color-bg-light', '#f3f4f6', 'important');
  root.style.setProperty('--color-glass', 'rgba(255,255,255,0.9)', 'important');

  if (headerHTML) {
    element.insertAdjacentHTML('afterbegin', headerHTML);
  }

  try {
    await new Promise(resolve => setTimeout(resolve, 500));

    const canvas = await html2canvas(element, {
      scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: element.scrollWidth,
      height: element.scrollHeight,
      onclone: (clonedDoc, clonedElement) => {
        if (!clonedElement) return;

        clonedElement.style.background = '#ffffff';

        injectOklchOverrideStyles(clonedDoc);

        const style = clonedDoc.createElement('style');
        style.textContent = `
          body { 
            background: #ffffff !important; 
          }
          .pdf-mode .sidebar {
            display: none !important;
          }
          svg {
            background: transparent !important;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          [style*="oklch"] {
            background-color: #ffffff !important;
            color: #111827 !important;
          }
          .recharts-layer path[fill]:not([fill="none"]) {
            fill: var(--chart-fill, #16a34a) !important;
          }
          .recharts-layer path[stroke]:not([stroke="none"]) {
            stroke: var(--chart-stroke, #16a34a) !important;
          }
        `;
        clonedDoc.head.appendChild(style);

        const allCloned = clonedElement.querySelectorAll('*');
        allCloned.forEach(el => {
          const styleAttr = el.getAttribute('style');
          if (styleAttr) {
            const newStyle = replaceOklchInString(styleAttr);
            el.setAttribute('style', newStyle);
          }
          
          const fillAttr = el.getAttribute('fill');
          if (fillAttr && fillAttr.includes('oklch')) {
            el.setAttribute('fill', '#16a34a');
          }
          
          const strokeAttr = el.getAttribute('stroke');
          if (strokeAttr && strokeAttr.includes('oklch')) {
            el.setAttribute('stroke', '#16a34a');
          }
        });

        const clonedCharts = clonedElement.querySelectorAll('.recharts-responsive-container, .recharts-wrapper');
        clonedCharts.forEach(chart => {
          chart.style.minWidth = '400px';
          chart.style.minHeight = '250px';
        });
      }
    });

    const imgData = canvas.toDataURL('image/png', 1.0);
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    const pdfWidthPt = 842;
    const pdfHeightPt = 595;
    const margin = 20;
    const contentWidthPt = pdfWidthPt - (margin * 2);
    const contentHeightPt = pdfHeightPt - (margin * 2);
    
    const imgAspect = imgWidth / imgHeight;
    const contentAspect = contentWidthPt / contentHeightPt;
    
    let displayWidth, displayHeight;
    
    if (imgAspect > contentAspect) {
      displayWidth = contentWidthPt;
      displayHeight = contentWidthPt / imgAspect;
    } else {
      displayHeight = contentHeightPt;
      displayWidth = contentHeightPt * imgAspect;
    }
    
    const fullDisplayHeight = (imgHeight / imgWidth) * displayWidth;
    const pagesNeeded = Math.ceil(fullDisplayHeight / contentHeightPt);

    const pdf = new jsPDF({
      orientation,
      unit: 'pt',
      format: 'a4',
    });

    const scaleFactor = displayWidth / imgWidth;

    for (let page = 0; page < pagesNeeded; page++) {
      if (page > 0) {
        pdf.addPage();
      }

      const pageStartInImgPixels = page * (contentHeightPt / scaleFactor);
      const remainingPixels = imgHeight - pageStartInImgPixels;
      const sliceHeightPixels = Math.min(contentHeightPt / scaleFactor, remainingPixels);
      const sliceHeightPt = sliceHeightPixels * scaleFactor;

      const sliceCanvas = document.createElement('canvas');
      sliceCanvas.width = imgWidth;
      sliceCanvas.height = Math.ceil(sliceHeightPixels);
      const ctx = sliceCanvas.getContext('2d');
      
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
      
      ctx.drawImage(
        canvas,
        0, pageStartInImgPixels, imgWidth, sliceHeightPixels,
        0, 0, imgWidth, sliceHeightPixels
      );
      
      const pageImgData = sliceCanvas.toDataURL('image/png', 1.0);
      pdf.addImage(pageImgData, 'PNG', margin, margin, displayWidth, sliceHeightPt);
    }

    pdf.save(fileName);
    return true;
  } catch (error) {
    console.error('PDF export error:', error);
    throw error;
  } finally {
    if (headerHTML && element.firstChild && element.firstChild.classList?.contains('pdf-header')) {
      element.removeChild(element.firstChild);
    }
    element.style.background = originalBackground;
    document.body.classList.remove('pdf-generating');
    document.body.classList.remove('pdf-mode');
    
    // Restore original CSS custom properties
    const root = document.documentElement;
    if (originalColorPrimary) {
      root.style.setProperty('--color-primary', originalColorPrimary);
    }
    if (originalColorPrimaryLight) {
      root.style.setProperty('--color-primary-light', originalColorPrimaryLight);
    }
    if (originalColorPrimaryDark) {
      root.style.setProperty('--color-primary-dark', originalColorPrimaryDark);
    }
    if (originalColorBgDark) {
      root.style.setProperty('--color-bg-dark', originalColorBgDark);
    }
    if (originalColorBgLight) {
      root.style.setProperty('--color-bg-light', originalColorBgLight);
    }
    if (originalColorGlass) {
      root.style.setProperty('--color-glass', originalColorGlass);
    }
  }
}

export function generatePDFHeaderHTML(filters = {}) {
  const { dateFrom, dateTo, studentClass, wasteType } = filters;

  const formatDate = (date) => {
    if (!date) return 'All Time';
    return format(new Date(date), 'dd MMM yyyy');
  };

  return `
    <div class="pdf-header">
      <h1>Waste Management Report</h1>
      <p>Green Champs - School Waste Collection System</p>
      <p>Date Range: ${formatDate(dateFrom)} - ${formatDate(dateTo)}</p>
      <p>Class: ${studentClass === 'all' ? 'All Classes' : studentClass} | Waste Type: ${wasteType === 'all' ? 'All Types' : wasteType}</p>
    </div>
  `;
}