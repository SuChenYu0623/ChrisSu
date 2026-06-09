import { profile } from '../../data/profile';
import styles from './IntroductionPage.module.css';

export function Skills() {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionLabel}>Skills</h2>
      <div className={styles.skillsList}>
        {profile.skills.map((skill) => (
          <span key={skill} className={styles.skillTag}>
            {skill}
          </span>
        ))}
      </div>
    </section>
  );
}
