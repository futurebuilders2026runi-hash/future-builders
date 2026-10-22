# AI Radar editorial artwork

Five original conceptual cover illustrations were created with the built-in
`image_gen` tool for this design. They are editorial illustrations, not photos
from the linked articles. No publisher images or logos were copied.

Final project assets (1280 × 853 WebP; approximately 100–186 KB each):

- `public/radar/editorial/models.webp`
- `public/radar/editorial/agents.webp`
- `public/radar/editorial/research.webp`
- `public/radar/editorial/builders.webp`
- `public/radar/editorial/business.webp`

`src/lib/radar/presentation.ts` selects a thematic cover from the article's title
and existing categories. A manually uploaded image always takes precedence.
New imported articles receive a cover without modifying their source content
or database records. Each generated cover carries an editorial-art credit and
descriptive Hebrew and English alt text.

## Club-supplied covers

The club supplied six additional PNG illustrations in `public/radar` in October
2026. Optimized WebP copies live in `public/radar/selected` (the original files
are retained locally). These are conceptual illustrations, not publisher photos:

| Supplied image | Optimized copy | Subject |
| --- | --- | --- |
| AI-Powered Legacy Modernisation | legacy-modernisation.webp | Legacy systems / COBOL |
| Connected Southeast Asian City at Dusk | connected-asia.webp | Southeast Asia's digital economy |
| Global Network Over Earth at Night | global-network.webp | Global data, languages, private computing |
| Holographic AI Cube on Circuit Board | ai-compute.webp | Embeddings, model infrastructure |
| Modern Glass Office at Sunset | industry-office.webp | Enterprise uses and economic research |
| Robotic Hand Touching Glowing Interface | robotic-interface.webp | Agents, robotics, interactive AI |

Subject-specific matches precede the five original thematic covers. All five
original editorial files are preserved unchanged; `builders.webp` remains the
cover for the existing AI coding story. Explicit record images take precedence.

## Final prompt set

Each asset used the following common prompt, with its subject and palette below:

> Use case: stylized-concept. Asset type: original editorial cover image for the
> Future Builders AI Radar technology news website. Create ONE polished wide
> landscape image, approximately 3:2, no grid or multiple panels.
> Subject: [subject below]. Style: premium contemporary 3D editorial art, tactile
> frosted glass and satin metal, careful shadows, visually bold and distinctive,
> an art-directed magazine cover rather than a software screenshot.
> Composition: one strong central sculptural subject, close enough to remain
> recognizable when cropped to a 16:10 news card, generous balanced background,
> crisp silhouette and layered depth. Color palette: [palette below].
> Lighting: sophisticated studio light with subtle grain and beautiful reflections.
> Constraints: no words, no letters, no logos, no watermarks, no robots, no human
> faces, no generic glowing brain. This is conceptual editorial illustration,
> not documentary photography.

### Models

Subject: A translucent cobalt-blue silicon monolith surrounded by stacked glass
computation layers, tiny luminous nodes, and a precise circular halo. A clear
visual metaphor for a powerful AI foundation model.

Palette: deep midnight navy, electric cobalt, icy cyan, small pearl-white highlights.

### Agents

Subject: A playful but sophisticated network of five sculptural glass modules
linked by flowing paths. One brilliant orange sphere navigates between the
modules, representing autonomous AI agents coordinating actions.

Palette: saturated cobalt, warm tangerine, pale peach, crisp off-white.

### Research

Subject: A sculptural translucent turquoise leaf branching into a molecular
structure and tiny glass data nodes, hovering above a textured blue laboratory
surface. A striking visual metaphor for AI research connecting nature and science.

Palette: rich teal, aquamarine, electric cyan, tiny lime highlights, deep navy.

### Builders

Subject: An exploded sculptural arrangement of rounded code brackets and small
blue metallic building blocks assembling into an elegant interface. Abstract
glass windows without readable text, with one vivid coral control orb. A metaphor
for coding and building with AI.

Palette: electric cobalt blue, pale ice blue, warm coral, dark ink.

### Business

Subject: Three beautiful cobalt architectural blocks rising at different heights,
connected by sweeping translucent amber glass arcs and a small warm sun disc.
An editorial metaphor for AI startups, industry growth, and investment.

Palette: cobalt blue, golden amber, soft butter yellow, pale cream.
