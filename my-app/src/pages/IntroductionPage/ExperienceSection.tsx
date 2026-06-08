import type { ExperienceSectionData } from '../../types';
import { Avatar } from './Avatar';
import { ExperienceProject } from './ExperienceProject';
import styles from './IntroductionPage.module.css';

type Props = { data: ExperienceSectionData };

export function ExperienceSection({ data }: Props) {
  return (
    <div id={data.id} className={styles.section} style={{ backgroundImage: `url(${data.bgImage})` }}>
      <Avatar image={data.avatarImage} width="200px" alt={`${data.title} icon`} />
      <div className={styles.introduction}>
        <div className={styles.title}>{data.title}</div>
        <br />
        {data.groups.map((group) => (
          <div key={group.subtitle}>
            <div className={styles.subtitle}>{group.subtitle}</div>
            <table style={{ borderTop: '1px black solid' }}>
              <tbody>
                {group.projects.map((project) => (
                  <tr key={project.title}>
                    <th colSpan={6}>PROJECT NAME</th>
                    <td colSpan={4}>
                      <ExperienceProject {...project} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <br />
          </div>
        ))}
      </div>
    </div>
  );
}
