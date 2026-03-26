# Create shared UI library and sandbox app for component testing

## Problem description

The project needs a centralized location for shared UI components that can be reused across multiple projects. Currently, `IconComponent` exists in `dream-game` but should be part of a proper shared UI library. Additionally, there is no way to visually test and document these components in isolation.

## Suggested approach

1. Create a new Angular library project named `shared-ui` following the pattern of `game-board-ui`
2. Move the `IconComponent` from `projects/dream-game/common/icon.component.ts` to the new library
3. Configure API Extractor with explicit exports and TypeScript path aliases (`@shared-ui`)
4. Create a new Angular application project named `shared-ui-sandbox` that serves as a primitive Storybook
5. Add E2E tests with screenshot verification to detect visual regressions

## Acceptance criteria

### shared-ui library project
- [ ] New project `shared-ui` added to `angular.json` with projectType: "library"
- [ ] TypeScript path alias configured (`@shared-ui`)
- [ ] API Extractor configured following the pattern of `game-board-ui`
- [ ] `index.ts` created with explicit exports (only public API surface)
- [ ] `IconComponent` moved and updated:
  - Component has inline styles (not in external SCSS file)
  - OnPush change detection strategy
  - Uses signal inputs
  - Exported via `index.ts`

### shared-ui-sandbox application project
- [ ] New project added to `angular.json` with projectType: "application"
- [ ] Serves as a "primitive storybook" - displays each component with all possible configurations
- [ ] Displays `IconComponent` with multiple pathD values and color variations
- [ ] Route-based navigation to different component views
- [ ] E2E tests configured with Playwright (following existing e2e project pattern)
- [ ] Screenshot tests verify no visual regression for each component configuration

### API Extractor
- [ ] `api-extractor.json` configured correctly
- [ ] `tsconfig.api.json` configured with path alias and proper includes/excludes
- [ ] API report generated and shows correct public exports

### Build and Test
- [ ] Library builds successfully with `npm run build`
- [ ] API Extractor runs without errors
- [ ] Sandbox app builds and serves correctly
- [ ] E2E tests pass with screenshot comparison