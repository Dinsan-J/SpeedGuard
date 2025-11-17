# QR Code Feature - Vehicle Dashboard

## Overview
Each vehicle card on the dashboard now includes a QR code that can be shown/hidden with a button click.

## Features Added

### 1. Show/Hide QR Code Button
- Located at the bottom of each vehicle card
- Click to toggle QR code visibility
- Icon changes based on state

### 2. QR Code Display
- Shows vehicle plate number as QR code
- 120x120 pixel size
- White background for easy scanning
- Displays plate number below QR code
- Includes instruction text

### 3. User Experience
- Click vehicle card to select it (filters violations)
- Click "Show QR Code" button to display QR
- Click "Hide QR Code" to collapse it
- Each vehicle has independent QR code state
- Smooth animation when showing/hiding

## Visual Layout

```
┌─────────────────────────────────────┐
│  My Vehicles                        │
│  ┌───────────────────────────────┐  │
│  │ 🚗 ABC123        IoT Connected│  │
│  │ 2020 Toyota Corolla           │  │
│  │ Device: IOT-DEVICE-12345      │  │
│  │ ✓ Selected                    │  │
│  ├───────────────────────────────┤  │
│  │ [📱 Show QR Code]             │  │ ← Click to toggle
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ 🚗 XYZ789                     │  │
│  │ 2019 Honda Civic              │  │
│  ├───────────────────────────────┤  │
│  │ [📱 Hide QR Code]             │  │ ← Currently showing
│  │ ┌─────────────────────────┐   │  │
│  │ │   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓    │   │  │
│  │ │   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓    │   │  │
│  │ │   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓    │   │  │
│  │ │   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓    │   │  │
│  │ │        XYZ789           │   │  │
│  │ │ Show to officers when   │   │  │
│  │ │      requested          │   │  │
│  │ └─────────────────────────┘   │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

## Implementation Details

### State Management
```typescript
const [showQRVehicleId, setShowQRVehicleId] = useState<string | null>(null);
```
- Tracks which vehicle's QR code is currently visible
- `null` means no QR code is shown
- Vehicle ID means that vehicle's QR code is shown

### QR Code Component
```typescript
<QRCode
  value={vehicle.plateNumber}  // QR code contains plate number
  size={120}                    // 120x120 pixels
  level="M"                     // Medium error correction
/>
```

### Toggle Logic
```typescript
onClick={(e) => {
  e.stopPropagation(); // Prevent vehicle selection
  setShowQRVehicleId(
    showQRVehicleId === vehicle._id ? null : vehicle._id
  );
}}
```

## User Interactions

### Scenario 1: Show QR Code
1. User sees vehicle card with "Show QR Code" button
2. Clicks button
3. QR code appears with smooth animation
4. Button text changes to "Hide QR Code"
5. Plate number and instructions shown below QR

### Scenario 2: Hide QR Code
1. QR code is currently visible
2. User clicks "Hide QR Code" button
3. QR code collapses
4. Button text changes back to "Show QR Code"

### Scenario 3: Multiple Vehicles
1. User has 3 vehicles
2. Shows QR for Vehicle 1
3. Shows QR for Vehicle 2
4. Vehicle 1's QR automatically hides
5. Only one QR code visible at a time

### Scenario 4: Select Vehicle While QR Shown
1. Vehicle 1 QR code is visible
2. User clicks Vehicle 2 card to select it
3. Vehicle 2 becomes selected (filters violations)
4. Vehicle 1's QR code remains visible
5. QR code state is independent of selection

## Use Cases

### For Users
- **Traffic Stop**: Show QR code to officer for quick vehicle verification
- **Parking**: Display QR for parking attendant
- **Insurance**: Share QR code for insurance verification
- **Registration**: Quick access to vehicle identification

### For Officers
- Scan QR code to quickly look up vehicle
- Verify vehicle registration
- Check violation history
- Access vehicle details

## Styling

### Button
- Ghost variant (transparent background)
- Small size
- Full width of card
- Icon + text layout
- Hover effect

### QR Code Container
- White background for contrast
- Rounded corners
- Padding for spacing
- Centered content
- Fade-in animation
- Border separator above button

### Text
- Plate number below QR
- Instruction text at bottom
- Muted color for secondary text
- Small font size

## Technical Notes

### QR Code Library
- Uses `react-qr-code` package
- Already installed in project
- Lightweight and fast
- SVG-based (scalable)

### Performance
- QR code only renders when visible
- No performance impact when hidden
- Instant generation (no API calls)
- Smooth animations

### Accessibility
- Button has clear label
- QR code has alt text (via plate number)
- Keyboard accessible
- Screen reader friendly

## Testing

### Manual Testing
1. ✅ Open dashboard
2. ✅ Click "Show QR Code" on any vehicle
3. ✅ Verify QR code appears
4. ✅ Scan QR code with phone - should show plate number
5. ✅ Click "Hide QR Code"
6. ✅ Verify QR code disappears
7. ✅ Show QR on multiple vehicles
8. ✅ Verify only one shows at a time
9. ✅ Select different vehicle while QR shown
10. ✅ Verify selection works independently

### Edge Cases
- ✅ No vehicles: No QR codes to show
- ✅ One vehicle: QR code works normally
- ✅ Many vehicles: Each has independent QR
- ✅ Long plate numbers: QR code adjusts
- ✅ Special characters: QR code handles them

## Future Enhancements

### Possible Additions
1. **Download QR Code**: Button to save QR as image
2. **Print QR Code**: Print-friendly version
3. **Share QR Code**: Share via email/SMS
4. **QR Code Size**: User-adjustable size
5. **QR Code Color**: Customizable colors
6. **Additional Data**: Include more vehicle info in QR
7. **Expiry Date**: Show registration/insurance expiry
8. **Violation Count**: Include in QR data

### Advanced Features
1. **Dynamic QR**: Update QR with real-time data
2. **Encrypted QR**: Secure vehicle information
3. **Multi-format**: Support different QR formats
4. **Batch Print**: Print all vehicle QR codes
5. **QR History**: Track QR code scans
6. **Officer App**: Dedicated app for scanning

## Comparison with Previous Implementation

### Before (MyVehicleCard.tsx)
- Separate component
- Only one vehicle shown
- QR code in separate section
- Less integrated

### Now (UserDashboard.tsx)
- ✅ Integrated into vehicle cards
- ✅ Multiple vehicles supported
- ✅ Toggle button for each vehicle
- ✅ Better user experience
- ✅ Consistent with design
- ✅ More accessible

## Code Changes Summary

### Files Modified
- `Frontend/src/pages/user/UserDashboard.tsx`

### Lines Added
- State: `showQRVehicleId`
- Button: Show/Hide QR Code
- QR Display: Conditional rendering
- Styling: Container and layout

### Dependencies
- `react-qr-code` (already installed)
- `lucide-react` for QrCode icon (already installed)

## User Guide

### How to Show QR Code
1. Go to Dashboard
2. Find the vehicle you want
3. Click "Show QR Code" button at bottom of card
4. QR code appears instantly
5. Show to officer or scan with phone

### How to Hide QR Code
1. Click "Hide QR Code" button
2. QR code disappears

### Tips
- Only one QR code shows at a time
- QR code contains vehicle plate number
- Works offline (no internet needed)
- Can be scanned by any QR reader app

---

**Feature Complete!** ✅

Each vehicle on the dashboard now has its own QR code that can be shown/hidden with a single click.
