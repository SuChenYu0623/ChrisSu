import { useState } from 'react';
import styles from './CopyButton.module.css';

type Props = { text: string };

export function CopyButton({ text }: Props) {
  const [copied, setCopied] = useState(false);

  const handleClick = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Clipboard copy failed:', err);
    }
  };

  return (
    <button
      type="button"
      className={copied ? `${styles.button} ${styles.copied}` : styles.button}
      onClick={handleClick}
    >
      {copied ? '已複製 ✓' : '複製'}
    </button>
  );
}
