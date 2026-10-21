# Servicio Social module

## Objective

Implement the Servicio Social module with one local, multi-step form per official UPMYS format, live preview, localStorage memory, and DOCX export, plus a module landing page and home-page registry entries.

## Problem

The module is a stub: `src/routes/servicio-social/+page.svelte` only says "Módulo en preparación", and `servicioSocialForms` in `src/lib/data/forms.js` points back to that stub with a "Próximamente" badge. The official PSS formats must be digitized.

## Why

Students need to generate the official Servicio Social documents without manually filling Word templates, using the same workflow already available for Estadía Profesional.

## Scope

- Local routes under `src/routes/servicio-social/<format>/`.
- Reuse existing components (`Stepper`, `FormInput`, `SelectField`, `RadioGroup`, `FormNav`, `PreviewPanel`, `Header`) and utilities.
- Register every implemented format in `src/lib/data/forms.js`.
- Module landing page listing the available formats.
- Home-page module card for each implemented format.
- No backend, no data submission; localStorage only.

## Constraints

- Preserve the official wording, addressee, and signature block from each source `.doc` file.
- Do not invent formats, fields, or institutional text absent from the sources.
- Generated artifacts (code, comments, documentation) in English; user-facing copy in Spanish.
- Keep the existing visual language and component patterns.
- The native review candidate is a work-unit commit, never a TODO checkbox.

## Delivery strategy

- Strategy: `ask-on-risk` (default). No pull request requested yet.
- Forecast at creation: about 400 authored changed lines for the first format plus module wiring. The feature will exceed 400 lines across all formats; revisit the strategy before opening a PR.
- Running authored changed lines: about 672 source lines across formats 01-02 (about 772 including this task document). Format 03 adds about 638 source lines (625 route lines plus registry, utility, and README edits), bringing the running total to about 1,310 source lines (about 1,410 including this task document). Format 04 adds about 1,312 source lines (1,294 route lines plus registry and README edits), bringing the running total to about 2,622 source lines (about 2,722 including this task document). Format 05 was forecast at about 350 source lines; it added about 468 (458 route lines plus registry, README, and task-document edits), bringing the running total to about 3,090 source lines. The accumulated feature branch exceeds the advisory 400-line planning heuristic; the `ask-on-risk` delivery strategy applies when a pull request is planned.

## Tasks

- [x] **SS-01** Implement the "Solicitud del PSS" (format 01) route with a three-step form, live preview, and DOCX export.
  - Route: delegated direct (writer trigger: new route plus shared utility and registry edits).
  - Source: `01. Solicitud del PSS.doc` supplied by the user.
  - Evidence: `src/routes/servicio-social/solicitud/+page.svelte` (306 lines); official addressee, body, activity list, signature block, and logo reproduced.
- [x] **SS-02** Replace the `/servicio-social` stub with a module landing that lists the available formats.
  - Route: delegated direct (same writer work unit as SS-01).
  - Evidence: `src/routes/servicio-social/+page.svelte`.
- [x] **SS-03** Register the format in `servicioSocialForms` and update the home-page module card.
  - Route: delegated direct (same writer work unit as SS-01).
  - Evidence: `src/lib/data/forms.js`, `src/routes/+page.svelte`.
- [x] **SS-04** Remove the SEP/escudo footer from format 01 per user request; no footer asset is shipped.
  - Route: direct inline (mechanical correction after user feedback).
  - Evidence: `src/routes/servicio-social/solicitud/+page.svelte` no longer configures a page footer; `static/Footer-SEP.jpeg` was deleted; the temporary `exportToDocx` footer support was reverted.
- [x] **SS-05** Update `README.md` with the Servicio Social section and project structure.
  - Route: delegated direct (same writer work unit as SS-01).
  - Evidence: `README.md`.
- [x] **SS-06** Implement the "Aceptación de SS" (format 02) route with a three-step form, live preview, and DOCX export.
  - Route: delegated direct (writer trigger: new route plus registry and README edits).
  - Source: `02._Aceptación_de_SS.docx` supplied by the user.
  - Evidence: `src/routes/servicio-social/aceptacion/+page.svelte` (313 lines); text-only letter with no logo, footer, image, table, or red instructional note.
