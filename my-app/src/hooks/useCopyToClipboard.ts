import { useCallback } from 'react';

export function useCopyToClipboard() {
  return useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert(`已複製到剪貼板: ${text}`);
    } catch (err) {
      console.error('Clipboard copy failed:', err);
      alert('複製失敗，請手動選取複製');
    }
  }, []);
}
