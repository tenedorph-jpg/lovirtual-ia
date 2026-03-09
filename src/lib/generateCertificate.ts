import { jsPDF } from 'jspdf';

const COURSE_NAME = 'Inteligencia Artificial y Herramientas Digitales: De Usuario a Creador';

function drawCornerDiamond(pdf: any, x: number, y: number, size: number) {
  pdf.setFillColor(184, 152, 61);
  pdf.lines([[size, -size], [size, size], [-size, size], [-size, -size]], x, y, [1, 1], 'F', true);
}

const imgToDataUrl = (src: string): Promise<string> =>
  new Promise(resolve => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = img.width;
      c.height = img.height;
      c.getContext('2d')!.drawImage(img, 0, 0);
      resolve(c.toDataURL('image/png'));
    };
    img.onerror = () => resolve('');
    img.src = src;
  });

export async function generateCertificatePDF(studentName: string, score: number): Promise<void> {
  const [firmaDataUrl, selloDataUrl] = await Promise.all([
    imgToDataUrl('/firma.png'),
    imgToDataUrl('/sello.jpeg'),
  ]);

  const currentDate = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  const certId = `CERT-${Date.now()}-${Math.floor(Math.random() * 100)}`;

  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const w = pdf.internal.pageSize.getWidth();
  const h = pdf.internal.pageSize.getHeight();

  // ── Background ─────────────────────────────────────────────────────────────
  pdf.setFillColor(255, 255, 255);
  pdf.rect(0, 0, w, h, 'F');

  pdf.setFontSize(36);
  (pdf as any).setFont('helvetica', 'bold');
  pdf.setTextColor(242, 242, 246);
  for (let xi = 0; xi < w; xi += 82) {
    for (let yi = 0; yi < h + 30; yi += 52) {
      pdf.text('LOVIRTUAL', xi, yi, { angle: 35 });
    }
  }

  // ── Borders ────────────────────────────────────────────────────────────────
  pdf.setDrawColor(1, 80, 125);
  (pdf as any).setLineWidth(2.5);
  pdf.rect(6, 6, w - 12, h - 12, 'S');

  pdf.setDrawColor(184, 152, 61);
  (pdf as any).setLineWidth(0.7);
  pdf.rect(10, 10, w - 20, h - 20, 'S');

  pdf.setDrawColor(1, 80, 125);
  (pdf as any).setLineWidth(0.3);
  pdf.rect(13, 13, w - 26, h - 26, 'S');

  [[8, 8], [w - 8, 8], [8, h - 8], [w - 8, h - 8]].forEach(([cx, cy]) => drawCornerDiamond(pdf, cx, cy, 1.8));
  drawCornerDiamond(pdf, w / 2, 8, 1.2);
  drawCornerDiamond(pdf, 8, h / 2, 1.2);
  drawCornerDiamond(pdf, w - 8, h / 2, 1.2);
  drawCornerDiamond(pdf, w / 2, h - 8, 1.2);

  // ── Header ─────────────────────────────────────────────────────────────────
  pdf.setDrawColor(184, 152, 61);
  (pdf as any).setLineWidth(0.5);
  pdf.line(20, 28, 105, 28);
  pdf.line(192, 28, 277, 28);

  (pdf as any).setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(201, 162, 39);
  pdf.text('A C A D E M I A   L O V I R T U A L', w / 2, 27.5, { align: 'center', baseline: 'bottom' });

  // ── Main title ─────────────────────────────────────────────────────────────
  (pdf as any).setFont('times', 'bold');
  pdf.setFontSize(46);
  pdf.setTextColor(1, 80, 125);
  pdf.text('CERTIFICADO', w / 2, 48, { align: 'center' });

  (pdf as any).setFont('helvetica', 'normal');
  pdf.setFontSize(13);
  pdf.setTextColor(100, 100, 100);
  pdf.text('D E   F I N A L I Z A C I Ó N', w / 2, 57, { align: 'center' });

  pdf.setDrawColor(184, 152, 61);
  (pdf as any).setLineWidth(0.6);
  pdf.line(30, 63, w / 2 - 5, 63);
  pdf.line(w / 2 + 5, 63, w - 30, 63);
  drawCornerDiamond(pdf, w / 2, 63, 1.6);

  // ── Student info ───────────────────────────────────────────────────────────
  (pdf as any).setFont('times', 'italic');
  pdf.setFontSize(10);
  pdf.setTextColor(140, 140, 140);
  pdf.text('Se certifica que', w / 2, 72, { align: 'center' });

  (pdf as any).setFont('times', 'bolditalic');
  pdf.setFontSize(32);
  pdf.setTextColor(1, 110, 157);
  pdf.text(studentName, w / 2, 85, { align: 'center' });

  const nw = (pdf as any).getTextWidth(studentName);
  const nx1 = w / 2 - nw / 2 - 8, nx2 = w / 2 + nw / 2 + 8;
  pdf.setDrawColor(184, 152, 61);
  (pdf as any).setLineWidth(0.8);
  pdf.line(nx1, 89, nx2, 89);
  (pdf as any).setLineWidth(0.3);
  pdf.line(nx1 + 5, 91, nx2 - 5, 91);

  // ── Description ────────────────────────────────────────────────────────────
  (pdf as any).setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100);
  pdf.text(
    'Ha completado satisfactoriamente todos los módulos, actividades prácticas y evaluaciones del programa de formación:',
    w / 2, 100, { align: 'center', maxWidth: 220 }
  );

  pdf.setFillColor(235, 243, 250);
  pdf.setDrawColor(1, 80, 125);
  (pdf as any).setLineWidth(0.3);
  (pdf as any).roundedRect((w - 210) / 2, 108, 210, 11, 3, 3, 'FD');
  (pdf as any).setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(1, 80, 125);
  pdf.text(COURSE_NAME, w / 2, 115.5, { align: 'center' });

  (pdf as any).setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(130, 130, 130);
  pdf.text('Calificación obtenida: ', w / 2 - 8, 127, { align: 'right' });
  (pdf as any).setFont('helvetica', 'bold');
  pdf.setTextColor(201, 162, 39);
  pdf.text(`${score}%`, w / 2 - 7, 127, { align: 'left' });

  pdf.setDrawColor(200, 200, 200);
  (pdf as any).setLineWidth(0.3);
  pdf.line(20, 132, w - 20, 132);

  // ── Footer ─────────────────────────────────────────────────────────────────
  const fY = 162;

  pdf.setDrawColor(1, 80, 125);
  (pdf as any).setLineWidth(0.5);
  pdf.line(22, fY, 98, fY);
  (pdf as any).setFont('helvetica', 'bold');
  pdf.setFontSize(7);
  pdf.setTextColor(130, 130, 130);
  pdf.text('FECHA DE EMISIÓN', 60, fY + 5, { align: 'center' });
  (pdf as any).setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(60, 60, 60);
  pdf.text(currentDate, 60, fY + 11, { align: 'center' });

  const sX = w / 2, sY = fY - 12;
  const selloSize = 46;
  if (selloDataUrl) {
    (pdf as any).addImage(selloDataUrl, 'PNG', sX - selloSize / 2, sY - selloSize / 2, selloSize, selloSize);
  }

  const sigX = w - 60;
  const firmaW = 58, firmaH = 26;
  if (firmaDataUrl) {
    (pdf as any).addImage(firmaDataUrl, 'PNG', sigX - firmaW / 2, fY - firmaH - 2, firmaW, firmaH);
  }

  pdf.setDrawColor(1, 80, 125);
  (pdf as any).setLineWidth(0.5);
  pdf.line(w - 98, fY, w - 22, fY);
  (pdf as any).setFont('helvetica', 'bold');
  pdf.setFontSize(7);
  pdf.setTextColor(130, 130, 130);
  pdf.text('DIRECCIÓN ACADÉMICA', sigX, fY + 5, { align: 'center' });
  (pdf as any).setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(60, 60, 60);
  pdf.text('Academia LoVirtual', sigX, fY + 11, { align: 'center' });

  pdf.setFontSize(5.5);
  pdf.setTextColor(180, 180, 180);
  pdf.text(`ID: ${certId}  |  Autenticado por Academia LoVirtual LLC`, w - 16, h - 9, { align: 'right' });

  pdf.save(`Certificado_${studentName.replace(/\s+/g, '_')}_LoVirtual.pdf`);
}
