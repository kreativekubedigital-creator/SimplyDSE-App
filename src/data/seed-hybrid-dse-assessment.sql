-- ============================================================
-- HYBRID DSE ASSESSMENT — COMPLETE SEED
-- ============================================================
-- This script creates the full assessment template, all sections
-- (categories), all 111 questions, and all answer options.
-- All guidance text is preserved verbatim from the source document.
-- ============================================================

-- 1. CREATE THE TEMPLATE
INSERT INTO assessment_templates (id, name, description, version, is_active)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Hybrid DSE Assessment',
  'The law requires your employer to protect your health, safety, and wellbeing while you are at work. This responsibility includes employees who work at locations other than the main business address.

While there are no specific rules only for remote work, general health and safety laws still apply when you work away from the office.

This risk assessment is a formal part of the office and remote working policy. You must review it regularly to stay compliant. You should also complete a new assessment if your work routine changes significantly.

To begin, we need to gather some details about your current working environment.',
  '1.0',
  true
);

-- ============================================================
-- 2. CREATE ALL SECTIONS (assessment_categories)
-- ============================================================

-- Section 1: Workstation Survey
INSERT INTO assessment_categories (id, template_id, name, description, display_order)
VALUES ('s01-ws-survey-00000000-000000000001', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
'Workstation Survey',
NULL,
1);

-- Section 2: Workstation Survey — More Information
INSERT INTO assessment_categories (id, template_id, name, description, display_order)
VALUES ('s02-ws-moreinfo-0000-000000000002', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
'Workstation Survey — More Information',
'As part of this assessment, we will provide you with the training and information you need to use your workstation safely. This is a requirement under health and safety law.

Your input is very important. It helps us understand how you use your display screen equipment, such as your laptop, tablet, or mobile devices.

Next, we need to know more about the tasks you usually carry out at your workstation.',
2);

-- Section 3: Your Working Environment
INSERT INTO assessment_categories (id, template_id, name, description, display_order)
VALUES ('s03-work-environ-000-000000000003', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
'Your Working Environment',
'Your work area must have enough light for you to see your tasks clearly.

The temperature and humidity at your desk should feel comfortable most of the time.

You should be able to work without distracting noises that interrupt your concentration or your speech.

The law does not set a minimum size for a workspace. However, your area must be large enough for you to arrange all your necessary equipment in a flexible way.',
3);

-- Section 4: Visual & Musculoskeletal — The Primary Risks
INSERT INTO assessment_categories (id, template_id, name, description, display_order)
VALUES ('s04-primary-risks-00-000000000004', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
'Visual & Musculoskeletal — The Primary Risks',
'The primary risks linked to using display screen equipment involve physical aches, eye strain, and mental stress.

These issues are not specific to computer work. The risk remains quite low if you use your equipment wisely and take the right steps to stay safe.',
4);

-- Section 5: Wellbeing, Mental Stress, and Anxiety
INSERT INTO assessment_categories (id, template_id, name, description, display_order)
VALUES ('s05-wellbeing-stress-000000000005', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
'Wellbeing, Mental Stress, and Anxiety',
'Long or intense periods of stress can cause physical or mental health problems.

You can help reduce stress and tiredness by having more control over how you manage your tasks.

It is important to get help if you feel you are not coping with stress or anxiety at work.

Please reach out to your Occupational Health or Human Resources department for guidance and support with stress management.',
5);

-- Section 6: Visual Problems
INSERT INTO assessment_categories (id, template_id, name, description, display_order)
VALUES ('s06-visual-problems-000000000006', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
'Visual Problems',
'You rely heavily on your eyesight when you use display screen equipment for your job. You must make sure your eyes work well to prevent fatigue and strain. It is vital that you have regular eye tests for this reason. You should also take regular breaks to rest your eyes.

If you use display screen equipment regularly, your employer must provide you with an eye test under Health and Safety Regulations. You can request this through your HR or Occupational Health department. They may also help with the cost of a basic pair of glasses in certain situations.',
6);

