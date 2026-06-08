export type Profile = {
  cnName: string;
  enName: string;
  birthday: string;
  school: string;
  company: string;
  programLanguages: string;
  experience: string[];
};

export type ProjectExperience = {
  title: string;
  githubLink: string;
  liveLink?: string;
};

export type ExperienceSectionData = {
  id: string;
  title: string;
  bgImage: string;
  avatarImage: string;
  groups: {
    subtitle: string;
    projects: ProjectExperience[];
  }[];
};

export type NoteEntry = {
  slug: string;
  title: string;
};

export type NoteCategory = {
  key: string;
  label: string;
  notes: NoteEntry[];
};

export type ToolEntry = {
  slug: string;
  label: string;
};

export type Photo = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

export type Album = {
  id: string;
  title: string;
  description?: string;
  date?: string;
  photos: Photo[];
};

export type NavItem = {
  label: string;
  path: string;
};
