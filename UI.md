# UI.md — Design Reference: Educational Physics Simulation Interfaces

**Purpose:** This document distills reusable UI/UX patterns, visual language, and interaction conventions common to interactive educational physics simulations. It is a *design reference*, not a specification for any particular simulation and not a reproduction of any existing product's branding, assets, exact colors, or exact layout. Every recommendation here is a generic principle to be adapted, not a fixed rule to be copied.

---

## 1. Design Language Overview

**Character.** The interface should read as a *scientific instrument you are allowed to touch* — closer to a well-designed lab tool than to a game or a marketing site. It balances two things that are easy to get wrong in opposite directions:

- **Educational vs. entertainment** — the simulation should reward curiosity and experimentation, but never lean so far into game mechanics (points, rewards, characters with personality arcs) that the physics becomes secondary to the "fun."
- **Scientific vs. approachable** — the underlying model must be accurate and the presentation precise, but the visual language should not intimidate a first-time or younger user with dense, jargon-heavy, dashboard-style chrome.

**Visual treatment.** Illustrative rather than realistic. Simplified, flat or lightly-shaded shapes communicate concepts faster than photorealistic rendering, and they age better, scale better, and are cheaper to produce consistently across many objects and states.

**Tone.** Calm and confident, with room for small moments of playfulness (friendly object design, a bit of character in an avatar or icon) — but playfulness is seasoning, not structure. The interface itself (panels, controls, typography) should stay quiet and neutral so the phenomenon can carry the personality.

**Perceived audience.** Broad — from middle-school through introductory college level, plus teachers demonstrating to a full classroom. Assume varied reading levels, varied device fluency, and no assumption of prior software experience.

**Visual density.** Deliberately low. A first glance should reveal one clear focal phenomenon and a small number of obviously-grouped controls — not a control surface that needs a legend to parse.

**Calm vs. energetic zones.** The interface should have exactly one "energetic" zone — the simulation stage, where motion, color change, and dynamic feedback happen — surrounded by "calm" zones (control panels, readouts) that are visually static except when a value updates. If everything moves, nothing reads as signal.

**What this should NOT become:**
- A marketing landing page (hero banners, promotional color blocking, decorative gradients).
- A general-purpose dashboard (dense grids of unrelated widgets, KPI-card aesthetics).
- A game UI (health bars, score counters, achievement badges, mascots with dialogue).
- A dense engineering tool (CAD-like toolbars, nested menus, tiny icon-only ribbons).
- Skeuomorphic or photorealistic (real-looking metal, glass, wood textures) — this raises production cost and cognitive load without adding pedagogical value.

---

## 2. Information Hierarchy

A physics simulation should present information in this priority order, from most to least visually dominant:

1. **The physical phenomenon** — the thing actually being simulated (the moving object, the flowing current, the changing field). This always occupies the largest, most central, highest-contrast region of the screen.
2. **Interactive objects within the phenomenon** — the parts the user can directly grab, drag, or adjust (a mass, a component, a slider attached to a physical object). These are visually part of the phenomenon but subtly distinguished (see Section 9) so they read as "touchable."
3. **Primary controls** — the small number of controls that drive the core experiment (the one or two sliders/toggles most users will reach for first). Grouped, but not competing in size with the phenomenon.
4. **Measurements and readouts** — live numeric or graphical feedback. Important enough to be easy to find at a glance, but positioned so the eye returns to them rather than starts there.
5. **Secondary controls** — parameters that shape the experiment but aren't the main variable (advanced toggles, display options, alternate views).
6. **Explanatory/help content** — labels, short instructional text, tooltips. Present but recessive; never competing with the visuals for attention.
7. **Data/results** — tables, logs, saved data points. Lowest priority in visual weight; usually tucked to an edge or revealed on demand.

**How hierarchy is expressed:**
- **Size** — the phenomenon canvas is always the largest single region.
- **Position** — center and left-of-center reads as primary; edges and corners read as secondary/utility.
- **Contrast** — the stage typically uses a distinct, slightly more saturated or differently-toned background from the neutral control-panel background, so the eye immediately separates "world" from "cockpit."
- **Whitespace** — the most important controls get the most breathing room around them; dense clusters signal "secondary/optional."
- **Grouping and proximity** — controls that affect the same object or concept are visually clustered and separated from unrelated controls by spacing or a container edge, not just by labels.
- **Progressive revelation** — anything not needed for the default/first-time experience (advanced settings, extra display layers) should be collapsed, hidden behind a toggle, or visually de-emphasized until requested.

---

## 3. Layout Architecture

Common structural regions, and when each is appropriate:

