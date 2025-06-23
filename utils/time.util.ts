export function convertToBerlinTime(dateInput: string | Date): string {
    const date = new Date(dateInput);
    return date.toLocaleString("de-DE", {
      timeZone: "Europe/Berlin",
      hour12: false,
    });
  }
  