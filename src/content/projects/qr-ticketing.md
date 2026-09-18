---
title: QR Ticketing System
summary: TypeScript automation that turns event registrations into QR tickets and emails them out.
description: A Google Apps Script system in TypeScript that reads an event's registration sheet, generates a QR ticket per participant, emails it out and checks people in on scan — used at every NSU MiBC event.
tech: [TypeScript, Google Apps Script, Google Sheets, QR generation, Automated email]
repo: https://github.com/TanjimEram/QR-Generating-System-from-Sheets.
color: '#7A5CFF'
pattern: halftone
status: shipped
statusNote: Used across NSU MiBC events
featured: true
order: 4
source: manual
---

My first repository, and still the one I'm most pleased with. Registration for our club events used to be manual: collecting entries, making tickets, sending them out, checking people in. It ate hours of volunteer time per event.

I wrote a TypeScript system that reads the registration sheet, generates a QR ticket for each participant, and emails it to them automatically. Scanning the ticket at the door marks them present in an attendance sheet — at one event that meant 850+ participants checked in within an hour. We've used it for every NSU MiBC event since, including Marxcellence. The work it removed is the kind nobody notices until it's gone.
