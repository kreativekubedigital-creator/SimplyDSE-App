import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('Seeding Assessments...');

  // 1. Create Template
  const { data: template, error: templateError } = await supabase
    .from('assessment_templates')
    .insert({
      name: 'Standard DSE & Ergonomic Assessment',
      description: 'Comprehensive workplace risk and ergonomic evaluation.',
      version: '1.0',
      is_active: true
    })
    .select()
    .single();

  if (templateError) {
    console.error('Error creating template:', templateError);
    return;
  }
  
  console.log('Template created:', template.id);

  const templateId = template.id;

  // Define the structure
  const assessmentData = [
    {
      name: 'Welcome & Introduction',
      description: 'This assessment helps ensure your workstation setup supports your wellbeing, comfort, and safe working practices.',
      display_order: 1,
      questions: [] // Handled in UI mostly, but we can have an acknowledgment
    },
    {
      name: 'Work Pattern Assessment',
      description: 'Understanding where and how you work.',
      display_order: 2,
      questions: [
        {
          text: 'What is your usual work location?',
          type: 'single_choice',
          options: [
            { text: 'Home', score: 0, risk_level: 'low' },
            { text: 'Office', score: 0, risk_level: 'low' },
            { text: 'Both', score: 0, risk_level: 'low' }
          ]
        },
        {
          text: 'Do you carry out your work at client or customer locations?',
          type: 'boolean',
          options: [
            { text: 'Yes', score: 1, risk_level: 'medium' },
            { text: 'No', score: 0, risk_level: 'low' }
          ]
        },
        {
          text: 'Do you ever work from cafés, service stations, or temporary locations?',
          type: 'boolean',
          options: [
            { text: 'Yes', score: 2, risk_level: 'medium' },
            { text: 'No', score: 0, risk_level: 'low' }
          ]
        },
        {
          text: 'Do you regularly use a smartphone or tablet as part of your work activities?',
          type: 'boolean',
          options: [
            { text: 'Yes', score: 1, risk_level: 'medium' },
            { text: 'No', score: 0, risk_level: 'low' }
          ]
        },
        {
          text: 'Do you work from a coworking space?',
          type: 'boolean',
          options: [
            { text: 'Yes', score: 1, risk_level: 'low' },
            { text: 'No', score: 0, risk_level: 'low' }
          ]
        },
        {
          text: 'Do you use hot-desking?',
          type: 'boolean',
          options: [
            { text: 'Yes', score: 1, risk_level: 'medium' },
            { text: 'No', score: 0, risk_level: 'low' }
          ]
        },
        {
          text: 'Do you use a vehicle for work?',
          type: 'boolean',
          metadata: { triggers_section: 'Driving Risk Assessment' },
          options: [
            { text: 'Yes', score: 0, risk_level: 'low' },
            { text: 'No', score: 0, risk_level: 'low' }
          ]
        },
        {
          text: 'How many hours per week do you spend working remotely?',
          type: 'single_choice',
          options: [
            { text: '0–7 hours', score: 0, risk_level: 'low' },
            { text: '8–14 hours', score: 1, risk_level: 'low' },
            { text: '15–21 hours', score: 2, risk_level: 'medium' },
            { text: '22–28 hours', score: 3, risk_level: 'medium' },
            { text: '29–35 hours', score: 4, risk_level: 'high' },
            { text: '36+ hours', score: 5, risk_level: 'high' }
          ]
        }
      ]
    },
    {
      name: 'Workstation Environment',
      description: 'Evaluating your physical workspace.',
      display_order: 3,
      questions: [
        {
          text: 'Is your workspace large enough to comfortably carry out your tasks?',
          type: 'boolean',
          options: [
            { text: 'Yes', score: 0, risk_level: 'low' },
            { text: 'No', score: 5, risk_level: 'high', hr_flag: true }
          ]
        },
        {
          text: 'Is there adequate lighting in your workspace?',
          type: 'boolean',
          options: [
            { text: 'Yes', score: 0, risk_level: 'low' },
            { text: 'No', score: 3, risk_level: 'medium' }
          ]
        },
        {
          text: 'Is the temperature in your workspace comfortable?',
          type: 'boolean',
          options: [
            { text: 'Yes', score: 0, risk_level: 'low' },
            { text: 'No', score: 2, risk_level: 'medium' }
          ]
        },
        {
          text: 'Is there sufficient ventilation?',
          type: 'boolean',
          options: [
            { text: 'Yes', score: 0, risk_level: 'low' },
            { text: 'No', score: 2, risk_level: 'medium' }
          ]
        },
        {
          text: 'Are noise levels acceptable for working?',
          type: 'boolean',
          options: [
            { text: 'Yes', score: 0, risk_level: 'low' },
            { text: 'No', score: 2, risk_level: 'medium' }
          ]
        },
        {
          text: 'Are suitable adjustable window coverings available?',
          type: 'boolean',
          options: [
            { text: 'Yes', score: 0, risk_level: 'low' },
            { text: 'No', score: 1, risk_level: 'low' }
          ]
        },
        {
          text: 'Is your workstation free from trip hazards?',
          type: 'boolean',
          options: [
            { text: 'Yes', score: 0, risk_level: 'low' },
            { text: 'No', score: 5, risk_level: 'critical', hr_flag: true }
          ]
        }
      ]
    },
    {
      name: 'Visual & Physical Wellbeing',
      description: 'Assessing how your workstation affects your health.',
      display_order: 4,
      questions: [
        {
          text: 'Have you had an eye test within the last two years?',
          type: 'boolean',
          options: [
            { text: 'Yes', score: 0, risk_level: 'low' },
            { text: 'No', score: 2, risk_level: 'medium' }
          ]
        },
        {
          text: 'Can you read text clearly on your screen?',
          type: 'boolean',
          options: [
            { text: 'Yes', score: 0, risk_level: 'low' },
            { text: 'No', score: 4, risk_level: 'high', hr_flag: true }
          ]
        },
        {
          text: 'Are you free from work-related aches, pains, or numbness?',
          type: 'boolean',
          options: [
            { text: 'Yes', score: 0, risk_level: 'low' },
            { text: 'No', score: 5, risk_level: 'critical', hr_flag: true }
          ]
        },
        {
          text: 'Are you free from physical conditions affecting workstation use?',
          type: 'boolean',
          options: [
            { text: 'Yes', score: 0, risk_level: 'low' },
            { text: 'No', score: 4, risk_level: 'high', hr_flag: true }
          ]
        },
        {
          text: 'Do you know who to report physical discomfort to?',
          type: 'boolean',
          options: [
            { text: 'Yes', score: 0, risk_level: 'low' },
            { text: 'No', score: 2, risk_level: 'medium' }
          ]
        },
        {
          text: 'Do you regularly take breaks during the day?',
          type: 'boolean',
          options: [
            { text: 'Yes', score: 0, risk_level: 'low' },
            { text: 'No', score: 4, risk_level: 'high', guidance_resource_url: '/training/fatigue-management' }
          ]
        },
        {
          text: 'Are you able to vary your posture throughout the day?',
          type: 'boolean',
          options: [
            { text: 'Yes', score: 0, risk_level: 'low' },
            { text: 'No', score: 3, risk_level: 'medium' }
          ]
        }
      ]
    },
    {
      name: 'Desk & Chair Ergonomics',
      description: 'Checking your primary physical support.',
      display_order: 5,
      questions: [
        {
          text: 'Do you have a suitable office chair?',
          type: 'boolean',
          options: [
            { text: 'Yes', score: 0, risk_level: 'low' },
            { text: 'No', score: 5, risk_level: 'high', hr_flag: true }
          ]
        },
        {
          text: 'Is your chair adjustable for height and tilt?',
          type: 'boolean',
          options: [
            { text: 'Yes', score: 0, risk_level: 'low' },
            { text: 'No', score: 4, risk_level: 'high', hr_flag: true }
          ]
        },
        {
          text: 'Does your chair provide lower back support?',
          type: 'boolean',
          options: [
            { text: 'Yes', score: 0, risk_level: 'low' },
            { text: 'No', score: 5, risk_level: 'high', hr_flag: true, guidance_resource_url: '/training/ergonomic-seating' }
          ]
        },
        {
          text: 'Are your feet supported comfortably?',
          type: 'boolean',
          options: [
            { text: 'Yes', score: 0, risk_level: 'low' },
            { text: 'No', score: 3, risk_level: 'medium' }
          ]
        },
        {
          text: 'Is there sufficient legroom beneath the desk?',
          type: 'boolean',
          options: [
            { text: 'Yes', score: 0, risk_level: 'low' },
            { text: 'No', score: 3, risk_level: 'medium' }
          ]
        },
        {
          text: 'Do you use a sit-stand desk?',
          type: 'boolean',
          options: [
            { text: 'Yes', score: 0, risk_level: 'low' },
            { text: 'No', score: 0, risk_level: 'low' }
          ]
        },
        {
          text: 'Is your seat height adjusted correctly?',
          type: 'boolean',
          options: [
            { text: 'Yes', score: 0, risk_level: 'low' },
            { text: 'No', score: 3, risk_level: 'medium' }
          ]
        }
      ]
    },
    {
      name: 'Display Screen Equipment',
      description: 'Evaluating your monitor and screen setup.',
      display_order: 6,
      questions: [
        {
          text: 'Is your screen suitable for your work tasks?',
          type: 'boolean',
          options: [
            { text: 'Yes', score: 0, risk_level: 'low' },
            { text: 'No', score: 4, risk_level: 'high', hr_flag: true }
          ]
        },
        {
          text: 'Is your screen free from glare and reflections?',
          type: 'boolean',
          options: [
            { text: 'Yes', score: 0, risk_level: 'low' },
            { text: 'No', score: 3, risk_level: 'medium' }
          ]
        },
        {
          text: 'Can you adjust screen brightness and contrast?',
          type: 'boolean',
          options: [
            { text: 'Yes', score: 0, risk_level: 'low' },
            { text: 'No', score: 2, risk_level: 'medium' }
          ]
        },
        {
          text: 'Is your screen positioned correctly at eye level?',
          type: 'boolean',
          options: [
            { text: 'Yes', score: 0, risk_level: 'low' },
            { text: 'No', score: 4, risk_level: 'high', guidance_resource_url: '/training/monitor-setup' }
          ]
        },
        {
          text: 'Is your screen positioned at a comfortable distance?',
          type: 'boolean',
          options: [
            { text: 'Yes', score: 0, risk_level: 'low' },
            { text: 'No', score: 3, risk_level: 'medium' }
          ]
        },
        {
          text: 'Does your body face the screen directly?',
          type: 'boolean',
          options: [
            { text: 'Yes', score: 0, risk_level: 'low' },
            { text: 'No', score: 4, risk_level: 'high' }
          ]
        },
        {
          text: 'Is the information displayed clear and easy to read?',
          type: 'boolean',
          options: [
            { text: 'Yes', score: 0, risk_level: 'low' },
            { text: 'No', score: 3, risk_level: 'medium' }
          ]
        }
      ]
    },
    {
      name: 'Keyboard & Input Devices',
      description: 'Checking how you interact with your computer.',
      display_order: 7,
      questions: [
        {
          text: 'Is your keyboard separate from your screen?',
          type: 'boolean',
          options: [
            { text: 'Yes', score: 0, risk_level: 'low' },
            { text: 'No', score: 4, risk_level: 'high', guidance_resource_url: '/training/laptop-ergonomics' }
          ]
        },
        {
          text: 'Can you achieve a comfortable typing position?',
          type: 'boolean',
          options: [
            { text: 'Yes', score: 0, risk_level: 'low' },
            { text: 'No', score: 4, risk_level: 'high' }
          ]
        },
        {
          text: 'Are your elbows positioned at approximately 90 degrees?',
          type: 'boolean',
          options: [
            { text: 'Yes', score: 0, risk_level: 'low' },
            { text: 'No', score: 3, risk_level: 'medium' }
          ]
        },
        {
          text: 'Are the keyboard keys clearly labelled?',
          type: 'boolean',
          options: [
            { text: 'Yes', score: 0, risk_level: 'low' },
            { text: 'No', score: 2, risk_level: 'medium' }
          ]
        },
        {
          text: 'Is your mouse comfortable to use?',
          type: 'boolean',
          options: [
            { text: 'Yes', score: 0, risk_level: 'low' },
            { text: 'No', score: 3, risk_level: 'medium' }
          ]
        },
        {
          text: 'Is your mouse within easy reach?',
          type: 'boolean',
          options: [
            { text: 'Yes', score: 0, risk_level: 'low' },
            { text: 'No', score: 3, risk_level: 'medium' }
          ]
        },
        {
          text: 'Do you use any alternative input devices?',
          type: 'boolean',
          metadata: { requires_details_if: 'Yes' },
          options: [
            { text: 'Yes', score: 0, risk_level: 'low' },
            { text: 'No', score: 0, risk_level: 'low' }
          ]
        }
      ]
    },
    {
      name: 'Manual Handling',
      description: 'Assessing physical lifting requirements.',
      display_order: 8,
      questions: [
        {
          text: 'Do your work activities involve manual handling tasks?',
          type: 'boolean',
          options: [
            { text: 'Yes', score: 3, risk_level: 'medium', guidance_resource_url: '/training/manual-handling', hr_flag: true },
            { text: 'No', score: 0, risk_level: 'low' }
          ]
        }
      ]
    },
    {
      name: 'Electrical Safety',
      description: 'Evaluating basic electrical safety at your workstation.',
      display_order: 9,
      questions: [
        {
          text: 'Has your DSE equipment been provided by your employer?',
          type: 'boolean',
          options: [
            { text: 'Yes', score: 0, risk_level: 'low' },
            { text: 'No', score: 1, risk_level: 'low' }
          ]
        },
        {
          text: 'Has older equipment undergone PAT testing?',
          type: 'single_choice',
          options: [
            { text: 'Yes', score: 0, risk_level: 'low' },
            { text: 'No', score: 4, risk_level: 'high', hr_flag: true },
            { text: 'N/A', score: 0, risk_level: 'low' }
          ]
        },
        {
          text: 'Are multi-plug adapters being used?',
          type: 'boolean',
          options: [
            { text: 'Yes', score: 2, risk_level: 'medium' },
            { text: 'No', score: 0, risk_level: 'low' }
          ]
        },
        {
          text: 'Do you have smoke alarms installed?',
          type: 'boolean',
          options: [
            { text: 'Yes', score: 0, risk_level: 'low' },
            { text: 'No', score: 5, risk_level: 'critical', hr_flag: true }
          ]
        }
      ]
    },
    {
      name: 'Driving Risk Assessment',
      description: 'Evaluating risks associated with driving for work.',
      display_order: 10,
      metadata: { condition: { depends_on_section: 'Work Pattern Assessment', question: 'Do you use a vehicle for work?', answer: 'Yes' } },
      questions: [
        {
          text: 'How often do you drive for work?',
          type: 'single_choice',
          options: [
            { text: '1–2 days per week', score: 1, risk_level: 'low' },
            { text: '3–4 days per week', score: 2, risk_level: 'medium' },
            { text: 'Every day', score: 4, risk_level: 'high' }
          ]
        },
        {
          text: 'On average, how long are your journeys?',
          type: 'single_choice',
          options: [
            { text: 'Less than 1 hour', score: 0, risk_level: 'low' },
            { text: '1–2 hours', score: 1, risk_level: 'low' },
            { text: '2–3 hours', score: 3, risk_level: 'medium' },
            { text: 'More than 3 hours', score: 5, risk_level: 'critical', hr_flag: true, guidance_resource_url: '/training/driving-safety' }
          ]
        },
        {
          text: 'Does driving account for more than 50% of your working day?',
          type: 'boolean',
          options: [
            { text: 'Yes', score: 4, risk_level: 'high' },
            { text: 'No', score: 0, risk_level: 'low' }
          ]
        },
        {
          text: 'Do you drive more than 200 miles per week?',
          type: 'boolean',
          options: [
            { text: 'Yes', score: 4, risk_level: 'high', hr_flag: true, guidance_resource_url: '/training/driving-safety' },
            { text: 'No', score: 0, risk_level: 'low' }
          ]
        },
        {
          text: 'Do you use sat nav for work driving?',
          type: 'boolean',
          options: [
            { text: 'Yes', score: 0, risk_level: 'low' },
            { text: 'No', score: 1, risk_level: 'low' }
          ]
        },
        {
          text: 'Do you make or receive calls while driving?',
          type: 'boolean',
          options: [
            { text: 'Yes', score: 4, risk_level: 'high' },
            { text: 'No', score: 0, risk_level: 'low' }
          ]
        },
        {
          text: 'Do you regularly take breaks while driving?',
          type: 'boolean',
          options: [
            { text: 'Yes', score: 0, risk_level: 'low' },
            { text: 'No', score: 4, risk_level: 'high' }
          ]
        },
        {
          text: 'Is your driving seat adjustable?',
          type: 'boolean',
          options: [
            { text: 'Yes', score: 0, risk_level: 'low' },
            { text: 'No', score: 3, risk_level: 'medium' }
          ]
        },
        {
          text: 'Is your laptop safely stored during driving?',
          type: 'boolean',
          options: [
            { text: 'Yes', score: 0, risk_level: 'low' },
            { text: 'No', score: 3, risk_level: 'medium' }
          ]
        }
      ]
    }
  ];

  for (const category of assessmentData) {
    const { data: cat, error: catError } = await supabase
      .from('assessment_categories')
      .insert({
        template_id: templateId,
        name: category.name,
        description: category.description,
        display_order: category.display_order
      })
      .select()
      .single();

    if (catError) {
      console.error('Error creating category:', catError);
      continue;
    }

    let qOrder = 1;
    for (const question of category.questions) {
      const { data: q, error: qError } = await supabase
        .from('assessment_questions')
        .insert({
          category_id: cat.id,
          text: question.text,
          type: question.type,
          metadata: (question as any).metadata || {},
          display_order: qOrder++
        })
        .select()
        .single();

      if (qError) {
        console.error('Error creating question:', qError);
        continue;
      }

      let oOrder = 1;
      for (const option of question.options) {
        const { error: oError } = await supabase
          .from('assessment_options')
          .insert({
            question_id: q.id,
            text: option.text,
            score: option.score,
            risk_level: option.risk_level,
            hr_flag: (option as any).hr_flag || false,
            guidance_resource_url: (option as any).guidance_resource_url || null,
            display_order: oOrder++
          });

        if (oError) {
          console.error('Error creating option:', oError);
        }
      }
    }
  }

  console.log('Seeding complete!');
}

seed().catch(console.error);
