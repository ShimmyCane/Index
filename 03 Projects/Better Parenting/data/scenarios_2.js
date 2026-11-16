// Scenarios, part 2: friends, siblings, screens, worries, honesty, responsibility.
(function () {
  var S = BP.S;

  // ---------- Friends and social ----------
  S('friends-01', '"Nobody played with me today"', 'K 12', 'friends',
    'At bedtime they say they were alone at recess and no one would play.',
    'It may be one bad recess or a pattern. They need to be heard before they need a plan.',
    ['Listen. Don\'t interrogate.', 'Accept the lonely feeling.', 'Ask what they tried and what they wish had happened.'],
    'That sounds lonely. I\'m glad you told me. What happened when recess started?', 'I\'m sure that\'s not true. You have lots of friends.', 'Practise joining words ("Can I be the goalie?"). Invite one child over. Ask the teacher what recess looks like.', 'coach scaffold');
  S('friends-02', 'Best friend says "you\'re not my friend any more"', 'K 12', 'friends',
    'Their closest friend dropped them today, loudly, in front of others.',
    'At this age friendships break and mend in a day. The hurt is still real.',
    ['Comfort first.', 'Don\'t criticise the friend. They may be friends again tomorrow.', 'Ask what they want to do next.'],
    'Ouch. That really hurts. Do you want a hug or do you want to think about what to do?', 'She\'s a horrible girl. Stay away from her.', 'Talk about what a good friend does. Help them widen the circle so one friend is not everything.', 'coach planb');
  S('friends-03', 'Being left out of a party or a group', '12 35', 'friends',
    'Everyone is talking about a party they weren\'t invited to, or a group chat they are not in.',
    'Belonging matters more each year. Exclusion hurts the way a physical injury does.',
    ['Sit with the hurt. Resist fixing.', 'Avoid calling the other parent in the heat of it.', 'Plan something good for that day.'],
    'Being left out is one of the worst feelings. I\'m sorry. I\'m here.', 'You didn\'t want to go to that silly party anyway.', 'Notice whether it is one event or a pattern. Help grow friendships outside that group (a team, a club, cousins).', 'coach connect');
  S('friends-04', 'Your child is the one being unkind', 'K 12 35', 'friends',
    'You see or hear that your child excluded, teased or bossed another child.',
    'Children try out power. It does not make them a bully. It needs a calm, clear response.',
    ['Talk privately. Describe what you saw, without labels.', 'Ask how they think the other child felt.', 'Ask how they will put it right.'],
    'I heard you tell Max he couldn\'t play. How do you think that felt for him? What could you do now?', 'You\'re being a bully. I\'m ashamed of you.', 'Look for what was behind it (wanting to belong, copying, feeling small). Praise kindness you see, specifically.', 'coach conseq praise');
  S('friends-05', 'Possible bullying', '12 35', 'friends',
    'The same child or group keeps targeting them: names, shoving, threats, or online. They don\'t want to go to school.',
    'Bullying is repeated, on purpose and with a power difference. Children cannot solve it alone, and often hide it.',
    ['Believe them. Thank them for telling you.', 'Say clearly: it is not your fault.', 'Get facts (who, where, when) and tell the school in writing.'],
    'I\'m so glad you told me. This is not your fault, and we\'re going to deal with it together.', 'Just ignore them. / Hit them back.', 'Follow up with the school until it stops. Practise a firm "Stop" and walking to an adult. Keep friendships outside school strong.', 'coach connect scaffold');
  S('friends-06', 'Bossy with friends, or always needs to win', 'K 12', 'friends',
    'Playdates end in tears because your child makes all the rules and changes them.',
    'They have strong ideas and weak flexibility. They do not yet see the game from the other side.',
    ['Step in early with a quiet word, not a public one.', 'Suggest turns at choosing.', 'Notice any moment of give-and-take.'],
    'It\'s Ali\'s turn to choose the game. You\'ll choose the next one.', 'No one will want to play with you if you\'re bossy.', 'Before the playdate, agree: guest picks first. Play turn-taking games at home.', 'setup praise coach');
  S('friends-07', 'Shy and won\'t join in', 'K 12', 'friends',
    'At a party or new activity they hide behind you and refuse to take part.',
    'Slow-to-warm-up is a temperament, not a fault. Pushing or rescuing both make it stickier.',
    ['Arrive early so the room fills around them.', 'Stay beside them and describe what the others are doing.', 'Let them go at their own pace. Don\'t label them shy to others.'],
    'It takes a little while to get used to a new place. We\'ll watch together until you\'re ready.', 'Go on, don\'t be shy! / She\'s shy (to other adults).', 'Preview new places. Praise small brave steps afterwards.', 'brave setup');
  S('friends-08', 'A friend you don\'t like', '35', 'friends',
    'Their new friend is rude, wild or pushes your child into things you don\'t allow.',
    'Forbidding a friend makes them more attractive. Your influence comes through staying close.',
    ['Have the friend at your house, with your rules.', 'Ask your child open questions about the friendship.', 'Name specific behaviour, not the person.'],
    'What do you like about hanging out with him? How do you feel after you\'ve been together?', 'I don\'t want you seeing that boy any more.', 'Keep talking about what a good friend does. Hold your family rules whoever is visiting.', 'coach planb');
  S('friends-09', 'Peer pressure and "everyone else has one"', '35', 'friends',
    'They insist everyone in the class has a phone, or plays a game you don\'t allow.',
    'Fitting in is a real need at this age, not shallowness. They also need you to hold a line.',
    ['Take the feeling seriously.', 'Give your reason once.', 'Look for a middle step you can say yes to.'],
    'It\'s hard to be the one without it. I get that. Here\'s what we can do for now.', 'If everyone jumped off a bridge, would you?', 'Check with other parents: "everyone" is often three children. Review the rule on a set date.', 'coach planb media');
  S('friends-10', 'Tattling on everyone', 'K 12', 'friends',
    'They report every small rule broken by classmates and siblings.',
    'Rules have just become very important. They are checking that the rules are real.',
    ['Thank them for knowing the rule.', 'Teach the difference: telling to get help, or telling to get someone in trouble.', 'Ask: "Is anyone hurt or in danger?"'],
    'You know the rules well. Is someone getting hurt? If not, you can let it go or use your words with them.', 'Nobody likes a tattletale.', 'Make sure real safety reports are always welcomed and praised.', 'coach scaffold');

  // ---------- Siblings ----------
  S('sibs-01', 'Fighting over the same toy', 'K 12', 'sibs',
    'Both are pulling on the same toy, screaming "Mine!"',
    'The toy matters less than winning. Deciding who had it first turns you into a judge they compete for.',
    ['Put a hand on the toy. Calm voice.', 'Describe: two kids, one toy.', 'Ask for ideas. If none, the toy rests and they try again in five minutes.'],
    'Two kids want one truck. That\'s hard. What\'s a plan that works for both of you?', 'Give it to your sister, you\'re the big one.', 'Teach turns with a timer. Each child has a few things that are theirs and need not be shared.', 'coach planb');
  S('sibs-02', 'One sibling hits or hurts the other', 'K 12 35', 'sibs',
    'You hear a scream. One child has hit, bitten or kicked the other.',
    'Hurting is a line. The hurt child needs you first, which also removes the reward of attention for hitting.',
    ['Go to the hurt child first.', 'Then, calmly, to the other: "I won\'t let you hurt."', 'Separate to cool down. Talk later.'],
    'Hitting hurts. You two need space. We\'ll talk when bodies are calm.', 'How would you like it if I hit you?', 'Later: what happened before? What can you do next time you\'re that angry? How will you make it right?', 'coach conseq calmplan');
  S('sibs-03', '"It\'s not fair! She got more!"', 'K 12 35', 'sibs',
    'They count crackers, minutes and presents. Any difference causes an uproar.',
    'Fair to a child means identical. What they really ask is: do I matter as much?',
    ['Don\'t measure or defend.', 'Speak to the need of the child in front of you.', 'Give according to need, not equal amounts.'],
    'Are you still hungry? I\'ll get you more. / You\'d like time with me too. Let\'s plan it.', 'Life isn\'t fair. Stop counting.', 'One-on-one time for each child each week. Say what you love about each without comparing.', 'coach special');
  S('sibs-04', 'Constant bickering and name-calling', '12 35', 'sibs',
    'Nothing serious, but the picking never stops: "Stop looking at me." "You\'re so annoying."',
    'Bickering is often boredom, or a bid for your attention. An audience keeps it going.',
    ['If no one is hurt, stay out or leave the room.', 'If it annoys you: "Take it somewhere else."', 'Give attention when it stops, not when it starts.'],
    'I trust you two to work this out. If you need help, come and find me calmly.', 'Refereeing every exchange.', 'Family rule: no name-calling, a redo is expected. Notice out loud when they are kind to each other.', 'praise scaffold');
  S('sibs-05', 'Older one bosses or excludes the younger', '12 35', 'sibs',
    'The older child won\'t let the younger one join, or orders them around.',
    'The older child needs space and status. The younger wants to belong. Both needs are fair.',
    ['Protect the older child\'s right to some time alone.', 'Protect the younger from unkindness.', 'Agree times: together and apart.'],
    'You can have 30 minutes on your own. Then find one game you can both play.', 'You have to let your brother play. He\'s only little.', 'Give the older child a real, respected role sometimes (teacher, coach). Thank them for it.', 'planb praise');
  S('sibs-06', 'Younger one wrecks the older one\'s things', 'K 12 35', 'sibs',
    'The little one knocks down the Lego build or scribbles on the homework. The big one explodes.',
    'The older child\'s anger is justified. They need protection so they don\'t have to protect themselves with fists.',
    ['Take the older child\'s side on the facts.', 'Help the younger one make it right in a small way.', 'Solve the space problem.'],
    'You worked hard on that, and now it\'s broken. You\'re right to be upset. Let\'s find a safe place for your builds.', 'He\'s little. He didn\'t mean it. Don\'t make a fuss.', 'A shelf or table the younger one can\'t reach. A rule about asking before touching.', 'coach setup');
  S('sibs-07', 'Tattling on each other', 'K 12', 'sibs',
    'A stream of reports: "He\'s not doing his reading." "She took two biscuits."',
    'It is a way to look good to you by making the other look bad.',
    ['Don\'t act on tales about small things.', 'Speak to the teller\'s feeling.', 'Always act on safety.'],
    'Sounds like that bothered you. Is anyone hurt? Then that\'s for him and me to sort out.', 'Punishing the sibling on the teller\'s word.', 'Praise each child directly so no one needs the other to look bad.', 'coach praise');
  S('sibs-08', 'Jealous of the attention a sibling gets', 'K 12 35', 'sibs',
    'One child needs more of you right now (illness, homework help, a big event). The other acts up.',
    'Acting up is a reliable way to get you back. They can\'t yet say "I miss you".',
    ['Name it for them.', 'Promise a specific time, and keep it.', 'A minute of full attention now helps more than you expect.'],
    'I\'ve been busy with your sister a lot. I miss you too. After dinner, you and me, ten minutes, your choice.', 'Can\'t you see I\'m busy?', 'Ten minutes of special time each day for each child holds jealousy down better than anything else.', 'special coach');
  S('sibs-09', 'Rough play that always ends in tears', 'K 12', 'sibs',
    'Wrestling starts as fun and ends with someone crying every time.',
    'Rough play is good for children and teaches control. They need rules and a stop word.',
    ['Agree rules first: where, and a stop word.', 'Stop means stop at once.', 'Step in when faces change, before the tears.'],
    'Wrestling rules: on the rug, no faces, and "stop" means stop. If stop isn\'t heard, wrestling rests.', 'No more wrestling ever.', 'Join in sometimes. You model how to be strong and gentle at the same time.', 'setup conseq');
  S('sibs-10', 'Comparing: "You love him more"', '12 35', 'sibs',
    'In a hard moment they say you always take the other one\'s side, or love them more.',
    'They are asking for reassurance in the only way they can right now.',
    ['Don\'t defend or list evidence.', 'Hear the feeling under it.', 'Tell them something specific you love about them.'],
    'It feels like I\'ve been on her side lately. That must feel awful. Nobody could ever take your place with me.', 'That\'s ridiculous. I love you both exactly the same.', 'Look honestly at the last week. Plan time alone with them.', 'coach special repair');

  // ---------- Screens and media ----------
  S('screens-01', 'Meltdown when screen time ends', 'K 12 35', 'screens',
    'The timer goes. They scream, cry or throw the remote.',
    'Stopping a screen is a sharp drop in stimulation. The upset is partly physical.',
    ['Warn five minutes before, sitting beside them.', 'End at a natural break.', 'Off. Name the feeling. Have the next thing ready.'],
    'It\'s so hard to stop. The show is finished for today. Come and help me with the pancakes.', 'OK, five more minutes (after the scream).', 'Same time each day so it is not a daily negotiation. If the stop goes badly, tomorrow is shorter. If it goes well, say so.', 'setup conseq media');
  S('screens-02', 'Sneaking the tablet', '12 35', 'screens',
    'You find them with the tablet under the covers, or playing when they said they were reading.',
    'The pull is strong and their self-control is still growing. Make the environment do the work.',
    ['Stay calm. Take the device.', 'Say what you saw, without the trap question.', 'Devices live in a shared place from now on.'],
    'I found the tablet in your bed. It\'s hard to resist, so it will sleep in the kitchen.', 'I can never trust you again.', 'Passwords and a charging station. Give a way to earn back trust and freedom.', 'media conseq setup');
  S('screens-03', 'Begging for a phone or a new game', '35', 'screens',
    'Daily requests for a phone, a console, or a game rated above their age.',
    'They want what connects them to friends. You need facts before deciding.',
    ['Ask what they want it for.', 'Look at the game or app together.', 'Give a clear answer and a date to review it.'],
    'Show me the game. What do your friends do on it? ... Not this year. We\'ll look again in the summer.', 'No, because I said so. Stop asking.', 'Use age ratings and reviews. A family media plan gives the reasons before the asking starts.', 'media planb');
  S('screens-04', 'Saw something scary or inappropriate online', 'K 12 35', 'screens',
    'They come to you upset, or you discover they watched violence, pornography or a frightening video.',
    'Curiosity and accidents both happen. If telling you leads to punishment, they will stop telling you.',
    ['Stay calm. Thank them for telling you.', 'Ask what they saw and how it felt.', 'Give a simple, true explanation. Then fix the filters.'],
    'I\'m really glad you told me. You\'re not in trouble. What did you see? How did it make you feel?', 'What were you doing on that site?! That\'s it, no more internet.', 'Agree the rule: if something feels weird, close it and come to me. Use shared spaces and parental controls.', 'truth coach media');
  S('screens-05', 'Bored and whiny without a screen', 'K 12 35', 'screens',
    'With screens off they follow you around saying "I\'m bored. There\'s nothing to do."',
    'Boredom is uncomfortable, and it is where play and ideas start. Their boredom is not yours to solve.',
    ['Accept the feeling cheerfully.', 'Don\'t offer a list of ideas.', 'Stay calm and busy. It usually passes in 15 minutes.'],
    'Bored is a tricky feeling. I wonder what you\'ll come up with.', 'Fine, have the tablet then.', 'Keep an "I\'m bored" jar of ideas they wrote themselves. Leave materials out: boxes, tape, paper.', 'scaffold media');
  S('screens-06', 'Gaming is all they talk about and want', '35', 'screens',
    'They have dropped other interests. Every conversation and every free minute is the game.',
    'Games give mastery, friends and status. The question is what it is crowding out.',
    ['Show real interest. Play with them once.', 'Check the basics: sleep, school, moving, friends in person.', 'Agree limits together, written down.'],
    'Teach me how it works. What do you love about it? ... Let\'s make sure there\'s still room for football and sleep.', 'That game is rotting your brain.', 'Gaming after homework and outdoor time. Notice mood after long sessions and talk about it with them.', 'media planb connect');
  S('screens-07', 'Your own phone gets in the way', 'K 12 35', 'screens',
    'They say "you\'re always on your phone", or act up whenever you pick it up.',
    'Children read your attention exactly. Your habits are the family media plan they actually follow.',
    ['Put it down and look at them.', 'Thank them for saying it.', 'Set a phone-free time you keep too.'],
    'You\'re right. I\'m putting it away. Tell me again, I\'m listening now.', 'I\'m working. This is important.', 'Phone-free meals and bedtimes for everyone. Say out loud what you are doing on it when you must.', 'media repair special');
  S('screens-08', 'Group chat or online game drama', '35', 'screens',
    'A friend was mean in a chat, or they were kicked out of a game group, or they said something unkind themselves.',
    'Online, they cannot see faces, and words stay. The social skills needed are years ahead of them.',
    ['Listen to the whole story.', 'Read it together if they will show you.', 'Help them decide: reply, leave, apologise or tell an adult.'],
    'That would hurt. Do you want to work out what to say, or step away from it for tonight?', 'That\'s it, I\'m deleting the app.', 'Rule: never type what you wouldn\'t say to a face. Screenshots of anything threatening go to you.', 'coach media planb');

  // ---------- Worries and fears ----------
  S('worry-01', 'Clings and cries at drop-off', 'K 12', 'worry',
    'Weeks into the term, they still hold your leg and sob when you leave.',
    'Long goodbyes and returning for one more hug tell them there is something to fear.',
    ['One short, warm ritual.', 'Say when you will be back, in their terms.', 'Go, even if they cry. Most settle within minutes.'],
    'One hug, one high five, and I\'ll see you after story time. You can do this.', 'Lingering, coming back, or slipping away unseen.', 'Ask the teacher how quickly they settle. Read books about school goodbyes. Praise each brave morning.', 'brave setup');
  S('worry-02', 'Asks the same worried question again and again', '12 35', 'worry',
    '"Are you sure you locked the door?" "What if you\'re late?" Ten times a day.',
    'Each reassurance calms for a moment and feeds the worry. The asking becomes the habit.',
    ['Answer once, fully.', 'After that: accept and express confidence, don\'t answer again.', 'Redirect to something active.'],
    'I\'ve answered that one. I know the worry is loud, and I know you can handle the not-knowing.', 'Answering the fifteenth time. / Stop asking me that!', 'Agree in advance: one answer per worry. Give the worry a name. If it grows, ask the pediatrician about anxiety support.', 'brave calmplan');
  S('worry-03', 'Afraid of dogs, storms, bees or the doctor', 'K 12 35', 'worry',
    'They panic at the sight of a dog, or at thunder, or before a vaccination.',
    'Avoiding the thing gives relief and teaches that it is truly dangerous. Small steps teach the opposite.',
    ['Accept the fear.', 'Stay calm yourself. They borrow your calm.', 'One small step closer, at their pace.'],
    'Dogs feel scary to you. Let\'s stand here and watch that one from far away. You\'re doing it.', 'Don\'t be a baby, it won\'t hurt you. / Crossing the road every time.', 'Build a ladder: pictures, videos, far away, closer, a calm old dog. Praise each rung.', 'brave coach');
  S('worry-04', 'Tummy aches before school or events', 'K 12 35', 'worry',
    'Regular stomach aches or headaches that appear on school mornings and fade on weekends.',
    'Worry lives in the body. The pain is real, even when the cause is a feeling.',
    ['Take it seriously and check for illness.', 'Name the link gently: bodies can hurt when we worry.', 'Go anyway, with support.'],
    'Your tummy really hurts. Sometimes tummies hurt when there\'s a worry inside. What\'s the hard part of today?', 'You\'re faking. / OK, stay home.', 'See the pediatrician to rule out illness. Find the worry and solve that with the school.', 'brave coach planb');
  S('worry-05', 'Scared after hearing bad news', '12 35', 'worry',
    'They heard about a disaster, a war or a shooting and now ask if it will happen to them.',
    'They can understand more than they can cope with. They need facts sized to their age, and your calm.',
    ['Ask what they heard.', 'Correct mistakes simply. Don\'t add detail.', 'Say what keeps them safe and who the helpers are.'],
    'What have you heard? ... That did happen, far from here. Lots of grown-ups are working to keep people safe. You are safe at home and at school.', 'Don\'t think about that. / Leaving the news on.', 'Limit news in the background. Do something helpful together (a card, a donation).', 'truth brave coach');
  S('worry-06', 'Won\'t try anything new', 'K 12 35', 'worry',
    'Swimming lessons, a new food, a birthday party: the answer is always "no, I don\'t want to".',
    '"I don\'t want to" often means "I\'m afraid I can\'t". Being allowed to skip confirms the fear.',
    ['Say what will happen, step by step.', 'Shrink the first step.', 'Go, stay a set time, then they can choose.'],
    'New things feel wobbly at first. We\'ll go for 20 minutes. You can watch first.', 'You\'ll love it! / Fine, we won\'t go.', 'Afterwards, name the bravery, not the fun: "You were nervous and you did it anyway."', 'brave setup process');
  S('worry-07', 'Worries about you dying or getting hurt', 'K 12', 'worry',
    'Out of nowhere: "Are you going to die? What if you crash the car?"',
    'Around five to seven, children grasp that death is real and permanent. They need honesty and safety.',
    ['Answer truthfully and simply.', 'Give the reassurance that is true.', 'Stay close. Let them ask more.'],
    'Everyone dies one day, but I plan to be here for a very, very long time. I take good care of myself.', 'I\'ll never die. / Don\'t say things like that.', 'Expect it to come back. Books about life cycles help. Keep goodbyes confident.', 'truth brave');
  S('worry-08', 'Performance nerves: test, recital or game', '12 35', 'worry',
    'The night before a test or a show, they can\'t sleep and say they\'re going to fail.',
    'A racing heart before a challenge is the body getting ready. They read it as danger.',
    ['Accept the nerves as normal.', 'Reframe: nervous and excited feel the same in the body.', 'Slow breathing, then a normal routine.'],
    'Butterflies mean your body is getting ready to do something that matters to you.', 'Don\'t be nervous. You\'ll be great.', 'Afterwards, ask what helped. Praise showing up, whatever the result.', 'brave process calmplan');

  // ---------- Honesty ----------
  S('honest-01', 'Lies about something obvious', 'K 12', 'honest',
    'Chocolate on their face. "I didn\'t eat it."',
    'Under seven, a lie is often a wish that it hadn\'t happened. Asking the question invites the lie.',
    ['Don\'t ask what you already know.', 'State the fact.', 'Move to the fix.'],
    'I see chocolate on your chin. The chocolate was for after dinner. Let\'s wipe your face, and next time ask me.', 'Did you eat the chocolate? Tell me the truth!', 'Notice truth-telling: "You told me even though it was hard. I really respect that."', 'praise coach');
  S('honest-02', 'Lies about homework or chores being done', '12 35', 'honest',
    '"Yes, I\'ve done it." You check. It is not done.',
    'The lie buys time and avoids a boring task and a lecture. It usually means the task feels too big.',
    ['Say calmly what you found.', 'Do the task now, with a start from you.', 'One sentence about trust. No speech.'],
    'The reading isn\'t done. Let\'s do it now. When I can trust what you tell me, I don\'t need to check.', 'You\'re a liar. I can\'t believe a word you say.', 'Make telling the truth cheaper than lying: "If it\'s not done, just say so and we\'ll make a plan."', 'conseq planb praise');
  S('honest-03', 'Took something from a shop or a friend', 'K 12 35', 'honest',
    'You find a toy or sweets you didn\'t buy, or something from a classmate\'s bag.',
    'Young children are still learning ownership and impulse control. Older ones may be testing or wanting to fit in.',
    ['Stay calm. State what you found.', 'It goes back, with them, today.', 'They say sorry or pay for it. You stand beside them.'],
    'This isn\'t ours. We need to take it back. I\'ll come with you.', 'You\'re a thief. Do you want to go to jail?', 'Talk about how the owner felt. Give ways to earn what they want. If it repeats in an older child, look for what is behind it.', 'conseq coach');
  S('honest-04', 'Blames the sibling, the dog or "nobody"', 'K 12', 'honest',
    'The lamp is broken. "It wasn\'t me. He did it."',
    'Fear of your reaction is bigger than the wish to be honest.',
    ['Focus on the problem, not the culprit.', 'Involve everyone in the clean-up.', 'Make it safe to own up.'],
    'The lamp is broken. I\'m not looking for someone to be in trouble. I need help cleaning up, and I\'d like to know what happened.', 'Lining them up until someone confesses.', 'When someone owns up, thank them first. Keep the consequence about fixing.', 'talk praise');
  S('honest-05', 'Tall tales and bragging', 'K 12', 'honest',
    'They tell friends they have a pet tiger, or tell you they scored ten goals.',
    'Imagination and the wish to impress. It is not the same as lying to deceive.',
    ['Enjoy the story as a story.', 'Gently mark the line between wish and fact.', 'Give them real things to be proud of.'],
    'That sounds like a wish! Wouldn\'t that be amazing? What really happened at the game?', 'Stop lying. Nobody will believe you.', 'If bragging is constant, they may feel small. Notice real strengths out loud.', 'coach praise');
  S('honest-06', 'Cheating at games', 'K 12', 'honest',
    'They peek at cards, move pieces, and change the rules to win.',
    'Winning matters more than rules at this age. They cheat because losing feels unbearable.',
    ['Name it lightly, no shame.', 'Restate the rule and carry on.', 'If it continues, the game ends for now.'],
    'I saw the extra move. In this game we take one turn each. Shall we keep playing by the rules?', 'You\'re a cheater. I\'m not playing with you.', 'Play cooperative games. Praise fair play and good losing more than winning.', 'conseq praise');
  S('honest-07', 'Hiding things for privacy', '35', 'honest',
    'They close the door, cover the screen, and say "it\'s nothing" about a note or a message.',
    'A growing need for privacy is healthy. Secrecy about safety is different.',
    ['Respect the ordinary privacy.', 'Be clear about what you will always check (devices, safety).', 'Keep being interested without prying.'],
    'You\'re allowed private thoughts and a private diary. Online things I check, because keeping you safe is my job.', 'Reading the diary. / Demanding to know everything.', 'Trust builds freedom. Say that out loud, and give freedom when trust is shown.', 'planb media');
  S('honest-08', 'Cheated on a test or copied homework', '35', 'honest',
    'The teacher tells you they copied, or you see answers taken from a friend or the internet.',
    'Usually fear of failing or of disappointing you. The pressure to get it right beat the wish to learn.',
    ['Calm first. Ask for their side.', 'Find out what made the honest route feel impossible.', 'They put it right with the teacher.'],
    'I want to understand what happened. What made this test feel so scary?', 'How could you? I\'m so disappointed in you.', 'Check the pressure at home. Praise learning and honest low marks over high ones.', 'coach process conseq');

  // ---------- Responsibility ----------
  S('resp-01', 'Refuses to clean up toys', 'K 12', 'resp',
    'The floor is covered. You ask them to tidy and get "I\'m too tired" or a flop on the floor.',
    'A whole messy room is overwhelming. They can\'t see where to begin.',
    ['Make it small: "All the cars in this box."', 'Do it together, with a song or a race.', 'When it is done, then the next thing happens.'],
    'I\'ll do the blocks, you do the cars. When the floor is clear, we\'ll have the story.', 'If you don\'t pick them up, I\'m throwing them all away.', 'Fewer toys out, labelled boxes, a tidy-up time each day in the routine.', 'whenthen setup praise');
  S('resp-02', 'Won\'t do chores without a fight', '12 35', 'resp',
    'Every job needs five reminders and comes with complaining.',
    'Chores done only when nagged belong to the nagger. They need ownership.',
    ['Hold a family meeting. List the jobs.', 'Let them choose theirs and when.', 'One reminder, then the when-then.'],
    'These are the jobs that keep our house running. Which two do you want this month?', 'Paying for every small thing, or doing it yourself with a sigh.', 'Thank them specifically. Rotate jobs. Keep it tied to being part of the family, not to punishment.', 'planb whenthen praise');
  S('resp-03', 'Bedroom is a disaster', '35', 'resp',
    'Clothes on the floor, plates under the bed. They say it is their room.',
    'They have a point about it being their space. Hygiene and respect for the home are also fair.',
    ['Decide your few non-negotiables (food, laundry, a path).', 'Let the rest go.', 'One reset time each week.'],
    'Your room, your style. My rules are: no food left, washing in the basket, and Saturday reset before screens.', 'Daily battles over the bed being made.', 'Give them storage that works. Do the first reset together.', 'planb whenthen');
  S('resp-04', 'Wants everything in the shop', 'K 12 35', 'resp',
    'Every outing includes begging for a toy, a magazine or a treat.',
    'They have no way to know what things cost you. An allowance turns asking into deciding.',
    ['Say the plan before you go in.', 'Accept the wanting without buying.', 'Put it on a wish list.'],
    'That does look fun. We\'re not buying toys today. Shall we take a photo for your wish list?', 'We can\'t afford it. / OK, just this once.', 'A small allowance with spend, save and give jars. Let them make a bad purchase and learn from it.', 'setup scaffold coach');
  S('resp-05', 'Loses or breaks things carelessly', '12 35', 'resp',
    'The third lost jumper this term, or a toy broken through rough use.',
    'Things appear and get replaced, so their value is invisible.',
    ['Sympathy, not a lecture.', 'They help solve it.', 'Replacement is not automatic.'],
    'That\'s a shame. What\'s your plan? You could check lost property tomorrow.', 'Money doesn\'t grow on trees!', 'They contribute to replacing it with money or jobs. Name labels and a home for each thing.', 'scaffold conseq');
  S('resp-06', '"Can you do it for me?" for things they can do', 'K 12', 'resp',
    'They can zip the coat, pour the milk and tie the shoe, and still ask you to.',
    'It can be tiredness, a wish for closeness, or a doubt about their own ability.',
    ['Check which it is.', 'Offer to do one part while they do the other.', 'Build in extra time so they can.'],
    'I\'ll start the zip and you finish it. ... You did it!', 'You\'re a big kid now. Do it yourself.', 'If it is about closeness, give the closeness another way. Teach one new self-care skill each month.', 'scaffold praise');
  S('resp-07', 'Quits when a chore or task gets hard', '12 35', 'resp',
    'They start making their lunch or folding washing, then give up: "I can\'t. You do it."',
    'The standard in their head is yours. They need a version they can succeed at.',
    ['Accept that it is tricky.', 'Show one step, then hand it back.', 'Accept a rough result.'],
    'Folding is fiddly. Watch this one. Now you try the next. It doesn\'t need to be perfect.', 'Redoing it properly in front of them.', 'Thank them for the result as it is. Skill follows practice.', 'process scaffold');
  S('resp-08', 'Pet or plant they promised to care for', '12 35', 'resp',
    'They begged for the hamster. Three weeks later you are doing all the feeding and cleaning.',
    'They meant the promise. Keeping a daily habit going is an adult-level skill.',
    ['Don\'t take it over in silence or in anger.', 'Tie the care to a fixed point in their day.', 'Check together, briefly.'],
    'The hamster depends on us. Feeding happens before your breakfast. Let\'s put it on your list.', 'I knew this would happen. I\'m giving it away.', 'Expect to share the load at this age. Praise the days they remember without being told.', 'setup whenthen praise');
})();
