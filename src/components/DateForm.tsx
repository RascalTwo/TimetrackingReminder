import { useCallback, useMemo } from 'react';

export default function DateForm({ date, setDate }: { date: string, setDate: React.Dispatch<React.SetStateAction<string>> }) {
  const datesWithEvents = useMemo(() => {
    const datesWithEvents: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.endsWith('_events')) {
        datesWithEvents.push(key.slice(0, 10));
      }
    }
    return datesWithEvents;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);
  return <form key={date} onSubmit={useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
      <br/>
      {/* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */}
      <button type="button" onClick={() => navigator.clipboard.writeText(localStorage.getItem(date + '_events')!).then(() => alert('Copied to clipboard'))}>Export</button>
      <button type="button" onClick={() => {
        const newEvents = prompt('Paste new events JSON');
        if (newEvents) {
          localStorage.setItem(date + '_events', newEvents);
          window.location.reload();
        }
      }}>Import</button>
    </fieldset>
  </form>;
}