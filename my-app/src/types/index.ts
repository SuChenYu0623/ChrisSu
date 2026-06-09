export type Profile = {
  cnName: string;
  enName: string;
  tagline: string;
  description: string;
  birthday: string;
  school: string;
  company: string;
  programLanguages: string[];
  skills: string[];
  avatarSrc: string;
  githubUrl: string;
};

export type Project = {
  title: string;
  description: string;
  tags: string[];
  githubUrl: string;
  liveUrl?: string;
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
