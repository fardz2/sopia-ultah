const formatter = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Asia/Jakarta',
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
});
export function birthdayState(now: number, preview = false) {
  const parts = Object.fromEntries(
    formatter.formatToParts(new Date(now)).map((part) => [part.type, Number(part.value)]),
  );
  const today = preview || (parts.month === 11 && parts.day === 7);
  const nextYear = parts.year + (parts.month > 11 || (parts.month === 11 && parts.day > 7) ? 1 : 0);
  let remaining = Math.max(0, Math.floor((Date.UTC(nextYear, 10, 7) - 7 * 3600000 - now) / 1000));
  const days = Math.floor(remaining / 86400);
  remaining -= days * 86400;
  const hours = Math.floor(remaining / 3600);
  remaining -= hours * 3600;
  const minutes = Math.floor(remaining / 60),
    seconds = remaining - minutes * 60;
  return {
    today,
    preview,
    year: parts.year,
    days,
    hours,
    minutes,
    seconds,
    dateLabel: preview
      ? 'pratinjau · 7 november'
      : today
        ? '7 november · hari ini'
        : 'setiap 7 november · pukul 00.00 wib',
    ariaLabel: today
      ? 'Selamat ulang tahun, Sopia!'
      : `${days} hari, ${hours} jam, ${minutes} menit, ${seconds} detik menuju 7 November`,
  };
}
export type BirthdayState = ReturnType<typeof birthdayState>;