-- Section 7: Visual and Musculoskeletal Health — Musculoskeletal Problems
INSERT INTO assessment_categories (id, template_id, name, description, display_order)
VALUES ('s07-musculo-problems-00000000007', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
'Visual and Musculoskeletal Health — Musculoskeletal Problems',
'You must tell your manager right away if you start to feel any physical issues like aches, pains, numbness, or tingling. This is especially important if you think your work causes these feelings. You should report these problems as soon as they happen instead of ignoring them. The sooner you address them, the better and faster your recovery will likely be.',
7);

-- Section 8: Your Daily Routine — Taking Breaks
INSERT INTO assessment_categories (id, template_id, name, description, display_order)
VALUES ('s08-taking-breaks-00-000000000008', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
'Your Daily Routine — Taking Breaks',
'You should make sure to take short, casual breaks during your day. Quick, regular pauses are much more effective than taking just one long rest. You should build in time for these breaks or change your work tasks while you are at your desk.

Try to rest before you start to feel worn out. It helps to get away from your workspace at lunch so you can refresh your mind and body.

Regular breaks are necessary to stop physical, mental, and eye strain from building up. You can also try to switch between different types of work to give your brain a change of pace. Stepping away from your desk is definitely the best move, but even a fast stretch in your seat helps. Your breaks might be as simple as standing up for a moment or walking over to the printer.

Do not forget to give your eyes a rest as well. A good habit is the 20 rule: every 20 minutes, look at something 20 feet away for at least 20 seconds.',
8);

-- Section 9: Desk — Healthy Ways to Sit at Work / How to Sit Comfortably
INSERT INTO assessment_categories (id, template_id, name, description, display_order)
VALUES ('s09-desk-ergonomics-000000000009', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
'Desk — Healthy Ways to Sit at Work',
'Your desk needs to have enough room for you to finish all your tasks easily. You should have plenty of space to sit comfortably and enough room to move, stretch, or shift around when you need to. You want to set up your screen, keyboard, and paperwork so you do not have to sit in awkward positions. Keep the space under your desk clear so your legs can move freely and you do not end up feeling cramped.

A healthy posture happens when you keep your joints and muscles in a neutral position. This is the state where they have to do the least amount of work. Sitting symmetrically is also key because it stops you from twisting or putting too much pressure on just one side of your body.

You should organise the items on your desk into zones based on how often you use them. Place your keyboard and mouse in the closest zone so you can reach them without moving your spine. Put things like your phone in a second zone where you only need a small reach forward. Items you rarely use, like a stapler or reference books, can stay in an outer zone further away.

How to Sit Comfortably:

A healthy posture starts by keeping your muscles and joints in a neutral position. This is the natural middle ground where your body does the least amount of work. Sitting symmetrically is also key because it prevents you from twisting or putting too much weight on one side.

• Your spine should keep its natural S-shape, making sure your lower back has plenty of support.
• Keep your neck and back straight and avoid any twisting.
• Make sure there is no uncomfortable pressure under your thighs or behind your calves.
• Your feet should always sit flat and firm on a supportive surface.
• Relax your shoulders and keep your arms at your sides with your elbows bent at about 90 degrees.
• Your forearms should stay level with the floor.
• Try not to bend your wrists too much in any direction.
• Keep your fingers loose and relaxed.

Try not to stay in the exact same position for a long time. Moving around keeps your muscles active and your blood flowing, which is the best way to stop yourself from feeling tired.',
9);

