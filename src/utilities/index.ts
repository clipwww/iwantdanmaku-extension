export function readAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = (e) => reject(e);
  });
}