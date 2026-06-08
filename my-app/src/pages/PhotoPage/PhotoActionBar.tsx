import { useState } from 'react';
import heartClick from '../../images/heartClick.png';
import heartNotClick from '../../images/heartNotClick.png';
import messageImg from '../../images/message.png';
import sendImg from '../../images/send.png';
import bookmarkImg from '../../images/bookmark.png';
import styles from './PhotoPage.module.css';

export function PhotoActionBar() {
  const [liked, setLiked] = useState(false);
  return (
    <div className={styles.footer}>
      <div className={styles.actionGroup}>
        <button
          type="button"
          className={styles.actionButton}
          onClick={() => setLiked((v) => !v)}
          aria-label="like"
        >
          <img src={liked ? heartClick : heartNotClick} alt="" />
        </button>
        <button
          type="button"
          className={styles.actionButton}
          onClick={() => alert('未開放留言功能')}
          aria-label="message"
        >
          <img src={messageImg} alt="" />
        </button>
        <button
          type="button"
          className={styles.actionButton}
          onClick={() => alert('未開放分享功能')}
          aria-label="send"
        >
          <img src={sendImg} alt="" />
        </button>
      </div>
      <div className={styles.actionGroup}>
        <button
          type="button"
          className={styles.actionButton}
          onClick={() => alert('未開放收藏功能')}
          aria-label="bookmark"
        >
          <img src={bookmarkImg} alt="" />
        </button>
      </div>
    </div>
  );
}