- **Main simulation canvas/workspace** — always present, always the largest region. This is where direct manipulation happens and where physics motion is rendered. It should be able to stand alone and still make sense if every panel were hidden.
- **Control area (panel or rail)** — typically anchored to one side (commonly right) or a top strip. Houses primary and secondary controls in a bounded, visually distinct container (subtle background tint and/or border) so it reads as "instrument panel," not part of the world.
- **Tool/component area** — used when the simulation involves a kit of parts the user assembles (e.g., placing components into a workspace). Usually a fixed strip or palette at an edge, from which items are dragged into the stage. Appropriate whenever the experiment is "build something," not just "adjust a value."
- **Measurement/readout area** — a compact, boxed display for live numeric values. Can be a floating card near the object it measures, or a fixed panel; floating/attached-to-object placement is preferable when it reinforces "this reading belongs to that thing."
- **Bottom toolbar** — best reserved for universal, always-relevant transport-style actions (play/pause, step, speed, reset). Keeping these in one predictable, low-profile strip means users don't have to relearn their location as the rest of the UI changes.
- **Top toolbar/strip** — good for global, infrequent options (display toggles, mode switches, settings) that apply to the whole simulation rather than one object.
- **Side panels** — appropriate for a moderate number of related controls that belong together conceptually (all controls for "Spring A," all display toggles). Avoid stacking many unrelated side panels; consolidate or use tabs instead.
- **Floating controls** — small controls attached directly to an object in the canvas (a mini-slider next to a spring, a drag handle on a mass). Appropriate when the control is meaningless without its object; keeps the connection between control and effect obvious.
- **Modal/dialog usage** — used sparingly, only for things that must interrupt the flow (an initial setup choice, an unrecoverable warning). Simulations should almost never use modals for routine interaction — they break the "always-touchable, always-live" feel that makes these tools effective.
- **Data/results area** — a table, graph, or list, usually collapsible or docked to an edge, that accumulates values over time. Appropriate for experiments that are explicitly about collecting data across trials, not needed for pure real-time observation tools.

**Principle, not prescription:** the exact split (left/right, top/bottom) is less important than that the roles stay separated: one place to *watch*, one place to *adjust*, one (optional) place to *record*.

---

## 4. Spatial Design

The interface should feel organized primarily through **consistent rhythm**, not through elaborate visual decoration.

- **Spacing rhythm** — use a small set of repeating spacing increments (e.g., a base unit and its multiples) rather than ad hoc gaps. Consistent rhythm is what makes a sparse UI feel intentional rather than empty.
- **Padding** — generous internal padding inside control containers signals "considered UI," while tight, uneven padding reads as cramped or accidental. Err toward more internal breathing room in panels, since these are read at a glance, not studied like a document.
- **Margins** — the canvas should never feel like it's touching panel edges; a clear margin between stage and control containers reinforces the "world vs. cockpit" separation.
- **Grouping** — related controls (all sliders for one object, all display toggles) share a visual container or clear spatial cluster distinct from unrelated groups.
- **Alignment** — controls within a panel should align to a shared edge (left-align labels, right-align values, etc.) so the panel reads as ordered even when scanned quickly.
- **Proximity** — a control's proximity to the object it affects is itself information; a slider placed directly beside/attached to the object it modifies needs less labeling than one placed in a distant generic panel.
- **Whitespace as hierarchy** — the busiest, most detailed area of the screen should be the smallest; the calmest, simplest area should be the largest. Whitespace around the primary phenomenon should always exceed whitespace inside a dense control panel.
- **Visual separation** — use a subtle background-tint change, a thin border, or a soft shadow — pick one method per boundary and apply it consistently, rather than mixing several separation techniques on the same screen.
- **Container density** — control panels should feel comfortably filled, never crammed; if a panel starts to feel dense, that's usually a signal to split it (tabs, collapsible groups) rather than shrink its components.
- **Relative proportions** (illustrative, not exact):
  - Dominant workspace: roughly two-thirds to three-quarters of the available screen area.
  - Secondary control region: the remainder, organized into one or two clearly bounded zones.
  - Compact utility controls (reset, settings, sound toggle): small, consistently positioned, and never competing in size with primary controls.

Avoid asserting exact pixel measurements as if they were derived from reference material; describe proportions and relationships instead.

---

## 5. Visual Hierarchy

Hierarchy is built from the interaction of several signals working together, not any single one:

- **Scale** — bigger = more important; reserve the largest scale for the phenomenon and, within controls, for the single most-used control.
- **Typography** — heavier weight and larger size for primary labels and live values; lighter weight and smaller size for secondary/help text.
- **Contrast** — higher contrast (darker text on light background, or a bright accent) marks primary actions and current values; lower contrast (grey, muted tones) marks disabled, secondary, or supplementary information.
- **Color** — reserved for meaning (see Section 6), not for decoration; a splash of accent color draws the eye to the one thing that should be noticed first.
- **Borders** — a border or outline is a strong "this is a distinct, boundable object" signal; use it for containers and interactive objects, not for purely decorative separation.
- **Weight** — bold weight for primary numbers/labels, regular weight for everything else.
- **Position** — top-left and center tend to be scanned first (in left-to-right reading contexts); reserve those positions for what should be seen first.
- **Whitespace** — isolating an element with extra space around it raises its perceived importance without changing its size or color.
- **Grouping** — elements that are visually grouped are read as related; ungrouped, evenly-spaced elements are read as independent.

**Distinguishing categories at a glance:**
- *Primary action* — highest contrast, often the only saturated/accent-colored control on screen.
- *Secondary action* — neutral coloring, same size class as primary but without the accent treatment.
- *Informational content* — no interactive affordance styling (no border-as-button, no pointer cursor implied), lower contrast text.
- *Measurements* — boxed or card-contained, consistent numeric styling, always paired with a unit and a label.
- *Warnings* — a distinct semantic color (see Section 6) used only for this purpose, paired with an icon and/or text, never color alone.
- *Disabled controls* — reduced contrast/opacity, no hover or pressed state, cursor affordance removed.
- *Interactive objects* — a consistent visual "signature" (see Section 9) applied across every draggable/adjustable element so users learn the pattern once and reuse it everywhere.

---

## 6. Color System Philosophy

Color in this kind of interface is a **labeling system**, not a decoration system. Every color used should answer "what does this mean?" rather than "what looks nice here?"

