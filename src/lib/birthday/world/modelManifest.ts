export const modelManifest = [
  ...['gift-base','gift-lid','gift-ribbon-x','gift-ribbon-y','gift-bow-left','gift-bow-right',
    'envelope-back','envelope-pocket','envelope-flap','envelope-letter','photo-frame','photo-stand']
    .map((name) => ({ name, url: `/landing-pages/birthday-media/world/${name}.stl` })),
  { name: 'seal', url: '/landing-pages/birthday-media/fs-seal.stl' },
];
