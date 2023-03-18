import { useCallback } from "react";

import TimeInput from "./TimeInput";

import { setDateHoursAndMinutes } from "../functions";

export default function NewEventForm({ defaultStartDateValue, defaultEndDateValue, createEvent }: { defaultStartDateValue: Date, defaultEndDateValue: Date, createEvent: (start: Date, end: Date) => boolean }) {
  return <form onSubmit={useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    createEvent(
      setDateHoursAndMinutes(new Date(), e.currentTarget.start.value),
      setDateHoursAndMinutes(new Date(), e.currentTarget.end.value)
    );
  }, [createEvent])}>
    <fieldset>
      <legend>New Event</legend>
      <TimeInput defaultDateValue={defaultStartDateValue} name="start" />
      {` -> `}
      <TimeInput defaultDateValue={defaultEndDateValue} name="end" />
      <br />
      <button type="submit">Add</button>
    </fieldset>
  </form>
}