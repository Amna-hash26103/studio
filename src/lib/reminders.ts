
'use client';

import { toast } from '@/hooks/use-toast';

const waterReminders = [
  { title: "💧 Hydration Check-in 💧", description: "that water bottle lookin' lonely. time to hydrate or diedrate." },
  { title: "✨ Main Character Moment ✨", description: "bffr, you haven't had water in a while. go drink some!" },
  { title: "👑 Reminder, Queen 👑", description: "spill the tea... or just drink some water. stay hydrated." },
  { title: " thirsty?", description: "ur body is begging for water rn, don't let it down." },
];

const mealReminders = [
  { title: "Fuel Up! 🍔", description: "tummy rumbling? sounds like main character energy. go eat something yummy." },
  { title: "What's Cookin'? 🤔", description: "pov: you're about to eat the best meal of your day. what's on the menu?" },
  { title: "Nom Nom Time 😋", description: "it's time to log that delicious meal you just had. don't keep me waiting!" },
  { title: "don't forget to eat!", description: "food is fuel. your body will thank you for it. 💖" },
];

const reminders = {
  water: waterReminders,
  meal: mealReminders,
};

type ReminderType = keyof typeof reminders;

/**
 * Schedules a random reminder notification to appear after a delay.
 * @param type The type of reminder to schedule ('water' or 'meal').
 * @returns The timeout ID for the scheduled reminder.
 */
export function scheduleReminder(type: ReminderType): NodeJS.Timeout {
  const reminderList = reminders[type];
  const randomReminder = reminderList[Math.floor(Math.random() * reminderList.length)];
  
  // Set a random delay between 30 seconds and 2 minutes for variety
  const randomDelay = 30000 + Math.random() * 90000;

  const timeoutId = setTimeout(() => {
    toast({
      title: randomReminder.title,
      description: randomReminder.description,
    });
  }, randomDelay);

  return timeoutId;
}

    