export default async function getUrl(
  canvas: HTMLCanvasElement
): Promise<string> {
  try {
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/png');
    });

    let url = null;
    if (!blob) throw new Error('Gagal mengambil URL');
    url = URL.createObjectURL(blob);
    return url;
  } catch (error) {
    const err = error as unknown as Error;
    return err.message;
  }
}
