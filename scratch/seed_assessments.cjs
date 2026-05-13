const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seed() {
  console.log('🌱 Seeding Assessment Template...');

  // 1. Create Template
  const { data: template, error: tError } = await supabase
    .from('assessment_templates')
    .insert({
      name: 'SimplyDSE Master Compliance Assessment 2024',
      description: 'The standard UK-compliant Display Screen Equipment (DSE) workstation assessment.',
      version: '2024.1'
    })
    .select()
    .single();

  if (tError) throw tError;

  const categories = [
    { name: 'Eye & Eyesight', description: 'Visual health and screen settings.', order: 1 },
    { name: 'Chair & Seating', description: 'Ergonomic chair adjustments and posture.', order: 2 },
    { name: 'Desk & Workstation', description: 'Equipment layout and space.', order: 3 },
    { name: 'Health & Wellbeing', description: 'Physical comfort and fatigue management.', order: 4 },
  ];

  for (const cat of categories) {
    const { data: category } = await supabase
      .from('assessment_categories')
      .insert({
        template_id: template.id,
        name: cat.name,
        description: cat.description,
        display_order: cat.order
      })
      .select()
      .single();

    if (cat.name === 'Eye & Eyesight') {
      const q1 = await createQuestion(category.id, 'Do you experience regular eye strain or headaches when working?', 1);
      await createOption(q1.id, 'No, never', 0, 'low', 1);
      await createOption(q1.id, 'Occasionally', 3, 'medium', 2);
      await createOption(q1.id, 'Frequently', 7, 'high', 3, 'https://simplydse.online/guidance/eye-strain-prevention.pdf');
      
      const q2 = await createQuestion(category.id, 'Is your screen free from glare or reflections?', 2);
      await createOption(q2.id, 'Yes, completely', 0, 'low', 1);
      await createOption(q2.id, 'No, there are minor reflections', 2, 'medium', 2);
      await createOption(q2.id, 'No, glare is a major problem', 5, 'high', 3);
    }

    if (cat.name === 'Chair & Seating') {
      const q1 = await createQuestion(category.id, 'Is your chair adjustable in height and back tilt?', 1);
      await createOption(q1.id, 'Yes, fully adjustable', 0, 'low', 1);
      await createOption(q1.id, 'Partially adjustable', 2, 'medium', 2);
      await createOption(q1.id, 'No, it is a fixed chair', 8, 'high', 3, 'https://simplydse.online/guidance/ergonomic-seating-guide.pdf');

      const q2 = await createQuestion(category.id, 'When sitting, are your thighs horizontal and feet flat on the floor?', 2);
      await createOption(q2.id, 'Yes', 0, 'low', 1);
      await createOption(q2.id, 'No, I need a footrest', 2, 'medium', 2);
      await createOption(q2.id, 'No, my legs dangle', 5, 'high', 3);
    }

    if (cat.name === 'Health & Wellbeing') {
      const q1 = await createQuestion(category.id, 'Do you experience recurring neck, back, or wrist pain?', 1);
      await createOption(q1.id, 'No', 0, 'low', 1);
      await createOption(q1.id, 'Minor stiffness', 3, 'medium', 2);
      await createOption(q1.id, 'Yes, recurring pain', 10, 'critical', 3, 'https://simplydse.online/guidance/posture-correction.pdf', true);
    }
  }

  console.log('✅ Seeding Complete!');
}

async function createQuestion(catId, text, order) {
  const { data } = await supabase
    .from('assessment_questions')
    .insert({
      category_id: catId,
      text: text,
      display_order: order
    })
    .select()
    .single();
  return data;
}

async function createOption(qId, text, score, risk, order, guidance = null, hrFlag = false) {
  await supabase
    .from('assessment_options')
    .insert({
      question_id: qId,
      text: text,
      score: score,
      risk_level: risk,
      display_order: order,
      guidance_resource_url: guidance,
      hr_flag: hrFlag
    });
}

seed().catch(console.error);
