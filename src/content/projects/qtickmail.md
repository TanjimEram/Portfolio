---
title: QTickMail
summary: Google Apps Script that turns an event registration sheet into QR tickets, emails them out and checks people in on scan.
description: A Google Apps Script check-in system that reads an event's registration sheet, generates a QR ticket per participant, emails it as a PDF and marks people present in an attendance sheet when the ticket is scanned — used at NSU MiBC events.
tech: [Google Apps Script, JavaScript, Google Sheets, Gmail, Google Drive, Google Docs, QuickChart QR API]
repo: https://github.com/TanjimEram/QTickMail
color: '#7A5CFF'
pattern: halftone
status: shipped
statusNote: Used across NSU MiBC events
featured: true
order: 4
source: manual
---

My first repository, and still the one I'm most pleased with. Registration for our club events used to be manual: collecting entries, making tickets, sending them out, checking people in. It ate hours of volunteer time per event.

I wrote an Apps Script system that reads the registration sheet, generates a QR ticket for each participant, and emails it to them automatically. Scanning the ticket at the door marks them present in an attendance sheet — at one event that meant 850+ participants checked in within an hour. We've used it for every NSU MiBC event since, including Marxcellence. The work it removed is the kind nobody notices until it's gone.

What it does:

- Generates a QR code per team from the sheet (QuickChart) and stores it in a Drive folder; the base version is meant to be reused with minor tweaks.
- The QR opens a web app that marks the team present in the Attendance sheet, and tells the scanner if they were already checked in.
- V2 (Marxcellence 2026): builds a PDF ticket from a Google Docs template, emails it through Gmail, and paces sends against the daily quota with timed triggers.
- Also handled the Round 1 case drop: mailed the case to every team lead and member, and scanned the inbox for bounces.