- [x] **SS-07** Register format 02 in `servicioSocialForms` and update `README.md`.
  - Route: delegated direct (same writer work unit as SS-06).
  - Evidence: `src/lib/data/forms.js`, `README.md`.
- [x] **SS-08** Implement the "Informe Periódico de SS" (format 03) route with a three-step form, live preview, and DOCX export.
  - Route: delegated direct (writer trigger: new route plus shared utility, registry, README, and feature-doc edits).
  - Source: `03. Reporte_mensual_SS UPMyS.docx` supplied by the user.
  - Scope: Times New Roman report with UPMYS logo, title block, place/date, ten-row data table, report-number and hours line, signature block, page-number footer, activities table, and observations table. Page 1 holds the main form; page 2 starts with the activities and observations tables.
- [x] **SS-09** Add page-number footer forwarding to `exportToDocx` and register format 03 in `servicioSocialForms` and `README.md`.
  - Route: delegated direct (same writer work unit as SS-08).
  - Evidence: `src/lib/utils/exportWord.js`, `src/lib/data/forms.js`, `README.md`.
- [x] **SS-10** Verify format 03 with `pnpm check`, `pnpm build`, and a DOCX footer-field inspection.
  - Route: parent verification after the writer returns.
  - Evidence: `pnpm check` 0 errors/0 warnings; `pnpm build` wrote the static site; footer smoke test produced `footer1.xml` with `PAGE` and `NUMPAGES` fields and a `footerReference` in `document.xml`.
- [x] **SS-11** Implement the "Evaluación del Servicio Social: perspectiva del Supervisor/Asesor" (format 04) route with a five-step form, live preview, and DOCX export.
  - Route: delegated direct (writer trigger: new route plus registry and README edits).
  - Source: `04. Instrumento_Eval_ perspectiva Superv.doc` supplied by the user.
  - Scope: title block, five data fields, four evaluation sections with 21 questions, five open-answer boxes, signature line, place/date line, and closing thanks. The generated document follows the official two-page layout when open answers are concise.
  - Evidence: `src/routes/servicio-social/evaluacion-supervisor/+page.svelte` (1,294 lines); committed in `b37d6ac`.
- [x] **SS-12** Register format 04 in `servicioSocialForms` and update `README.md`.
  - Route: delegated direct (same writer work unit as SS-11).
  - Evidence: `src/lib/data/forms.js`, `README.md`; committed in `b37d6ac`.
- [ ] **SS-13** Verify format 04 with `pnpm check`, `pnpm build`, and a DOCX layout/content inspection.
  - Route: parent verification.
  - Evidence: `pnpm check` and `pnpm build` pass for the shared worktree; the format 04 DOCX layout/content smoke test remains pending.
