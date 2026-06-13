// Cleared For Takeoff Video Library
// Maps lesson IDs to Mux playback IDs and metadata
//
// SETUP: After uploading each video to Mux, copy the Playback ID from the Mux
// dashboard and replace the corresponding 'PENDING' value below.
//
// Mux dashboard → Video → click the video → copy "Playback ID"
//
// free: true  → accessible without an access code (Modules 1 and 2, free preview)
// free: false → requires a valid COURSE_ACCESS_CODE to watch

// Lesson lists match the V2 scripts: six videos per module (the welcome is folded
// into Video 1, the Cleared To Try into Video 6). Module 3 is linear (all six
// paths). Module 4 keeps "pick 1 track" (intro + 4 tracks + close).
const MODULES = [
    {
        id: 1,
        slug: 'module-01',
        title: 'Pre-Flight Checks',
        subtitle: 'Understanding AI before you use it',
        free: true,
        lessons: [
            { id: 'm01-l01', title: 'What AI actually is (and isn\'t)',                 duration: '7:00', playbackId: 'PENDING' },
            { id: 'm01-l02', title: 'Three things it does well, three it does badly',   duration: '7:00', playbackId: 'PENDING' },
            { id: 'm01-l03', title: 'Choosing your first tool',                         duration: '7:00', playbackId: 'PENDING' },
            { id: 'm01-l04', title: 'Signing up safely',                                duration: '9:00', playbackId: 'PENDING' },
            { id: 'm01-l05', title: 'Setting up so it doesn\'t train on you',           duration: '7:00', playbackId: 'PENDING' },
            { id: 'm01-l06', title: 'Your dashboard, and your first hello',             duration: '9:00', playbackId: 'PENDING' },
        ]
    },
    {
        id: 2,
        slug: 'module-02',
        title: 'Cleared For Taxi',
        subtitle: 'How to talk to AI well',
        free: true,
        lessons: [
            { id: 'm02-l01', title: 'Prompting in plain English',           duration: '10:00', playbackId: 'PENDING' },
            { id: 'm02-l02', title: 'The four flight controls',             duration: '11:00', playbackId: 'PENDING' },
            { id: 'm02-l03', title: 'How to make it interview you',         duration: '9:00',  playbackId: 'PENDING' },
            { id: 'm02-l04', title: 'Specific, vague, or start again',      duration: '10:00', playbackId: 'PENDING' },
            { id: 'm02-l05', title: 'Mistakes everyone makes in week one',  duration: '11:00', playbackId: 'PENDING' },
            { id: 'm02-l06', title: 'Saving prompts, and your Cleared To Try', duration: '10:00', playbackId: 'PENDING' },
        ]
    },
    {
        id: 3,
        slug: 'module-03',
        title: 'Cleared For Takeoff',
        subtitle: 'AI for your actual life, six everyday paths',
        free: false,
        lessons: [
            { id: 'm03-l01', title: 'Welcome to the air, and Path A: Writing',        duration: '13:00', playbackId: 'PENDING' },
            { id: 'm03-l02', title: 'Path B: Summarising long things',                duration: '10:00', playbackId: 'PENDING' },
            { id: 'm03-l03', title: 'Path C: Planning anything',                      duration: '11:00', playbackId: 'PENDING' },
            { id: 'm03-l04', title: 'Path D: Research that doesn\'t lie to you',      duration: '11:00', playbackId: 'PENDING' },
            { id: 'm03-l05', title: 'Path E: Health information, calmly',             duration: '9:00',  playbackId: 'PENDING' },
            { id: 'm03-l06', title: 'Path F: Money and admin, and your Cleared To Try', duration: '12:00', playbackId: 'PENDING' },
        ]
    },
    {
        id: 4,
        slug: 'module-04',
        title: 'In The Air',
        subtitle: 'Deep work on one real project, pick 1 track',
        free: false,
        pickYourTrack: true,
        trackCount: 1,
        lessons: [
            { id: 'm04-l01',     title: 'Choosing your project',                       duration: '12:00', playbackId: 'PENDING', required: true },
            { id: 'm04-track-a', title: 'Track A: Write something',                    duration: '12:00', playbackId: 'PENDING', track: 'A' },
            { id: 'm04-track-b', title: 'Track B: Start something',                    duration: '12:00', playbackId: 'PENDING', track: 'B' },
            { id: 'm04-track-c', title: 'Track C: Sort something',                     duration: '12:00', playbackId: 'PENDING', track: 'C' },
            { id: 'm04-track-d', title: 'Track D: Learn something',                    duration: '12:00', playbackId: 'PENDING', track: 'D' },
            { id: 'm04-l06',     title: 'Locking your scope, and your Cleared To Try', duration: '12:00', playbackId: 'PENDING', required: true },
        ]
    },
    {
        id: 5,
        slug: 'module-05',
        title: 'Holding Pattern',
        subtitle: 'What to watch for, what to protect',
        free: false,
        lessons: [
            { id: 'm05-l01', title: 'Hallucinations: when the crew makes things up',   duration: '10:00', playbackId: 'PENDING' },
            { id: 'm05-l02', title: 'Confidently wrong vs quietly right',              duration: '9:00',  playbackId: 'PENDING' },
            { id: 'm05-l03', title: 'The five scams to see coming',                    duration: '14:00', playbackId: 'PENDING' },
            { id: 'm05-l04', title: 'Your privacy rights, in plain English',           duration: '8:00',  playbackId: 'PENDING' },
            { id: 'm05-l05', title: 'The never-share list',                            duration: '8:00',  playbackId: 'PENDING' },
            { id: 'm05-l06', title: 'Trust, verify, or walk away, and your Cleared To Try', duration: '10:00', playbackId: 'PENDING' },
        ]
    },
    {
        id: 6,
        slug: 'module-06',
        title: 'Final Approach',
        subtitle: 'Building a lasting practice',
        free: false,
        lessons: [
            { id: 'm06-l01', title: 'One page, one habit, one tool',                   duration: '10:00', playbackId: 'PENDING' },
            { id: 'm06-l02', title: 'Knowing when NOT to use AI',                      duration: '10:00', playbackId: 'PENDING' },
            { id: 'm06-l03', title: 'Staying current without staying anxious',         duration: '9:00',  playbackId: 'PENDING' },
            { id: 'm06-l04', title: 'Paid tools: worth it, and not',                   duration: '9:00',  playbackId: 'PENDING' },
            { id: 'm06-l05', title: 'Bringing someone along',                          duration: '10:00', playbackId: 'PENDING' },
            { id: 'm06-l06', title: 'Final reflection, and your last Cleared To Try',  duration: '10:00', playbackId: 'PENDING' },
        ]
    }
];

