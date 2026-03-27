# Requirements Document

## Introduction

This document specifies requirements for enhancing the prayer clock component with additional animations and visual effects. The prayer clock is a circular SVG-based component in an Ionic/Angular application that displays Islamic prayer times throughout a 24-hour cycle. The component currently includes basic animations (arc sweep, breathing glow, ring drawing) and displays prayer markers, current time indicator, moon phase, and center text with countdown. This enhancement aims to improve the user experience through refined animations, interactive feedback, and spiritual visual effects while maintaining the component's elegant aesthetic.

## Glossary

- **Prayer_Clock**: The circular SVG component that displays prayer times in a 24-hour cycle starting from Maghrib
- **Arc_Sweep**: The animated progress arc that sweeps from 0° to the current time position
- **Prayer_Marker**: A circular dot positioned on the ring at each prayer time angle
- **Current_Time_Indicator**: A white dot that shows the current time position on the ring
- **Breathing_Glow**: Pulsing circles behind the clock that create a subtle breathing effect
- **Center_Text**: The text display in the center showing current prayer name, countdown, and next prayer
- **Prayer_Label**: SVG text positioned outside the ring showing prayer name and time
- **Moon_Phase**: Visual representation of the current lunar phase displayed near Maghrib
- **Ring**: The main circular track at radius 38 where the progress arc and markers are displayed
- **Tick_Mark**: Hour indicators around the ring (24 total, with major marks every 6 hours)
- **Active_Prayer**: The current prayer period that the user is in
- **Transition_Moment**: The instant when one prayer time ends and the next begins
- **User_Interaction**: Any touch, click, or hover action performed by the user on the component

## Requirements

### Requirement 1: Prayer Transition Animations

**User Story:** As a user, I want to see smooth visual transitions when prayer times change, so that I can clearly notice when a new prayer period begins.

#### Acceptance Criteria

1. WHEN a prayer time is reached, THE Prayer_Clock SHALL animate the Active_Prayer marker from its current size to a larger glowing state over 800ms
2. WHEN a prayer time is reached, THE Prayer_Clock SHALL pulse the corresponding Prayer_Label with a scale animation from 1.0 to 1.15 and back over 600ms
3. WHEN a prayer time is reached, THE Prayer_Clock SHALL fade the previous Active_Prayer marker from bright to dim state over 400ms
4. WHEN a prayer time is reached, THE Center_Text SHALL animate the prayer name change with a fade-out (200ms) followed by fade-in (300ms) transition
5. WHEN a prayer time is reached, THE Prayer_Clock SHALL emit a subtle radial pulse effect from the new Active_Prayer marker position

### Requirement 2: Interactive Prayer Marker Feedback

**User Story:** As a user, I want visual feedback when I interact with prayer markers, so that I can explore prayer times intuitively.

#### Acceptance Criteria

1. WHEN a user hovers over a Prayer_Marker, THE Prayer_Clock SHALL scale the marker to 1.4x its original size with a 150ms ease-out transition
2. WHEN a user hovers over a Prayer_Marker, THE Prayer_Clock SHALL increase the glow filter intensity by 50%
3. WHEN a user hovers over a Prayer_Marker, THE Prayer_Clock SHALL highlight the corresponding Prayer_Label by increasing its opacity to 1.0
4. WHEN a user taps a Prayer_Marker, THE Prayer_Clock SHALL display a ripple animation expanding from the marker position
5. WHEN a user stops hovering over a Prayer_Marker, THE Prayer_Clock SHALL return the marker to its original state over 200ms

### Requirement 3: Enhanced Arc Sweep Animation

**User Story:** As a user, I want the arc sweep animation to feel more dynamic and engaging, so that the clock loading experience is visually appealing.

#### Acceptance Criteria

1. WHILE the Arc_Sweep animation is running, THE Prayer_Clock SHALL reveal Prayer_Markers sequentially as the arc passes their positions
2. WHILE the Arc_Sweep animation is running, THE Prayer_Clock SHALL apply a trailing glow effect that follows 15° behind the arc endpoint
3. WHEN the Arc_Sweep animation completes, THE Prayer_Clock SHALL trigger a subtle flash effect at the Current_Time_Indicator position
4. WHILE the Arc_Sweep animation is running, THE Prayer_Clock SHALL fade in Prayer_Labels with a 200ms delay after their markers are revealed
5. THE Arc_Sweep animation SHALL maintain the existing 2.8s duration with cubic easing

### Requirement 4: Countdown Animation Effects

**User Story:** As a user, I want the countdown display to have subtle animations, so that I can easily track the time remaining until the next prayer.

#### Acceptance Criteria

