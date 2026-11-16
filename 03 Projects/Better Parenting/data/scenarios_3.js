// Scenarios, part 3: body/food/safety, hard news, out and about, confidence, you the parent.
(function () {
  var S = BP.S;

  // ---------- Body, food and safety ----------
  S('body-01', 'Picky eating at dinner', 'K 12 35', 'body',
    'They look at the plate and say "Yuck. I\'m not eating that."',
    'Many children need ten or more calm exposures before accepting a food. Pressure, bribes and deals slow it down.',
    ['You decide what, when and where. They decide whether and how much.', 'Always include one food they usually eat.', 'No comments on what they eat. Talk about the day.'],
    'You don\'t have to eat it. It\'s there if you want to try. Dinner is what\'s on the table tonight.', 'Three more bites and you get dessert. / Cooking a second meal.', 'Let them help shop and cook. Serve new foods often, in tiny amounts, without comment.', 'setup scaffold');
  S('body-02', 'Sneaking sweets or constant snack requests', 'K 12 35', 'body',
    'You find wrappers hidden in their room, or they ask for snacks every twenty minutes.',
    'Food that is forbidden or scarce becomes more exciting. Grazing also kills appetite for meals.',
    ['No shame about the wrappers.', 'Set regular meal and snack times.', 'Include sweets sometimes, openly, as ordinary food.'],
    'The kitchen is closed until snack time at three. Then you can choose: fruit and crackers, or yoghurt.', 'You\'re going to get fat. / Sugar is poison.', 'Avoid labelling foods as good or bad. Never comment on body size, theirs or anyone\'s.', 'setup truth');
  S('body-03', '"Where do babies come from?"', 'K 12', 'body',
    'In the supermarket queue, loudly: "How did the baby get in her tummy?"',
    'It is a science question to them. Your ease now decides whether they ask you later.',
    ['Find out what they are asking.', 'Give a short true answer with real words.', 'Stop and see if they want more.'],
    'Good question. A baby grows in a place inside the mother called the uterus. It starts from a tiny cell from each parent. Want to know more?', 'The stork. / I\'ll tell you when you\'re older.', 'Get an age-right book and read it together. Many small talks work better than one big one.', 'truth');
  S('body-04', 'Touching private parts, or playing "doctor"', 'K 12', 'body',
    'They touch themselves in the living room, or you find them and a friend looking at each other\'s bodies.',
    'Curiosity about bodies is normal at this age. They need rules about privacy, without shame.',
    ['Stay calm. Ordinary voice.', 'Private parts are private: your room, alone.', 'For play with a friend: clothes on, and redirect the game.'],
    'That\'s something for when you\'re alone in your room. / Bodies are private. We keep clothes on when we play. Let\'s find another game.', 'That\'s dirty! Stop that!', 'Teach: real names, no one touches your private parts, no secrets about touching, tell me always. Concerned by anything forceful or adult-like? Call the pediatrician.', 'truth setup');
  S('body-05', 'Body changes are starting', '35', 'body',
    'You notice early signs of puberty, or they ask about a classmate, deodorant or periods.',
    'Puberty can begin from eight or nine. Children do much better when they know before it happens.',
    ['Start before you think you need to.', 'Facts in small pieces, ordinary tone.', 'Say that everyone\'s timing is different.'],
    'Bodies start changing around your age, some sooner, some later. Here\'s what to expect. Nothing is embarrassing to ask me.', 'Waiting for school to cover it.', 'Leave a good book in their room. Sort out the practical things (deodorant, supplies) with no fuss.', 'truth');
  S('body-06', 'Says "I\'m fat" or "I\'m ugly"', '12 35', 'body',
    'They pinch their tummy or compare their body to a friend\'s or to people online.',
    'Body comparison starts earlier than most parents expect. Reassurance about looks keeps the focus on looks.',
    ['Ask where the thought came from.', 'Accept the feeling without agreeing or arguing.', 'Turn towards what bodies do.'],
    'That sounds like a hard thought to carry. What made you think about that today? ... Your body lets you climb and swim and hug.', 'No you\'re not, you\'re beautiful! / Maybe eat fewer biscuits.', 'No diet talk or body criticism at home, including about yourself. If eating changes or the worry persists, call the pediatrician.', 'coach truth');
  S('body-07', 'Won\'t wear a helmet or a seatbelt', 'K 12 35', 'body',
    'They argue, unclip, or ride off without the helmet.',
    'They can\'t picture the risk. Safety rules are the one place for no negotiation.',
    ['State the rule in few words.', 'No helmet, no bike. No belt, no driving.', 'Follow through every single time.'],
    'The car moves when everyone is buckled. I\'ll wait.', 'Long explanations about brain injuries, or giving in once.', 'Wear your own helmet. Let them choose the helmet. Never bend the rule "just this once".', 'conseq command');
  S('body-08', 'Wandered off or talked to a stranger', 'K 12', 'body',
    'You lose sight of them in a shop for one terrifying minute, or find them chatting to an adult you don\'t know.',
    'They do not judge risk well and most people they meet are kind. They need a plan more than fear.',
    ['Hug first. Your fear can wait.', 'Then the rule, calmly.', 'Teach what to do if lost.'],
    'I was worried when I couldn\'t see you. If we get separated: stay where you are, and find a worker or a mum with children.', 'Never talk to strangers! Someone will take you!', 'Teach "tricky people": safe adults don\'t ask children for help or to keep secrets. Practise your phone number.', 'setup truth');
  S('body-09', 'Wants to go alone: walk to school, stay home', '35', 'body',
    'They ask to walk to a friend\'s house, go to the shop, or stay home alone for half an hour.',
    'Wanting independence is healthy. Readiness depends on the child, the place and practice.',
    ['Say yes to a step, not to everything.', 'Practise it together first.', 'Agree rules and a check-in.'],
    'Let\'s build up to it. This week I\'ll walk behind you. Next week, you text me when you get there.', 'Absolutely not, it\'s too dangerous.', 'Check local rules for children home alone. Review what went well and extend the freedom.', 'scaffold planb');
  S('body-10', 'Swearing or toilet words', 'K 12 35', 'body',
    'A new word arrives home from school and is used at dinner, with a grin.',
    'Words are powerful and your reaction proves it. Young ones are testing, older ones are fitting in.',
    ['No big reaction.', 'Give the information: what it means, where it is not OK.', 'Offer a replacement.'],
    'That word isn\'t one we use at home or at school. If you need a strong word, try "fiddlesticks".', 'Gasping, laughing, or washing mouths out.', 'Watch your own language. For toilet humour: "bathroom words stay in the bathroom".', 'talk command');

  // ---------- Hard news and big questions ----------
  S('hard-01', 'A pet has died', 'K 12 35', 'hard',
    'The family pet has died or must be put to sleep.',
    'For many children this is the first death. How it is handled shapes how they understand loss.',
    ['Tell them soon, simply, with the word "died".', 'Let them see you sad.', 'Mark it: a burial, a drawing, a story.'],
    'I have sad news. Biscuit died today. His body stopped working and it can\'t be fixed. I\'m sad too.', 'He ran away. / We\'ll get a new one tomorrow.', 'Grief comes in bursts between play. Answer repeat questions patiently.', 'truth coach');
  S('hard-02', 'A grandparent or someone close has died', 'K 12 35', 'hard',
    'Someone they love has died, or is very ill.',
    'Children grieve in short waves and may seem unaffected, then ask a startling question a week later.',
    ['Tell them yourself, somewhere quiet.', 'Use plain words. Avoid "sleeping", "lost" or "gone away".', 'Say who will look after them and what stays the same.'],
    'Grandpa died this morning. That means his body stopped working and he can\'t come back. It\'s OK to feel sad, or confused, or nothing yet.', 'Hiding your own tears. / Keeping them away from everything.', 'Offer a choice about the funeral and explain what happens there. Keep routines. Share memories.', 'truth coach connect');
  S('hard-03', 'Parents are separating', 'K 12 35', 'hard',
    'You need to tell them that their parents will live in two homes.',
    'Children assume it is their fault and fear losing a parent. They need three messages repeated.',
    ['Tell them together if you can, with a plan.', 'Not your fault. We both love you. Here is what will happen.', 'No blame of the other parent.'],
    'We have decided to live in two homes. This is a grown-up decision. Nothing you did caused it. We will both always be your parents.', 'Details of adult problems. / Asking them to choose or carry messages.', 'Expect behaviour to slide for a while. Keep rules similar in both homes. Tell the teacher.', 'truth coach');
  S('hard-04', 'Moving house or changing schools', 'K 12 35', 'hard',
    'You are moving. They are angry, sad, or refuse to talk about it.',
    'They lose their whole world without having a vote. Anger is grief with energy.',
    ['Tell them early.', 'Accept the sadness and anger. Don\'t sell the move.', 'Give them real choices inside it.'],
    'You\'re going to miss your friends and your room. I understand. You get to choose how your new room is set up.', 'You\'ll make new friends in no time!', 'Visit first. Keep old friendships going. Keep routines and belongings steady through the change.', 'coach truth planb');
  S('hard-05', 'A new baby is coming', 'K 12', 'hard',
    'You tell them about the baby. They are thrilled, then regress: baby talk, clinging, accidents.',
    'They are working out whether there will still be room for them.',
    ['Accept mixed feelings out loud.', 'Baby them a little when they ask.', 'Give them a role, not a duty.'],
    'Sometimes a new baby is exciting and sometimes it\'s annoying. Both are OK. You\'ll always be my first baby.', 'You\'re a big kid now. Don\'t be silly.', 'Protect one-on-one time after the birth, even ten minutes. Let visitors greet the older child first.', 'coach special');
  S('hard-06', 'A parent or sibling is seriously ill', 'K 12 35', 'hard',
    'Someone in the house is ill, in hospital, or having treatment.',
    'They notice the whispers. Not knowing is more frightening than a simple truth.',
    ['Name the illness and say what is being done.', 'Say what will change in their day.', 'It is not catching (if true) and not their fault.'],
    'Mum has an illness called cancer. The doctors are giving her strong medicine. She\'ll be tired. Grandma will take you to school.', 'Everything\'s fine. Don\'t worry.', 'Update them as things change. Tell the school. Give them one small way to help.', 'truth coach');
  S('hard-07', 'Questions about God, death and what happens after', 'K 12 35', 'hard',
    'At bedtime: "What happens when we die? Where is heaven? Is God real?"',
    'These are honest philosophical questions. They want to think with you, not to receive a lecture.',
    ['Ask what they think.', 'Share what your family believes, simply.', 'It is fine to say "nobody knows for certain".'],
    'That\'s one of the biggest questions there is. What do you think? ... Here\'s what I believe.', 'Shutting it down, or more than they asked for.', 'Keep the conversation open over years. Other families believe different things, and that is OK.', 'truth');
  S('hard-08', 'They notice difference: skin, disability, money, families', 'K 12 35', 'hard',
    'Loudly, in public: "Why is that man in a wheelchair?" or "Why does she have two dads?"',
    'Noticing difference is normal. Shushing teaches that difference is shameful.',
    ['Answer calmly, there and then.', 'Give a simple fact.', 'Add the value: different is normal.'],
    'He uses a wheelchair to get around, the way you use your legs. People\'s bodies work in different ways.', 'Shh! Don\'t stare. That\'s rude.', 'Books and friendships that show many kinds of people and families. Talk about fairness directly.', 'truth');
  S('hard-09', 'They ask about money worries or a lost job', '12 35', 'hard',
    'They overhear an argument about bills or notice things being cut back.',
    'They sense stress and imagine the worst, such as losing their home.',
    ['Tell the truth at their level.', 'Say what the adults are doing about it.', 'Their job is to be a kid.'],
    'Money is tighter at the moment, so we\'re being careful. We have what we need, and the grown-ups are handling it.', 'It\'s none of your business. / Sharing every fear.', 'Involve them in small free fun. Don\'t make them the confidant.', 'truth coach');
  S('hard-10', 'Something frightening happened to them', 'K 12 35', 'hard',
    'A car accident, a dog bite, a lockdown drill that felt real, a hospital stay.',
    'After a scare, children may replay it in play, sleep badly or become clingy. Most recover with steady support.',
    ['Safety and closeness first.', 'Let them tell it, as often as they need.', 'Help the story reach its ending: and then you were safe.'],
    'That was really scary. You\'re safe now. Do you want to tell me what you remember?', 'Don\'t think about it. You\'re fine.', 'Keep routines. If nightmares, jumpiness or avoidance go on past a month, see the pediatrician.', 'connect coach truth');

  // ---------- Out and about ----------
  S('out-01', 'Tantrum in the supermarket', 'K 12', 'out',
    'You said no to the sweets at the checkout. They are on the floor screaming, and people are staring.',
    'Tired, hungry, bored and tempted, all at once. The audience makes you want to give in or get harsh.',
    ['Ignore the audience. Breathe.', 'Get low and quiet: name the feeling, hold the no.', 'If it continues, leave the trolley and go outside until it passes.'],
    'You really wanted those. The answer is no. I\'ll stay with you until you\'re ready.', 'Buying the sweets. / Threats you won\'t carry out.', 'Next time: snack first, the plan in the car, a job in the shop, and praise at the end.', 'connect setup pause');
  S('out-02', 'Wild in a restaurant', 'K 12', 'out',
    'Climbing under the table, shouting, throwing cutlery while you wait for food.',
    'Waiting with nothing to do is beyond a young child. It is a skill built by short, successful practice.',
    ['Give them something to do: drawing, a small game.', 'One clear rule: bottoms on seats.', 'If it fails, a calm walk outside with one adult.'],
    'In restaurants we sit and use quiet voices. Let\'s see who can spot the most red things.', 'Handing over a phone at the first wriggle, every time.', 'Start with quick, noisy, family places. Order their food first. Praise what went right.', 'setup praise whenthen');
  S('out-03', 'Long car journey or flight', 'K 12 35', 'out',
    '"Are we there yet?" from minute ten, then fighting and kicking seats.',
    'Children have little sense of time and a strong need to move.',
    ['Make time visible: a paper chain or a map with stops.', 'Plan movement breaks.', 'Hand out activities one at a time.'],
    'We\'ve done two of five parts. Next stop is the playground in 40 minutes.', 'If you ask once more, we\'re going home.', 'Audiobooks, snacks in portions, a surprise bag. Agree the screen plan before leaving.', 'setup');
  S('out-04', 'Embarrassing behaviour at a relative\'s house', 'K 12 35', 'out',
    'They refuse to greet, say the food is disgusting, or are rude to a grandparent while everyone watches.',
    'New rules, tired child, and a parent who is tense because they are being judged.',
    ['Take them aside. Never correct in front of the audience.', 'Brief and calm: what you expect.', 'Offer a way to greet they can manage (a wave, a high five).'],
    '(privately) Here, we say hello and "no thank you". You don\'t have to hug. Ready to try again?', 'Say sorry right now! (in front of everyone)', 'Preview the visit in the car: who is there, the two rules, where they can go for a break.', 'setup connect pause');
  S('out-05', 'Won\'t leave a friend\'s house', 'K 12', 'out',
    'Pickup time. They hide, run, or collapse in front of the other parent.',
    'The fun is ending and they are tired. They also know you are less likely to be firm in front of others.',
    ['Arrive with a five-minute warning.', 'Offer a leaving job: "Can you find your shoes or shall I?"', 'Then go, kindly and firmly.'],
    'You had such a good time that it\'s hard to stop. Five minutes, then shoes.', 'Twenty minutes of negotiating at the door.', 'Agree the leaving plan before the playdate. Good leavings mean the next playdate comes sooner.', 'setup whenthen');
  S('out-06', 'Poor sportsmanship at a game or practice', '12 35', 'out',
    'They throw the bat, blame the referee, or cry and refuse to shake hands.',
    'They care a lot and can\'t yet handle the feeling in public.',
    ['Let the coach coach.', 'Afterwards, feelings before lessons.', 'One expectation: shake hands, whatever happened.'],
    'That was a tough loss. I loved watching you play. Disappointed is OK. Throwing the bat is not.', 'A lecture in the car on the way home.', 'Only say "I love watching you play" after games. Talk about pro athletes who lose well.', 'coach conseq process');
  S('out-07', 'Interrupts constantly when you talk to adults', 'K 12', 'out',
    'Every time you speak to another adult or take a call: "Mum. Mum. MUM."',
    'Waiting is hard, and interrupting works.',
    ['Teach a signal: hand on your arm, you cover it with yours.', 'Respond within a minute at first.', 'Thank them for waiting.'],
    'When I\'m talking, put your hand on my arm. I\'ll squeeze it so you know I know. Then I\'ll turn to you.', 'Stop interrupting! (while responding to the interruption)', 'Practise at home. Stretch the wait slowly. Keep calls short when they are little.', 'setup praise');
  S('out-08', 'Rude or silent to adults who speak to them', 'K 12 35', 'out',
    'A neighbour says hello. They hide, glare or say something rude.',
    'It can be shyness, mood or not knowing the script. Forcing it creates a scene.',
    ['Answer lightly for them and move on.', 'Don\'t label them in front of others.', 'Teach the script later.'],
    '(later) When someone says hello, you can say hi or wave. Which one will you use next time?', 'Say hello! Don\'t be rude! He\'s just shy.', 'Role-play greetings with toys. Praise any attempt.', 'brave scaffold');

  // ---------- Confidence and effort ----------
  S('grit-01', 'Wants to quit the team or instrument', '12 35', 'grit',
    'Three weeks in: "I hate it. I\'m not going any more."',
    'The beginner stage is uncomfortable. Sometimes it is the activity, sometimes a coach or a friend problem.',
    ['Find out what "hate" means today.', 'Hold the commitment to the end of the term.', 'Then they have a real say.'],
    'What\'s the worst part? ... We finish the season because the team is counting on you. Then you can decide.', 'Fine, quit. / You\'re not a quitter in this family.', 'Agree the end point before signing up for anything. Praise showing up on the hard days.', 'planb process brave');
  S('grit-02', 'Gives up the moment something is hard', 'K 12 35', 'grit',
    'One failed try at the puzzle, the bike or the maths problem: "I can\'t. It\'s too hard."',
    'They believe that needing effort means they are not good at it.',
    ['Accept the frustration.', 'Add "yet".', 'Shrink the next step and stay close.'],
    'It\'s hard, and you can\'t do it yet. Which bit do you want to try first?', 'It\'s easy, look! / Doing it for them.', 'Tell stories about things that took you a long time. Praise persistence the moment you see it.', 'process scaffold');
  S('grit-03', 'Compares themselves with a classmate or sibling', '12 35', 'grit',
    '"She\'s on chapter books and I\'m not." "He\'s better than me at everything."',
    'Comparison is how they locate themselves at this age. It hurts when the gap is public.',
    ['Accept the feeling.', 'Point to their own line: last month and now.', 'Everyone has a different timetable.'],
    'It\'s hard to see someone ahead of you. Remember when this book was too hard? Look at you now.', 'Well, you\'re better at football.', 'Never compare siblings yourself. Keep a record of their own progress they can see.', 'process coach');
  S('grit-04', 'Afraid to make mistakes or raise a hand', '12 35', 'grit',
    'The teacher says they never answer in class. At home they won\'t try unless sure.',
    'Being wrong in front of others feels dangerous.',
    ['Make mistakes ordinary at home.', 'Set tiny goals: one answer a day.', 'Praise the try, not the correctness.'],
    'What mistake did you make today that taught you something? Here\'s mine.', 'Just put your hand up. What\'s the worst that could happen?', 'Let the teacher know the goal. Celebrate brave tries at dinner.', 'process brave');
  S('grit-05', 'Bragging and showing off', '12 35', 'grit',
    '"I\'m the best in the class. That\'s easy. You\'re so slow." Friends are getting annoyed.',
    'Loud confidence often covers a shaky inside. They want to be seen.',
    ['Don\'t squash it in public.', 'Privately, describe how it lands for others.', 'Give them real recognition at home.'],
    'You\'re proud of your reading, and you should be. When you say "that\'s easy", how do you think Maya feels?', 'Nobody likes a show-off.', 'Teach how to share good news and how to praise others. Notice kindness as much as achievement.', 'coach process');
  S('grit-06', 'Falls apart at criticism or correction', '12 35', 'grit',
    'You point out one spelling mistake. They cry, argue or shut down.',
    'They hear "you are wrong" as "you are bad".',
    ['Start with something specific that is good.', 'One correction, as a question.', 'Let them fix it themselves.'],
    'This sentence is really clear. Have another look at this word. What do you notice?', 'A list of every error.', 'Let them see you take feedback well. Ask before giving it: "Want a suggestion?"', 'process talk');
  S('grit-07', 'Didn\'t make the team, the part or the top group', '35', 'grit',
    'The list goes up and their name isn\'t on it.',
    'It is a real loss. They need to grieve it before they can learn from it.',
    ['Just be with the disappointment.', 'No silver linings today.', 'Later: what do you want to do about it?'],
    'I\'m so sorry. I know how much you wanted this.', 'The coach is an idiot. / Maybe if you\'d practised more.', 'Help them choose: try again, ask for feedback, or try something else. All are fine.', 'coach process');
  S('grit-08', 'Needs constant praise and reassurance', 'K 12', 'grit',
    '"Is this good? Do you like it? Did I do it right?" every thirty seconds.',
    'They are learning to judge their own work and have handed the job to you.',
    ['Describe instead of rating.', 'Turn the question back.', 'Notice effort without being asked.'],
    'You used a lot of blue and made the lines swirl. What\'s your favourite part?', 'It\'s beautiful! Amazing! Perfect!', 'Fewer "good job"s, more detail. Display work they are proud of, by their choice.', 'process scaffold');

  // ---------- You, the parent ----------
  S('you-01', 'You feel yourself about to yell', 'K 12 35', 'you',
    'It is the fifth time. Your jaw is tight and you can feel the shout rising.',
    'Your body has gone into fight mode. Nothing useful gets taught from there.',
    ['Stop mid-sentence if you must.', 'Long breath out. Drop your shoulders. Lower your voice to a near whisper.', 'Say you need a minute, and take it.'],
    'I\'m getting very frustrated. I\'m going to breathe for a minute, and then we\'ll try again.', 'Pushing through and saying the thing you\'ll regret.', 'Find your pattern: time of day, hunger, rushing. Change one thing in that slot.', 'pause');
  S('you-02', 'You yelled, and now you feel awful', 'K 12 35', 'you',
    'You shouted, maybe said something harsh. They are crying or have gone quiet.',
    'Ruptures happen in every family. What they remember is whether you came back.',
    ['Calm yourself first. Be kind to yourself.', 'Go to them. Name it and own it.', 'No "but you...".'],
    'I\'m sorry I yelled. That was my big feeling, not your fault. Next time I\'m going to take a breath first.', 'I\'m sorry, but you made me so angry.', 'Repair teaches them how to repair. Then solve the original problem at a calm time.', 'repair pause');
  S('you-03', 'You have no patience left by 6 p.m.', 'K 12 35', 'you',
    'Dinner, homework, baths and bickering all land when you are emptiest.',
    'It is the hardest hour for everyone. Willpower does not fix a design problem.',
    ['Lower the bar for this hour.', 'Feed everyone early, including you.', 'Ten minutes of connection before the tasks.'],
    'Everyone\'s tired. Let\'s sit on the sofa for ten minutes before we do anything.', 'Trying to do everything and be cheerful.', 'Simplify weeknight dinners. Move what can move (baths, reading) to another time. Trade off with your partner.', 'pause setup special');
  S('you-04', 'You and your partner disagree on discipline', 'K 12 35', 'you',
    'One of you is stricter. You contradict each other in front of the children, and they have noticed.',
    'Different styles are fine. Undermining each other is what causes trouble.',
    ['Back each other in the moment unless it is unsafe.', 'Talk later, in private.', 'Agree on three or four house rules and the response.'],
    '(to your partner, later) I want us on the same page. Can we pick the three things that matter most to both of us?', 'Don\'t listen to your father. / Arguing in front of them.', 'A short weekly check-in. You don\'t need identical styles, only shared rules.', 'planb pause');
  S('you-05', 'One child pushes your buttons more than the other', 'K 12 35', 'you',
    'You are patient with one and short with the other. You don\'t like it about yourself.',
    'Often that child is most like you, or needs more than you have. Seeing it is the first step.',
    ['Notice what exactly sets you off.', 'Find three things you enjoy about this child. Say one today.', 'Start ten minutes of special time, just with them.'],
    'I\'ve been snappy with you lately. That\'s mine to fix. I like being with you. Want to play a round of cards?', 'Why can\'t you be more like your brother?', 'Keep special time going for two weeks and see what changes. It usually does.', 'special repair');
  S('you-06', 'You gave in, again, and feel like a pushover', 'K 12 35', 'you',
    'You said no, they pushed, you were tired, and you said yes.',
    'It happens to everyone. It also teaches them that pushing works. One no you keep is worth ten you don\'t.',
    ['Forgive this one.', 'Say fewer no\'s. Pause before answering.', 'When you do say no, decide first that you will hold it.'],
    'Let me think about that. I\'ll tell you after dinner.', 'No! ... Oh, all right then.', 'Pick the two limits that matter most this month and hold only those perfectly.', 'pause conseq');
  S('you-07', 'You feel guilty and think you are getting it wrong', 'K 12 35', 'you',
    'After a bad day you lie awake listing your failures as a parent.',
    'Guilt means you care. It is not an accurate report. Children need a good-enough parent who repairs, not a perfect one.',
    ['Talk to yourself as you would to a friend.', 'Name one thing that went right today.', 'Choose one small thing for tomorrow.'],
    '(to yourself) Good parent, hard day. Tomorrow I\'ll start with ten minutes on the floor with them.', 'Promising yourself to be perfect from now on.', 'Sleep, food, movement, a friend to talk to. If the low mood stays, talk to your own doctor.', 'repair pause');
  S('you-08', 'Last year\'s tricks have stopped working', 'K 12 35', 'you',
    'The sticker chart is ignored. Counting to three gets an eye-roll. What worked at five fails at seven.',
    'They have grown. Each stage needs more say for them and more coaching from you.',
    ['Notice what they are asking for now: voice, privacy, respect.', 'Ask them what would work.', 'Swap one telling for one asking today.'],
    'I think the old way isn\'t working for us any more. What do you think would help mornings go better?', 'Doing the old thing louder.', 'Read the stage card for their grade. Pick one skill from the toolkit and practise it for a week.', 'planb scaffold');
  S('you-09', 'They only want the other parent', 'K 12', 'you',
    '"Not you! I want Daddy!" at bedtime, at pickup, when hurt.',
    'Preferences swing and are not a verdict on you. Reacting with hurt adds weight to it.',
    ['Don\'t take the bait or the hurt.', 'Accept the wish. Hold the plan.', 'Stay warm and get on with it.'],
    'You wish it was Daddy tonight. I get it. Tonight it\'s me, and I\'ve got a funny voice for this book.', 'Fine, I won\'t bother then.', 'Each parent keeps regular one-on-one time. The favoured parent backs the other one up.', 'coach special');
  S('you-10', 'They are melting down and you are in a hurry', 'K 12 35', 'you',
    'You have to leave in four minutes for something that matters, and the shoes are being thrown.',
    'Your urgency raises their stress, which slows everything down. Two calm minutes are faster than ten rushed ones.',
    ['Decide: is being five minutes late survivable? Usually yes.', 'Slow down on purpose. Get low.', 'Connect for one minute, then move together.'],
    'We\'re both stressed. Come here for a second. ... OK. Shoes in the car, let\'s go.', 'We\'re LATE! Move! NOW!', 'Leave ten minutes of slack before anything important. Pack the night before.', 'pause connect setup');
})();
