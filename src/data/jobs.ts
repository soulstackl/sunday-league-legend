import type { Job } from '../types/game'

export const JOBS: Job[] = [
  {
    id: 'builder',
    name: 'Builder',
    modifier: { graft: 2, engine: 1 },
    trait: 'Early Riser',
    text: 'Hard graft comes naturally. Shift work means your training time is unpredictable.',
  },
  {
    id: 'teacher',
    name: 'Teacher',
    modifier: { pass: 2, head: 1 },
    trait: 'Vocal Leader',
    text: 'You spend all day organising chaos. Sunday league feels familiar.',
  },
  {
    id: 'nurse',
    name: 'Nurse / NHS worker',
    modifier: { engine: 2, graft: 1 },
    trait: 'Iron Lungs',
    text: "Shift work destroys your sleep. Your fitness is extraordinary.",
  },
  {
    id: 'office',
    name: 'Office worker',
    modifier: { vibes: 2, touch: 1 },
    trait: 'Five-a-side Regular',
    text: 'Wednesday lunchtime five-a-side keeps you sharp. Friday drinks do not.',
  },
  {
    id: 'delivery',
    name: 'Delivery driver',
    modifier: { pace: 2, engine: 1 },
    trait: 'Always Moving',
    text: "You're on your feet all day. Your engine is solid. Your knees, less so.",
  },
  {
    id: 'student',
    name: 'Student',
    modifier: { vibes: 2, pace: 1 },
    trait: 'Cheap Round',
    text: 'Maximum availability, minimum budget. Your social game is unmatched.',
  },
  {
    id: 'selfemployed',
    name: 'Self-employed',
    modifier: { strike: 1, vibes: 1 },
    trait: 'Flexible Schedule',
    text: 'You set your own hours. Which means training is either every day or never.',
  },
]
