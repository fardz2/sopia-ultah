import notes from './memory-notes.json';

export interface MemoryPage {
  title: string;
  place: string;
  mediaType: 'photo' | 'video';
  url: string;
  videoUrl?: string;
  description?: string;
}
export const mediaPages: readonly MemoryPage[] = Array.from({ length: 10 }, (_, i) => {
  const number = String(i + 1).padStart(2, '0');
  const videos: Record<number, string> = {
    2: '/WhatsApp%20Video%202026-10-29%20at%2012.40.23.mp4',
    3: '/WhatsApp%20Video%202026-10-29%20at%2012.41.11.mp4',
    6: '/WhatsApp%20Video%202026-10-29%20at%2012.41.12.mp4',
  };
  return {
    title: `Kenangan ${number}`,
    place: videos[i] ? 'Video' : 'Foto',
    mediaType: videos[i] ? 'video' : 'photo',
    url: `/landing-pages/birthday-media/kenangan-${number}.svg`,
    videoUrl: videos[i],
    description: [notes[i].heading, ...notes[i].lines, notes[i].closing].join(' '),
  };
});
export const portraitPhoto = '/WhatsApp%20Image%202026-10-29%20at%2012.40.23%20(1).jpeg';
export const framePhoto = '/WhatsApp%20Image%202026-10-29%20at%2012.41.12.jpeg';
export const irisPhoto = '/WhatsApp%20Image%202026-10-29%20at%2012.41.12%20(1).jpeg';
export const galleryPhotos = [
  { src: portraitPhoto, alt: 'Sopia dengan cahaya lampu malam di belakangnya.' },
  {
    src: '/WhatsApp%20Image%202026-10-29%20at%2012.40.23.jpeg',
    alt: 'Potret Sopia di tempat yang diterangi lampu hangat.',
  },
  { src: irisPhoto, alt: 'Sopia tersenyum di tengah pemandangan hijau.' },
  {
    src: '/WhatsApp%20Image%202026-10-29%20at%2012.41.13.jpeg',
    alt: 'Swafoto dua orang dalam kumpulan kenangan pribadi.',
  },
  {
    src: '/WhatsApp%20Image%202026-10-29%20at%2012.41.13%20(1).jpeg',
    alt: 'Foto pilihan dalam buku hadiah untuk Sopia.',
  },
] as const;
export const wishes = [
  {
    time: 'pagi',
    title: 'hatimu selalu tenang',
    note: 'aku ingin kamu memulai hari tanpa terlalu banyak beban.',
  },
  {
    time: 'siang',
    title: 'mimpimu makin dekat',
    note: 'aku akan senang melihatmu tumbuh menjadi yang kamu inginkan.',
  },
  {
    time: 'sore',
    title: 'ada tempat untuk pulang',
    note: 'semoga bersamaku, kamu merasa didengar dan diterima.',
  },
  { time: 'malam', title: 'istirahatmu terasa cukup', note: 'kamu tidak harus kuat setiap waktu, sayang.' },
  {
    time: 'selalu',
    title: 'kamu merasa dicintai',
    note: 'lewat kata, perhatian, dan hal kecil yang terus aku pelajari.',
  },
] as const;