- [x] **SS-15** Implement the "Terminación del SS" (format 05) route with a four-step form, live preview, and DOCX export.
  - Route: delegated direct (writer trigger: new route plus registry and README edits).
  - Source: `05. Terminación del SS-UPMyS (1).docx` supplied by the user.
  - Scope: Arial 12 pt letter matching the source's two-page flow, with a right-aligned place/date line, Rector addressee, right-aligned `At'n Dr. Abraham Hi Rivera` copy line, justified body with the student, career, service period, organization, project, and fixed 480 hours, five bullet activity slots, `A t e n t a m e n t e.`, signature line with responsible name, position, and company address, and the bold letterhead note. No logo, header, footer, or page numbers. The signature block is kept together and flows to page 2 when needed.
  - Evidence: `src/routes/servicio-social/terminacion/+page.svelte`; `pnpm check` 0 errors/0 warnings; `pnpm build` succeeded; Word COM smoke test produced 293 words in 2 pages with the complete signature block on page 2, no header/footer, and the expected margins; committed in `38bc15f`.
- [x] **SS-16** Register format 05 in `servicioSocialForms` and update `README.md`.
  - Route: delegated direct (same writer work unit as SS-15).
  - Evidence: `src/lib/data/forms.js`, `README.md`.
- [x] **SS-17** Verify format 05 with `pnpm check`, `pnpm build`, and a DOCX layout/content inspection.
  - Route: parent verification after the writer returns.
  - Evidence: `pnpm check` 0 errors/0 warnings; `pnpm build` wrote the static site; Word COM opened the smoke `.docx`, reported 2 pages and 293 words, kept the signature line, name, position, address, and note together on page 2, and confirmed no header/footer plus the source margins. The source itself is 2 pages in Word; the generated layout matches that flow.
- [ ] **SS-18+** Pending: additional official formats supplied by the user.
  - Route: to be decided when the sources arrive.

## Acceptance criteria

### Module

- `/servicio-social` lists every implemented format and links to it.
- The home page links to the module.
- Each form persists values in localStorage and restores them on reload.
- `pnpm check` and `pnpm build` pass.
- No backend or external data transfer is introduced.

### Format 01

- `/servicio-social/solicitud` renders a three-step form and validates required fields before advancing.
- The generated `.docx` reproduces the official letter: logo, date, addressee, request paragraph, activity list, closing, signature line, and student name.
- The generated document has no SEP/escudo footer.

### Format 02

- `/servicio-social/aceptacion` renders a three-step form and validates required fields before advancing.
- The generated `.docx` reproduces the acceptance letter: place and date, Rector addressee, student and career, receiving organization, project title, period, schedule, 480 hours, activities, closing, `ATENTAMENTE`, responsible name, and position.
- The generated document contains no logo, no footer, and no red instructional note.
- The letterhead and seal of the receiving organization are handled outside the generated document.

### Format 03

- `/servicio-social/informe` renders a three-step form and validates required fields before advancing.
- The generated `.docx` reproduces the official report: UPMYS logo, university title, `Vinculación Social`, `INFORME PERIÓDICO DE SERVICIO SOCIAL`, italic place/date line, ten-row data table, report-number and hours line, advisor/student signature block, page-number footer, activities table, and observations table.
- Page 1 contains the header, data table, report line, and signatures; page 2 starts with the activities table and ends with the observations table.
- Instructional placeholders and template highlights (`Descripción general...`, `(elegir opción)`, `dd/mm/aaaa`, gray/yellow highlights) are not emitted.
- `pnpm check` and `pnpm build` pass.

### Format 04

- `/servicio-social/evaluacion-supervisor` renders a five-step form: general data, academic advising (Q1-Q5), service provider (Q6-Q12), values (Q13-Q17), and impact/closing (Q18-Q21 plus evaluation date).
- The generated `.docx` reproduces the official evaluation: UPMYS logo at the top-left, university title, subtitle, instructions, cycle and name lines, organization and supervisor data, the four lettered sections, the 7-column question tables, the open-answer boxes, the signature line, the place/date line, and the closing thanks.
- The generated document contains no header, no footer, and no page numbers. It aims for two pages when open answers are concise; long open answers may flow to additional pages.
- The pre-checked `No (x)` in the source is not prefilled; answers are emitted only from the form state.
- Obvious source typos and missing accents are corrected without changing the official meaning or institutional terms.
- `pnpm check` and `pnpm build` pass.

### Format 05

- `/servicio-social/terminacion` renders a four-step form: student data, service period and organization, activities, and signatory.
- The generated `.docx` reproduces the official letter: right-aligned place/date, Rector addressee, right-aligned `At'n Dr. Abraham Hi Rivera` / `Secretario Académico`, justified body with student, career, period, organization, project, and the fixed 480 hours, bullet activity list, `A t e n t a m e n t e.`, signature line with responsible name, position, and company address, and the bold letterhead note.
- The generated document contains no logo, header, footer, or page numbers; the signature block stays together and may flow to page 2, matching the source's two-page flow.
- The form validates required fields before advancing.
- `pnpm check` and `pnpm build` pass.

## Checks

- `pnpm check`
- `pnpm build`
- Manual: complete the form, export the `.docx`, and open it in Word or LibreOffice.

## Progress

