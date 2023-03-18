import { REMINDER_INTERVAL } from "./constants";

export const setDateHoursAndMinutes = (date: Date, hoursAndMinutes: string) => {
  const [hours, minutes] = hoursAndMinutes.split(':').map(Number);
  date.setHours(hours);
  date.setMinutes(minutes);
  date.setSeconds(0);
  date.setMilliseconds(0);
  return date;
}


export const updateTimeOnWheel = (e: React.WheelEvent<HTMLInputElement>) => {
  const date = setDateHoursAndMinutes(new Date(), e.currentTarget.value);
  if (isNaN(date.getTime())) return;

  date.setMinutes(date.getMinutes() + REMINDER_INTERVAL * -Math.max(-1, Math.min(1, e.deltaY)));

  const newValue = dateToHHMM(date);
  e.currentTarget.value = newValue;
  return newValue
}

const setScrolling = (scrolling: boolean) => {
  document.body.style.overflow = scrolling ? 'auto' : 'hidden';
}

export const disableScrolling = () => setScrolling(false);
export const enableScrolling = () => setScrolling(true);

export const dateToHHMM = (date: Date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

