import { useCallback, useMemo } from "react";

export default function DateForm({ date, setDate }: { date: string, setDate: React.Dispatch<React.SetStateAction<string>> }) {
  const datesWithEvents = useMemo(() => {
    const datesWithEvents: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)!;
      if (key.endsWith('_events')) {
        datesWithEvents.push(key.slice(0, 10));
      }
    }
    return datesWithEvents;
  }, [date]);
  return <form key={date} onSubmit={useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newDate = e.currentTarget.querySelector('input')!.value;
    setDate(newDate);
  }, [setDate])}>
    <fieldset>
      <legend>Date Selector</legend>
      <input type="text" defaultValue={date} list="dates-with-events-list" pattern="\d{4}-\d{2}-\d{2}" required />
      <datalist id="dates-with-events-list">
        {datesWithEvents.map(date =>
          <option key={date} value={date} />
        )}
      </datalist>
      <br />
      <button>Update</button>
    </fieldset>
  </form>
}