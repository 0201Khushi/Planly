import { useEffect } from 'react';

const PLANNER_KEY = "planly_planner_data";
const TIMETABLE_KEY = "planly_savedWeek";
const NOTIFICATIONS_STATE_KEY = "planly_notifications_state";

const formatTime = (hour) => {
  const totalMinutes = Math.round(hour * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  const period = h >= 12 ? "PM" : "AM";
  const displayHour = h % 12 === 0 ? 12 : h % 12;
  const minutes = String(m).padStart(2, "0");
  return `${displayHour}:${minutes} ${period}`;
};

export function useNotifications() {
  useEffect(() => {
    // Check if browser supports notifications
    if (!("Notification" in window)) {
      console.warn("This browser does not support desktop notification");
      return;
    }

    const checkNotifications = () => {
      if (Notification.permission !== "granted") return;

      const plannerData = JSON.parse(localStorage.getItem(PLANNER_KEY)) || [];
      const notifiedState = JSON.parse(localStorage.getItem(NOTIFICATIONS_STATE_KEY)) || {};

      const now = Date.now();

      plannerData.forEach(task => {
        if (!task.date || task.completed) return; // Skip if no date or already completed

        const taskId = task.id;
        if (!notifiedState[taskId]) {
          notifiedState[taskId] = [];
        }

        // Calculate absolute time of deadline
        let deadlineTime = task.date; // Midnight of the deadline day
        let hasTime = false;

        if (task.time) {
          const [hours, minutes] = task.time.split(":").map(Number);
          deadlineTime += (hours * 60 * 60 * 1000) + (minutes * 60 * 1000);
          hasTime = true;
        } else {
          // If no time is specified, assume deadline is effectively end of day, but we'll notify at 9 AM
          // actually let's stick to the midnight base for calculations.
          // Adjust midnight to something reasonable like 9 AM for the "on the day" notification.
          deadlineTime += 9 * 60 * 60 * 1000;
        }

        // Define thresholds
        const thresholds = {
          "1_week": deadlineTime - 7 * 24 * 60 * 60 * 1000,
          "2_days": deadlineTime - 2 * 24 * 60 * 60 * 1000,
          "1_day": deadlineTime - 1 * 24 * 60 * 60 * 1000,
          "0_days": deadlineTime, // On the deadline day (at 9AM if no time, or exact time)
        };

        if (hasTime) {
          thresholds["30_mins"] = deadlineTime - 30 * 60 * 1000;
        }

        // Sort thresholds from most recent to oldest so we only trigger the most relevant one if they open the app after being away
        const sortedThresholdKeys = Object.keys(thresholds).sort((a, b) => thresholds[b] - thresholds[a]);

        let triggeredAny = false;

        for (const key of sortedThresholdKeys) {
          const thresholdTime = thresholds[key];

          // If we have passed this threshold
          if (now >= thresholdTime) {
            // If we haven't notified for this threshold yet
            if (!notifiedState[taskId].includes(key)) {
              // And the deadline hasn't completely passed yet (allow up to 2 hours after exact time)
              if (now < deadlineTime + (hasTime ? 2 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000)) {
                // If we haven't triggered anything yet in this loop, trigger the most recent applicable one
                if (!triggeredAny) {
                  const title = `Reminder: ${task.title}`;
                  let body = "";
                  const daysLeft = Math.round((deadlineTime - now) / (24 * 60 * 60 * 1000));

                  if (key === "1_week") {
                    body = `Due in ${daysLeft > 1 ? daysLeft : 7} days`;
                  } else if (key === "2_days") {
                    body = `Due in ${daysLeft > 1 ? daysLeft : 2} days`;
                  } else if (key === "1_day") {
                    body = "Due tomorrow";
                  } else if (key === "0_days") {
                    body = hasTime ? `Due today at ${task.time}` : "Due today";
                  } else if (key === "30_mins") {
                    const minsLeft = Math.max(0, Math.round((deadlineTime - now) / 60000));
                    body = minsLeft === 0 ? `Due now (${task.time})` : `Due in ${minsLeft} minutes (${task.time})`;
                  }

                  new Notification(title, { body });
                  triggeredAny = true;
                }
              }
              // Mark as notified so we don't evaluate it again (even if we skipped triggering it to avoid spam)
              notifiedState[taskId].push(key);
            }
          }
        }
      });

      // --- TIMETABLE CLASSES ---
      const savedWeek = JSON.parse(localStorage.getItem(TIMETABLE_KEY)) || {};
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const todayDay = days[new Date().getDay()];
      const baseTodayClasses = savedWeek[todayDay] || [];

      // Read overrides
      const todayIso = new Date().toISOString().slice(0, 10);
      const overridesStr = sessionStorage.getItem("planly_timetableOverrides");
      const allOverrides = overridesStr ? JSON.parse(overridesStr) : {};
      const todayOverrides = allOverrides[todayIso] || { cancelled: [], postponed: {} };

      const todayClasses = baseTodayClasses
        .map((cls, idx) => ({ ...cls, originalIndex: idx }))
        .filter(cls => !todayOverrides.cancelled.includes(cls.originalIndex))
        .map(cls => {
          const postponed = todayOverrides.postponed[cls.originalIndex];
          return postponed ? { ...cls, ...postponed } : cls;
        });

      const todayMidnight = new Date();
      todayMidnight.setHours(0, 0, 0, 0);
      const midnightMs = todayMidnight.getTime();

      todayClasses.forEach((cls) => {
        const classId = `class_${midnightMs}_${cls.subject}_${cls.start}`;
        if (!notifiedState[classId]) {
          notifiedState[classId] = [];
        }

        const classStartTime = midnightMs + Number(cls.start) * 60 * 60 * 1000;
        const classEndTime = midnightMs + Number(cls.end) * 60 * 60 * 1000;
        const thresholdTime = classStartTime - 15 * 60 * 1000;

        if (now >= thresholdTime) {
          if (!notifiedState[classId].includes("15_mins")) {
            // Valid as long as the class hasn't ended yet
            if (now < classEndTime) {
              const title = `Class Reminder: ${cls.subject}`;
              const diffMins = Math.round((classStartTime - now) / 60000);
              const timeString = formatTime(cls.start);
              let body = "";

              if (diffMins > 0) {
                body = `Starts in ${diffMins} minutes (${timeString})${cls.venue ? ` at ${cls.venue}` : ""}`;
              } else if (diffMins === 0) {
                body = `Starting now (${timeString})${cls.venue ? ` at ${cls.venue}` : ""}`;
              } else {
                body = `Started ${Math.abs(diffMins)} minutes ago (${timeString})${cls.venue ? ` at ${cls.venue}` : ""}`;
              }

              new Notification(title, { body, tag: classId });
            }
            notifiedState[classId].push("15_mins");
          }
        }
      });

      localStorage.setItem(NOTIFICATIONS_STATE_KEY, JSON.stringify(notifiedState));
    };

    // Check immediately on mount
    checkNotifications();

    // Ask for permission on first user interaction to bypass browser blocking
    const requestPerm = async () => {
      if (Notification.permission === "default") {
        const perm = await Notification.requestPermission();
        if (perm === "granted") {
          checkNotifications();
        }
      }
      document.removeEventListener("click", requestPerm);
    };
    document.addEventListener("click", requestPerm);

    // Check every minute
    const intervalId = setInterval(checkNotifications, 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);
}
