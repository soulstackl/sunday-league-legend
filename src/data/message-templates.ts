import type { ChatMessage } from '../types/game'

export const MESSAGE_TEMPLATES: Record<string, ChatMessage[]> = {
  preMatch: [
    { sender: 'pete',       text: 'Big match today lads. Anchor Athletic. No messing about.',              time: '7:45am' },
    { sender: 'deano',      text: 'Still in bed but I will be there. I am leaving in five minutes.',       time: '8:12am' },
    { sender: 'bigtaz',     text: 'I have got the water bottles. Make sure someone brings the pump.',      time: '8:20am' },
    { sender: 'gav',        text: 'I am starting upfront today Pete yeah? My boots are clean.',            time: '8:22am' },
    { sender: 'garyNephew', text: 'I am ready to give it one hundred and ten percent gaffer!',             time: '8:25am' },
    { sender: 'bev',        text: 'Bring your match fees. Three pounds each. Exact change please.',        time: '8:30am' },
    { sender: 'callum',     text: 'Is the pitch cut? Last week was like playing in a field.',              time: '8:35am' },
    { sender: 'dazza',      text: 'I am absolutely buzzing. Let us smash these today.',                    time: '8:40am' },
    { sender: 'shaz',       text: 'Simple football today. Play the channels.',                             time: '8:42am' },
    { sender: 'pete',       text: 'Gary is starting because Gary actually turns up to training.',          time: '8:45am' },
    { sender: 'gav',        text: 'Pete please.',                                                          time: '8:47am' },
    { sender: 'deano',      text: 'Traffic is absolute murder near the bypass. Standby.',                  time: '8:50am' },
    { sender: 'bigtaz',     text: 'Deano you are literally five minutes down the road.',                   time: '8:52am' },
    { sender: 'deano',      text: 'I am moving. Mostly.',                                                  time: '8:53am' },
    { sender: 'bev',        text: 'Last warning, no fees, no football.',                                   time: '8:55am' },
    { sender: 'pete',       text: 'Who has the first aid kit? Deano says his back is gone again.',         time: '8:57am' },
    { sender: 'bigtaz',     text: 'I have it. Also have the deep heat. Gary, stay away from it.',          time: '8:58am' },
    { sender: 'garyNephew', text: "Sorry Taz. Won't happen again.",                                        time: '8:59am' },
  ],
  postMatchWin: [
    { sender: 'pete',       text: 'Brilliant shift today lads. That is what I want to see.',               time: '2:30pm' },
    { sender: 'gav',        text: 'Unbelievable win. I told you I would deliver if you square it.',        time: '2:35pm' },
    { sender: 'deano',      text: 'I had that goal covered anyway. Great clean sheet.',                    time: '2:40pm' },
    { sender: 'bigtaz',     text: 'Clean sheet is down to the graft at the back. Solid.',                  time: '2:42pm' },
    { sender: 'dazza',      text: 'Who is buying the first round at the Duck? I am parched.',              time: '2:45pm' },
    { sender: 'garyNephew', text: 'Unreal match! Cheers gaffer for the sub appearance!',                   time: '2:48pm' },
    { sender: 'shaz',       text: 'Played some decent stuff today. Simple but effective.',                 time: '2:50pm' },
    { sender: 'bev',        text: 'Match fees paid. Mostly. Gav, see me later.',                           time: '2:55pm' },
  ],
  postMatchDraw: [
    { sender: 'pete',       text: 'A point is a point. We will take it. Move on.',                         time: '2:30pm' },
    { sender: 'bigtaz',     text: 'Honest result that. Both teams could have nicked it.',                  time: '2:33pm' },
    { sender: 'shaz',       text: 'Should have been more clinical. We had the chances.',                   time: '2:38pm' },
    { sender: 'dazza',      text: 'Going for a pint either way. Whose round?',                             time: '2:42pm' },
    { sender: 'callum',     text: 'Felt like a win and a loss at the same time. Weird one.',               time: '2:46pm' },
    { sender: 'bev',        text: 'Decent point, lads. Now hand the kits in this time please.',            time: '2:55pm' },
  ],
  postMatchLoss: [
    { sender: 'pete',       text: 'Absolute rubbish. We did not work hard enough. Simple as.',             time: '2:30pm' },
    { sender: 'bigtaz',     text: 'Ref was a joke today. Never a penalty in a million years.',             time: '2:32pm' },
    { sender: 'callum',     text: 'Can we please pass the ball when I make the run?',                      time: '2:35pm' },
    { sender: 'shaz',       text: 'We were chasing shadows in the second half.',                           time: '2:38pm' },
    { sender: 'deano',      text: 'Sun was in my eyes for the third one, to be fair.',                     time: '2:40pm' },
    { sender: 'pete',       text: 'We go again next week. Training is mandatory.',                         time: '2:45pm' },
    { sender: 'gav',        text: 'I was onside for that goal. Absolute daylight between us.',             time: '2:50pm' },
    { sender: 'garyNephew', text: "Sorry gaffer. I'll train harder this week.",                            time: '2:55pm' },
  ],
  midweek: [
    { sender: 'pete',   text: 'Training on Wednesday. 7pm sharp. Be there.',                              time: 'Mon 4:00pm' },
    { sender: 'deano',  text: 'I have got a shift, might be five minutes late.',                           time: 'Mon 4:15pm' },
    { sender: 'gav',    text: 'Who is washing the bibs? They absolute stink.',                             time: 'Tue 10:00am' },
    { sender: 'bev',    text: 'I washed them. It is your turn next week Gav.',                             time: 'Tue 10:15am' },
    { sender: 'dazza',  text: 'Anyone fancy a quick pint at the Duck tonight?',                            time: 'Tue 6:00pm' },
    { sender: 'bigtaz', text: 'Aye, I am in. Just the one.',                                               time: 'Tue 6:05pm' },
  ],
}