// ── Kids & Teens tracks ──────────────────────────────────────────────────────
// Two tracks, ten weekly lessons each. Week 1 of each track is a free preview.
// Lesson IDs match course/kids-library.js (jr-w01..jr-w10, sr-w01..sr-w10).
// 'free' is per-lesson here (only Week 1), unlike the adult module-level 'free'.
const KIDS_TRACKS = [
    {
        id: 'junior', slug: 'junior', title: 'Junior AI Navigators', kids: true,
        lessons: [
            { id: 'jr-w01', title: 'What is AI?',                  duration: '9:00',  playbackId: 'PENDING', free: true  },
            { id: 'jr-w02', title: 'Talking to AI safely',         duration: '9:00',  playbackId: 'PENDING', free: false },
            { id: 'jr-w03', title: 'Machines that see',            duration: '9:00',  playbackId: 'PENDING', free: false },
            { id: 'jr-w04', title: 'Train your first classifier',  duration: '10:00', playbackId: 'PENDING', free: false },
            { id: 'jr-w05', title: 'When AI gets it wrong',        duration: '9:00',  playbackId: 'PENDING', free: false },
            { id: 'jr-w06', title: 'AI storytelling',              duration: '10:00', playbackId: 'PENDING', free: false },
            { id: 'jr-w07', title: 'Scratch helpers',              duration: '10:00', playbackId: 'PENDING', free: false },
            { id: 'jr-w08', title: 'Safe and smart online',        duration: '9:00',  playbackId: 'PENDING', free: false },
            { id: 'jr-w09', title: 'Build week',                   duration: '9:00',  playbackId: 'PENDING', free: false },
            { id: 'jr-w10', title: 'Showcase week',                duration: '9:00',  playbackId: 'PENDING', free: false },
        ],
    },
    {
        id: 'senior', slug: 'senior', title: 'Senior AI Pilots', kids: true,
        lessons: [
            { id: 'sr-w01', title: 'How AI systems work',             duration: '13:00', playbackId: 'PENDING', free: true  },
            { id: 'sr-w02', title: 'Prompt design and evaluation',    duration: '13:00', playbackId: 'PENDING', free: false },
            { id: 'sr-w03', title: 'Data and labelling',              duration: '13:00', playbackId: 'PENDING', free: false },
            { id: 'sr-w04', title: 'Building an image model',         duration: '14:00', playbackId: 'PENDING', free: false },
            { id: 'sr-w05', title: 'Bias, fairness and failure',      duration: '13:00', playbackId: 'PENDING', free: false },
            { id: 'sr-w06', title: 'AI-assisted storytelling and media', duration: '13:00', playbackId: 'PENDING', free: false },
            { id: 'sr-w07', title: 'Human-centred design',            duration: '13:00', playbackId: 'PENDING', free: false },
            { id: 'sr-w08', title: 'Ethics, privacy and copyright',   duration: '13:00', playbackId: 'PENDING', free: false },
            { id: 'sr-w09', title: 'Capstone sprint',                 duration: '13:00', playbackId: 'PENDING', free: false },
            { id: 'sr-w10', title: 'Demo day and reflection',         duration: '13:00', playbackId: 'PENDING', free: false },
        ],
    },
];

// Flat lookup map: lessonId → { ...lesson, module: moduleObj }
const LESSON_MAP = {};
for (const mod of MODULES) {
    for (const lesson of mod.lessons) {
        LESSON_MAP[lesson.id] = { ...lesson, moduleData: mod };
    }
}
// Kids lessons: 'free' lives on the lesson; moduleData carries the track + a
// free flag derived from the lesson so the token endpoint can gate uniformly.
for (const track of KIDS_TRACKS) {
    for (const lesson of track.lessons) {
        LESSON_MAP[lesson.id] = {
            ...lesson,
            moduleData: { id: track.id, slug: track.slug, title: track.title, kids: true, free: lesson.free === true },
        };
    }
}

module.exports = { MODULES, KIDS_TRACKS, LESSON_MAP };
