import { useEffect, useState } from "react";

function format(seconds: number) {
  const minutes = Math.floor(seconds / 60);

  const secs = seconds % 60;

  return `${minutes.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
}

export function useCallTimer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((value) => value + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return {
    seconds,
    time: format(seconds),
  };
}
