import getUrl from './geturl';

export default async function readCertificatePdf(file: File) {
  try {
    // Dynamic import
    const [{ getDocument, GlobalWorkerOptions }, jsqr] = await Promise.all([
      import('pdfjs-dist'),
      import('jsqr'),
    ]);

    const pdfJsVersion = '5.4.296';
    GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfJsVersion}/build/pdf.worker.min.mjs`;

    // Koversi file ke arrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Muat dokument pdf
    const pdf = await getDocument({ data: arrayBuffer }).promise;

    // Pastikan halaman pertama
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 2 });

    // Render halaman ke dalam canvas untuk mendapatkan data gambar
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Tidak bisa mendapatkan 2D dari contect');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const render = {
      canvasContext: context,
      viewport: viewport,
      canvas,
    };

    // render halaman
    await page.render(render).promise;

    // Ambil data gambar dari canvas
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    // Baca kode Qr
    const qrCode = jsqr.default(
      imageData.data,
      imageData.width,
      imageData.height
    );

    const qrMessage = qrCode?.data as string;
    const previewUrl = await getUrl(canvas);

    canvas.remove();

    return { qrMessage, previewUrl };
  } catch (error) {
    const err = error as unknown as Error;
    throw err;
  }
}
