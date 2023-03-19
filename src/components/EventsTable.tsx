import { useCallback } from 'react';

import EventRow from './EventRow';

import type { R2Event } from '../types';

export default function EventsTable({ events, setEvents }: { events: R2Event[], setEvents: React.Dispatch<React.SetStateAction<R2Event[]>> }) {
  const deleteEvent = useCallback((start: Date) => setEvents(events => events.filter(event => event.start.getTime() !== start.getTime())), [setEvents]);
  const setEventEditing = useCallback((start: Date, editing: boolean) => setEvents(events => events.map(event => event.start.getTime() === start.getTime() ? { ...event, editing } : event)), [setEvents]);
  const updateEvent = useCallback((updatedEvent: R2Event) => setEvents(events => events.map(event => event.start.getTime() === updatedEvent.start.getTime() ? updatedEvent : event)), [setEvents]);
  return <table>
    <caption>Events & Gaps</caption>
    <thead>
      <tr>
        <th>Start</th>
        <th>Duration</th>
        <th>End</th>
        <th>Task</th>
        <th>What</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {events.map(event =>
        <EventRow
          key={event.start.getTime()}
          event={event}
          deleteEvent={deleteEvent}
          setEventEditing={setEventEditing}
          updateEvent={updateEvent}
        />
      )}
    </tbody>
  </table>;
}
