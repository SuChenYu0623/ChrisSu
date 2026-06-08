import styles from './IntroductionPage.module.css';

type AvatarProps = {
  image: string;
  width?: string;
  alt: string;
};

export function Avatar({ image, width, alt }: AvatarProps) {
  const isLogo = Boolean(width);
  const numericWidth = width ? Number(width.match(/([0-9]+)/)?.[1] ?? 0) : 0;
  const padding = width ? (400 - numericWidth) / 2 : 0;
  const innerStyle = width ? { width, height: width } : undefined;
  return (
    <div
      className={isLogo ? `${styles.avatar} ${styles.avatarLogo}` : styles.avatar}
      style={width ? { padding: `${padding}px` } : undefined}
    >
      <img src={image} alt={alt} style={innerStyle} />
    </div>
  );
}
