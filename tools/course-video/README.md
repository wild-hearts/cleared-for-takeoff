# Course videos: slides plus narration, hosted on Mux

52 lesson videos: Junior AI Navigators weeks 1 to 8, Senior AI Pilots weeks 1 to 8, and the
36 lessons of AI for Real Life. Each one is the lesson's slides held for the length of
Naomi's narration for that slide (cloned voice, ElevenLabs).

| File | What it is |
|---|---|
| `lessons.json` | One entry per video: lesson ID (as used by the site), new title, slide range, narration file, deck PDF, audio folder, duration, and the Mux asset and playback IDs once uploaded |
| `render.py` | Builds `<lesson-id>.mp4` from a deck PDF and the per-slide MP3s |
| `mux_upload.py` | Uploads the MP4s to Mux (signed playback, auto English captions) and writes the playback IDs into `lessons.json` |
| `apply.py` | Copies titles, durations and playback IDs from `lessons.json` into `api/video-library.js`, `course/watch.html`, `course/dashboard.html` and `course/kids-library.js` |

The narration scripts live in `course-content/narration/`, with the list of slide problems
found while writing them in `course-content/narration/SLIDE-FIXES.md`. Media files are not
in git (see `.gitignore`); the MP3s are also in the Wild Hearts ElevenLabs workspace, one
flow per deck.

## Order of operations

1. `render.py` (or re-render only the lessons whose slides changed).
2. `mux_upload.py` with `MUX_TOKEN_ID` and `MUX_TOKEN_SECRET` set. Re-runnable; it skips
   lessons that already have a playback ID. To replace a video, clear that lesson's
   `playbackId` in `lessons.json` first.
3. `apply.py`, then commit. Titles, durations and playback IDs change in one commit, so the
   site never shows a new title over an old video.

Adult lesson IDs are unchanged, so students' saved progress carries over. Module 4 keeps its
pick-a-track shape: `m04-l01` is the welcome, `m04-track-a` to `-d` the tracks, `m04-l06`
the close. Kids weeks 9 and 10 have no decks yet and stay "Coming soon".
