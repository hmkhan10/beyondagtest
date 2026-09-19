import { randomUUID } from 'crypto';
import type { Issue } from '../types/index.js';

export function analyzeAccessibility(uiHierarchy: string): Issue[] {
  const issues: Issue[] = [];

  if (!uiHierarchy) {
    issues.push({
      id: randomUUID(),
      severity: 'medium',
      category: 'accessibility',
      title: 'No UI hierarchy available',
      description: 'Could not read accessibility tree for analysis',
      fix: 'Ensure accessibility labels are set on all interactive elements',
      timestamp: new Date(),
    });
    return issues;
  }

  const contentDescMissing = (uiHierarchy.match(/content-desc=""/g) || []).length;
  if (contentDescMissing > 0) {
    issues.push({
      id: randomUUID(),
      severity: 'medium',
      category: 'accessibility',
      title: `${contentDescMissing} elements missing content descriptions`,
      description: 'Interactive elements should have content descriptions for screen readers',
      fix: 'Add contentDescription (Android) or accessibilityLabel (iOS) to elements',
      timestamp: new Date(),
    });
  }

  const clickableWithoutDesc = (uiHierarchy.match(/clickable="true"[^>]*content-desc=""/g) || []).length;
  if (clickableWithoutDesc > 0) {
    issues.push({
      id: randomUUID(),
      severity: 'high',
      category: 'accessibility',
      title: `${clickableWithoutDesc} clickable elements without labels`,
      description: 'Clickable elements must have accessible labels',
      fix: 'Add meaningful labels to all clickable elements',
      timestamp: new Date(),
    });
  }

  return issues;
}

export function analyzeUiLayout(screenshots: { screenName: string; path: string }[]): Issue[] {
  const issues: Issue[] = [];

  if (screenshots.length === 0) {
    issues.push({
      id: randomUUID(),
      severity: 'info',
      category: 'ui',
      title: 'No screenshots captured',
      description: 'Cannot analyze UI without screenshots',
      fix: 'Ensure screenshots are captured during testing',
      timestamp: new Date(),
    });
  }

  return issues;
}
