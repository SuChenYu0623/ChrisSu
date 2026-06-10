import { Link } from 'react-router-dom';
import { tools } from '../../data/tools';
import styles from './ToolsPage.module.css';

export function ToolsLanding() {
  return (
    <article className={styles.landing}>
      <h1 className={styles.landingTitle}>Tools</h1>
      <p className={styles.landingMeta}>{tools.length} 個工具</p>
      <div className={styles.landingGrid}>
        {tools.map((tool) => (
          <Link key={tool.slug} to={`/tools/${tool.slug}`} className={styles.landingCard}>
            <h2 className={styles.landingCardTitle}>{tool.label}</h2>
            <p className={styles.landingCardDesc}>{tool.description}</p>
          </Link>
        ))}
      </div>
    </article>
  );
}
