import { useRef, type ChangeEvent } from 'react';
import copyImg from '../images/copy.png';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';
import styles from './TextArea.module.css';

type TextAreaProps = {
  name: string;
  value: unknown;
  disabled?: boolean;
  onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void;
};

export function TextArea({ name, value, disabled, onChange }: TextAreaProps) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const copy = useCopyToClipboard();
  const text = disabled
    ? JSON.stringify(value)
    : typeof value === 'string'
      ? value
      : String(value ?? '');

  return (
    <div className={styles.textArea}>
      <div className={styles.option}>
        <span className={styles.title}>{name}</span>
        <button type="button" className={styles.copyBtn} onClick={() => copy(text)}>
          <span>copy</span>
          <img src={copyImg} alt="複製" />
        </button>
      </div>
      <textarea
        className={styles.input}
        name={name}
        value={text}
        onChange={onChange}
        ref={ref}
        disabled={disabled}
      />
    </div>
  );
}
