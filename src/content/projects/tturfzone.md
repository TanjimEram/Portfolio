---
title: TTurfZone
summary: A slot-booking site for a client's turf ground — pick a date, pick a slot, book it.
description: A booking system for a single sports turf in Bangladesh, built for a client with Flask and PostgreSQL, so players can see what's free and reserve a 90-minute slot without a phone call.
tech: [Python, Flask, PostgreSQL, SQLAlchemy, Alembic, Jinja, JavaScript, pytest]
repo: https://github.com/TanjimEram/WEB_TTurfZone
color: '#1FA463'
pattern: grid
status: in-development
statusNote: Client project
featured: false
order: 3
source: manual
---

A client project: a booking system for a sports turf, so players can see what's free and reserve a slot without a phone call. Currently in development — the build runs locally and is waiting on hosting before it goes live.

Built so far:

- Public booking flow: a date picker for the booking window, a 12-slot day grid fed by an availability API, and a details form that re-validates everything server-side.
- Double booking is prevented by the database (a partial unique index), not just the front end — a concurrency test fires 10 simultaneous bookings and exactly one wins.
- Admin area behind login: dashboard, filterable bookings list with tel/WhatsApp links, and a day calendar where the owner can block or free slots.
- 145 tests, Asia/Dhaka time throughout, and customer names and phone numbers never leave the admin pages.
