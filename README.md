# Daily Challenge Pomodoro Timer

[![Main Pipeline](https://github.com/Tadwork/vibe-pomodoro-daily-challenge/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/Tadwork/vibe-pomodoro-daily-challenge/actions/workflows/ci.yml)
[![Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen)](https://github.com/Tadwork/vibe-pomodoro-daily-challenge/actions/workflows/ci.yml)

A simple Node.js + Tailwind Pomodoro timer app with focus and break cycles.

## Screenshot

![Pomodoro timer app screenshot](./docs/app-screenshot.png)

## Run locally

```bash
npm install
npm run build:css
npm start
```

Open `http://localhost:3000`.

## Test and coverage

```bash
npm test
npm run test:coverage
```

Current automated test coverage scope is `lib/**/*.js`.