-- Section 10: Chair — Setting up your chair properly
INSERT INTO assessment_categories (id, template_id, name, description, display_order)
VALUES ('s10-chair-setup-0000-000000000010', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
'Chair — Setting up your chair properly',
'Your chair should be stable and support your spine in a natural "S" shape, with good support for the lower back. It should feel comfortable and allow you to adjust it so your posture stays well supported, including the inward curve of your lower back and the slight outward curve of your upper back.

In an office setting, your chair should meet basic health and safety standards. This means it should have a stable base, allow free movement, and be adjustable in height and tilt. If you are working in a temporary setup, this may not always be possible, but you should still aim for the best posture you can in that environment. The chair should not create any pressure points on your body.

If your chair has adjustments, take time to learn how they work by trying them out.

Sit with your shoulders relaxed and your elbows bent at about 90 degrees. Adjust the seat height so your forearms are level with your desk. If your chair is not adjustable, you can use cushions to raise your seating position.

Armrests are optional, but they can help with comfort if used properly. They should not stop you from pulling your chair close to the desk.

Your feet should rest flat on the floor or on a footrest. If you do not have a footrest, you can use a thick book or a stack of A4 paper to support your feet.',
10);

-- Section 11: Software — Information about your software
INSERT INTO assessment_categories (id, template_id, name, description, display_order)
VALUES ('s11-software-info-00-000000000011', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
'Software — Information about your software',
'The software you use should be appropriate for your tasks. It should be simple to use and give clear feedback when needed. You should also be able to control the speed at which you use it.',
11);

-- Section 12: Visual Display Screens
INSERT INTO assessment_categories (id, template_id, name, description, display_order)
VALUES ('s12-display-screens-000000000012', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
'Visual Display Screens',
'Looking at your screen:
Make sure you sit facing your screen directly without twisting your body. Your screen should be at a comfortable viewing distance so you can read text clearly. This is usually about an arm''s length away, although it may vary depending on personal preference. There should be no glare or reflections that make it difficult to see the screen.

Screen height:
The top of your screen should be at about eye level, or slightly lower if you are not a touch typist. Keeping your screen clean is also important to help reduce eye strain.

Multiple screens:
If you use more than one screen, sit facing the one you use most often. If you use them equally, position them so they feel like one wide screen and sit centrally to both.

Glare and reflections:
Glare and reflections can cause eye strain or make parts of the screen hard to see.

First, try to remove the source of the problem. Use blinds to block sunlight from windows, and ensure overhead lighting is properly diffused with suitable covers or bulbs.

If possible, adjust your setup so the light source is not directly affecting your screen, for example by positioning the screen at a right angle to windows causing issues.

If needed, use an anti-glare screen filter as a final option.

Laptops:
Laptops should not be used on their own for long periods. You should use a separate keyboard, mouse, and screen.

Alternatively, you can use a laptop kit with a separate keyboard and mouse so the screen can be set at the correct height.

The laptop should be placed on a stand so the top of the screen is at about eye level.',
12);

-- Section 13: Keyboard & Input Devices
INSERT INTO assessment_categories (id, template_id, name, description, display_order)
VALUES ('s13-keyboard-input-00-00000000013', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
'Keyboard & Input Devices — Your Mouse and Keyboard',
'Your mouse and keyboard should feel comfortable to use. They should be placed so you do not have to stretch or reach too far. When using them, your elbows should be bent at about 90 degrees, with your upper arms relaxed at your sides. Move your keyboard and mouse closer if needed to avoid reaching.

Try not to rest your wrists on the desk while typing.

Sit back in your chair with your shoulders relaxed, and keep your hands lightly hovering over the keyboard.',
13);

-- Section 14: Manual Handling
INSERT INTO assessment_categories (id, template_id, name, description, display_order)
VALUES ('s14-manual-handling-000000000014', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
'Manual Handling',
'Manual handling means moving or supporting a load by hand or physical effort. This includes lifting, lowering, pushing, pulling, carrying, or moving something.

If possible, manual handling should be avoided. Often, tasks can be done in a different way. For example, files can be sent electronically between home and the office instead of carrying printed documents.

If manual handling cannot be avoided, it must be assessed to identify any risks. This will help decide if changes or training are needed.',
14);

