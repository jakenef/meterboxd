# Styles Directory Structure

This directory contains the modular SCSS files for the MeterBoxd frontend. The styles have been organized for better maintainability and easier development.

## Directory Structure

```
styles/
├── base/
│   └── _variables.scss      # Global variables, colors, breakpoints, etc.
└── components/
    ├── _buttons.scss        # Modern upload buttons and navigation
    ├── _loading.scss        # Loading screens and animations
    ├── _movie-grid.scss     # Movie card grid and individual card styles
    ├── _shareable-image.scss # Shareable image preview and download component
    ├── _tough-crowd.scss    # Tough crowd section responsive styles
    └── _upload.scss         # Upload container and file input styles
```

## Import Order

The main.scss file imports styles in this order:

1. **Bootstrap** - Base framework styles
2. **Base Variables** - Custom variables that can be used throughout components
3. **Components** - Individual component styles

## Variables

All commonly used values are defined in `base/_variables.scss`:

- **Colors**: Primary, dark, black, success, warning colors
- **Spacing**: Consistent spacing scale (xs, sm, md, lg, xl)
- **Breakpoints**: Mobile, tablet, desktop breakpoints
- **Border Radius**: Consistent border radius values
- **Transitions**: Standard transition durations
- **Z-index**: Layering system

## Adding New Components

When adding new component styles:

1. Create a new file in `styles/components/` with an underscore prefix (e.g., `_new-component.scss`)
2. Add the import to `main.scss`
3. Use the variables from `_variables.scss` for consistency
4. Follow the existing naming conventions and structure

## Best Practices

- Use variables instead of hardcoded values
- Follow BEM naming convention where appropriate
- Group related styles together
- Use meaningful component names
- Include responsive breakpoints when needed
- Keep components focused and single-purpose
