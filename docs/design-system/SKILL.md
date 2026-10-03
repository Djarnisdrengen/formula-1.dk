---
name: f1klub-design
description: Use this skill to generate well-branded interfaces and assets for Frederikssund Formel 1 Klub — a private F1 betting site for ~10 Danish friends — either for production or throwaway prototypes/mocks. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the `README.md` file within this skill, and explore the other available files. The system is small and opinionated — F1 red `#e10600`, dark-theme default, Chivo + Manrope type, Font Awesome icons, no emoji, terse Danish/English bilingual copy.

If creating visual artifacts (slides, mocks, throwaway prototypes), copy assets out and create static HTML files for the user to view. Pull `colors_and_type.css` and the logos from `assets/` into your output folder, lean on the CSS variables, and reuse the JSX components in `ui_kits/website/` rather than rebuilding them.

If working on production code, copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.
