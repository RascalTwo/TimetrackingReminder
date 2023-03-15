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
  const [state, setState] = useState<T>(() => {
    const storedValue = localStorage.getItem(key);
    if (storedValue) {
      return JSON.parse(storedValue, dateReviver);
    }

    return defaultValue;
  });

  const setValueAndStore = useCallback((action: SetStateAction<T>) => setState(prevState => {
    const newState: T = typeof action === 'function' ? (action as ((prevState: T) => T))(prevState) : action;
    console.log(newState);
    localStorage.setItem(key, JSON.stringify(newState, dateReplacer));
    return newState
  }), [setState])

  return [state, setValueAndStore];
}

function App() {
  const [events, setEvents] = useLocalState<Event[]>('events', [])
  const [goals, setGoals] = useLocalState<Record<string, number>>('goals', {});
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

  return (
    <main>
      <div>
        {blockStart.toLocaleTimeString()} -&gt; {blockEnd.toLocaleTimeString()}
        <br />
        <div>{Math.floor(secondsRemaining / 60)}m{Math.floor(secondsRemaining % 60)}s</div>
      </div>
      <section>
        <h1>Goals</h1>
        <ul>
          {Object.entries(goals).map(([task, hours]) => {
            const completedMinutes = events.filter(e => e.task === task).reduce((acc, e) => acc + (e.end.getTime() - e.start.getTime()) / 1000 / 60, 0);
            const completedHours = completedMinutes / 60;
            return (
              <li key={task}>
                {task} - <input type="number" min="0" value={hours} onChange={e => setGoals(goals => ({ ...goals, [task]: e.target.valueAsNumber }))} /> - {completedHours.toFixed(2)} ({(completedHours / hours * 100).toFixed(2)}%) <button onClick={() => setGoals(({ [task]: _, ...leftoverGoals }) => leftoverGoals)}>Delete</button>
              </li>
            )
          })}
          <li>
            <button onClick={() => {
              const task = prompt("Name?");
              if (!task) return;

              const hours = prompt("Hours?");
              if (!hours || isNaN(+hours)) return;

              setGoals(goals => ({ ...goals, [task]: +hours }));
            }}>New Goal</button>
          </li>
        </ul>
      </section>
      <ul>
        {events.map(e =>
          <li key={e.start.getTime()}>
            <span>{e.start.toLocaleTimeString()} -&gt; {e.end.toLocaleTimeString()}</span>
            {" "}{e.what} @ {e.task}
            <button onClick={() => setEvents(events => events.filter(le => le.start !== e.start))}>Delete</button>
          </li>
        )}
        <li>
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
            <input type="time" name="start" defaultValue={blockStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })} />
            -&gt;
            <input type="time" name="end" defaultValue={blockEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })} />

            <button type="submit">Add Event</button>
          </form>

        </li>
      </ul>
    </main>
  )
}

export default App
