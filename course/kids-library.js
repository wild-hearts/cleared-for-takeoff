// Cleared For Takeoff, Kids & Teens course data (client-side metadata only).
//
// Two tracks, ten weekly lessons each. No playback IDs here; the server
// (api/video-library.js) holds those and gates them via api/video-token.js.
//
// free: true  -> Week 1 of each track is a free preview (no entitlement needed),
//                mirroring Modules 1 and 2 of the adult course.
//
// Lesson IDs MUST match api/video-library.js (jr-w01..jr-w10, sr-w01..sr-w10).

const KIDS_TRACKS = {
    junior: {
        id: 'junior',
        title: 'Junior AI Navigators',
        ages: '8–11',
        accent: '#C8862B',                 // amber
        credential: 'AI Flight Log – Level 1',
        blurb: 'Ground school to first solo. Ten weekly flights, an animated instructor, and a real credential at the end.',
        weeks: [
            { id: 'jr-w01', week: 1,  title: 'What is AI?',              subtitle: 'Say what AI is and what it is not',                duration: '9:00',  free: true },
            { id: 'jr-w02', week: 2,  title: 'Talking to AI safely',     subtitle: 'Clear instructions, and staying safe',            duration: '9:00',  free: false },
            { id: 'jr-w03', week: 3,  title: 'Machines that see',        subtitle: 'What makes a good example for a computer',         duration: '9:00',  free: false },
            { id: 'jr-w04', week: 4,  title: 'Train your first classifier', subtitle: 'Teach a computer to tell two things apart',    duration: '10:00', free: false },
            { id: 'jr-w05', week: 5,  title: 'When AI gets it wrong',    subtitle: 'Mistakes, fairness, and why data matters',        duration: '9:00',  free: false },
            { id: 'jr-w06', week: 6,  title: 'AI storytelling',          subtitle: 'Co-write a story, then make it yours',            duration: '10:00', free: false },
            { id: 'jr-w07', week: 7,  title: 'Scratch helpers',          subtitle: 'Build a tiny game with a smart rule',             duration: '10:00', free: false },
            { id: 'jr-w08', week: 8,  title: 'Safe and smart online',    subtitle: 'Safe sharing, and checking if AI is right',       duration: '9:00',  free: false },
            { id: 'jr-w09', week: 9,  title: 'Build week',               subtitle: 'Plan and build your own project',                 duration: '9:00',  free: false },
            { id: 'jr-w10', week: 10, title: 'Showcase week',            subtitle: 'Present it, and earn your wings',                  duration: '9:00',  free: false },
        ],
    },
    senior: {
        id: 'senior',
        title: 'Senior AI Pilots',
        ages: '12–16',
        accent: '#74D0EC',                 // cyan
        credential: 'AI Co-Pilot License – Level 1',
        blurb: 'Taking the controls. Ten weekly flights that build real skill, sound ethics, and a project you can defend.',
        weeks: [
            { id: 'sr-w01', week: 1,  title: 'How AI systems work',             subtitle: 'Trace data to output; predict, generate, classify', duration: '13:00', free: true },
            { id: 'sr-w02', week: 2,  title: 'Prompt design and evaluation',    subtitle: 'Design strong prompts; build a rubric',         duration: '13:00', free: false },
            { id: 'sr-w03', week: 3,  title: 'Data and labelling',              subtitle: 'Build a balanced dataset; document it',         duration: '13:00', free: false },
            { id: 'sr-w04', week: 4,  title: 'Building an image model',         subtitle: 'Train, improve v1 to v2, inputs and thresholds', duration: '14:00', free: false },
            { id: 'sr-w05', week: 5,  title: 'Bias, fairness and failure',      subtitle: 'Audit for skew; write a model card',            duration: '13:00', free: false },
            { id: 'sr-w06', week: 6,  title: 'AI-assisted storytelling and media', subtitle: 'A branching piece, edited in your own voice', duration: '13:00', free: false },
            { id: 'sr-w07', week: 7,  title: 'Human-centred design',            subtitle: 'Pitch an AI solution with safeguards',          duration: '13:00', free: false },
            { id: 'sr-w08', week: 8,  title: 'Ethics, privacy and copyright',   subtitle: 'Consent, deepfakes, ownership, when humans decide', duration: '13:00', free: false },
            { id: 'sr-w09', week: 9,  title: 'Capstone sprint',                 subtitle: 'Build one substantial project',                 duration: '13:00', free: false },
            { id: 'sr-w10', week: 10, title: 'Demo day and reflection',         subtitle: 'Present, defend, and earn your licence',        duration: '13:00', free: false },
        ],
    },
};

// Entitlement product codes the Stripe webhook should set on purchase:
//   'kids-junior' -> junior track, 'kids-senior' -> senior track, 'kids-all' -> both.
const KIDS_PRODUCTS = {
    junior: ['kids-junior', 'kids-all'],
    senior: ['kids-senior', 'kids-all'],
};
