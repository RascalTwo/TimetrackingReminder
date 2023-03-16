import { useCallback, useEffect, useMemo, useState } from 'react'
import type { SetStateAction, Dispatch } from 'react'
import './App.css'

interface Event {
  start: Date
  end: Date
  what: string
  task: string
}

const REMINDER_INTERVAL = 15;

const dateReplacer = (key: string, value: any) => {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(value)) {
    return { r2Type: 'Date', value: new Date(value).getTime() };
  }
  return value;
}

const dateReviver = (key: string, value: any) => {
  if (value && value.r2Type === 'Date') {
    return new Date(value.value);
  }
  return value;
}



const useLocalState = <T extends any>(key: string, defaultValue: T): [T, Dispatch<SetStateAction<T>>] => {
  const [state, setState] = useState<T>(defaultValue);

  useEffect(() => {
    const storedValue = localStorage.getItem(key);
    setState(storedValue ? JSON.parse(storedValue, dateReviver) : defaultValue);
  }, [key, defaultValue]);

  const setValueAndStore = useCallback((action: SetStateAction<T>) => setState(prevState => {
    const newState: T = typeof action === 'function' ? (action as ((prevState: T) => T))(prevState) : action;
    console.log(newState);
    localStorage.setItem(key, JSON.stringify(newState, dateReplacer));
    return newState
  }), [setState])

  return [state, setValueAndStore];
}

function App() {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  const [events, setEvents] = useLocalState<Event[]>(`${date}_events`, useMemo(() => [], []))
  const lastTask = useMemo(() => events.at(-1)?.task, [events]);

  const blockStart = useMemo(() => {
    const blockStart = new Date();
    blockStart.setMinutes(blockStart.getMinutes() - blockStart.getMinutes() % REMINDER_INTERVAL);
    blockStart.setSeconds(0);
    blockStart.setMilliseconds(0);

    while (events.find(e => e.start.getTime() >= blockStart.getTime() || e.end.getTime() > blockStart.getTime())) {
      blockStart.setMinutes(blockStart.getMinutes() + REMINDER_INTERVAL);
    }

    return blockStart;
  }, [events])
  const blockEnd = useMemo(() => {
    const blockEnd = new Date(blockStart);
    blockEnd.setMinutes(blockEnd.getMinutes() + REMINDER_INTERVAL);
    return blockEnd;
  }, [blockStart])

  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining(Math.max(0, (blockEnd.getTime() - Date.now()) / 1000));
    }, 1000);

    return () => {
      clearInterval(timer);
    }
  }, [blockEnd, setSecondsRemaining]);

  const createEvent = useCallback((start: Date, end: Date) => {
    const task = lastTask && confirm(`Did you do ${lastTask}?`)
      ? lastTask
      : prompt("What task were you working on?")!;
    if (!task) return;

    let what: string | null = null;
    while (!what) {
      what = prompt(`What did you do for ${task}?`);
    }

    setEvents(events => [...events, {
      start,
      end,
      what: what!,
      task,
    }]);
  }, [setEvents, lastTask])

  useEffect(() => {
    const createEventTimer = setInterval(() => {
      createEvent(blockStart, blockEnd);
    }, Math.max(0, blockEnd.getTime() - Date.now()));

    return () => {
      clearInterval(createEventTimer);
    }
  }, [lastTask, blockStart, blockEnd, setEvents]);

  const firstEventStart = useMemo(() => events[0]?.start, [events]);
  const lastEventStart = useMemo(() => events.at(-1)?.start, [events]);
  const eventsAndGaps = useMemo(() => {
    if (!firstEventStart || !lastEventStart) return [];

    if (firstEventStart === lastEventStart){
      if (blockStart.getTime() === events[0].end.getTime()) return events;
      return [
        ...events,
        { start: new Date(firstEventStart.getTime() + 1000 * 60 * 15), end: blockStart, what: 'Gap', task: 'Gap'}
      ]
    }

    const eventsAndGaps: Event[] = [];

    let now = new Date(firstEventStart);
    while (now <= lastEventStart) {
      const event = events.find(e => e.start.getTime() === now.getTime());
      if (event) {
        eventsAndGaps.push(event);
        now = new Date(event.end);
      } else {
        if (eventsAndGaps.at(-1)?.task === 'Gap') {
          eventsAndGaps.at(-1)!.end = new Date(now.getTime() + 1000 * 60 * 15);
        } else {
          eventsAndGaps.push({ start: new Date(now), end: new Date(now.getTime() + 1000 * 60 * 15), what: 'Gap', task: 'Gap' });
        }
        now.setMinutes(now.getMinutes() + 15);
      }
    }

    return eventsAndGaps;
  }, [events, firstEventStart, lastEventStart]);

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

  return (
    <main>
      <section>
        <h1>Tasks</h1>
        <sup>{date}</sup>
      </section>

      <form key={date} onSubmit={e => {
        e.preventDefault();
        const newDate = (e.currentTarget.elements[0] as HTMLInputElement).value;
        setDate(newDate);
      }}>
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

      <table>
        <caption>Task Totals</caption>
        <thead>
          <tr>
            <th>Task</th>
            <th>Hours</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(eventsAndGaps.reduce((tasks, event) => {
            tasks[event.task] = (tasks[event.task] || 0) + ((event.end.getTime() - event.start.getTime()) / 1000 / 60 / 60);
            return tasks;
          }, {} as Record<string, number>)).map(([task, hours]) =>
            <tr key={task}>
              <td>{task}</td>
              <td>{hours}</td>
            </tr>
          )}
        </tbody>
      </table>

      <div>
        <h2>Current Time Block</h2>
        {blockStart.toLocaleTimeString()} -&gt; {blockEnd.toLocaleTimeString()}
        <br />
        <div>{Math.floor(secondsRemaining / 60)}m{Math.floor(secondsRemaining % 60)}s</div>
      </div>
      <table>
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
          {eventsAndGaps.map(e =>
            <tr key={e.start.getTime()}>
              <td>{e.start.toLocaleTimeString()}</td>
              <td>{Math.floor((e.end.getTime() - e.start.getTime()) / 1000 / 60 / 60).toString().padStart(2, '0')}:{Math.floor((e.end.getTime() - e.start.getTime()) / 1000 / 60 % 60).toString().padStart(2, '0')}</td>
              <td>{e.end.toLocaleTimeString()}</td>
              <td>{e.task}</td>
              <td>{e.what}</td>
              {e.task !== 'Gap' ? <td>
                <button onClick={() => setEvents(events => events.filter(le => le.start !== e.start))}>Delete</button>
              </td> : null}
            </tr>
          )}
        </tbody>
      </table>
      <form onSubmit={e => {
        e.preventDefault();

        const start = new Date();
        start.setHours(+e.currentTarget.start.value.split(":")[0]);
        start.setMinutes(+e.currentTarget.start.value.split(":")[1]);
        start.setSeconds(0);
        start.setMilliseconds(0);

        const end = new Date();
        end.setHours(+e.currentTarget.end.value.split(":")[0]);
        end.setMinutes(+e.currentTarget.end.value.split(":")[1]);
        end.setSeconds(0);
        end.setMilliseconds(0);

        createEvent(start, end);
      }} key={events.length}>
        <fieldset>
          <legend>New Event</legend>
          <input type="time" name="start" defaultValue={blockStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })} />
          -&gt;
          <input type="time" name="end" defaultValue={blockEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })} />

          <button type="submit">Add</button>
        </fieldset>
      </form>
    </main>
  )
}

export default App
