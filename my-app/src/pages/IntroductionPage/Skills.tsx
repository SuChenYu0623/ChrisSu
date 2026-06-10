import { profile } from '../../data/profile';
import styles from './IntroductionPage.module.css';

export function Skills() {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionLabel}>Skills</h2>
      <dl className={styles.skillGroups}>
        {profile.skillGroups.map((group) => (
          <div key={group.label} className={styles.skillGroup}>
            <dt className={styles.skillGroupLabel}>{group.label}</dt>
            <dd className={styles.skillGroupItems}>
              {group.items.map((item) => (
                <span key={item} className={styles.skillTag}>
                  {item}
                </span>
              ))}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
