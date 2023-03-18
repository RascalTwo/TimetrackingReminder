import { memo, useMemo } from "react";

import { dateToHHMM, disableScrolling, enableScrolling, setDateHoursAndMinutes, updateTimeOnWheel } from "../functions";

export default memo(function TimeInput({ defaultDateValue, dateValue, onDateChange, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { defaultDateValue?: Date, dateValue?: Date, onDateChange?: (date: Date) => void }) {
  const onChange = useMemo(() => onDateChange ? (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = setDateHoursAndMinutes(new Date(), e.currentTarget.value);
    if (isNaN(date.getTime())) return;

    onDateChange(date);
  } : undefined, [onDateChange]);

  const onWheel = useMemo(() => onDateChange ? (e: React.WheelEvent<HTMLInputElement>) => {
    const newValue = updateTimeOnWheel(e);
    if (newValue) onDateChange(setDateHoursAndMinutes(new Date(), newValue));
  } : updateTimeOnWheel, [onDateChange]);

  return <input
    type="time"
    onChange={onChange}
    value={useMemo(() => dateValue ? dateToHHMM(dateValue) : undefined, [dateValue])}
    defaultValue={useMemo(() => defaultDateValue ? dateToHHMM(defaultDateValue) : undefined, [defaultDateValue])}
    onWheel={onWheel}
    onMouseEnter={disableScrolling}
    onMouseLeave={enableScrolling}
    {...props}
  />
});
