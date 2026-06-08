import styles from './DefaultImage.module.css';

type DefaultImageProps = {
  image: string;
  alt: string;
  width?: string;
};

export function DefaultImage({ image, alt, width }: DefaultImageProps) {
  return (
    <div className={styles.wrapper} style={width ? { width } : undefined}>
      <img className={styles.img} style={width ? { width } : undefined} src={image} alt={alt} />
      <div className={styles.mask} />
    </div>
  );
}
