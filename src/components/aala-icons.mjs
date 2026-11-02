const paths = {
  dashboard: '<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',
  executive: '<path d="M8 3h8l5 5v13H3V3h5Z"/><path d="M16 3v5h5"/><path d="M7 16l3-4 3 2 4-5"/>',
  presentation: '<rect x="3" y="3" width="18" height="13" rx="2"/><path d="M12 16v5m-5 0h10"/><path d="m10 8 5 2.5-5 2.5z"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/>',
  phone: '<path d="M22 16.9v3a2 2 0 0 1-3.3 2.2A19.8 19.8 0 0 1 2 5.3 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7l.5 3a2 2 0 0 1-.6 1.8L7.1 10a16 16 0 0 0 6.9 6.9l1.5-1.9a2 2 0 0 1 1.8-.6l3 .5a2 2 0 0 1 1.7 2Z"/>',
  pin: '<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 4 6 4 9s-1 6-4 9c-3-3-4-6-4-9s1-6 4-9Z"/>',
  youtube: '<rect x="2" y="5" width="20" height="14" rx="4"/><path d="m10 9 5 3-5 3z"/>',
  facebook: '<path d="M15 21v-8h3l.5-4H15V7c0-1.2.5-2 2-2h2V2.2A16 16 0 0 0 16 2c-3.2 0-5 1.9-5 5v2H8v4h3v8"/>',
  instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor"/>',
  linkedin: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 10v7M8 7v.1M12 17v-7m0 3c0-4 6-4 6 0v4"/>',
  arrow: '<path d="M5 12h14m-7-7 7 7-7 7"/>'
};
export function aalaIcon(name, size=19) {
  return `<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${paths[name] || paths.dashboard}</svg>`;
}
