import React from 'react';

/**
 * Accessible Icon Component
 * Provides proper ARIA labels for icon-only buttons and elements
 */
export function AccessibleIcon({ label, children, ...props }) {
  return (
    <>
      <span aria-hidden="true" {...props}>
        {children}
      </span>
      <span className="sr-only">{label}</span>
    </>
  );
}

/**
 * Screen Reader Only Text
 * Hides text visually but keeps it accessible to screen readers
 */
export function ScreenReaderOnly({ children }) {
  return (
    <span className="sr-only">
      {children}
    </span>
  );
}
