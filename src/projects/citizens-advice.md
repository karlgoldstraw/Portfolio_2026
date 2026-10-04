---
title: Citizens Advice
intro: A redesigned case management system for Citizens Advice
order: 2
cardTitle: "Citizens Advice: A case management system redesign"
cardImage: /assets/img/Citizens-Advice.svg
cardAlt: Citizens Advice logo
---

{% figure "/assets/img/citizens1.jpg", "The Casebook dashboard on a laptop, tablet and phone. The laptop shows 'Good morning, Jane' with charts of this week's queries, a news feed of colleagues' activity and a 'Find a client' search. The tablet and phone show a client's profile and case history." %}

<p class="lede">Citizens Advice helps millions of people a year with debt, housing, benefits and more. Every one of those conversations is recorded by an adviser in a case management system. I led the user experience of Casebook, the system built to replace the one everybody loved to hate.</p>

## At a glance

- **Organisation:** Citizens Advice
- **My role:** User Experience Lead for the Casebook team (contract Senior Interaction Designer)
- **When:** November 2015 to April 2017
- **Working with:** a product owner, delivery manager, user researcher, data analyst, front and back end developers, and a network of over 250 local Citizens Advice offices who tested it

## The problem

The old system, Petra, was bought off the shelf and adapted. It had been built by asking everyone across the network what they needed, building all of it over two years, and testing at the end. The result did everything for everyone and nothing well for anyone.

My favourite way of explaining it to advisers was a TV remote. Everyone has one with 50 buttons, uses 5 of them, and still sometimes opens the DVD player by mistake. Petra was that remote.

Advisers are often volunteers with limited time. Every extra click was time not spent helping someone.

## A different way of working

Casebook was built in-house, in two week sprints, with a few features at a time designed, tested with real advisers and improved before moving on. We signed up 35 "super tester" offices, a representative mix of urban and rural, large and small, who tested intensively, alongside over 250 light touch testers across the network.

I visited local offices, sat with advisers while they worked and interviewed the people they help. Casebook was tested with users via DAC who had access needs, including neurodivergent people and people with motor and vision impairments, and the system was designed to meet WCAG from the start rather than retrofitted.

## Starting with the worst bit: issue codes

Every case has to be coded with an Advice Issue Code so the charity can report on what people need help with. The codes sit in three levels: 16 at the top, up to 32 underneath each of those, and as many as 71 at the third level. In Petra it took 12 clicks and three long dropdowns to add one, with no way of seeing the options before you opened each list.

We worked out that saving just 2 seconds per code entered would add up to a whole year of adviser time across the network. So it was worth getting right.

I designed a single search field that looks across all three levels at once, so an adviser can type "council tax" or a client's own words like a lender's name and get the right code without knowing where it lives in the hierarchy. Our data analyst used pattern recognition on past cases to suggest related codes, the way a shop suggests things you might also want. I built the idea as a quick HTML prototype with dummy data first, then connected it to the real set of codes, so we could put it in front of advisers within days.

## The rest of the system

From there the same approach went through the core of an adviser's day:

- **A dashboard** with the office's activity and a prominent client search, because finding the right person is the start of nearly every task.
- **A client page** with their whole history in one place, so a new adviser can get up to speed without opening a dozen records.
- **Case notes** with a short structured summary for supervisors and a full screen writing view for advisers who need to write in detail.
- **A reading view** that lays out a whole case in one readable, printable page, with larger text and an inverted colour option for people with low vision or working late in a dark room.
- **Smart prompts** that suggest further questions or guidance based on the issue codes chosen.

## What advisers said

In May 2016 we put the first features in front of the whole network. Over 1,200 people from 73% of local offices took part. Satisfaction with Casebook was higher than with Petra, it was seen as much simpler, and most people completed the tasks without any help or training.

The feedback was honest and useful. Terminology tripped people up ("client check in" didn't mean what we thought it meant), placeholder text confused them, and with only a handful of test clients in the system, search was hard to judge. All of that went straight back into the next sprints.

## What happened next

Casebook replaced Petra from 2017 and was rolled out across every local Citizens Advice. It now forms the backbone of the organisation's CRM.

## What I learned

Fix the thing people do a hundred times a day before the thing they do once a month. Two seconds, multiplied by a network, is a year.
