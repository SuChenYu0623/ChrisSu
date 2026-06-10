import { profile } from '../../data/profile';
import styles from './IntroductionPage.module.css';

export function Hero() {
  return (
    <section className={styles.hero}>
      <div>
        <h1 className={styles.heroTitle}>
          Hi, I&apos;m {profile.enName}
          <span className={styles.heroTitleAccent}>.</span>
        </h1>
        <p className={styles.heroTagline}>{profile.tagline}</p>
        <p className={styles.heroDescription}>{profile.description}</p>
        <div className={styles.heroCtas}>
          <a href="#projects" className={styles.btnPrimary}>
            View Projects →
          </a>
          <a
            href={profile.githubUrl}
            target="_blank"
            rel="noreferrer"
            className={styles.btnSecondary}
          >
            GitHub
          </a>
        </div>
      </div>
      <div className={styles.avatarBox}>
        <img src={profile.avatarSrc} alt={`${profile.enName} avatar`} />
      </div>
    </section>
  );
}
