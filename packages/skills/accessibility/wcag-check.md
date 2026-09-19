# WCAG Accessibility Test Suite

## Test Cases

### 1. Color Contrast
- Check text/background contrast ratios
- WCAG AA requires 4.5:1 for normal text
- WCAG AA requires 3:1 for large text
- Check interactive elements contrast

### 2. Touch Targets
- All interactive elements must be at least 44x44px
- Check button sizes
- Check link sizes
- Check input field sizes

### 3. Screen Reader Support
- Verify content descriptions exist
- Check heading hierarchy (h1, h2, h3)
- Verify landmark regions
- Check focus order

### 4. Text Scaling
- Test with system font scaling (200%)
- Verify no text truncation
- Check layout doesn't break

### 5. Keyboard Navigation
- Verify all interactive elements are focusable
- Check focus visible indicators
- Verify logical tab order

### 6. Motion and Animation
- Verify prefers-reduced-motion is respected
- Check no auto-playing animations
- Verify parallax effects can be disabled
