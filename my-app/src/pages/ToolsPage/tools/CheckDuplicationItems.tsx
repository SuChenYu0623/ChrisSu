import { useState, type ChangeEvent } from 'react';
import { TextArea } from '../../../components/TextArea';
import styles from '../ToolsPage.module.css';

type State = {
  code: string;
  key: string;
  notRepeatArr: unknown[];
  repeatArr: unknown[];
};

const cleanCode = (code: string): string =>
  code
    .trim()
    .replace(/[\n]/gm, '')
    .replace(/(['"]|)([A-Za-z0-9]+)(['"]|):/gm, '"$2":');

export function CheckDuplicationItems() {
  const [state, setState] = useState<State>({
    code: '',
    key: '',
    notRepeatArr: [],
    repeatArr: [],
  });

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setState((prev) => ({ ...prev, [name]: value }));
  };

  const checkDuplication = () => {
    try {
      const arr = JSON.parse(cleanCode(state.code)) as unknown[];
      const isKeyEmpty = state.key === '';
      const filterFunc = (item: unknown, index: number) =>
        isKeyEmpty
          ? arr.indexOf(item) === index
          : arr
              .map((tmp) => (tmp as Record<string, unknown>)[state.key])
              .indexOf((item as Record<string, unknown>)[state.key]) === index;
      const notRepeatArr = arr.filter(filterFunc);
      const repeatArr = arr.filter((item, index) => !filterFunc(item, index));
      setState((prev) => ({ ...prev, notRepeatArr, repeatArr }));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className={styles.content}>
      <div className={styles.row}>
        <div className={styles.cell}>
          <TextArea name="code" value={state.code} onChange={handleChange} />
        </div>
        <div className={styles.cell}>
          <TextArea name="Repeat" value={state.repeatArr} disabled />
          <TextArea name="notRepeat" value={state.notRepeatArr} disabled />
        </div>
      </div>
      <div className={styles.actions}>
        <div>輸入需要檢查的 key 值（單純 array 則保持為空）</div>
        <input type="text" name="key" value={state.key} onChange={handleChange} />
        <button type="button" onClick={checkDuplication}>
          submit
        </button>
      </div>
    </div>
  );
}