1. WHEN the countdown reaches 5 minutes or less, THE Center_Text SHALL pulse the countdown text with a gentle scale animation (1.0 to 1.05) every 2 seconds
2. WHEN the countdown reaches 1 minute or less, THE Center_Text SHALL increase the pulse frequency to every 1 second
3. WHEN the countdown seconds update, THE Center_Text SHALL apply a subtle fade transition (100ms) to the seconds digits
4. WHEN the countdown reaches 10 seconds or less, THE Prayer_Clock SHALL add a subtle glow effect to the countdown text
5. THE countdown animations SHALL not distract from readability or accessibility

### Requirement 5: Moon Phase Animation

**User Story:** As a user, I want the moon phase display to have a gentle animation, so that it feels like a natural part of the spiritual experience.

#### Acceptance Criteria

1. WHEN the Prayer_Clock loads, THE Moon_Phase SHALL fade in with a 1.2s ease-in animation starting at 1.5s delay
2. WHILE the Prayer_Clock is displayed, THE Moon_Phase SHALL apply a subtle breathing effect with opacity varying between 0.35 and 0.55 over 4 seconds
3. WHEN the moon is in full phase, THE Moon_Phase SHALL display a soft radial glow effect
4. WHEN the moon is in new phase, THE Moon_Phase SHALL display a faint outline circle instead of being invisible
5. THE Moon_Phase animation SHALL synchronize with the Breathing_Glow phase offset by 90 degrees

### Requirement 6: Current Time Indicator Enhancement

**User Story:** As a user, I want the current time indicator to be more noticeable, so that I can quickly identify the current moment on the clock.

#### Acceptance Criteria

1. THE Current_Time_Indicator SHALL display a pulsing glow effect with opacity varying between 0.6 and 1.0 over 2 seconds
2. WHEN the Current_Time_Indicator moves past a Prayer_Marker, THE Prayer_Clock SHALL trigger a brief flash effect on the marker
3. THE Current_Time_Indicator SHALL cast a subtle trailing shadow effect 5° behind its position
4. WHEN the Arc_Sweep animation completes, THE Current_Time_Indicator SHALL pulse once with a scale animation from 1.0 to 1.5 over 400ms
5. THE Current_Time_Indicator SHALL maintain smooth rotation without jitter or frame drops

### Requirement 7: Breathing Glow Refinement

**User Story:** As a user, I want the breathing glow effect to feel more organic and calming, so that it enhances the spiritual atmosphere.

#### Acceptance Criteria

1. THE Breathing_Glow SHALL use a sine wave easing function for scale and opacity changes
2. THE Breathing_Glow SHALL vary the inner circle (radius 26) and outer circle (radius 32) with a 45-degree phase offset
3. WHEN the Active_Prayer changes, THE Breathing_Glow SHALL briefly intensify by 30% for 1.5 seconds
4. THE Breathing_Glow SHALL maintain the existing 66ms update interval for smooth animation
5. WHERE the user prefers reduced motion, THE Breathing_Glow SHALL reduce amplitude by 70%

### Requirement 8: Tick Mark Animations

**User Story:** As a user, I want the hour tick marks to have subtle animations, so that the clock feels more alive and dynamic.

#### Acceptance Criteria

1. WHEN the Prayer_Clock loads, THE Tick_Mark elements SHALL fade in sequentially with a 30ms stagger delay
2. WHEN the Current_Time_Indicator passes a major Tick_Mark, THE Tick_Mark SHALL briefly brighten by 50% for 300ms
3. WHILE the Arc_Sweep animation is running, THE Tick_Mark elements SHALL fade in as the arc passes their positions
4. THE major Tick_Mark elements SHALL have a subtle pulsing opacity effect varying between 0.35 and 0.45 over 3 seconds
5. WHERE the user prefers reduced motion, THE Tick_Mark animations SHALL be disabled

### Requirement 9: Prayer Label Animations

**User Story:** As a user, I want prayer labels to have smooth entrance animations, so that the interface feels polished and professional.

#### Acceptance Criteria

1. WHEN the Prayer_Clock loads, THE Prayer_Label elements SHALL fade in with a slide animation from 10% closer to center over 400ms
2. WHEN the Arc_Sweep reveals a Prayer_Marker, THE corresponding Prayer_Label SHALL fade in 200ms after the marker appears
3. WHEN a Prayer_Label becomes active, THE Prayer_Label SHALL transition its color and weight over 300ms with ease-in-out timing
4. THE Prayer_Label animations SHALL use staggered delays based on their angular position (30ms per 60 degrees)
5. WHERE the user prefers reduced motion, THE Prayer_Label SHALL use fade-only transitions without sliding

### Requirement 10: Accessibility and Performance

**User Story:** As a user with motion sensitivity or using a lower-end device, I want animations to respect my preferences and perform smoothly, so that the app remains usable and comfortable.

#### Acceptance Criteria