export const CHOICE_MESSAGES: Record<string, ChatMessage> = {
  'training-banter': {
    sender: 'pete',
    text: "Right, good session today. I saw you grafting. That's what I want to see from you.",
    time: 'Wed 8:30pm',
    choices: [
      { text: 'Cheers gaffer. Felt sharp.',                       effect: { relationship: { pete: 8 }, vibes: 1 } },
      { text: 'Tell Gav to stay onside in practice then.',         effect: { relationship: { pete: -3, gav: -8 } } },
      { text: "I'll be there every week, gaffer. No question.",   effect: { relationship: { pete: 12 }, vibes: 2 } },
    ],
  },
  'rest-day-message': {
    sender: 'deano',
    text: "Oi, you not at training? Pete is doing his head in. He's already picking Gary.",
    time: 'Wed 7:20pm',
    choices: [
      { text: "Tell him I'm managing a knock. Body needed it.",   effect: { relationship: { deano: 5, pete: -3 } } },
      { text: 'I know, I know. Just needed the rest mate.',       effect: { relationship: { deano: 5 } } },
      { text: "He can ring me himself if he's that bothered.",    effect: { relationship: { deano: -5, pete: -10 } } },
    ],
  },
  'pub-night-chaos': {
    sender: 'dazza',
    text: 'Absolute scenes at the Duck. Gav is buying rounds until someone agrees he was onside against Anchor Athletic three weeks ago.',
    time: 'Tue 10:45pm',
    choices: [
      { text: 'He was onside. Definitely. Get the pints in Gav.',    effect: { relationship: { gav: 15, dazza: 5 } } },
      { text: "He was three yards off. He's always three yards off.", effect: { relationship: { gav: -10, dazza: 10 } } },
      { text: "I'm staying well out of this one.",                    effect: {} },
    ],
  },
  'overtime-excuse': {
    sender: 'pete',
    text: 'Missed training again. I hope there is a decent reason for this. Gary was there. Gary.',
    time: 'Wed 9:00pm',
    choices: [
      { text: 'Emergency at work gaffer. No choice in it.',       effect: { relationship: { pete: -3 } } },
      { text: "I'll put in extra work before Sunday, I promise.", effect: { relationship: { pete: 5 } } },
      { text: "Sorry gaffer. Won't happen again.",                effect: { relationship: { pete: 2 } } },
    ],
  },
  'patch-up': {
    sender: 'bigtaz',
    text: 'Saw you buying them a pint and having a proper chat. Respect for that mate. Team is a team.',
    time: 'Thu 7:15pm',
    choices: [
      { text: 'Just needed to clear the air. Fresh start.',      effect: { relationship: { bigtaz: 8 } } },
      { text: 'Hopefully they appreciate the gesture.',          effect: { relationship: { bigtaz: 5 } } },
      { text: "It's what the team needed. We move together.",    effect: { relationship: { bigtaz: 10 }, vibes: 2 } },
    ],
  },
}
