---
title: Designing responsive accessible tables
tags: [Accessibility, CSS]
draft: true
---

Tables can be a pain to display especially on smaller screens.

I've seen tables treated very differently across the web. Either they get squashed into the viewport, or they are fixed-width and require a user to know to scroll across horizontally. Users tend to not like scrolling, especially horizontally.

{% figure "/assets/img/Desktop-table1.jpg", "A screenshot of a table with 4 rows and 4 columns. The forth column is visually cut off the endge of the screen.", "MoneySavingExpert.com uses affordance to tell users to scroll horizontally" %}

## Creating a responsive table

I've been working on a way to display tables on a small screen. You can change the layout of a table easily using CSS. The problem is though, accessibility with screenreaders.

When you add `display:block/grid/flex;` to a table, or cells within, then screenreaders such as iOS VoiceOver no longer recognise the elements as a table and thus are not announced as such. It’s true you could use divs and tag them up with ARIA, but then you’re losing the semantic nature of native tables, and you're giving yourself a lot of extra code each time you want to insert a simple table.

As a fix, I've found that you need to add `roles` to each of the table, th, td, etc, markup. For example, add:

- `role="table"` to the table
- `role="row"` to the rows
- `role="columnheader"` to the th's
- `role="cell"` to the td's

These attribute additions help VoiceOver to recognise the table as a table once again whilst displaying responsively and you're only adding a little bit of code to an already semantic element. I tested these on Mac VoiceOver, iPhone VoiceOver and NVDA with IE11.

Once you have these in place, then you can apply `display:block;` or whatever to your table element and make it change appearance.

For my example, I hid the `<th>`'s with the non-accessible `display:none;` I really don't want anyone to see this, including screenreaders.

I then used `data-label` on each cell, which is a replication of the respective `<th>` to show with each data field. This is really easy to set up in a template, especially if you are using dynamic fields for your table from your CMS.

An advantage of showing `data-label` on each cell alongside it's data cell for users with access needs who zoom the screen is that they wouldn;t lose context when zoomed at a high percentage.

Here's an example of my responsive table:

<figure>
<iframe height="300" style="width: 100%;" scrolling="no" title="Responsive table" src="https://codepen.io/theturning-the-reactor/embed/XQOKPa/?height=265&theme-id=0&default-tab=html" loading="lazy" allowfullscreen>
See the Pen <a href="https://codepen.io/theturning-the-reactor/pen/XQOKPa/">Responsive table</a> by Karl Goldstraw on <a href="https://codepen.io">CodePen</a>.
</iframe>
<figcaption>View and edit the code on CodePen</figcaption>
</figure>