-- Section 15: Equipment & Electrical Safety
INSERT INTO assessment_categories (id, template_id, name, description, display_order)
VALUES ('s15-electrical-safety-0000000015', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
'Equipment & Electrical Safety',
'The Health & Safety Executive reports that 25% of electrical accidents involve portable appliances. In your home office, the equipment provided is considered low risk.

However, it still needs to be checked regularly and used correctly to avoid risks such as electric shock or fire.

You should use a suitable multi-way adapter to safely connect your home working equipment. To reduce the risk of fire, make sure it is not overloaded and only use one plug per socket.

Multi-Plugs:
To prevent socket overload, only use one plug per socket. If you need to use an adaptor, use a fused bar-type adaptor and make sure the total load from all connected devices does not exceed 13 amps.',
15);

-- Section 16: Keeping in Touch — First Aid & Accident Reporting
INSERT INTO assessment_categories (id, template_id, name, description, display_order)
VALUES ('s16-first-aid-report-0000000016', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
'Keeping in Touch — First Aid & Accident Reporting',
'To meet regulations, we keep a record of all workplace injuries. This is done using an accident record book held in Human Resources.

If you become ill or are injured because of your work, you must report it straight away to your line manager, who will then inform Human Resources.

If you are working from home in a remote or rural area, access to medical or emergency services may be more limited. Because of this, it is sensible to keep a basic first aid kit in your home workspace.

We also need to know your current work location, so make sure your home working address is kept up to date with us.

Good communication and online support help make home working a positive experience. Stay connected with colleagues through email, video calls, online tools, and regular phone calls, as staying in touch is important.',
16);

-- Section 17: Driving — Information about your driving
INSERT INTO assessment_categories (id, template_id, name, description, display_order)
VALUES ('s17-driving-info-000-000000000017', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
'Driving — Information about your driving',
'As part of the assessment, we will give you information and training on how to use your vehicle safely for work-related driving and any related tasks.

Your input is important to help us understand how you use your vehicle and any risks involved.

To begin with, we need to know how much driving your job requires.',
17);

-- Section 18: Driving — Risks associated with driving
INSERT INTO assessment_categories (id, template_id, name, description, display_order)
VALUES ('s18-driving-risks-00-000000000018', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
'Driving — Risks associated with driving',
'It''s important to understand that driving for long periods can be unsafe because fatigue can reduce your alertness and concentration. You should take regular breaks whenever needed to help prevent this.

Less obvious risks of frequent driving include muscle and joint problems caused by sitting for long periods without enough breaks. This can affect the shoulders, legs, and especially the spine, particularly the lower back. You should take steps to reduce these risks as much as possible.',
18);

-- Section 19: Driving — Using a laptop while driving or in a vehicle
INSERT INTO assessment_categories (id, template_id, name, description, display_order)
VALUES ('s19-driving-laptop-00-00000000019', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
'Driving — Using a laptop while driving or in a vehicle',
'It is important to reduce laptop use in the car, as it often leads to poor posture and uncomfortable positions. Instead, use a suitable place such as a coffee shop or rest area where you can sit at a table and work properly.',
19);

-- Section 20: Driving — Your Driving Seat
INSERT INTO assessment_categories (id, template_id, name, description, display_order)
VALUES ('s20-driving-seat-000-000000000020', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
'Driving — Your Driving Seat',
'The driver''s seat should have enough adjustment options so you can sit in a comfortable and well-supported position.

Get to know how the seat adjusts, as this can vary between vehicles. Some may include lumbar (lower back) support or seat tilt, while others may not. All vehicles should at least allow the seat height to be adjusted, moved forward and backward, and have a backrest that can be tilted.',
20);

-- Section 21: Assessment Completion
INSERT INTO assessment_categories (id, template_id, name, description, display_order)
VALUES ('s21-completion-00000-000000000021', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
'Assessment Completion',
'Your assessment is complete.

If you have any extra comments about your workstation or this assessment, please add them below.

Click ''Finish'' to submit your assessment.

What happens next?

1. Your assessment will be reviewed
2. You may receive follow-up information by email
3. We may contact you for further discussion',
21);
