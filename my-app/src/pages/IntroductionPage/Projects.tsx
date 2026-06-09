import { projects } from '../../data/profile';
import { ProjectCard } from './ProjectCard';
import styles from './IntroductionPage.module.css';

export function Projects() {
  return (
    <section id="projects" className={styles.section}>
      <h2 className={styles.sectionLabel}>Projects</h2>
      <div className={styles.projectsList}>
        {projects.map((project) => (
          <ProjectCard key={project.title} project={project} />
        ))}
      </div>
    </section>
  );
}
