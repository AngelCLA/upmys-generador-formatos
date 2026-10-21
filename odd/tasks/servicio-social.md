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
- Running authored changed lines: about 346 source lines for SS-01..SS-05 (about 426 including this task document). The source work unit stays under the advisory 400-line planning heuristic; revisit the delivery strategy before any pull request.

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
- [ ] **SS-06+** Pending: additional official formats supplied by the user.
  - Route: to be decided when the sources arrive.

## Acceptance criteria

- `/servicio-social/solicitud` renders a three-step form and validates required fields before advancing.
- The form persists values in localStorage and restores them on reload.
- The generated `.docx` reproduces the official letter: logo, date, addressee, request paragraph, activity list, closing, signature line, and student name.
- The generated document has no SEP/escudo footer.
- `/servicio-social` lists the implemented format and links to it.
- The home page links to the implemented format.
- `pnpm check` and `pnpm build` pass.
- No backend or external data transfer is introduced.

## Checks

- `pnpm check`
- `pnpm build`
- Manual: complete the form, export the `.docx`, and open it in Word or LibreOffice.

## Progress

- 2026-10-21: Feature created on branch `feat/servicio-social`. Source format 01 received. Footer asset extracted to `static/Footer-SEP.jpeg`.
- 2026-10-21: SS-01..SS-05 implemented in one delegated writer work unit. `pnpm check`: 0 errors, 0 warnings. `pnpm build`: succeeded. DOCX footer API smoke test: generated a 31,954-byte `.docx` with the JPEG footer. Manual Word/LibreOffice pagination check remains pending.
- 2026-10-21: User feedback accepted: removed the SEP/escudo footer and one blank line before `ATENTAMENTE` in the generated letter. The footer asset and the temporary `exportToDocx` footer support were removed.
