import { getCollection, type CollectionEntry } from 'astro:content';

export type Project = CollectionEntry<'projects'>;
export type ProjectStatus = NonNullable<Project['data']['status']>;

/** Badge text for `status` */
export const statusLabels: Record<ProjectStatus, string> = {
  shipped: 'Shipped',
  'in-development': 'In development',
  ongoing: 'Ongoing',
};

const byOrder = (a: Project, b: Project) => a.data.order - b.data.order || a.data.title.localeCompare(b.data.title);

/** All projects in display order: featured first (by `order`), then the rest. */
export async function getOrderedProjects(): Promise<Project[]> {
  const all = await getCollection('projects');
  return [...all.filter((p) => p.data.featured).sort(byOrder), ...all.filter((p) => !p.data.featured).sort(byOrder)];
}

/** What the home page shows: featured projects, or everything until something is featured. */
export async function getHomeProjects(): Promise<{ projects: Project[]; featuredOnly: boolean }> {
  const ordered = await getOrderedProjects();
  const featured = ordered.filter((p) => p.data.featured);
  return featured.length > 0 ? { projects: featured, featuredOnly: true } : { projects: ordered, featuredOnly: false };
}
