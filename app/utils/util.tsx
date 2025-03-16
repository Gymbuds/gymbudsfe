

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

 export const convertTo24Hour = (time:string) => {
    let [hour, minutePeriod] = time.split(":");
    let [minutes, period] = [minutePeriod.slice(0, 2), minutePeriod.slice(-2).toUpperCase()];

    let hourNum = parseInt(hour, 10);
    let minuteNum = parseInt(minutes, 10);

    if (hourNum === 12) {
      hourNum = period === "AM" ? 0 : 12; // 12 AM -> 00:00, 12 PM stays 12:00
    } else if (period === "PM") {
      hourNum += 12; // Convert PM hours (except 12 PM) to 24-hour format
    }

    return { hour: hourNum, minute: minuteNum, period };
  };
export const padTime = (hour: string | number, minute: string | number) => 
`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

