import { useCallback } from 'react';

import TimeInput from './TimeInput';

import { setDateHoursAndMinutes } from '../functions';

export default function NewEventForm({ todayDate, defaultStartDateValue, defaultEndDateValue, createEvent }: { todayDate: Date, defaultStartDateValue: Date, defaultEndDateValue: Date, createEvent: (start: Date, end: Date) => boolean }) {
  return <form onSubmit={useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    createEvent(
      setDateHoursAndMinutes(new Date(todayDate), e.currentTarget.start.value),
      setDateHoursAndMinutes(new Date(todayDate), e.currentTarget.end.value)
    );
  }, [todayDate, createEvent])}>
    <fieldset>
      <legend>New Event</legend>
      <TimeInput defaultDateValue={defaultStartDateValue} name="start" />
      {' -> '}
      <TimeInput defaultDateValue={defaultEndDateValue} name="end" />
      <br />
      <button type="submit">Add</button>
    </fieldset>
  </form>;
}