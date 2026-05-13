# Homepage AI Portfolio Redesign

## Goal

Redesign the homepage so it feels like a credible developer portfolio rather than a generic AI-generated landing page. The new home should communicate:

- Production software experience across web, cloud infrastructure, and operations.
- Former founder/CTO leadership experience.
- Current depth in AI engineering, agentic workflows, LLM systems, and AI-native product development.
- A memorable visual identity based on abstract pixel/cosmic imagery, not mascot-heavy illustration or literal AI keywords.

## Approved Direction

Use a bold builder-portfolio direction with an abstract "Knowledge Constellation" visual system.

The homepage should not open with a plain project grid. It should first establish the developer's professional positioning, then show the knowledge graph and recent technical writing as evidence of depth.

## Hero Section

### Primary Copy

Headline:

```text
Production experience,
now at the AI frontier.
```

Supporting copy:

```text
Built across consumer apps, climate-tech products, and AI-powered cloud contact centers.
Now applying that production background to agentic workflows, LLM systems, and AI-native product development.
```

Top label:

```text
Full-stack engineer / Former CTO / AI Engineering
```

Meta cards:

- Experience / Web, Cloud Infra, Operations
- Leadership / Founder / CTO
- AI Engineering / Agentic workflows

### Visual

Use a 32x32 abstract pixel thumbnail inspired by the existing SEO thumbnail's palette and atmosphere, not its exact character.

Rules:

- No astronaut or alien mascot as the main concept.
- No literal words inside the thumbnail such as AI, code, cloud, ship, or HTTP.
- Use large pixel cells, not detailed illustration.
- Use deep navy as the base, cyan/blue for signal structure, violet/magenta for accent nodes, and a small amount of green as intelligence/energy.
- Prefer a constellation/graph composition over a character silhouette.

## Knowledgebase Graph Section

Add a mid-page section that previews the existing `/kb` experience as an orbiting knowledge graph.

Purpose:

- Show that the blog is not just chronological writing.
- Make AI infrastructure, LLM research, frontend/backend/cloud notes feel connected.
- Reinforce the visual language from the hero thumbnail.

Content direction:

- Heading: "A map of what I am studying, building, and connecting."
- Explain that posts form a navigable graph across AI infrastructure, LLM research, product engineering, and operations.
- Link the section to `/kb`.

Implementation notes:

- Use existing `app/kb-data.json` as the data source where practical.
- For the homepage, keep the graph as a lightweight preview rather than a full KB interface.
- Avoid expensive canvas/WebGL unless needed; SVG or CSS-positioned nodes are enough for the first implementation.
- Respect `prefers-reduced-motion`: static graph for reduced motion, subtle orbit/float only otherwise.

## Other Homepage Sections

After the hero and KB graph, keep the page practical:

- Featured technical writing: prioritize AI infrastructure, LLM research, and architecture posts.
- Selected projects: show fewer items with stronger context, not a broad project dump.
- Recent posts: keep available, but lower priority than the positioning and KB graph.

The current `FeaturedSection`, `TechStackSection`, and `RecentPostsSection` can be replaced or consolidated if they compete with the new narrative.

## Visual Style

Use a restrained dark/cosmic palette:

- Base: deep navy / near-black.
- Primary signal: cyan / electric blue.
- Accent: violet or magenta.
- Secondary energy: limited green.
- Text: high-contrast off-white and muted blue-gray.

Avoid:

- Gradient blob backgrounds.
- Emoji feature cards.
- Rounded marketing cards with generic copy.
- AI keyword badges inside visuals.
- A full game UI treatment.
- Overly cute or realistic mascot imagery.

## Responsive Behavior

Desktop:

- Hero should use a two-column layout: copy left, pixel thumbnail right.
- Headline line-height should be tall enough to breathe, matching the approved taller rhythm.
- KB graph can sit beside explanatory copy.

Mobile:

- Hero stacks copy first, visual second.
- Pixel thumbnail remains square and readable.
- Meta cards can become a vertical stack or compact two-column grid if space allows.
- KB graph should remain legible and not require horizontal scrolling.

## Accessibility

- The abstract pixel thumbnail is decorative unless it links somewhere; use `aria-hidden` if decorative.
- The KB graph preview should not require motion or hover to understand.
- Links to `/kb`, posts, and projects must have clear accessible names.
- Maintain contrast for all text against the dark background.

## Verification

Before considering implementation complete:

- Run the project lint/build checks used by the repo.
- Verify desktop and mobile screenshots.
- Confirm there are no text overlaps in the hero, meta cards, and KB graph section.
- Confirm dark/light theme behavior is acceptable, or intentionally make the homepage hero a controlled dark band.
- Confirm reduced-motion mode disables any orbiting animation.

## Out of Scope

- Rebuilding the full `/kb` interface.
- Generating a new bitmap SEO image.
- Redesigning all post pages.
- Rewriting post content.
