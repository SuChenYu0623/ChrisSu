import { Hero } from './Hero';
import { About } from './About';
import { Skills } from './Skills';
import { Projects } from './Projects';
import styles from './IntroductionPage.module.css';

export default function IntroductionPage() {
  return (
    <div className={styles.page}>
      <Hero />
      <div className={styles.container}>
        <About />
        <Skills />
        <Projects />
      </div>
    </div>
  );
}
