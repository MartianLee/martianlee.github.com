export function slugToTitle(slug: string) {
  return slug?.split('-').splice(3).join('-');
}
