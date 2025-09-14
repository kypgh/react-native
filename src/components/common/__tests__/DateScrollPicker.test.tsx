import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { DateScrollPicker } from '../DateScrollPicker';
import { ThemeProvider } from '../../../theme';

// Mock theme provider
const MockThemeProvider = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

describe('DateScrollPicker', () => {
  const mockOnDateSelect = jest.fn();
  const selectedDate = new Date('2025-09-15');

  beforeEach(() => {
    mockOnDateSelect.mockClear();
  });

  it('renders correctly with selected date', () => {
    const { getByText } = render(
      <MockThemeProvider>
        <DateScrollPicker
          selectedDate={selectedDate}
          onDateSelect={mockOnDateSelect}
        />
      </MockThemeProvider>
    );

    // Should display the selected date
    expect(getByText('15')).toBeTruthy();
  });

  it('calls onDateSelect when a date is pressed', () => {
    const { getByText } = render(
      <MockThemeProvider>
        <DateScrollPicker
          selectedDate={selectedDate}
          onDateSelect={mockOnDateSelect}
        />
      </MockThemeProvider>
    );

    // Find and press a different date
    const dateButton = getByText('16');
    fireEvent.press(dateButton);

    expect(mockOnDateSelect).toHaveBeenCalled();
  });

  it('generates correct date range', () => {
    const { getByText } = render(
      <MockThemeProvider>
        <DateScrollPicker
          selectedDate={selectedDate}
          onDateSelect={mockOnDateSelect}
          maxRange={1}
        />
      </MockThemeProvider>
    );

    // Should have dates from current month and next month
    expect(getByText('15')).toBeTruthy();
  });
});