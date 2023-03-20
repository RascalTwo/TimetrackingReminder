import { memo, useCallback, useEffect, useMemo, useState } from 'react';

import TimeInput from './TimeInput';

import type { R2Event } from '../types';

export default memo(function EventRow({ baseDate, event: origEvent, deleteEvent, setEventEditing, updateEvent }: { baseDate: Date, event: R2Event, deleteEvent: (start: Date) => void, setEventEditing: (start: Date, editing: boolean) => void, updateEvent: (event: R2Event) => void }) {
  const [event, setEvent] = useState(() => ({ ...origEvent }));
  useEffect(() => setEvent(origEvent), [origEvent]);

  const durationString = useMemo(() => {
    const hoursDuration = Math.floor((event.end.getTime() - event.start.getTime()) / 1000 / 60 / 60).toString().padStart(2, '0');
    const minutesDuration = Math.floor((event.end.getTime() - event.start.getTime()) / 1000 / 60 % 60).toString().padStart(2, '0');
    return `${hoursDuration}:${minutesDuration}`;
  }, [event.start, event.end]);

  const onStartChange = useCallback((start: Date) => setEvent(event => ({ ...event, start })), [setEvent]);
  const onEndChange = useCallback((end: Date) => setEvent(event => ({ ...event, end })), [setEvent]);
  const onTextChange = useCallback(({ currentTarget: { name, value } }: React.ChangeEvent<HTMLInputElement>) => setEvent(event => ({ ...event, [name]: value })), [setEvent]);

  return <tr>
    {event.editing ? <>
      <td>
        <TimeInput baseDate={baseDate} dateValue={event.start} onDateChange={onStartChange} />
      </td>
      <td>{durationString}</td>
      <td>
        <TimeInput baseDate={baseDate} dateValue={event.end} onDateChange={onEndChange} />
      </td>
      <td>
        <input type="text" value={event.task} onChange={onTextChange} name="task" />
      </td>
      <td>
        <input type="text" value={event.what} onChange={onTextChange} name="what" />
      </td>
      {event.task !== 'Gap' ? <td>
        <button onClick={() => {
          setEventEditing(event.start, false);
          setEvent({ ...origEvent });
        }}>Cancel</button>
        <button onClick={() => {
          if (event.start.getTime() >= event.end.getTime()) return alert('Start time must be before end time');
          updateEvent({ ...event, editing: false });
        }}>Save</button>
      </td> : null}
    </> : <>
      <td>{event.start.toLocaleTimeString()}</td>
      <td>{durationString}</td>
      <td>{event.end.toLocaleTimeString()}</td>
      <td>{event.task}</td>
      <td>{event.what}</td>
      {event.task !== 'Gap' ? <td>
        <button onClick={() => deleteEvent(event.start)}>Delete</button>
        <button onClick={() => setEventEditing(event.start, true)}>Edit</button>
      </td> : null}
    </>}
  </tr>;
});