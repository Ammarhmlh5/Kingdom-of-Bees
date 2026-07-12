import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { I18nProvider, useI18n } from './I18nContext';

const TestComponent: React.FC = () => {
  const { language, setLanguage, t, isRTL } = useI18n();

  return (
    <div>
      <div data-testid="language">{language}</div>
      <div data-testid="rtl">{isRTL ? 'true' : 'false'}</div>
      <div data-testid="honey">{t.honey}</div>
      <button onClick={() => setLanguage('en')}>Switch to English</button>
      <button onClick={() => setLanguage('ar')}>Switch to Arabic</button>
    </div>
  );
};

describe('I18nContext', () => {
  it('provides Arabic by default', () => {
    render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    );
    expect(screen.getByTestId('language')).toHaveTextContent('ar');
    expect(screen.getByTestId('rtl')).toHaveTextContent('true');
    expect(screen.getByTestId('honey')).toHaveTextContent('العسل');
  });

  it('accepts initial language', () => {
    render(
      <I18nProvider initialLanguage="en">
        <TestComponent />
      </I18nProvider>
    );
    expect(screen.getByTestId('language')).toHaveTextContent('en');
    expect(screen.getByTestId('rtl')).toHaveTextContent('false');
    expect(screen.getByTestId('honey')).toHaveTextContent('Honey');
  });

  it('switches language', () => {
    render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    );
    expect(screen.getByTestId('honey')).toHaveTextContent('العسل');
    fireEvent.click(screen.getByText('Switch to English'));
    expect(screen.getByTestId('honey')).toHaveTextContent('Honey');
    expect(screen.getByTestId('rtl')).toHaveTextContent('false');
  });

  it('throws error when used outside provider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestComponent />)).toThrow(
      'useI18n must be used within an I18nProvider'
    );
    consoleError.mockRestore();
  });
});
