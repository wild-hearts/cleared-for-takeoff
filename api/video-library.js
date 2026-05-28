// Cleared For Takeoff — Video Library
// Maps lesson IDs to Mux playback IDs and metadata
//
// SETUP: After uploading each video to Mux, copy the Playback ID from the Mux
// dashboard and replace the corresponding 'PENDING' value below.
//
// Mux dashboard → Video → click the video → copy "Playback ID"
//
// free: true  → accessible without an access code (Modules 1 and 2, free preview)
// free: false → requires a valid COURSE_ACCESS_CODE to watch

const MODULES = [
    {
        id: 1,
        slug: 'module-01',
        title: 'Pre-Flight Checks',
        subtitle: 'Understanding AI before you use it',
        free: true,
        lessons: [
            { id: 'm01-intro',  title: 'Welcome to Cleared For Takeoff',         duration: '2:30',  playbackId: 'PENDING' },
            { id: 'm01-l01',    title: 'What AI Actually Is',                    duration: '10:30', playbackId: 'PENDING' },
            { id: 'm01-l02',    title: 'Three Things AI Does Well (and Badly)',  duration: '10:00', playbackId: 'PENDING' },
            { id: 'm01-l03',    title: 'Choosing Your First Tool',               duration: '11:00', playbackId: 'PENDING' },
            { id: 'm01-l04',    title: 'Signing Up Safely',                      duration: '10:00', playbackId: 'PENDING' },
            { id: 'm01-l05',    title: 'Setting Up Your Account',                duration: '10:00', playbackId: 'PENDING' },
            { id: 'm01-l06',    title: 'Your First Hello',                       duration: '9:00',  playbackId: 'PENDING' },
        ]
    },
    {
        id: 2,
        slug: 'module-02',
        title: 'Cleared For Taxi',
        subtitle: 'How to talk to AI well',
        free: true,
        lessons: [
            { id: 'm02-intro',  title: 'Module 2 Introduction',                              duration: '2:30',  playbackId: 'PENDING' },
            { id: 'm02-l01',    title: 'Prompting in Plain English',                         duration: '12:00', playbackId: 'PENDING' },
            { id: 'm02-l02',    title: 'The Four-Line Prompt',                               duration: '12:00', playbackId: 'PENDING' },
            { id: 'm02-l03',    title: 'Ask AI to Ask You Better Questions',                 duration: '12:00', playbackId: 'PENDING' },
            { id: 'm02-l04',    title: 'When to Be Specific, When to Be Vague, When to Start Over', duration: '12:00', playbackId: 'PENDING' },
            { id: 'm02-l05',    title: 'Mistakes Everyone Makes',                            duration: '11:00', playbackId: 'PENDING' },
            { id: 'm02-l06',    title: 'Saving and Reusing Prompts',                         duration: '10:00', playbackId: 'PENDING' },
        ]
    },
    {
        id: 3,
        slug: 'module-03',
        title: 'Cleared For Takeoff',
        subtitle: 'AI for your actual life — pick 3 paths',
        free: false,
        pickYourPath: true,
        pathCount: 3,
        lessons: [
            { id: 'm03-intro',   title: 'Module 3 Introduction',       duration: '3:00',  playbackId: 'PENDING', required: true },
            { id: 'm03-path-a',  title: 'Path A: Writing Emails and Letters', duration: '14:00', playbackId: 'PENDING', path: 'A' },
            { id: 'm03-path-b',  title: 'Path B: Summarising Documents',      duration: '13:00', playbackId: 'PENDING', path: 'B' },
            { id: 'm03-path-c',  title: 'Path C: Planning',                   duration: '14:00', playbackId: 'PENDING', path: 'C' },
            { id: 'm03-path-d',  title: 'Path D: Research and Fact-Finding',  duration: '14:00', playbackId: 'PENDING', path: 'D' },
            { id: 'm03-path-e',  title: 'Path E: Health Information',         duration: '14:00', playbackId: 'PENDING', path: 'E' },
            { id: 'm03-path-f',  title: 'Path F: Money and Admin',            duration: '14:00', playbackId: 'PENDING', path: 'F' },
            { id: 'm03-close',   title: 'Module 3 Close',              duration: '4:00',  playbackId: 'PENDING', required: true },
        ]
    },
    {
        id: 4,
        slug: 'module-04',
        title: 'In The Air',
        subtitle: 'Deep work on one real project — pick 1 track',
        free: false,
        pickYourTrack: true,
        trackCount: 1,
        lessons: [
            { id: 'm04-intro',    title: 'Module 4 Introduction',   duration: '4:00',  playbackId: 'PENDING', required: true },
            { id: 'm04-track-a',  title: 'Track A: Write Something', duration: '25:00', playbackId: 'PENDING', track: 'A' },
            { id: 'm04-track-b',  title: 'Track B: Start Something', duration: '25:00', playbackId: 'PENDING', track: 'B' },
            { id: 'm04-track-c',  title: 'Track C: Sort Something',  duration: '25:00', playbackId: 'PENDING', track: 'C' },
            { id: 'm04-track-d',  title: 'Track D: Learn Something', duration: '25:00', playbackId: 'PENDING', track: 'D' },
            { id: 'm04-close',    title: 'Module 4 Close',           duration: '4:00',  playbackId: 'PENDING', required: true },
        ]
    },
    {
        id: 5,
        slug: 'module-05',
        title: 'Holding Pattern',
        subtitle: 'What to watch for, what to protect',
        free: false,
        lessons: [
            { id: 'm05-intro',  title: 'Module 5 Introduction',                           duration: '4:00',  playbackId: 'PENDING' },
            { id: 'm05-l01',    title: 'Hallucinations — What They Are and How to Spot Them', duration: '11:00', playbackId: 'PENDING' },
            { id: 'm05-l02',    title: 'Confidently Wrong and Quietly Right',             duration: '11:00', playbackId: 'PENDING' },
            { id: 'm05-l03',    title: 'Scam Awareness',                                  duration: '12:00', playbackId: 'PENDING' },
            { id: 'm05-l04',    title: 'Privacy and Australian Law',                      duration: '10:00', playbackId: 'PENDING' },
            { id: 'm05-l05',    title: 'What Never to Put Into an AI Tool',               duration: '10:00', playbackId: 'PENDING' },
            { id: 'm05-l06',    title: 'Trust, Verify, Walk Away',                       duration: '11:00', playbackId: 'PENDING' },
        ]
    },
    {
        id: 6,
        slug: 'module-06',
        title: 'Final Approach',
        subtitle: 'Building a lasting practice',
        free: false,
        lessons: [
            { id: 'm06-intro',  title: 'Module 6 Introduction',                        duration: '3:00',  playbackId: 'PENDING' },
            { id: 'm06-l01',    title: 'Building Your Routine',                        duration: '10:00', playbackId: 'PENDING' },
            { id: 'm06-l02',    title: 'When Not to Use AI',                           duration: '10:00', playbackId: 'PENDING' },
            { id: 'm06-l03',    title: 'Staying Current — Following AI Without Panic', duration: '10:00', playbackId: 'PENDING' },
            { id: 'm06-l04',    title: 'Where to Go Next',                             duration: '10:00', playbackId: 'PENDING' },
            { id: 'm06-l05',    title: 'Bringing Someone Along',                       duration: '10:00', playbackId: 'PENDING' },
            { id: 'm06-l06',    title: 'Final Reflection and Graduation',              duration: '12:00', playbackId: 'PENDING' },
        ]
    }
];

// Flat lookup map: lessonId → { ...lesson, module: moduleObj }
const LESSON_MAP = {};
for (const mod of MODULES) {
    for (const lesson of mod.lessons) {
        LESSON_MAP[lesson.id] = { ...lesson, moduleData: mod };
    }
}

module.exports = { MODULES, LESSON_MAP };
