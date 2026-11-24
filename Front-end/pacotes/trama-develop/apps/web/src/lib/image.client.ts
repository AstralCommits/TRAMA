export async function compressImageFile(file: File, maxSize = 440): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Selecione um arquivo de imagem.');
  if (file.size > 8 * 1024 * 1024) throw new Error('A imagem deve ter até 8 MB antes da compressão.');
  const bitmap = await createImageBitmap(file);
  const ratio = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * ratio));
  canvas.height = Math.max(1, Math.round(bitmap.height * ratio));
  const context = canvas.getContext('2d');
  if (!context) { bitmap.close(); throw new Error('Não foi possível processar esta imagem.'); }
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const dataUrl = canvas.toDataURL('image/jpeg', 0.78);
  if (dataUrl.length > 900_000) throw new Error('A imagem ficou muito grande. Escolha uma foto menor.');
  return dataUrl;
}
