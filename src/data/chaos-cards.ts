import type { ChaosCard } from '../types/game'

export const CHAOS_CARDS: ChaosCard[] = [
  // Weather
  { id: 'rain',     type: 'Weather',      title: 'Heavy Rain',                     desc: 'The heaven opens up. The pitch is waterlogged. The ball flies at weird angles.',               effects: 'Pace -2, Pass Accuracy -10%',                                    tip: 'Studs required.' },
  { id: 'frozen',   type: 'Pitch/Weather', title: 'Frozen Ground',                  desc: 'Solid rock pitch. First touch is incredibly hard, but sliding tackles travel further.',        effects: 'First Touch check harder, Tackles easier',                       tip: 'Mind your ankles.' },
  { id: 'fog',      type: 'Weather',      title: 'Fog Patch',                      desc: 'You cannot see the other side of the pitch. Tactically, it is absolute chaos.',               effects: 'Opponent and player goals chance reduced',                       tip: 'Stick to short passes.' },
  { id: 'sunshine', type: 'Weather',      title: 'Glorious Sunshine',              desc: 'Absolutely boiling. Glare off the penalty box blinding the keeper.',                          effects: 'Keeper save rating reduced',                                     tip: 'Shoot from distance.' },
  { id: 'hail',     type: 'Weather',      title: 'Hailstorm Mid-Match',            desc: 'Painful ice pellets hit you from side-on. Everyone is freezing.',                            effects: 'All stats -1 for key match moments',                             tip: 'No easy touches.' },

  // Pitch
  { id: 'boggy',     type: 'Pitch', title: 'Boggy Pitch',                      desc: 'Standard Wetherspoons Lane. Mud up to your shins.',                                          effects: 'First Touch harder, stamina drains faster',                      tip: 'Play simple football.' },
  { id: 'slope',     type: 'Pitch', title: 'One End Slopes',                   desc: 'The pitch has a steep three-metre drop to the east end.',                                    effects: 'Attacking into the slopes creates chaotic bounces',               tip: 'Aim low.' },
  { id: 'mudbox',    type: 'Pitch', title: 'Waterlogged Penalty Box',          desc: 'The goalmouth has turned into a shallow bog.',                                               effects: 'High chance of slipping during shot moments',                    tip: 'Aim for corners.' },
  { id: 'goals',     type: 'Pitch', title: 'Goalposts Not Regulation Width',   desc: 'Pete thinks the crossbar is slightly slanted, and Clive does not care.',                    effects: 'Higher woodwork chance on all strike attempts',                  tip: 'Do not hit it too clean.' },
  { id: 'frosthalf', type: 'Pitch', title: 'Half Pitch Frosted',               desc: 'One half is in the sun, the other is basically an ice rink.',                               effects: 'Pace advantage nullified on the cold side',                      tip: 'Rotate play quickly.' },

  // Availability
  { id: 'keeper_late', type: 'Availability', title: 'Keeper is Late',    desc: 'Deano is still asleep after a heavy night. Big Taz has to put the gloves on.',        effects: 'Defensive moment checks are much harder',              tip: 'Vocal leadership helps.' },
  { id: 'bare_eleven', type: 'Availability', title: 'Bare Eleven',       desc: 'Exactly eleven players turned up. No subs, no rest.',                                 effects: 'Massive fatigue penalty at end of match',              tip: 'Manage your stamina.' },
  { id: 'short_squad', type: 'Availability', title: 'Short Squad',       desc: 'We start with nine men. Gary arrives late looking extremely panicked.',              effects: 'Moment difficulty increased in first half',            tip: 'Keep possession.' },
  { id: 'hangover',    type: 'Availability', title: 'Hangover XI',       desc: 'The pub session was too good. Half the team looks green.',                           effects: '-2 to all stats if team pub night chosen',            tip: 'Sweat it out.' },
  { id: 'gary_starts', type: 'Availability', title: 'Gary Starts',       desc: 'Gary is in the lineup. Pete is beaming, everyone else is sighing.',                 effects: 'Lower base team rating',                               tip: 'Support the lad.' },

  // Team Drama
  {
    id: 'row', type: 'Drama', title: 'Dressing Room Row',
    desc: 'Taz and Callum had a shouting match about a missed pass in warm-up.',
    effects: 'Chemistry -15 before kickoff. Winning restores it.',
    tip: 'Try to link up with both.',
    choices: [
      { text: 'Stay out of it. Let Pete handle it.',   effect: {},                                                              outcome: 'You keep your head down.' },
      { text: 'Step in and mediate between them.',      effect: { relationship: { bigtaz: 8, callum: 8 }, teamChemistry: 5 },   outcome: 'They shake hands. Reluctantly.' },
    ],
  },
  { id: 'callum_wants', type: 'Drama', title: 'Callum Wants Away',          desc: 'Callum is sulking because a local scout has not talked to him.',                 effects: '-3 to all moments involving winger assists',           tip: 'Ignore his complaints.' },
  { id: 'confront',     type: 'Drama', title: 'Captain Confronts Manager',  desc: 'Taz told Pete the 3-5-2 is garbage. Reverted to 4-4-2 immediately.',           effects: 'Pete starts in a foul mood',                           tip: 'Do not dissent.' },
  { id: 'money',        type: 'Drama', title: 'Someone Owes Someone Money', desc: 'Ten quid from the pub quiz has caused a massive rift.',                         effects: 'Relationship scores drop slightly for squad members',   tip: 'Buy a round.' },
  { id: 'kit_mixup',    type: 'Drama', title: 'Kit Mix-Up',                 desc: 'Bev left the home kit wet in the washing machine. Playing in bibs.',             effects: 'Morale -5 but hilarious newspaper post-match coverage', tip: 'Focus on the badge.' },

  // Rivalry
  { id: 'watching', type: 'Rivalry', title: 'Anchor Athletic Are Watching', desc: 'Rival scouts seen behind the hedge. They know exactly how you play.',        effects: 'Moment resolution difficulty increased',   tip: 'Try the unexpected.' },
  { id: 'nemesis',  type: 'Rivalry', title: 'The Nemesis Returns',          desc: 'Your personal rival is in their starting eleven today.',                    effects: 'Confidence checks during matches are harder', tip: 'Prove them wrong.' },
  {
    id: 'ref_clive', type: 'Rivalry', title: 'Referee Clive',
    desc: 'Clive is refereeing today. Zero tolerance for shouting.',
    effects: 'High dissent card risk on failures',
    tip: 'Keep your mouth shut.',
    choices: [
      { text: 'Stay quiet. Not worth a yellow.',  effect: { confidence: -5 },                   outcome: 'Smart. Clive is satisfied.' },
      { text: 'Protest the decision!',             effect: { refereeRep: -20, confidence: 10 }, outcome: 'Booked. Worth it though.' },
    ],
  },

  // Work/Life
  { id: 'double',   type: 'Work/Life', title: 'Worked a Double Shift',  desc: 'You have been on your feet for sixteen hours before kickoff.',           effects: 'Start match with +20 fatigue',                      tip: 'Take simple touches.' },
  { id: 'rel_drama', type: 'Work/Life', title: 'Relationship Drama',    desc: 'Your phone is buzzing in the dressing room. You are completely distracted.', effects: 'Morale and composure check penalised',              tip: 'Put the phone away.' },
  {
    id: 'bollocking', type: 'Work/Life', title: 'Bollocking at Work',
    desc: 'Your manager yelled at you on Friday. You are playing with a point to prove.',
    effects: 'Form -1, but extra Strike boost during shots',
    tip: 'Unleash the anger.',
    choices: [
      { text: 'Channel it. Use the anger.',      effect: { confidence: 15, strike: 1 }, outcome: "You're playing with fury today." },
      { text: 'Deep breaths. Stay professional.', effect: { confidence: 5 },            outcome: 'Cool head. Smart call.' },
    ],
  },
  {
    id: 'horses', type: 'Work/Life', title: 'Won £50 on the Horses',
    desc: 'Absolute result. You are flying high.',
    effects: '+10 confidence boost',
    tip: 'Play with freedom.',
    choices: [
      { text: 'Buy a round for the lads.', effect: { teamChemistry: 15, confidence: 5 }, outcome: 'Legend. Absolute legend.' },
      { text: 'Save it. You need new boots.', effect: { confidence: 10 },                outcome: 'Sensible. But slightly boring.' },
    ],
  },

  // Fitness/Injury
  { id: 'hamstring',  type: 'Fitness', title: 'Niggly Hamstring',         desc: 'Your left hamstring feels tight. You cannot sprint properly.',                  effects: 'Pace -3, high risk of pulling up',               tip: 'Avoid long runs.' },
  { id: 'taz_strap',  type: 'Fitness', title: 'Big Taz Needs Strapping',  desc: 'Taz is playing but his knee is wrapped in two rolls of heavy tape.',           effects: 'Opponent runs are harder to track',               tip: 'Help defend.' },
  { id: 'deano_back', type: 'Fitness', title: "Deano's Back Complaint",   desc: 'Deano is complaining loudly about his back every time he bends down.',         effects: 'Goalkeeper save parameters reduced by 2',        tip: 'Protect the goal.' },

  // Social
  { id: 'legendary_train', type: 'Social', title: 'Legendary Training Session', desc: 'You actually did a proper warm-up drill and team runs.',           effects: 'Chemistry +10, Confidence +5',            tip: 'Build on the momentum.' },
  { id: 'brawl',           type: 'Social', title: 'Pub Brawl Aftermath',        desc: 'A disagreement at the karaoke night got two of our squad suspended.', effects: 'Fewer available teammates in match moments', tip: 'Carry the workload.' },
  { id: 'club_trip',       type: 'Social', title: 'Club Trip Was Last Night',   desc: 'Blackpool away was epic, but the bus ride back was rough.',          effects: '-1 to all stats, team Vibes are legendary', tip: 'Enjoy the match.' },
  { id: 'fundraiser',      type: 'Social', title: 'Fundraiser Hangover',        desc: 'Raised £400 for the new goal nets. A great night, terrible morning.',  effects: 'Vibes +10, Fitness -5',                    tip: 'Play for the fans.' },
]
