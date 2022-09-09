import { getDate, getTime } from '../dateTime'

test('can get date', () => {
  jest.useFakeTimers().setSystemTime(new Date('2022-09-20'))
  expect(getDate()).toBe('2022-09-20')
  jest.useFakeTimers().setSystemTime(new Date('2022-09-01'))
  expect(getDate()).toBe('2022-09-01')
  jest.useFakeTimers().setSystemTime(new Date('2022-10-01'))
  expect(getDate()).toBe('2022-10-01')
})

test('can get time', () => {
  jest.useFakeTimers().setSystemTime(new Date('2022-09-20 12:30'))
  expect(getTime()).toBe('12:30')
  jest.useFakeTimers().setSystemTime(new Date('2022-09-20 2:30'))
  expect(getTime()).toBe('02:30')
  jest.useFakeTimers().setSystemTime(new Date('2022-09-20 12:01'))
  expect(getTime()).toBe('12:01')
  expect(getTime(60000)).toBe('12:02')
  expect(getTime(-60000)).toBe('12:00')
})
