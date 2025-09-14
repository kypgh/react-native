# DateScrollPicker Component

A horizontal scrollable date picker component that allows users to select dates within a specified range.

## Features

- Horizontal scrolling date selection
- Configurable date range (default: 2 months from current date)
- Visual feedback for selected date and today's date
- Responsive design that adapts to different screen sizes
- Theme support for light and dark modes
- Accessibility support

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `selectedDate` | `Date` | Required | Currently selected date |
| `onDateSelect` | `(date: Date) => void` | Required | Callback when a date is selected |
| `maxRange` | `number` | `2` | Maximum months from current date |
| `minRange` | `number` | `0` | Months before current date |

## Usage

```tsx
import { DateScrollPicker } from '../components';

function MyScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <DateScrollPicker
      selectedDate={selectedDate}
      onDateSelect={setSelectedDate}
      maxRange={2}
      minRange={0}
    />
  );
}
```

## Visual States

- **Normal**: Default appearance for unselected dates
- **Selected**: Highlighted with primary color and white text
- **Today**: Border with primary color (when not selected)
- **Interactive**: Touch feedback with opacity change

## Implementation Details

- Automatically scrolls to selected date when it changes
- Uses virtualized scrolling for performance
- Snaps to date items for better UX
- Calculates optimal item width based on screen size
- Supports both tablet and phone layouts

## Requirements Fulfilled

This component fulfills the following requirements from the UI enhancements spec:

- **4.2**: Display dates in a horizontally scrollable format
- **4.3**: Limit scroll range to maximum of 2 months from current date
- **4.4**: Show continuous scroll of selectable date options
- **4.5**: Highlight selected date and update available classes accordingly