- 2026-10-21: Feature created on branch `feat/servicio-social`. Source format 01 received. Footer asset extracted to `static/Footer-SEP.jpeg`.
- 2026-10-21: SS-01..SS-05 implemented in one delegated writer work unit. `pnpm check`: 0 errors, 0 warnings. `pnpm build`: succeeded. DOCX footer API smoke test: generated a 31,954-byte `.docx` with the JPEG footer. Manual Word/LibreOffice pagination check remains pending.
- 2026-10-21: User feedback accepted: removed the SEP/escudo footer and one blank line before `ATENTAMENTE` in the generated letter. The footer asset and the temporary `exportToDocx` footer support were removed.
- 2026-10-21: Format 02 implemented in one delegated writer work unit and verified with `pnpm check` (0 errors, 0 warnings) and `pnpm build` (succeeded). The body keeps only the student and responsible names bold, matching the source emphasis. Manual Word/LibreOffice pagination check remains pending.
- 2026-10-21: Format 03 source parsed: Times New Roman 11 pt body, 24 pt title, 16 pt `Vinculación Social`, 14 pt report title, 0.98 in/1.18 in margins, double-bordered tables, UPMYS logo in the top-left, centered `Página X de Y` footer, page 2 activities and observations tables.
- 2026-10-21: SS-08/SS-09 implemented in one delegated writer work unit. `pnpm check`: 0 errors, 0 warnings. `pnpm build`: succeeded. The route adds the Times New Roman report layout, two-page DOCX structure, live preview, footer forwarding in `exportToDocx`, and format 03 registry/README entries. Manual Word/LibreOffice pagination check remains pending.
- 2026-10-21: SS-10 verified: `pnpm check` 0 errors/0 warnings; `pnpm build` succeeded; a DOCX footer smoke test produced `footer1.xml` with `PAGE` and `NUMPAGES` fields and a `footerReference` in `document.xml`. Manual Word/LibreOffice pagination remains pending.
- 2026-10-21: User confirmed the generated format 03 `.docx` looks correct after opening it.
- 2026-10-21: Actual worktree is on `main`; formats 01-03 are committed (`0bd74c9`, `c1bdc66`, `65163db`). Format 03 is committed but not agent-reviewed. Format 04 remains the next work unit; keep it separate from the format 03 commit.
- 2026-10-21: Format 04 source parsed: Letter 612x792 pt with 0.98 in top/bottom and 1.18 in left/right margins; UPMYS logo is a floating body image at the top-left; header and footer are empty; 8 tables with a 7-column question layout; Arial 8 pt questions, Arial 7 pt options, Times New Roman body; four lettered sections and 21 questions; Q10 has a monthly amount, Q11 a frequency count, Q19 is yes/no, and Q5/Q12/Q17/Q20/Q21 are open answers. Design fixed for a five-step route, corrected accents, a uniform table layout, and a two-page DOCX without header, footer, or page numbers.
- 2026-10-21: Format 04 implementation committed in `b37d6ac` (1,294-line route plus registry and README edits). Format 04 verification remains pending.
- 2026-10-21: Format 05 source parsed: Letter 612x792 pt, 0.98 in top/bottom and 1.18 in left/right margins, Arial 12 pt throughout, right-aligned place/date and `At'n` block, justified body with a 708-twip first-line indent, five bullet blanks with 720/360 hanging indent, centered signature block, and a bold letterhead note. No header, footer, image, table, or page numbers. Word reports the source as 2 pages; the signature block starts on page 2.
- 2026-10-21: Format 05 work unit started on branch `feat/servicio-social-terminacion`.
- 2026-10-21: SS-15/SS-16/SS-17 implemented and verified. `pnpm check`: 0 errors, 0 warnings. `pnpm build`: succeeded and wrote the static site. Parent corrections preserved the source's two blank lines before `Sin otro particular` and added `keepNext`/`keepLines` so the signature block does not split across pages. A Word COM smoke test of the generated `.docx` reported 2 pages and 293 words, kept the signature line, name, position, address, and note together on page 2, and confirmed no header/footer plus the source margins. Manual UI export remains pending.
- 2026-10-21: Format 05 source itself is 2 pages in Word; the generated layout follows that flow. Do not force a one-page fit without a user decision.
- 2026-10-21: Format 05 work unit committed in `38bc15f` (458-line route, registry, README, and task-doc updates). Manual UI export remains pending.
