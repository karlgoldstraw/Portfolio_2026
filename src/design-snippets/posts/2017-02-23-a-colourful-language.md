---
title: A colourful language
tags: [Design systems]
draft: true
---

I love Zeplin, it’s the bridge that keeps our designers and developers communicating as the team we should be. Having a colour palette of 4 base colours, and 6 extended colours with % tints for opacity, was never going to be easy to work with for a developer that just want to use primary colours because they don’t have time for pretty things.

As a designer I like to use a variety of colours and tints, but as a developer I know it’s horrible having lots of different names for these colours. And it’s even worse communicating that you’d like to swap out Red for Red-lighter-light.

This is how a Sass file of colour references can easily start to look:

```scss
$Red: #E32222;
$Red-light: #E94F4F;
$Red-lighter: #F4AAAA;
$Red-ligtest: #FAD7D7; /* Pink? */
$Red-dark: #A41515;
$Red-darkest: #600C0A;
```

Code and communication quickly it becomes a mess, and when discussing verbally, nobody really knows which colour you’re talking about, right?

{# TODO: the original draft had an image here (assets/img/tbc.png) that hasn't been made yet #}
