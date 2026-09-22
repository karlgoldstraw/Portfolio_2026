// Works each exercise the way somebody in a session would, and checks that
// the barrier still bites and that the accessible version still works. Two
// barriers are only visible here and not to axe: colour as the only cue, and
// a div standing in for a button.
const ROOT = "/accessibility-discovery";

// The broken / fixed radios are visually hidden, so the label is what a
// person clicks and what the test clicks too.
const version = (name, value) => `label[for="${name}-mode-${value}"]`;

async function open(context, base, path, failures) {
  const page = await context.newPage();
  page.on("pageerror", (error) => failures.push(`${path} threw: ${error}`));
  await page.goto(base + ROOT + path, { waitUntil: "load" });
  return page;
}

export default async function run({ context, base, ok, note, failures }) {
  // ---------- 1. Low contrast ----------
  {
    const page = await open(context, base, "/low-contrast/", failures);

    const code = (await page.textContent("#contrast-code")).trim();
    ok("contrast: a six character reference is generated", /^[A-Z0-9]{6}$/.test(code), code);

    const start = parseFloat(await page.textContent("#contrast-ratio"));
    ok("contrast: starts below the AA threshold", start < 4.5, `${start}:1`);

    await page.click("#contrast-aa");
    const passing = parseFloat(await page.textContent("#contrast-ratio"));
    ok("contrast: the AA jump reaches 4.5:1", passing >= 4.5, `${passing}:1`);

    const valueText = await page.getAttribute("#contrast-range", "aria-valuetext");
    ok(
      "contrast: the slider announces the ratio and the verdict",
      Boolean(valueText) && valueText.includes(":1") && /AA/.test(valueText),
      valueText
    );

    await page.fill("#contrast-answer", code.toLowerCase());
    await page.click("#contrast-form button[type=submit]");
    ok("contrast: the right reference is accepted", await page.locator("#contrast-result.result--pass").isVisible());

    await page.fill("#contrast-answer", "ZZZZZZ");
    await page.click("#contrast-form button[type=submit]");
    ok("contrast: a wrong reference is rejected", await page.locator("#contrast-result.result--fail").isVisible());

    await page.close();
  }

  // ---------- 2. Form controls ----------
  {
    const page = await open(context, base, "/form-controls/", failures);

    // Margaret's details exactly as she gives them on the phone.
    await page.fill("#bf-name", "Margaret Okonkwo-Bell");
    ok(
      "forms: the name is truncated with no warning",
      (await page.inputValue("#bf-name")) === "Margaret Okonkw",
      await page.inputValue("#bf-name")
    );

    await page.fill("#bf-day", "3");
    await page.fill("#bf-month", "7");
    await page.fill("#bf-year", "1962");
    await page.fill("#bf-address", "14 Brynmill Terrace, Swansea");
    await page.fill("#bf-postcode", "SA1 5LN");
    await page.click("#broken-form button[type=submit]");

    ok("forms: natural input is rejected", await page.locator("#bf-error").isVisible());
    ok("forms: the date of birth is thrown away", (await page.inputValue("#bf-year")) === "");
    ok("forms: attempts are counted", (await page.textContent("#broken-attempts")) === "1");

    // The undocumented format: two digit day and month, no space in the postcode.
    await page.fill("#bf-day", "03");
    await page.fill("#bf-month", "07");
    await page.fill("#bf-year", "1962");
    await page.fill("#bf-postcode", "SA15LN");
    await page.click("#broken-form button[type=submit]");
    ok("forms: only the hidden format is accepted", await page.locator("#form-result.result--pass").isVisible());

    await page.click(version("form", "fixed"));
    ok("forms: the accessible version replaces the broken one", (await page.locator("#fixed-form").isVisible()) && !(await page.locator("#broken-form").isVisible()));

    await page.click("#fixed-form button[type=submit]");
    ok("forms: an error summary appears", await page.locator("#ff-summary").isVisible());
    ok(
      "forms: focus moves to the summary",
      (await page.evaluate(() => document.activeElement.id)) === "ff-summary"
    );
    ok(
      "forms: the error is added to the field description",
      (await page.getAttribute("#ff-name", "aria-describedby")) === "ff-name-error ff-name-hint"
    );
    ok("forms: the field is marked invalid", (await page.getAttribute("#ff-name", "aria-invalid")) === "true");
    ok("forms: every required field is listed", (await page.locator("#ff-summary-list a").count()) === 4);

    await page.locator("#ff-summary-list a").first().click();
    ok(
      "forms: a summary link moves focus to its field",
      (await page.evaluate(() => document.activeElement.id)) === "ff-name"
    );

    await page.fill("#ff-name", "Margaret Okonkwo-Bell");
    await page.fill("#ff-day", "3");
    await page.fill("#ff-month", "7");
    await page.fill("#ff-year", "1962");
    await page.fill("#ff-address", "14 Brynmill Terrace, Swansea");
    await page.fill("#ff-postcode", "SA1 5LN");
    await page.click("#fixed-form button[type=submit]");

    const outcome = await page.textContent("#form-result");
    ok("forms: natural input is accepted", await page.locator("#form-result.result--pass").isVisible());
    ok("forms: the postcode is tidied up rather than rejected", outcome.includes("SA1 5LN"));

    await page.close();
  }

  // ---------- 3. Keyboard only ----------
  {
    const page = await open(context, base, "/keyboard-only/", failures);

    await page.click("#kb-count");
    const broken = await page.textContent("#kb-result");
    ok("keyboard: only one of five controls can be reached", broken.includes("1 of 5"), broken.trim().slice(0, 70));

    await page.click(version("kb", "fixed"));
    await page.click("#kb-count");
    ok("keyboard: the accessible version reaches all five", (await page.textContent("#kb-result")).includes("5 of 5"));

    // The fixed booking completed with keys alone, no pointer at all.
    await page.focus("#kb-room-ceredigion");
    await page.keyboard.press("Space");
    await page.keyboard.press("Tab");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    const time = await page.inputValue("#kb-time");
    await page.focus("#kb-fixed-form button[type=submit]");
    await page.keyboard.press("Enter");
    ok(
      "keyboard: the booking completes with keys alone",
      (await page.textContent("#kb-result")).includes("Booked"),
      `room and ${time || "no time"} chosen by keyboard`
    );

    await page.click(version("kb", "broken"));
    await page.locator(".kb-card[data-room=Ceredigion]").click();
    await page.locator(".kb-select").click();
    await page.locator(".kb-option[data-time='10:00']").click();
    await page.click("#kb-broken-submit");
    ok("keyboard: the broken flow still works with a mouse", (await page.textContent("#kb-result")).includes("Booked"));

    await page.close();
  }

  // ---------- 4. Colour as the only cue ----------
  {
    const page = await open(context, base, "/colour-alone/", failures);

    ok("colour: ten orders are listed", (await page.locator("#orders-broken tr").count()) === 10);
    ok("colour: the broken table says everything with a dot", (await page.locator("#orders-broken .dot").count()) === 10);
    ok(
      "colour: the broken status column has no text at all",
      (await page.locator("#orders-broken td:last-child").allTextContents()).every((text) => text.trim() === "")
    );
    ok("colour: the accessible table spells the status out", (await page.locator("#orders-fixed .status").count()) === 10);

    await page.selectOption("#colour-filter", "deuteranopia");
    ok(
      "colour: the vision simulation is applied",
      (await page.evaluate(() => document.getElementById("colour-stage").style.filter)).includes("#filter-deuteranopia")
    );

    await page.fill("#colour-answer", "3");
    await page.click("#colour-form button[type=submit]");
    ok("colour: the right count is accepted", await page.locator("#colour-result.result--pass").isVisible());

    await page.close();
  }

  // ---------- 5. What a screen reader has to work with ----------
  {
    const page = await open(context, base, "/screen-reader/", failures);

    await page.click("#sr-next");
    ok("screen reader: stepping starts at the first announcement", (await page.textContent("#sr-position")).includes("1 of"));

    await page.click("#sr-links");
    const brokenLinks = await page.locator("#sr-links-list li").allTextContents();
    ok(
      "screen reader: the broken links list says nothing useful",
      brokenLinks.length > 0 && brokenLinks.every((text) => /read more|click here/i.test(text)),
      brokenLinks.join(" | ")
    );

    await page.fill("#sr-answer-phone", "0800 111 2233");
    await page.fill("#sr-answer-coat", "Gower");
    await page.click("#sr-form button[type=submit]");
    ok("screen reader: the answers are not available in the broken version", await page.locator("#sr-result.result--fail").isVisible());

    await page.click(version("sr", "fixed"));
    const fixedLinks = await page.locator("#sr-links-list li").allTextContents();
    ok(
      "screen reader: the accessible links list describes each link",
      fixedLinks.some((text) => text.includes("Gower waterproof parka")),
      fixedLinks.join(" | ")
    );

    await page.fill("#sr-answer-phone", "0800 111 2233");
    await page.fill("#sr-answer-coat", "the Gower parka");
    await page.click("#sr-form button[type=submit]");
    ok("screen reader: both answers are reachable once there is text", await page.locator("#sr-result.result--pass").isVisible());

    await page.close();
  }

  // ---------- 6. Target size ----------
  {
    const page = await open(context, base, "/target-size/", failures);

    await page.click("#measure");
    const measured = await page.textContent("#target-result");
    ok(
      "targets: the broken checkout fails 2.5.8",
      measured.includes("under 24 by 24") && measured.includes("fails 2.5.8 outright") || measured.includes("fail 2.5.8 outright"),
      measured.trim().slice(0, 90)
    );
    ok("targets: the destructive button's clearance is reported", measured.includes("Cancel order sits"));

    await page.locator("#cookie-broken p").click();
    ok("targets: missing the close button counts as a mis-tap", (await page.textContent("#broken-mistaps")) === "1");

    await page.click("#cookie-broken-close");
    await page.locator("#checkout-broken .qty__btn[data-step='1']").click();
    await page.locator("#checkout-broken .qty__btn[data-step='1']").click();
    ok("targets: the quantity reaches three", (await page.textContent("#qty-broken")) === "3");

    await page.click("#pay-broken");
    ok("targets: paying for three works", (await page.textContent("#target-result")).includes("Three pairs"));

    await page.click(version("target", "fixed"));
    await page.click("#measure");
    ok(
      "targets: the accessible checkout meets the minimum",
      (await page.textContent("#target-result")).includes("Every target meets the 24 by 24 minimum")
    );

    const sizes = await page.evaluate(() =>
      [...document.querySelectorAll("#checkout-fixed [data-target]")].map((element) => {
        const box = element.getBoundingClientRect();
        return Math.min(Math.round(box.width), Math.round(box.height));
      })
    );
    ok("targets: every accessible target is at least 44 pixels", sizes.every((size) => size >= 44), sizes.join(", "));

    await page.close();
  }

  note("the colour-only and div-as-button barriers are checked here because axe cannot see them.");
}
