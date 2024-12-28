const SECONDS_IN_HOUR = 3600;
const SECONDS_IN_MINUTE = 60;

export function getTimeTaken(diffMilliseconds: number): string {
  const diffSeconds = Math.floor(diffMilliseconds / 1000);
  const hours = Math.floor(diffSeconds / SECONDS_IN_HOUR);
  const minutes = Math.floor((diffSeconds % SECONDS_IN_HOUR) / SECONDS_IN_MINUTE);
  const seconds = diffSeconds % SECONDS_IN_MINUTE;

  const hoursText = hours > 0 ? `${hours} ${hours === 1 ? "hour " : "hours "}` : "";
  const minutesText = minutes > 0 ? `${minutes} ${minutes === 1 ? 'minute ' : 'minutes '}` : "";
  const secondsText = seconds > 0 ? `${seconds} ${seconds === 1 ? 'second' : 'seconds'}` : "";

  return `${hoursText}${minutesText}${secondsText}`;
}