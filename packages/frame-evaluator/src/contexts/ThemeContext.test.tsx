import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider, useTheme } from './ThemeContext';

const TestComponent: React.FC = () => {
  const { theme, toggleTheme, setThemeMode, customizeColors } = useTheme();

  return (
    <div>
      <div data-testid="mode">{theme.mode}</div>
      <div data-testid="background">{theme.colors.background}</div>
      <button onClick={toggleTheme}>Toggle</button>
      <button onClick={() => setThemeMode('dark')}>Set Dark</button>
      <button onClick={() => customizeColors({ background: '#FF0000' })}>
        Customize
      </button>
    </div>
  );
};

describe('ThemeContext', () => {
  it('provides light theme by default', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    expect(screen.getByTestId('mode')).toHaveTextContent('light');
    expect(screen.getByTestId('background')).toHaveTextContent('#FFFFFF');
  });

  it('accepts initial mode', () => {
    render(
      <ThemeProvider initialMode="dark">
        <TestComponent />
      </ThemeProvider>
    );
    expect(screen.getByTestId('mode')).toHaveTextContent('dark');
    expect(screen.getByTestId('background')).toHaveTextContent('#111827');
  });

  it('toggles theme', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    expect(screen.getByTestId('mode')).toHaveTextContent('light');
    fireEvent.click(screen.getByText('Toggle'));
    expect(screen.getByTestId('mode')).toHaveTextContent('dark');
  });

  it('sets theme mode directly', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    fireEvent.click(screen.getByText('Set Dark'));
    expect(screen.getByTestId('mode')).toHaveTextContent('dark');
  });

  it('customizes colors', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    fireEvent.click(screen.getByText('Customize'));
    expect(screen.getByTestId('background')).toHaveTextContent('#FF0000');
  });

  it('throws error when used outside provider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestComponent />)).toThrow(
      'useTheme must be used within a ThemeProvider'
    );
    consoleError.mockRestore();
  });
});
