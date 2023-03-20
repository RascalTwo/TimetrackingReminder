import { useCallback, useMemo, useState } from 'react';

import { REMINDER_INTERVAL } from './constants';

import DateForm from './components/DateForm';
import NewEventForm from './components/NewEventForm';
import EventsTable from './components/EventsTable';
import CurrentEventCountdown from './components/CurrentEventCountdown';
import TaskTable from './components/TaskTable';

import useLocalState from './hooks/useLocalState';
import useCountdownTimer from './hooks/useCountdownTimer';

import './App.css';

import type { R2Event } from './types';


function App() {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const todayDate = useMemo(() => {
    const [year, month, day] = date.split('-').map(Number);
    return new Date(year, month - 1, day);
  }, [date]);
  const isToday = useMemo(() => new Date().toISOString().slice(0, 10) === date, [date]);


  const [events, setEvents] = useLocalState<R2Event[]>(`${date}_events`, useMemo(() => [], []));
  const lastTask = useMemo(() => events.at(-1)?.task, [events]);

  const blockStart = useMemo(() => {
    const blockStart = new Date(todayDate);
    blockStart.setHours(new Date().getHours());
    blockStart.setMinutes(blockStart.getMinutes() - blockStart.getMinutes() % REMINDER_INTERVAL);
    blockStart.setSeconds(0);
    blockStart.setMilliseconds(0);

    while (events.find(e => e.start.getTime() >= blockStart.getTime() || e.end.getTime() > blockStart.getTime())) {
      blockStart.setMinutes(blockStart.getMinutes() + REMINDER_INTERVAL);
    }

    return blockStart;
  }, [todayDate, events]);

  const blockEnd = useMemo(() => {
    const blockEnd = new Date(blockStart);
    blockEnd.setMinutes(blockEnd.getMinutes() + REMINDER_INTERVAL);
    return blockEnd;
  }, [blockStart]);

  const createEvent = useCallback((start: Date, end: Date) => {
    if (start.getTime() >= end.getTime()) {
      alert('Start time must be before end time');
      return false;
    }

    const task = lastTask && confirm(`Did you do ${lastTask}?`)
      ? lastTask
      : prompt('What task were you working on?');
    if (!task) return false;

    let what: string | null = null;
    while (!what) what = prompt(`What did you do for ${task}?`);

    setEvents(events => [...events, {
      start,
      end,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      what: what!,
      task,
      editing: false
    }].sort((a, b) => a.start.getTime() - b.start.getTime()));
    return true;
  }, [setEvents, lastTask]);

  const secondsRemaining = useCountdownTimer(
    useMemo(() => isToday ? blockEnd : new Date(blockEnd.getTime() + 1000 * 60 * 60 * 24 * 365), [isToday, blockEnd]),
    useMemo(() => isToday ? () => {
      if (!createEvent(blockStart, blockEnd)) {
        setEvents(events => [...events]);
      }
    } : undefined, [isToday, blockStart, blockEnd, createEvent, setEvents]));

  const allEvents = useMemo((): R2Event[] => {
    const firstEventStart = events[0]?.start;
    const lastEventStart = events.at(-1)?.start;
    if (!firstEventStart || !lastEventStart) return [];

    if (firstEventStart === lastEventStart) {
      if (blockStart.getTime() === events[0].end.getTime()) return events;
      return [
        ...events,
        { start: new Date(firstEventStart.getTime() + 1000 * 60 * REMINDER_INTERVAL), end: blockStart, what: 'Gap', task: 'Gap', editing: false }
      ];
    }

    const allEvents: R2Event[] = [];

    let now = new Date(firstEventStart);
    while (now <= lastEventStart) {
      const event = events.find(e => e.start.getTime() === now.getTime());
      if (event) {
        allEvents.push(event);
        now = new Date(event.end);
      } else {
        const latestEvent = allEvents.at(-1);
        if (latestEvent?.task === 'Gap') {
          latestEvent.end = new Date(now.getTime() + 1000 * 60 * REMINDER_INTERVAL);
        } else {
          allEvents.push({ start: new Date(now), end: new Date(now.getTime() + 1000 * 60 * REMINDER_INTERVAL), what: 'Gap', task: 'Gap', editing: false });
        }
        now.setMinutes(now.getMinutes() + REMINDER_INTERVAL);
      }
    }

    return allEvents;
  }, [blockStart, events]);

  return (
    <main>
      <section>
        <h1>Tasks</h1>
        <sup>{date}</sup>
      </section>

      <DateForm date={date} setDate={setDate} />
      <TaskTable events={allEvents} />
      {isToday ? <CurrentEventCountdown start={blockStart} end={blockEnd} secondsRemaining={secondsRemaining} /> : null}
      <EventsTable todayDate={todayDate} events={allEvents} setEvents={setEvents} />
      <NewEventForm key={events.length} todayDate={todayDate} defaultStartDateValue={blockStart} defaultEndDateValue={blockEnd} createEvent={createEvent} />
    </main>
  );
}

export default App;
