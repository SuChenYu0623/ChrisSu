import { Avatar } from './Avatar';
import { ProfileTable } from './ProfileTable';
import { ExperienceSection } from './ExperienceSection';
import { profile, profileBackground, experienceSections } from '../../data/profile';
import styles from './IntroductionPage.module.css';

export default function IntroductionPage() {
  return (
    <div className={styles.page}>
      <div className={styles.section} style={{ backgroundImage: `url(${profileBackground})` }}>
        <Avatar image={profileBackground} alt="background avatar" />
        <ProfileTable profile={profile} />
      </div>
      {experienceSections.map((section) => (
        <ExperienceSection key={section.id} data={section} />
      ))}
      <div className={styles.saying}>
        <div>生而為人，能照顧愛惜自己就好了！</div>
        <div>인간으로서 스스로를 돌볼 수 있다면 참 좋을 것 같아요</div>
      </div>
    </div>
  );
}
