

export const formatTime = (time: string): string => {
  const hours = parseInt(time.substring(0, 2), 10);
  const minutes = time.substring(3, 5);
  const period = hours < 12 || hours === 24 ? 'AM' : 'PM';
  const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
  return `${formattedHours}:${minutes} ${period}`;
};
export const validateTime = (time: string): boolean => {
    const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/;
    return timeRegex.test(time);
  };