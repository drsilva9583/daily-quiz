# Daily Quiz

A single-page, mobile-friendly quiz app that loads questions from `data.json`, selects a subject (based on day of week), shows a random starting question and then steps through questions sequentially. Includes animated UI, timer, score tracking, and support for multiple-choice and typed-answer questions.

## Features
- Subject-of-the-day (based on day of week) or explicit subject load
- Random start index, sequential next-button navigation, stops when cycle returns to start
- Two question types:
  - Multiple choice (questionType: 1)
  - Text input answer (questionType: 2)
- Score and progress UI
- Timer per-question with circular SVG animation
- CSS animations for question transitions
- Plain HTML/CSS/JavaScript (no frameworks)

## Quick start

1. Open a terminal in the project folder:
   cd "c:\Users\diego\Downloads\daily-quiz-app\daily-quiz"

2. Serve files with a simple local server (required so `fetch('data.json')` works):
   - Python:
     python -m http.server 8000
   - or Node (http-server):
     npx http-server -c-1 .

3. Open browser:
   http://localhost:8000

## Files
- `index.html` — main page markup
- `styles/main.css` — styles and animations
- `app.js` — quiz logic (load questions, navigation, scoring)
- `data.json` — question bank (per-subject arrays)
- `README.md` — this file

## data.json schema

Top-level object keyed by subject label (keys are case-sensitive to how your code maps them). Each subject is an array of question objects.

Example question (multiple choice):
```json
{
  "question": "Where is the Great Barrier Reef located?",
  "questionType": 1,
  "choices": ["Africa","North America","South America","Asia","Australia","Europe"],
  "correctChoice": "Australia",
  "score": 5
}
```

Example question (typed answer):
```json
{
  "question": "What planet is the Curiosity rover exploring?",
  "questionType": 2,
  "correctAnswer": "Mars",
  "score": 10
}
```

Notes:
- Your code supports variations in property names (`correctChoice` / `correctAnswer`, `questionType` / `type`) but keep a consistent format where possible.
- Each subject should include at least 10 questions for a good experience.

## How navigation works
- On first load, app picks the subject (default: day-of-week) and a random start index into that subject's question array.
- Current question = startIndex. Next advances sequentially.
- When next would return to startIndex, the quiz stops (cycle complete).
- Use Start / Answer / Next / Quit controls to run the quiz.

## Troubleshooting
- If questions fail to load, check DevTools Console and Network tab. Common cause: opening `index.html` via `file://` — use a local HTTP server.
- If styles for selected choice don't appear in older browsers, ensure radio input and label ordering or use CSS fallback for `:has()`.

## Development tips
- Keep `currentQuestion` state in `app.js` so answer checking uses the original object (avoid reading only rendered text).
- When rendering MC options, append the `input` element before its `label` so `input:checked + label` selector works cross-browser.
- Cache `data.json` after first fetch to avoid repeated network calls.

## License & Contact
MIT License — modify as needed.  
Contact: quiz@youremail.example