import { addDays, addMonths, addYears, setHours, setMinutes } from 'date-fns';

export const availableSelectTimeOptions = [
  {
    type: 'months',
    timeGenerator: (quantity) => addMonths(new Date(), quantity),
  },
  {
    type: 'days',
    timeGenerator: (quantity) => addDays(new Date(), quantity),
  },
  {
    type: 'years',
    timeGenerator: (quantity) => addYears(new Date(), quantity),
  },
];

export const normalizeDate = (date) => setMinutes(setHours(date, 0), 0);
