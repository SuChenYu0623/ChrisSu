import { useState, type ChangeEvent } from 'react';
import { TextArea } from '../../../components/TextArea';
import { ToolContainer } from '../ToolContainer';
import { tools } from '../../../data/tools';
import styles from '../ToolsPage.module.css';

type Row = [
  key: string,
  before: string | undefined,
  after: string | undefined,
  message: string | undefined,
];

type State = { code1: string; code2: string; outTable: Row[] };

const cleanCode = (code: string): [string, string][] =>
  code.split('; ').map((item) => {
    const idx = item.indexOf('=');
    return [item.slice(0, idx), item.slice(idx + 1)];
  });

const compareTwoArray = (
  arr1: [string, string][],
  arr2: [string, string][],
): Record<string, { value: string; message: string }> => {
  const result: Record<string, { value: string; message: string }> = {};
  const arr2Keys = arr2.map((item) => item[0]);
  for (const [key, value] of arr1) {
    if (!arr2Keys.includes(key)) {
      result[key] = { value, message: '[this cookie is not defined]' };
      continue;
    }
    const peer = arr2.find((item) => item[0] === key);
    if (peer && value !== peer[1]) {
      result[key] = { value, message: '[this cookie value is modified]' };
    }
  }
  return result;
};

const TOOL = tools.find((t) => t.slug === 'cookie-diff')!;

export function CheckCookieDiff() {
  const [state, setState] = useState<State>({ code1: '', code2: '', outTable: [] });

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setState((prev) => ({ ...prev, [name]: value }));
  };

  const checkCookieDiff = () => {
    try {
      const before = compareTwoArray(cleanCode(state.code1), cleanCode(state.code2));
      const after = compareTwoArray(cleanCode(state.code2), cleanCode(state.code1));
      const keys = Array.from(new Set([...Object.keys(before), ...Object.keys(after)]));
      const outTable: Row[] = keys.map((key) => [
        key,
        before[key]?.value,
        after[key]?.value,
        before[key]?.message ?? after[key]?.message,
      ]);
      setState((prev) => ({ ...prev, outTable }));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <ToolContainer title={TOOL.label} description={TOOL.description}>
      <div className={styles.content}>
        <div className={styles.row}>
          <div className={styles.cell}>
            <TextArea name="code1" value={state.code1} onChange={handleChange} />
          </div>
          <div className={styles.cell}>
            <TextArea name="code2" value={state.code2} onChange={handleChange} />
          </div>
        </div>
        <div className={styles.actions}>
          <button type="button" className={styles.btnPrimary} onClick={checkCookieDiff}>
            Parse
          </button>
        </div>
        {state.outTable.length > 0 && (
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.col2}>Cookie</th>
                <th className={styles.col6}>Before</th>
                <th className={styles.col6}>After</th>
                <th className={styles.col4}>Message</th>
              </tr>
            </thead>
            <tbody>
              {state.outTable.map(([key, before, after, message]) => (
                <tr key={key}>
                  <td className={styles.col2}>{key}</td>
                  <td className={styles.col6}>{before}</td>
                  <td className={styles.col6}>{after}</td>
                  <td className={styles.col4}>{message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </ToolContainer>
  );
}
