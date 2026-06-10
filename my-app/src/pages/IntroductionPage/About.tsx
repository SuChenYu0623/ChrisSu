import { profile } from '../../data/profile';
import styles from './IntroductionPage.module.css';

export function About() {
  const cards: { label: string; value: string }[] = [
    { label: 'Born', value: profile.birthday },
    { label: 'Education', value: profile.school },
    { label: 'Languages', value: profile.programLanguages.join(', ') },
    { label: 'Currently', value: profile.company },
  ];
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionLabel}>About</h2>
      <div className={styles.aboutGrid}>
        {cards.map((card) => (
          <div key={card.label} className={styles.aboutCard}>
            <p className={styles.aboutLabel}>{card.label}</p>
            <p className={styles.aboutValue}>{card.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
