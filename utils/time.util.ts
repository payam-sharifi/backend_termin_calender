export function convertToBerlinTime(
  dateInput: string | Date
): { date: string; time: string } {
  const date = new Date(dateInput);

  const berlinDate = date.toLocaleDateString("de-DE", {
    timeZone: "Europe/Berlin",
    day: "2-digit",
    month: "2-digit",
  });

  const berlinTime = date.toLocaleTimeString("de-DE", {
    timeZone: "Europe/Berlin",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return {
    date: berlinDate, // 22.12
    time: berlinTime, // 16:30
  };
}
