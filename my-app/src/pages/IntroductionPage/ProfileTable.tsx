import type { Profile } from '../../types';
import styles from './IntroductionPage.module.css';

type Props = { profile: Profile };

export function ProfileTable({ profile }: Props) {
  const scrollTo = (id: string) => {
    document.querySelector(`#${CSS.escape(id)}`)?.scrollIntoView({ behavior: 'smooth' });
  };
  return (
    <div className={styles.introduction}>
      <div className={styles.title}>Crawler Engineer &amp; Front End</div>
      <br />
      <table style={{ borderTop: '1px black solid' }}>
        <tbody>
          <tr>
            <th colSpan={6}>NAME</th>
            <td colSpan={4}>
              {profile.cnName} {profile.enName}
            </td>
          </tr>
          <tr>
            <th colSpan={6}>BORN DATE</th>
            <td colSpan={4}>{profile.birthday}</td>
          </tr>
          <tr>
            <th colSpan={6}>WORK AT</th>
            <td colSpan={4}>{profile.company}</td>
          </tr>
          <tr>
            <th colSpan={6}>GRADUATED FROM</th>
            <td colSpan={4}>{profile.school}</td>
          </tr>
          <tr>
            <th colSpan={6}>PROGRAM LANGUAGE</th>
            <td colSpan={4}>{profile.programLanguages}</td>
          </tr>
          <tr>
            <th colSpan={6}>PROJECT EXPERIENCE</th>
            <td colSpan={4}>
              {profile.experience.map((item) => (
                <button
                  type="button"
                  key={item}
                  className={styles.experienceTag}
                  onClick={() => scrollTo(item)}
                >
                  {item}
                </button>
              ))}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
