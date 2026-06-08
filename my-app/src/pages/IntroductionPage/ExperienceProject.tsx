import type { ProjectExperience } from '../../types';
import githubImg from '../../images/github.png';
import linkImg from '../../images/link.png';
import styles from './IntroductionPage.module.css';

export function ExperienceProject({ title, githubLink, liveLink }: ProjectExperience) {
  return (
    <div className={styles.experienceProject}>
      <span>{title}</span>
      <a
        className={styles.link}
        style={{ backgroundImage: `url(${githubImg})` }}
        href={githubLink}
        target="_blank"
        rel="noreferrer"
        aria-label={`${title} GitHub`}
      />
      {liveLink && (
        <a
          className={styles.link}
          style={{ backgroundImage: `url(${linkImg})` }}
          href={liveLink}
          target="_blank"
          rel="noreferrer"
          aria-label={`${title} demo`}
        />
      )}
    </div>
  );
}
