export async function copyToClipboard(
  value: string,
  onSuccess?: () => void,
  onError?: () => void
): Promise<void> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
    } else {
      // Fallback for older browsers / iOS
      const el = document.createElement('textarea');
      el.value = value;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    onSuccess?.();
  } catch {
    onError?.();
  }
}
