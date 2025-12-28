import React from 'react';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import LanguageToggle from '@/components/LanguageToggle';
import { SkipToContent } from '@/components/ui/skip-to-content';

const TestSurface = () => (
  <div>
    <SkipToContent />
    <main id="main-content">
      <LanguageToggle />
      <button type="button">Primary Action</button>
    </main>
  </div>
);

describe('accessibility smoke checks', () => {
  it('renders core navigation helpers without a11y violations', async () => {
    const { container } = render(<TestSurface />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
