import { memo, useMemo } from 'react';

import { dateToHHMM, disableScrolling, enableScrolling, setDateHoursAndMinutes, updateTimeOnWheel } from '../functions';

export default memo(function TimeInput({ baseDate, defaultDateValue, dateValue, onDateChange, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { baseDate?: Date, defaultDateValue?: Date, dateValue?: Date, onDateChange?: (date: Date) => void }) {
  const onChange = useMemo(() => onDateChange ? (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = setDateHoursAndMinutes(baseDate ? new Date(baseDate) : new Date(), e.currentTarget.value);
    if (isNaN(date.getTime())) return;

    onDateChange(date);
  } : undefined, [baseDate, onDateChange]);

  const onWheel = useMemo(() => onDateChange ? (e: React.WheelEvent<HTMLInputElement>) => {
    const newValue = updateTimeOnWheel(e);
    if (newValue) onDateChange(setDateHoursAndMinutes(baseDate ? new Date(baseDate) : new Date(), newValue));
  } : updateTimeOnWheel, [baseDate, onDateChange]);

  return <input
    type="time"
    onChange={onChange}
    value={useMemo(() => dateValue ? dateToHHMM(dateValue) : undefined, [dateValue])}
    defaultValue={useMemo(() => defaultDateValue ? dateToHHMM(defaultDateValue) : undefined, [defaultDateValue])}
    onWheel={onWheel}
    onMouseEnter={disableScrolling}
    onMouseLeave={enableScrolling}
    {...props}
  />;
});
