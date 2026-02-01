# Rhythm Stretch Game

A web-based rhythm stretching game using pose detection and music.

## Features
- Real-time pose detection in your browser (no backend needed)
- Rhythm game with custom stretch routines
- Fun music and visual feedback
- Leaderboard and score tracking

## Requirements
- Modern web browser (Chrome, Firefox, Safari)
- A webcam for pose detection

## Getting Started

### 1. Open the App
- Visit the hosted site: [https://your-app-url.com](https://your-app-url.com)
- Or, to run locally:
  1. Download or clone this repository
  2. Open a terminal and run:
    ```bash
    cd app/frontend
    npm install
    npm run dev
    ```
  3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage
- Click "Start Game" to begin.
- Allow camera access when prompted.
- Follow the on-screen poses and try to match them in time with the music!
- Your score will be tracked and shown at the end.

## Project Structure
```
ellehacksproj/
├── app/
│   └── frontend/        # Next.js frontend
├── shared/              # Shared models/assets
└── README.md
```

## Troubleshooting
- Make sure your webcam is connected and allowed in your browser.
- If you see errors about missing packages, run `npm install` in `app/frontend`.
- For API key issues (if using Gemini or other AI features), check your `.env.local` file in `app/frontend`.

## Credits
- Built with Next.js, MediaPipe, and Racing Sans One font.
- Music belong to their respective owners.
- All assets and images belong to Hurkity aka Jessica 

---
Enjoy stretching and have fun!
