---
title: Athena
summary: A desktop voice assistant I built to run my own machine.
description: A Python voice assistant for Windows 11 with local wake-word detection, Groq Whisper speech-to-text, an LLM brain with tool calling, a safety gate for risky actions and Edge TTS for the voice.
tech: [Python, Groq, openWakeWord, Edge TTS, pywebview, Supabase, Tavily]
repo: https://github.com/TanjimEram/Athena-VA
video: /project_vids/Athena.mp4
color: '#4C8DFF'
pattern: rings
status: ongoing
statusNote: Hobby project
featured: false
order: 1
source: manual
---

Athena is my first real software project. I wanted something on my laptop that worked the way JARVIS works for Tony Stark — I talk, it handles the busywork. I built the whole thing myself, from the speech pipeline to the command handling.

The constraint is the APIs. I'm on free tiers, which caps how smart Athena can actually be, and getting closer to what I want without paying for API access is the problem I'm still chewing on. It's a hobby project, so the challenge is part of the point.

What works today:

- Say "hey Jarvis" and ask in plain words; Athena answers in an Irish voice — or actually does it: opens apps, searches the web, sets the volume, locks the screen.
- Pipeline: wake word (openWakeWord, local) → speech-to-text (Groq Whisper) → brain (llama-3.3-70b with tool calling) → safety gate → Windows skills → voice (edge-tts). Risky actions need a spoken confirmation; failures are reported, never faked.
- Screen vision, live web research (Tavily) and persistent memory (Supabase), with an orb/dashboard UI and a settings page that applies most changes without a restart.
- Guided mode: she reads your screen and talks you through a task one step at a time.
