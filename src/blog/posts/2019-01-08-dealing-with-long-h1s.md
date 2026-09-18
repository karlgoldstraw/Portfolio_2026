---
title: Dealing with long H1's
tags: [Typography, Responsive design]
draft: true
---

On nhs.uk we had some really long clinical words, words that are kind of important to display correctly.

But we also have users who have some really small screens. (Over 100 million session per year are at 375px and less).

Whilst we needed a minimum font-size for legibility on small screens, the same font-size didn't always show all of the characters in a 20 letter condition across a 320px mobile screen, especially when it was a H1 title.

Some examples that didn't fit a mobile screen width were:

- Electroencephalogram (20 letters)
- Hyperparathyroidism (19 letters)
- Cholangiocarcinoma (18 letters)

{% figure "/assets/img/h1s-1-desktop.png", "An iPhone showing a condition title overflowing off the screen", "The H1 of the page was cut off when the character length was long." %}

The image above shows just how even this 17 word condition wouldn't fit onto the given styles. And yet we had to find a way to accomodate over 4,380 H1's with the same design at scale.
