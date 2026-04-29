Build a React PDF export utility using @react-pdf/renderer (NOT html2canvas or jsPDF) 
that supports multi-page documents with pixel-perfect layout.

Requirements:

1. LIBRARY: Use @react-pdf/renderer exclusively. Do NOT use html2canvas, 
   jsPDF, or window.print(). These cause blurry text and layout glitches.

2. MULTI-PAGE SUPPORT:
   - Use <Document> and <Page> components from @react-pdf/renderer
   - Set a fixed page size (e.g. size="A4")
   - Use wrap={true} on <View> containers so content flows to next page automatically
   - Never use fixed pixel heights that force content to overflow without wrapping

3. TEXT CLARITY:
   - Always define fonts explicitly using Font.register() with a Google Fonts URL
     or bundled font file (e.g. Inter, Roboto)
   - Set fontSize in points (pt), not px
   - Use fontWeight="bold" / "normal" only — no custom weight numbers unless 
     the font supports it
   - Avoid opacity or color values below 0.8 on text

4. LAYOUT RULES:
   - Use flexDirection, alignItems, justifyContent for all layout — no position absolute 
     unless for decorative elements
   - All padding/margin in numbers (points), never strings like "10px"
   - Tables: use nested <View> with flexDirection="row" for rows and fixed-width 
     columns using width as a percentage string e.g. width="33%"
   - Borders: use borderWidth, borderColor, borderStyle="solid" on individual sides 
     (borderBottomWidth etc.) for clean lines

5. EXPORT TRIGGER:
   - Add a <PDFDownloadLink> button that triggers download directly in browser
   - Filename should be dynamic e.g. `report-${Date.now()}.pdf`
   - Show "Generating..." state while PDF is being prepared using the loading prop

6. PAGE HEADER & FOOTER (repeat on every page):
   - Use fixed={true} on header and footer <View> components so they repeat 
     on every page
   - Add page numbers using the render prop: 
     render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}

7. IMAGES (if any):
   - Use <Image src={url} /> — only use CORS-accessible URLs or base64 data URIs
   - Always set explicit width and height on <Image>

8. NO GLITCH CHECKLIST:
   - No nested <Text> inside <View> without explicit style
   - No undefined or null values passed into style props
   - All colors as hex strings e.g. "#333333" not named colors
   - No percentage-based height — use minHeight or let content define height
   - Test with at least 3 pages worth of content to verify page breaks

Deliver:
- A usable React component with sample data (invoice or report layout)
- The PDFDocument component separated from the download button
- Clean, commented code