1. WHERE the user has enabled "prefers-reduced-motion", THE Prayer_Clock SHALL disable all non-essential animations
2. WHERE the user has enabled "prefers-reduced-motion", THE Prayer_Clock SHALL maintain only the Arc_Sweep and countdown updates
3. THE Prayer_Clock SHALL maintain 60fps performance during all animations on devices from the last 4 years
4. THE Prayer_Clock SHALL use CSS transforms and opacity for animations to leverage GPU acceleration
5. THE Prayer_Clock SHALL use requestAnimationFrame for JavaScript-driven animations to prevent jank
6. WHEN the device frame rate drops below 30fps for more than 2 seconds, THE Prayer_Clock SHALL automatically disable interactive animations (hover effects, ripples)
7. WHEN the device frame rate drops below 20fps for more than 2 seconds, THE Prayer_Clock SHALL disable all decorative animations except the Arc_Sweep and countdown
8. THE Prayer_Clock SHALL detect device capabilities on initialization and disable complex filters (strongGlow, ripple) on low-end devices
9. WHERE animations are disabled due to performance, THE Prayer_Clock SHALL use instant state changes with simple opacity transitions as fallbacks
10. THE Prayer_Clock SHALL provide a manual setting to force "reduced animations mode" for users who prefer minimal motion regardless of device capability

### Requirement 11: Stagger and Orchestration

**User Story:** As a user, I want the various animations to feel coordinated and harmonious, so that the overall experience is cohesive rather than chaotic.

#### Acceptance Criteria

1. WHEN the Prayer_Clock loads, THE animation sequence SHALL follow this order: ring draw (0ms) → arc sweep (150ms) → markers reveal (during sweep) → labels fade (200ms after markers) → dates (1400ms)
2. WHEN a prayer transition occurs, THE animation sequence SHALL follow this order: previous marker dim (0ms) → new marker glow (100ms) → label pulse (200ms) → center text fade (300ms) → breathing intensify (400ms)
3. THE Prayer_Clock SHALL use consistent easing functions across related animations (cubic-bezier for entrances, ease-out for interactions)
4. THE Prayer_Clock SHALL limit simultaneous animations to 5 or fewer to prevent performance degradation
5. THE Prayer_Clock SHALL queue prayer transition animations if they occur during the initial load sequence
6. WHERE performance degradation is detected, THE Prayer_Clock SHALL skip stagger delays and execute animations simultaneously to reduce total animation time
7. THE Prayer_Clock SHALL gracefully skip queued animations if the queue exceeds 3 pending animation sequences

### Requirement 12: Visual Effect Filters

**User Story:** As a user, I want the visual effects to enhance the spiritual aesthetic, so that the clock feels premium and thoughtfully designed.

#### Acceptance Criteria

1. THE Prayer_Clock SHALL define a "strongGlow" SVG filter with gaussian blur stdDeviation of 3 for emphasis effects
2. THE Prayer_Clock SHALL define a "ripple" SVG filter for interactive feedback on prayer markers
3. WHEN a Prayer_Marker is in active state, THE Prayer_Clock SHALL apply the markerGlow filter with enhanced parameters
4. THE Prayer_Clock SHALL use linear gradients for the Arc_Sweep that transition from accent-bright to accent color
5. THE Prayer_Clock SHALL apply subtle drop shadows to Center_Text for improved readability over the breathing glow
6. WHERE SVG filters cause performance issues (detected frame drops), THE Prayer_Clock SHALL fall back to CSS box-shadow and opacity effects
7. WHERE the device does not support SVG filters properly, THE Prayer_Clock SHALL use solid colors without gradients and simple opacity changes
8. THE Prayer_Clock SHALL test filter support on initialization and cache the result to avoid repeated capability checks



### Requirement 13: Progressive Enhancement and Graceful Degradation

**User Story:** As a user on any device, I want the prayer clock to work reliably and look good regardless of my device's capabilities, so that I can always access prayer times with an appropriate experience.

#### Acceptance Criteria

1. THE Prayer_Clock SHALL implement a three-tier animation system: full (high-end devices), reduced (mid-range devices), and minimal (low-end devices)
2. THE Prayer_Clock SHALL detect device tier on initialization using performance benchmarks (requestAnimationFrame timing test over 100ms)
3. WHERE device tier is "minimal", THE Prayer_Clock SHALL display only static elements with instant state changes and no animations except countdown updates
4. WHERE device tier is "reduced", THE Prayer_Clock SHALL enable only Arc_Sweep, breathing glow, and prayer transition animations
5. WHERE device tier is "full", THE Prayer_Clock SHALL enable all animations as specified in Requirements 1-12
6. THE Prayer_Clock SHALL monitor performance continuously and downgrade tier if sustained frame drops occur (below 30fps for 3+ seconds)
7. THE Prayer_Clock SHALL NOT upgrade tier automatically during a session to prevent jarring experience changes
8. WHERE JavaScript fails or is disabled, THE Prayer_Clock SHALL display a static SVG with all prayer times visible and clearly labeled
9. THE Prayer_Clock SHALL store the detected device tier in localStorage and use it as the starting tier on subsequent visits
10. THE Prayer_Clock SHALL provide visual feedback (subtle icon or text) indicating which animation mode is active for user awareness