**Categories to define (as roles, not specific hex values):**
- **Primary/brand-neutral tones** — used for chrome, panels, backgrounds; kept low-saturation so they recede.
- **Accent color(s)** — reserved for the primary interactive/callout elements (the one button or control that matters most). Used sparingly enough that its appearance always draws the eye.
- **Semantic colors** — a small, fixed set (e.g., one hue for "positive/success/valid," one for "caution," one for "error/invalid"). Never reused for anything else, so their meaning stays unambiguous.
- **Measurement/quantity colors** — when a simulation displays multiple related quantities simultaneously (e.g., different energy types, different circuit branches), each quantity gets one consistent color used identically in every chart, label, and readout referencing it. This mapping should never change within a simulation and ideally stays consistent across a whole family of simulations.
- **Object-identity colors** — used to help users track a specific object (e.g., "the red mass" vs. "the blue mass") consistently across the canvas, controls, and any graph referencing it.
- **Background colors** — typically a soft, low-saturation tone for the stage (distinct from the control panel's neutral tone) so the two zones are instantly distinguishable without needing borders.
- **Neutral UI colors** — greys/near-neutrals for text, borders, and inactive states.
- **Warning/error/success colors** — a small reserved set, always paired with icon or text, never the sole carrier of meaning.

**Principles:**
- **Consistency above all** — once a color is assigned a meaning (a quantity, a state, an object), it must mean that thing everywhere it appears in the interface.
- **Restraint** — a small total palette (a handful of hues plus neutrals) is easier to learn and remember than a large one; more colors does not mean more clarity.
- **Color-to-concept mapping** — where possible, borrow intuitive associations (e.g., "warm tones for energy/heat-like quantities," "cool tones for potential/stored-type quantities") so the mapping is partly self-explanatory rather than arbitrary.
- **Contrast** — text and meaningful graphics must maintain strong contrast against their background in every zone of the interface, including inside colored panels or badges.
- **Never color-alone** — any state or meaning conveyed by color must have a second cue (icon, label, pattern, position) so colorblind users and greyscale/projector viewing aren't excluded.

---

## 7. Typography

**Overall personality:** clean, geometric or humanist sans-serif, highly legible at small sizes and from a distance (classroom/projector use), with no decorative or display typefaces used for anything functional.

**Hierarchy (roles, not exact sizes):**
- **Headings/titles** — largest, boldest text on screen, used sparingly (simulation title, major section labels).
- **Body/instructional text** — medium weight, comfortable reading size, short line lengths; never dense paragraphs.
- **Labels** (control names, object names) — smaller than body text, consistent weight, always adjacent to what they label.
- **Button labels** — short, verb-first, sized for easy reading without needing to be the loudest thing on screen.
- **Measurement values** — the exception to "keep things small": numeric readouts deserve some of the largest, boldest, most legible treatment in the whole interface, because they are often the actual answer the student is looking for.
- **Units** — visually subordinate to the value itself (smaller size and/or lighter weight) but always present and never abbreviated ambiguously.
- **Table text** — compact but not cramped; numeric columns given enough width that values never wrap or truncate.
- **Helper/tooltip text** — smallest text in the hierarchy, low-emphasis styling, appears only on demand.

**Numeric readability (critical for this domain):**
- Use a numeral style that keeps consistent character widths (tabular/monospaced figures) wherever numbers update live or appear in a column, so digits don't jitter or cause layout shift as values change.
- Keep a stable number of decimal places per quantity so the readout doesn't visually "jump" in width as it updates.
- Always pair a number with its unit, and keep the unit visually attached (same line or clearly grouped) rather than separated.
- Favor a slightly larger size for measurement values than for equivalent-importance UI labels, since these numbers are frequently the pedagogical payoff of the interaction.

**General type mechanics:**
- Generous line height for any multi-line text (instructions, help content) to aid quick scanning.
- Comfortable, slightly open letter spacing for all-caps labels (if used) since tight caps hurt legibility at small sizes.
- Left-alignment for body and label text; right-alignment (or decimal-alignment) for numeric columns in tables.

---

## 8. Controls and Components

A generic reference for common controls, described by role:

- **Buttons** — primary actions get filled/accented styling; secondary actions get outlined or neutral styling. Reserve filled/accent buttons for the one or two most important actions per screen.
- **Icon buttons** — acceptable for universally-understood actions (reset, play/pause, close) where the icon is unambiguous; pair with a text label or tooltip whenever the icon alone could be misread.
- **Sliders** — the default control for continuous physical parameters. Should show the current value near the handle, describe the range with plain-language endpoints (not just raw numbers) when the concept benefits from it, and update the simulation live as they're dragged, not only on release.
- **Switches/toggles** — for binary on/off states with an immediate, visible effect (show/hide an overlay). Should never be used for anything with more than two states.
- **Checkboxes** — for optional, independent display layers (multiple can be active at once); always paired with a clear label, never icon-only.
- **Radio buttons** — for mutually-exclusive choices among a small set (2–5) of named options; used when only one state can be true at a time and all options should be visible without a dropdown.
- **Tabs** — for switching between related "modes" or "screens" of the same tool (e.g., different views of the same experiment) without navigating away; keep tab labels short and the active tab unmistakably distinct.
- **Dropdowns** — reserved for longer lists of choices where showing all options at once would be wasteful; avoid for fewer than ~5 options, where radio buttons or a segmented control are clearer.
- **Segmented controls** — a compact alternative to tabs or radio buttons for a small number of mutually-exclusive views, when space is tight and all options should stay visible.
- **Tool palettes** — for kits of draggable components; each item should show a clear preview of what it becomes once placed, and be large enough to grab comfortably.
- **Draggable objects** — see Section 9 for full treatment; the key control-level requirement is a generous hit-area larger than the visible object where practical, especially for touch.
- **Measurement displays** — bounded cards or panels with a clear label, a prominent value, and a unit; visually distinguished from controls (they display, they don't accept input) unless explicitly editable.
- **Tables** — see Section 21.
- **Dialogs** — reserved for interrupting, must-acknowledge moments; always include an unambiguous way to dismiss/cancel.
- **Tooltips** — short, on-demand, appearing on hover/focus/long-press; never the only place critical information lives.

For each component type, "inappropriate use" generally means: using a heavier-weight component (modal, dropdown) where a lighter one (inline toggle, radio group) would serve, or hiding a frequently-needed control behind an extra interaction step.

---

## 9. Interactive Object Design

This is one of the most important sections for a physics simulation, since much of the learning happens through direct manipulation of "physical" objects rather than through abstract UI controls.

**Communicating "you can touch this":**
- A consistent visual signature — a subtle outline, drop shadow, slightly raised/highlighted appearance — applied to every object that can be grabbed, and to nothing else, so the signature itself becomes a learned affordance.
- A cursor change on hover (e.g., to a grab/hand cursor) reinforces the same message for mouse users.
- Slight, non-distracting motion on hover (a small scale-up, a soft glow) confirms "this responds to you" before the user commits to interacting.
- Handles or grip indicators (small dots, a textured edge) on objects that can be resized, rotated, or extended, distinguishing "move the whole object" from "adjust this specific property of it."
- Connection points (for objects that can be linked, like circuit terminals) should be visually distinct from the rest of the object — a small circle or marker — and should highlight when a compatible object is nearby during a drag.

**Feedback during interaction:**
- **Hover** — subtle highlight or outline change; should never be mistaken for a selected/active state.
- **Selection** — a clearer, more persistent highlight (stronger outline or accent-colored halo) that remains until deselected, distinct from hover.
- **Dragging** — the object should visibly "lift" (shadow increase, slight scale, or opacity change) so it reads as detached from its resting layer and following the cursor/finger.
- **Snapping** — when an object approaches a valid position or connection, provide an anticipatory visual cue (a highlighted target zone, a ghost/preview of the snapped position) before the snap occurs, not only after.
- **Invalid placement** — a distinct, semantically "warning" treatment (see Section 6) such as a red-tinted outline or a gentle rejection animation (object springs back), always paired with a non-color cue.
- **Valid placement** — a brief, positive confirmation (a settle animation, a soft highlight that fades) that is quieter than the invalid-placement feedback, since valid actions are the expected common case and shouldn't demand as much attention.

**Physical-world affordance vs. UI affordance:** where an object represents something physically manipulable in real life (a mass, a slider on a real instrument, a knob), its on-screen behavior should mirror the physical intuition (drag along the axis it would actually move, rotate the way it would actually rotate) rather than substituting an abstract UI-only interaction (a menu, a text field) unless precision genuinely requires it. Precision input (a text field or fine-stepping control) can *supplement* direct manipulation but shouldn't replace it as the primary way to interact.

---

## 10. Drag-and-Drop UX

- **Pickup** — a click/tap-and-hold (or immediate click-drag) begins the interaction; provide an immediate visual acknowledgment (the "lift" treatment from Section 9) so the user knows the pickup registered.
- **Cursor behavior** — change to a grabbing/closed-hand cursor during an active drag (mouse contexts); ensure the dragged object doesn't hide underneath the cursor itself.
- **Hover (pre-drag)** — indicate draggability before any commitment, as covered in Section 9.
- **Drag preview** — the object (or a simplified version of it) follows the pointer/finger directly, ideally offset slightly so it isn't obscured by the cursor or fingertip.
- **Object movement** — should feel direct and un-laggy; avoid heavy easing on the object's position while actively being dragged (easing belongs to state transitions, not to the live tracking of a controlled drag).
- **Snapping** — snap to meaningful positions (grid points, valid connection points, resting positions) rather than requiring pixel-perfect placement; the snap radius should be generous enough to feel forgiving, especially on touch.
- **Drop zones** — where relevant, indicate valid drop regions visually as soon as a drag begins (a highlighted outline or subtle background change on eligible zones), not only when the object is hovered directly over them.
- **Invalid drops** — return the object smoothly to its last valid position with a brief rejection cue; never leave an object in a broken or ambiguous state.
- **Collision/overlap** — decide and apply one consistent rule (objects can't overlap and will push/block, or objects can overlap and simply layer) rather than mixing behaviors across the same simulation.
- **Release feedback** — a settle/confirm animation when the drag ends successfully, distinct from the ongoing drag motion, so "the interaction is complete" is unambiguous.
- **Accidental interactions** — small movements (a slight jitter on a tap) should not trigger a drag; require a minimum movement threshold before treating an interaction as a drag rather than a click/tap.
- **Touch interaction** — hit areas should be larger than the visual object where feasible; avoid relying on hover-only affordances for anything that must work on touch devices; ensure a dragged object isn't hidden underneath the user's finger (offset the visual above the touch point).

---

## 11. Measurement and Data Visualization

This is a core function of the interface, since the entire pedagogical value of these tools often comes down to "can the student see, clearly and immediately, what changed and by how much."

**General principles for any measured quantity (voltage, current, force, mass, length, time, energy, speed, etc.):**
- **Prominence** — a measurement the student is meant to observe should never be the smallest or least contrasted text on screen.
- **Units** — always shown, always attached to the value, never assumed.
- **Precision** — a fixed, sensible number of significant figures/decimal places per quantity; avoid values that jump between different lengths as they update, which reads as noisy or broken.
- **Labels** — every readout names what it is measuring in plain language, not only in a symbol or abbreviation (or shows both together).
- **Live updates** — values update continuously/immediately as the underlying phenomenon changes, not on a delay or only after a manual "measure" action, unless the pedagogy specifically depends on a discrete measurement action (e.g., simulating a real instrument that must be placed to take a reading).
- **Instrument-to-readout relationship** — when a virtual instrument (a probe, a meter) is used, the readout should appear close to, or clearly linked (by a connecting line, consistent color, or direct attachment) to, the instrument taking the measurement — reinforcing that the number comes from that specific measurement, not from a generic dashboard.

**Choosing a representation:**
- **Raw numeric value** — use when precision matters and the student needs an exact figure to record or compare.
- **Visual gauge/dial/bar** — use when the *relative magnitude* or *trend* matters more than the exact figure, or to give an at-a-glance read alongside the precise number.
- **Graph (time-series or relationship)** — use when the pedagogical point is about *change over time* or *relationship between two variables*, not a single value.
- **Table** — use when the point is comparing multiple discrete trials or data points side by side.
- **Indicator (icon/light/color state)** — use for simple state information (on/off, connected/disconnected, within/outside a safe range) rather than for continuous quantities.
- **Combination** — the strongest designs typically pair a precise numeric value with at least one visual representation (a bar, a graph, a proportional icon) so the same information is reinforced in two forms simultaneously — this dual-coding is one of the more effective patterns in this domain.

**Reference lines and indicators:** dashed or dotted lines marking a baseline, resting position, or target value are an efficient way to show "how far from baseline" without extra text; keep such reference marks visually quieter (thinner, dashed, muted color) than the live data itself.

---

## 12. Interaction States

| State | What typically changes | Why | Feedback strength |
|---|---|---|---|
| Default | Baseline appearance | Establishes the "at rest" look | None |
| Hover | Subtle highlight, cursor change | Signals affordance before commitment | Low |
| Focus (keyboard) | Visible outline/ring | Supports keyboard navigation and accessibility | Medium, always visible |
| Pressed | Slight scale-down or color shift | Confirms a click/tap registered | Low, brief |
| Active | Sustained highlight or accent color | Shows a control is currently in effect (e.g., a toggle that's on) | Medium |
| Selected | Persistent outline/halo distinct from hover | Shows an object is the current focus of attention/edits | Medium |
| Dragging | Lift effect (shadow/scale/opacity) | Shows the object is detached and following input | Medium-high |
| Disabled | Reduced opacity/contrast, no hover response | Signals unavailability without implying an error | Low, passive |
| Loading | Neutral progress indicator, no premature data | Signals work in progress without implying success/failure | Low-medium |
| Success/valid | Brief positive highlight, quick fade | Confirms a correct/expected outcome | Low-medium, brief |
| Warning | Semantic warning color + icon/text | Flags a state needing attention but not necessarily wrong | Medium, persistent until resolved |
| Error/invalid | Semantic error color + icon/text + often a shake/reject motion | Flags an action or state that cannot proceed | Medium-high, persistent until resolved |
| Measured | Value populated, often with a brief "just updated" pulse | Confirms a reading was taken | Low, brief |
| Unmeasured | Placeholder/dash instead of a value | Avoids implying a false zero or default reading | None |

General rule: feedback strength should be proportional to how *unexpected* or *consequential* the state is — routine states (hover, default) get the subtlest treatment; states requiring the user's attention (error, warning) get the strongest, but even the strongest feedback in this domain should stay measured rather than alarming, since this is a learning tool, not a safety-critical system.

---

## 13. Feedback Design

The purpose of feedback in a physics simulation is not just "confirm the click landed" — it's **teaching cause and effect**. Every interaction should make the causal link between "what the student did" and "what happened as a result" as legible as possible.

- **Immediate feedback** — the effect of any adjustment (a slider move, a dragged object) should be visible essentially instantly; delayed feedback breaks the causal link the student is meant to build.
- **Visual feedback** — the phenomenon itself should visibly respond (a beam bends more, a needle moves, a color shifts) so the *mechanism* is shown, not just the *result number*.
- **Numeric feedback** — paired with the visual response so students can connect the qualitative change to a quantitative one.
- **Animation feedback** — used to show *how* a change propagates (e.g., a value smoothly interpolating rather than jumping) when the smoothness itself is meaningful; used sparingly for purely decorative confirmation.
- **Sound feedback** — optional and always mutable; useful for reinforcing discrete events (a successful connection, a collision) but never required to understand the simulation, and never used for continuous data.
- **Success confirmation** — quiet and brief; the student's attention should return to the phenomenon quickly, not linger on a congratulatory UI moment.
- **Invalid-action feedback** — clear about *what* was invalid (a specific object shakes or highlights) rather than a generic error banner disconnected from its cause.
- **Error recovery** — always leave the student in a clearly-labeled, easily reversible state; a visible, always-available reset should be treated as part of the feedback system, not just a utility button.

---

## 14. Motion and Animation

Two categories of motion must be kept clearly distinct:

### Physics motion
Motion that *represents the simulated phenomenon itself* (an object falling, a wave propagating, current flowing). This motion:
- Should be as accurate to the underlying model as possible — timing and easing here are *data*, not aesthetic choice.
- Should dominate visual attention whenever it's occurring; nothing in the UI chrome should animate competitively while physics motion is active.
- May run continuously (real-time simulation) or be steppable/pausable, depending on the pedagogical need to freeze and inspect a moment.

### UI motion
Motion used purely to communicate *interface* state (a panel expanding, a value updating, a control responding to a click). This motion:
- Should be brief and subtle — fast durations, gentle easing — so it registers as polish, not as something demanding independent attention.
- Should never be used decoratively (no bouncing icons, no attention-seeking pulsing) unless specifically drawing attention to a state that requires action (e.g., a warning).
- Panel transitions (expand/collapse) should be quick enough not to feel like a delay before the user can continue.
- Table insertion (a new data row appearing) can use a brief highlight-then-settle treatment so new data is noticeable without being distracting.
- Reset should animate distinctly — a clear, slightly more noticeable transition back to the starting state — so the student registers "everything just returned to zero," rather than reset feeling identical to a normal parameter change.

**Overall philosophy:** UI motion exists to support clarity, not to entertain. When in doubt, make interface animation faster and subtler; reserve richer, slower motion for the physics being taught.

---

## 15. Control Density

- **Progressive disclosure** is the primary tool for managing density: show only what's needed for the default experiment; put everything else behind an explicit toggle, tab, or "advanced" affordance.
- **Primary vs. secondary controls** — identify (per simulation) the one or two controls most users will touch first, and give them the most prominent, always-visible placement; everything else is secondary by definition.
- **Optional settings** (display toggles, alternate units, visual overlays) belong in a clearly secondary, often collapsible area — visible enough to be discoverable, but not competing with primary controls.
- **Advanced controls** (parameters aimed at more advanced users — e.g., fine-tuning a value most users would leave at default) should require an explicit action to reveal, so beginners are never confronted with them unasked.
- **Avoiding control overload** — a rule of thumb: if a first-time user needs more than a few seconds to identify "the one thing to try first," the panel likely has too many equally-weighted controls.
- **Grouping** related controls under a shared heading or container reduces perceived density even when the absolute control count is unchanged.
- **Collapsible panels** are appropriate when a group of controls is useful but not always needed (e.g., a "measurement tools" panel used only in some experiments).
- **Tabs** are appropriate when controls belong to genuinely distinct modes/views that are rarely needed simultaneously; avoid tabs for controls that are actually needed together, since switching hides related information from the student.

---

## 16. Reset and Recovery UX

- **Reset/restart** must be one of the most discoverable controls in the entire interface — consistent placement (commonly near other transport controls), a recognizable icon (commonly a circular arrow), and never buried in a menu.
- **Undo**, where meaningful (e.g., undoing a placed component), should be lightweight and immediate; not every simulation needs a full undo history, but any action a student might regret (deleting a built configuration) should have an easy way back.
- **Invalid configuration** — the interface should make it easy to see *what* is invalid (highlighted specifically) and easy to return to a known-good state, rather than forcing the student to manually reverse-engineer what went wrong.
- **Accidental dragging** — mitigated by the movement-threshold principle in Section 10; when it does happen, an easy "snap back" (double-tap, or simply dragging back) should be intuitive rather than requiring a special undo command.
- **Incomplete setup** (e.g., a circuit that isn't yet closed) should be visually distinguishable from an *invalid* setup — incompleteness is a normal, expected in-progress state and shouldn't be flagged with alarming/error styling.
- **Returning to a known-good state** — reset should always return to a single, predictable, well-defined starting configuration; students should never be confused about what "reset" actually restores.

---

## 17. Responsive Design

- **Desktop/laptop** — the baseline design target for most of these tools; assume enough space for the canvas plus a full control panel side-by-side.
- **Tablet** — the workspace should remain dominant; control panels may need to become more compact (smaller text, tighter spacing) or move to a collapsible drawer, but should not disappear or become harder to reach.
- **Smaller screens** — beyond a certain width, side-by-side layout typically breaks down; the most common adaptation is stacking the control panel below or above the canvas, or making it a slide-out panel triggered by a clearly-labeled control — while keeping the canvas itself as large as possible at all times.
- **Workspace scaling** — the simulation canvas should scale to fill available space rather than staying a fixed pixel size that leaves large unused margins on bigger screens or gets clipped on smaller ones.
- **Control repositioning** — acceptable and often necessary across breakpoints; what should stay constant is the *grouping and hierarchy* of controls, not their exact pixel position.
- **Panel collapse** — a fully collapsible control panel (with a persistent, obvious toggle) is a reasonable pattern once screen width can't comfortably fit both canvas and panel at usable sizes.
- **Touch interaction** — hit targets should increase in size on touch-primary devices, not merely inherit desktop sizing; hover-dependent affordances need a touch-appropriate equivalent (tap-and-hold, persistent visual cues).
- **Minimum readable size** — text and numeric readouts should never shrink below a comfortably legible size even under space pressure; better to reduce the number of simultaneously visible secondary controls than to shrink core text past legibility.
- **Minimum target size** — interactive elements should maintain an easily tappable size on touch devices regardless of how visually compact the design becomes elsewhere.
- **Horizontal vs. vertical layouts** — favor whichever orientation keeps the canvas largest and least distorted; don't force a fixed aspect ratio that causes significant letterboxing on common screen shapes.

**Guiding constraint:** responsive adaptation should always protect the simulation workspace first; every other UI element is a candidate for compression, hiding, or relocation before the workspace itself is compromised.

---

## 18. Accessibility

- **Color contrast** — all text, icons, and meaningful graphical elements must maintain sufficient contrast against their background in every zone (including inside colored badges/panels).
- **Keyboard navigation** — every interactive control (sliders, buttons, toggles, draggable objects where feasible) should be reachable and operable via keyboard alone, with a logical tab order.
- **Focus states** — a clearly visible focus indicator (distinct from hover) on every focusable element, never suppressed for aesthetic reasons.
- **Semantic labels** — every control, icon button, and readout should have a text label or accessible name, not rely on visual position or icon shape alone.
- **Non-color-only feedback** — every state or meaning conveyed by color must have a secondary cue (icon, text, pattern), as established in Section 6.
- **Touch target size** — adequate on all devices, not just touch-primary ones, since motor precision varies across students.
- **Readable typography** — sufficient size and contrast by default, with support for browser/OS-level text scaling where feasible.
- **Reduced motion** — a respected preference (system-level or in-app) that suppresses non-essential UI motion while, ideally, still preserving the core physics motion needed to understand the phenomenon (or offering a reduced-motion-safe alternative representation, such as a static graph, when the primary representation is heavily animated).
- **Screen reader considerations** — live regions or accessible descriptions for updating measurement values, so changes are announced meaningfully rather than silently; meaningful reading order that matches the visual hierarchy.
- **Clear error messaging** — plain-language, specific, and paired with a clear path to resolution — never a vague or purely iconographic error state.

Classroom/student context makes accessibility especially important: a projector-viewed, teacher-led demonstration and an individual student on a personal device with assistive technology are both common real-world scenarios this interface must serve simultaneously.

---

## 19. Illustration and Visual Asset Philosophy

- **Flat vs. realistic** — favor flat or lightly-shaded illustration over photorealism; realism raises production cost, ages poorly, and can distract from the abstracted concept being taught.
- **Outlines** — a consistent outline weight across all objects (physical objects, instruments, icons) gives the whole asset library a unified feel even when drawn by different people over time.
- **Shading** — minimal and consistent — a simple light-source convention (e.g., a single soft highlight/shadow direction) applied uniformly, rather than fully rendered 3D shading.
- **Depth** — implied through simple layering (foreground/midground/background) and drop shadows rather than complex perspective or 3D modeling.
- **Perspective** — mostly flat/orthographic or a simple consistent angle; avoid mixing perspective styles between objects in the same scene.
- **Visual simplification** — every object should be reduced to the minimum detail needed to be recognizable and to communicate its function; extraneous detail (textures, small decorative elements) should be omitted unless it aids comprehension.
- **Consistency between physical objects and UI controls** — the illustration style used for in-world objects (masses, components, instruments) and the style used for UI chrome (icons, buttons) should feel like they belong to the same design system, even though they serve different roles.

---

## 20. Iconography

- **Personality** — simple, geometric, friendly but not cartoonish; icons should read clearly at small sizes without fine detail that disappears when scaled down.
- **Stroke/fill philosophy** — pick one consistent style (all outline/stroke-based, or all filled) across the entire icon set rather than mixing; consistency here matters more than which specific style is chosen.
- **Size hierarchy** — icon size should track the same hierarchy rules as other UI elements (bigger for primary actions, smaller for secondary/utility).
- **Icon + text** — pair icons with text labels whenever the action isn't close to universally recognized (play/pause/reset are safe alone; anything more specific to the simulation's domain should include a label, at least on first exposure or via tooltip).
- **Icon-only acceptable cases** — extremely common, standardized actions (close, settings gear, sound on/off) where near-universal recognition can be assumed, and where a tooltip is available as a fallback.
- **Consistency** — the same icon must always mean the same thing across the entire interface and, ideally, across a family of related simulations.
- **Accessibility** — every icon, including icon-only controls, needs an accessible text equivalent even when no visible label is shown.

---

## 21. Tables and Structured Data

- **Column hierarchy** — the most important column (often the dependent variable being studied) should be visually distinguished (e.g., bold, or first position) from supporting columns.
- **Numeric alignment** — right-align or decimal-align numeric columns so values are easy to compare at a glance; left-align only text/label columns.
- **Units** — shown in the column header, not repeated in every cell, to keep the data itself clean and scannable.
- **Row density** — comfortable spacing that supports quick scanning; avoid cramming so many rows that any single value becomes hard to isolate.
- **Selected/active rows** — a clear, consistent highlight distinct from hover, so the currently-relevant data point (e.g., "this is the trial currently shown in the graph") is unambiguous.
- **Newly added rows** — a brief highlight-and-settle treatment (see Section 14) draws attention to fresh data without requiring the student to hunt for it.
- **Empty states** — a table with no data yet should say so plainly (a short instructional message) rather than showing a blank or confusing void.
- **Overflow** — long tables should scroll within their own container rather than pushing the rest of the interface (especially the canvas) out of view.
- **Readability** — sufficient contrast between rows (subtle banding or dividers) to prevent misreading across rows in dense tables.

---

## 22. Instructional UX

- **Short contextual instructions** — a brief line of plain-language guidance near the relevant control or object, not a paragraph of prose; the interface should show what to do more than it tells.
- **First-time hints** — a lightweight, dismissible cue (a subtle animated hand icon, a soft highlight) on the primary interactive element the first time a simulation loads, then not repeated once the interaction is discovered.
- **Tooltips** — used for supplementary detail on demand (hover/focus/long-press), never as the sole source of information required to use a control.
- **Labels** — the first line of defense for instructional clarity; a well-labeled control needs far less separate instructional text.
- **Onboarding** — minimal by default; these tools are generally meant to be explorable without a guided tour. Where onboarding exists, keep it skippable and brief.
- **Progressive disclosure** — instructional depth should scale with engagement: a one-line label for the casual glance, a tooltip for a bit more detail, and (optionally) a separate help panel for a full explanation — never force every user through the deepest level.
- **Contextual help** — placed as close as possible to the thing it explains, rather than centralized in a single generic help screen disconnected from the interaction.
- **Error explanations** — specific to what went wrong and what to do next, written in plain, non-technical language appropriate to the target age range.

---

## 23. Classroom Usability

- **Projector visibility** — sufficient contrast, sufficiently large text and controls, and reliance on more than fine color distinctions, since projected images often wash out contrast and saturation.
- **Distance readability** — a student at the back of a room should be able to read the primary measurement values and identify the current state of the phenomenon without needing to approach the screen.
- **Mouse precision** — assume variable pointing precision (younger students, unfamiliar trackpads); avoid requiring pixel-perfect clicks on small targets for core interactions.
- **Touch screens** — increasingly common in classrooms; core interactions should work as well via touch as via mouse, per Section 17.
- **Student unfamiliarity** — assume zero prior exposure to the specific tool; the first-glance experience should not depend on reading instructions before anything makes sense.
- **Quick reset** — critical for a classroom pace where a teacher may want to demonstrate the same setup repeatedly to different points; reset should be effectively instantaneous.
- **Obvious controls** — favor clarity over cleverness; a control whose function needs to be discovered through experimentation is fine for secondary/advanced settings, but the primary interaction should be self-evident.
- **Minimal setup** — the simulation should present something meaningful and already-running (or ready-to-run with a single obvious action) the instant it loads, not require configuration before anything can be observed.
- **Teacher demonstration mode considerations** — the ability to make a clear, deliberate change (a slider move, a toggle) and have the whole class see the resulting effect clearly supports the common "teacher drives, class watches" classroom pattern, even if the tool is otherwise designed for individual student use.
- **Repeated experimentation** — the interface should make "try it again with a different value" nearly frictionless, since the pedagogical method is built on repeated, varied trials rather than a single pass.

---

## 24. Design Anti-Patterns

Avoid the following, all of which undermine the "instrument you can trust and quickly understand" feeling:

- Dashboard-like layouts with many equally-weighted, unrelated widgets competing for attention.
- Excessive use of cards for every piece of content, fragmenting the interface into disconnected boxes.
- Excessive gradients, glows, or glassmorphism effects that add visual noise without communicating meaning.
- Excessive or inconsistent drop shadows applied decoratively rather than to signal elevation/interactivity.
- Tiny controls that are difficult to target precisely, especially on touch devices.
- Dense settings panels that expose every possible parameter at once instead of using progressive disclosure.
- Unnecessary modal dialogs interrupting a flow that should stay live and continuous.
- Decorative animation (bouncing, spinning, pulsing elements) with no informational purpose.
- Excessive color variety diluting the semantic value of color as a meaning-carrying system.
- Photorealistic or heavily textured equipment renderings that raise cost and complexity without pedagogical benefit.
- Unexplained or ambiguous icons used without labels or tooltips.
- Hidden or hard-to-find reset functionality.
- Tiny, low-contrast numerical readouts for values the student is specifically meant to observe.
- Long blocks of instructional text where a short label or visual cue would suffice.
- Any UI element animating or drawing attention in a way that competes with the physics phenomenon itself while it's actively demonstrating something.

---

## 25. Reusable Design Principles

The distilled lessons from this analysis:

1. **Simulation first** — the phenomenon is always the visual and experiential priority.
2. **Direct manipulation** — prefer touching/dragging the world over operating abstract menus wherever physically plausible.
3. **Clear cause and effect** — every action should produce an immediate, legible, connected response.
4. **Strong visual hierarchy** — one clear focal point at every moment; everything else recedes appropriately.
5. **Readable measurements** — numbers the student needs are never small, low-contrast, or hard to find.
6. **Semantic color** — color means something specific and consistent; it is never purely decorative.
7. **Progressive disclosure** — show the minimum needed by default; reveal complexity only on request.
8. **Immediate, proportionate feedback** — feedback strength matches how consequential or unexpected the state is.
9. **Simple, illustrative visuals** — flat, consistent, simplified rendering over realism or ornamentation.
10. **Classroom-first usability** — designed to withstand distance viewing, imprecise input, and zero prior familiarity.
11. **Physics motion over decorative UI motion** — meaningful motion dominates; interface motion stays brief and quiet.
12. **Complexity introduced progressively** — from a simple, obvious first interaction toward optional depth, never the reverse.

---

## 26. Application to Future Projects

`UI.md` is a **design reference**, not a fixed implementation specification. When designing an original simulation:

1. Use the principles above as the foundation for design decisions, not as a checklist to satisfy mechanically.
2. Adapt each principle to the specific experiment's actual learning goal — the "right" layout, color mapping, or control set will differ meaningfully depending on what is being taught.
3. Create an original visual system (palette, typography choices, illustration style, iconography) rather than adopting any existing product's specific look.
4. Do not copy any specific existing simulation's exact layout, branding, assets, or component styling.
5. Ground every concrete UI decision in the actual learning workflow of the specific simulation being built — what the student manipulates, what they need to observe, and what they're meant to conclude — rather than in this document's examples alone.

This document should be treated as a shared vocabulary and starting point for future design conversations, to be revisited and refined as an original simulation's specific needs become clearer.
