import styles from './IntroductionPage.module.css';

type AvatarProps = {
  image: string;
  width?: string;
  alt: string;
};

export function Avatar({ image, width, alt }: AvatarProps) {
  const numericWidth = width ? Number(width.match(/([0-9]+)/)?.[1] ?? 0) : 0;
  const padding = width ? (400 - numericWidth) / 2 : 0;
  const style = width ? { width, height: width, padding: `${padding}px` } : undefined;
  return (
    <div className={styles.avatar} style={style}>
      <img src={image} alt={alt} />
    </div>
  );
}
