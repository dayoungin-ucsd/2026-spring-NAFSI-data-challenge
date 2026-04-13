# NutriMap — Kiro Prompt Engineering Log

**NAFSI × NourishNet Student Data Challenge 2026 | Track 2**  
**Team: NutriHog of Ozark | University of Arkansas**

This file documents the complete sequence of prompts used in Kiro to build the NutriMap React application. Judges can reproduce the tool by opening the `NutriHog-of-Ozark` project folder in Kiro and running these prompts in order.

---

## Environment

- **IDE:** Kiro (AWS agentic IDE, public preview)
- **Model:** Auto (Claude Sonnet 4.5)
- **Project folder:** `NutriHog-of-Ozark/` (cloned from GitHub)
- **Node.js:** Not installed — Kiro adapted to a zero-build CDN approach automatically
- **Autopilot:** ON for all prompts

---

## Prompt 1 — Project Orientation

> Read the README.md and the nutrihog_county_data.csv file in this project. Understand what NutriMap is, what data is available, and what the NourishNet 2026 challenge is asking for. Then summarize what you understand before doing anything else.

**What Kiro did:** Read `README.md`, inspected the CSV structure (3,221 counties, NVI scores, vulnerability predictions, SHAP values, lat/lon coordinates). Confirmed it understood the three user groups — families, donors, and volunteers — and the DC/MD/VA geographic focus.

**Why this prompt:** Grounding Kiro in the existing data and challenge brief before any code generation prevents hallucinated data schemas and ensures the app reflects real outputs from our analysis pipeline.

---

## Prompt 2 — Architecture Decision

> I want to build a React web application for the NourishNet challenge that displays county-level food vulnerability data for DC, Maryland, and Virginia. It needs to connect three user groups: families seeking food assistance, donors looking to contribute, and volunteers looking to help. The app must be deployable to GitHub Pages with no server infrastructure. What approach do you recommend given this project?

**What Kiro did:** Checked Node.js availability (`node --version; npm --version`), found it was not installed, and pivoted to a fully self-contained static HTML/JS approach using CDN-loaded React 18, Leaflet 1.9, and Babel — no build step required, directly deployable to GitHub Pages.

**Why this prompt:** Letting Kiro assess the environment first produced a more pragmatic architecture than forcing a Create React App scaffold that would have failed without Node.

---

## Prompt 3 — Full Application Build

> Build a self-contained NutriMap food vulnerability dashboard as a static web app in a subfolder called `nutrimap-app/`. Requirements:
>
> 1. **Map tab**: Interactive Leaflet map centered on DC/MD/VA. Color-coded circle markers for counties by NVI score tier (Critical 80-100 red, High 65-79 orange, Moderate 50-64 yellow, Low-Mod 35-49 light green, Low 0-34 green). Clicking a county shows a popup with NVI score, food insecurity rate, poverty rate, SNAP rate, and top vulnerability driver. Left sidebar with region overview stats (total counties, critical counties, avg NVI, avg food insecurity rate) and filters for state, NVI range, and vulnerability level.
>
> 2. **Connect tab**: Role selector for three user types — family needing food assistance, donor, and volunteer. After selecting a role, show a searchable list of real food assistance organizations in DC, Maryland, and Virginia. Include at least 20 real organizations such as Capital Area Food Bank, Maryland Food Bank, MANNA, Fredericksburg Regional Food Bank, SNAP offices, WIC programs, and food pantries. Each organization card shows name, type, service area, contact, and website.
>
> 3. **About tab**: NVI methodology explanation, data source citations, team information (NutriHog of Ozark, University of Arkansas, NourishNet 2026).
>
> 4. **Design**: Dark green theme (#0a1a0a background), responsive layout, professional typography. Header with NutriMap branding and DC·MD·VA tag.
>
> 5. **Files**: Create `index.html` (CDN React + Leaflet + Babel), `styles.css` (all styling), `data.js` (county data + organizations), `app.js` (full React JSX app), `.nojekyll` (GitHub Pages bypass), `README.md` (deploy instructions).
>
> Use real DC/MD/VA county data — at minimum include all counties in DC, Maryland, and Virginia with realistic NVI scores, food insecurity rates, and coordinates.

**What Kiro did:** Generated all 6 files. `data.js` initially failed on the first write attempt due to file size; Kiro automatically retried with a different write strategy and succeeded. Final output included 55 DC/MD/VA counties, 24 real organizations, full React component tree with state management, Leaflet map integration, and responsive CSS.

**Why this prompt:** A single comprehensive prompt with explicit file structure, data requirements, and design specifications produced a more coherent output than iterative partial prompts. Specifying real organization names ensured the Connect tab had actionable, verifiable content rather than placeholder data.

---

## Prompt 4 — Recovery After Network Drop

> The previous session dropped due to a network error after 10 minutes. `index.html` and `styles.css` were created successfully. `data.js` failed mid-write. Please check what files currently exist in the `nutrimap-app/` folder, then complete any missing or incomplete files to finish the application.

**What Kiro did:** Audited the workspace, found `data.js` was incomplete, regenerated it with 35 DC/MD/VA counties and 24 organizations, then completed `app.js` and `.nojekyll`. Confirmed all 6 files were present and consistent.

**Why this prompt:** Network interruptions are a real constraint in long Kiro sessions. This recovery prompt demonstrates that Kiro can resume mid-build without restarting from scratch, which is an important property for complex multi-file projects.

---

## Deployment

After Kiro completed the build, files were uploaded directly to the GitHub repository via the browser upload interface (git was not installed on the machine). GitHub Pages was already configured from a prior deployment.

**Live URL:** https://rushilagad.github.io/NutriHog-of-Ozark/

**To reproduce locally:**
```
# No build step needed
# Open index.html directly in a browser, or:
python -m http.server 8080
# Then open http://localhost:8080/nutrimap-app/
```

**To reproduce via Kiro:**
1. Clone `https://github.com/RushiLagad/NutriHog-of-Ozark`
2. Open the folder in Kiro
3. Run Prompts 1–3 above in sequence with Autopilot ON
4. The app will be generated in `nutrimap-app/`

---

## Reflection on Prompt Engineering

**What worked well:**
- Grounding Kiro in existing project context before any code generation (Prompt 1) significantly improved data schema accuracy
- A single comprehensive Prompt 3 with explicit file structure, design specs, and real organization names produced a more coherent multi-file output than iterative partial builds
- Letting Kiro assess the environment and self-select the CDN approach (Prompt 2) avoided the Node.js dependency failure entirely
- Kiro's automatic retry on `data.js` write failure showed strong autonomous error recovery

**What was challenging:**
- Long sessions (10+ min) are susceptible to network drops; building in explicit recovery prompts is essential
- File size limits on single-write operations required Kiro to chunk large data files across multiple edits
- Without Node.js, standard `create-react-app` scaffolding was unavailable; the CDN/Babel approach is a reasonable workaround but limits access to the npm ecosystem

**Future improvements:**
- Pre-install Node.js to enable a full React build pipeline with component splitting
- Use Kiro's steering files to encode project conventions (data schema, color palette, org data format) before the first build prompt
- Add a Kiro hook to auto-validate the Leaflet map renders correctly after each `data.js` edit
