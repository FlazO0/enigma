# Riddle Game

A minimalist, dark-themed riddle game built with a clean interface and subtle animations.
Players must solve a sequence of riddles to progress through stages while tracking time and attempts.

This version focuses on:

* Clean black UI (no heavy cards or flashy effects)
* Enigmatic typography
* Smooth micro-animations
* Local ranking system (stored in `localStorage`)
* Lightweight architecture (no build tools required)

---

## Technologies Used

* **HTML5** – Structure
* **Tailwind CSS (CDN)** – Styling (no custom CSS files)
* **Vanilla JavaScript** – Game logic, timer, ranking system
* **localStorage API** – Persistent local ranking

No frameworks, no bundlers, no dependencies.

---

## Project Structure

```
/project-folder
│── index.html
│── script.js
```

* `index.html` → Layout + Tailwind configuration
* `script.js` → Game logic, timer, ranking system

---

## How to Run

1. Clone or download this repository.
2. Make sure `index.html` and `script.js` are in the same directory.
3. Open `index.html` in a modern browser.
4. Start solving riddles.

No installation required.

---

## How the Ranking Works

The ranking system uses `localStorage` with the key:

```
riddles_ranking_v1
```

It stores:

```json
{
  "bestTimeMs": number,
  "bestAttempts": number,
  "runs": [
    {
      "at": "ISO date string",
      "timeMs": number,
      "attempts": number
    }
  ]
}
```

* Best time → lower is better
* Best attempts → lower is better
* Keeps up to 20 recent runs

All data is stored locally in the browser.

---

## Customizing the Game

To add new riddles, edit the `gameData.stages` array inside `script.js`:

```javascript
{
  name: "Stage X",
  title: "New Riddle",
  question: "Your question here...",
  answers: ["answer1", "answer2"],
  hint: "Optional hint",
  difficulty: "Medium"
}
```

You can freely expand the number of stages.

---

## Design Philosophy

* Pure black background
* No card-heavy UI
* Minimal visual noise
* Enigmatic serif title + modern sans body font
* Lightweight animations only where necessary

---

## Notes

* This project runs entirely in the browser.
* No user data is sent anywhere.
* Clearing browser storage will reset the ranking.