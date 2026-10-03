/** สีประจำสาขา คงที่ทุกที่ที่แสดงสาขา (แท่งกราฟ, legend, tooltip) ตาม design.md principle #3 */
export const BRANCH_COLORS = {
  สยาม: 'var(--color-series-siam)',
  สีลม: 'var(--color-series-silom)',
  บางนา: 'var(--color-series-bangna)',
  มหาวิทยาลัย: 'var(--color-series-university)',
  อารีย์: 'var(--color-series-ari)',
}

export function branchColor(branch) {
  return BRANCH_COLORS[branch] || 'var(--color-brand)'
}

/** แปลงชื่อสาขาไทย <-> slug อังกฤษ สำหรับใส่ใน URL (เช่น #overview?branch=siam) */
const BRANCH_SLUGS = {
  สยาม: 'siam',
  สีลม: 'silom',
  บางนา: 'bangna',
  มหาวิทยาลัย: 'university',
  อารีย์: 'ari',
}
const SLUG_TO_BRANCH = Object.fromEntries(Object.entries(BRANCH_SLUGS).map(([name, slug]) => [slug, name]))

export function branchToSlug(branch) {
  return branch ? BRANCH_SLUGS[branch] || null : null
}

export function slugToBranch(slug) {
  return slug ? SLUG_TO_BRANCH[slug] || null : null
}
