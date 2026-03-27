# Design Document: Prayer Clock Animations Enhancement

## Overview

This design document specifies the technical implementation for enhancing the prayer clock component with refined animations, interactive feedback, and spiritual visual effects. The prayer clock is a circular SVG-based component in an Ionic/Angular application that displays Islamic prayer times in a 24-hour cycle starting from Maghrib.

### Current State

The existing `PrayerClockComponent` includes:
- Circular SVG clock with 100x100 viewBox (displayed at radius 38)
- Arc sweep animation (0° to current time over 2.8s with cubic easing)
- Breathing glow effect (two pulsing circles behind the clock)
- Prayer markers (dots on the ring at each prayer time angle)
- Current time indicator (white dot rotating with real time)
- Prayer labels (name and time positioned outside the ring at radius 56)
- Center text display (Arabic name, English name, countdown, next prayer)
- Moon phase visualization near Maghrib position
- Hour tick marks (24 total, major marks every 6 hours)
- Ring drawing animation on load
- SVG filters: `softGlow` (blur 1.2) and `markerGlow` (dual blur 2/4)

### Enhancement Goals

This enhancement adds:
1. **Prayer transition animations** - Visual feedback when prayer times change
2. **Interactive marker feedback** - Hover and tap responses on prayer markers
3. **Enhanced arc sweep** - Sequential marker/label reveals during initial animation
4. **Countdown animations** - Pulsing effects as prayer time approaches
5. **Moon phase animation** - Breathing effect synchronized with main glow
6. **Current time indicator enhancement** - Pulsing glow and trailing shadow
7. **Breathing glow refinement** - Sine wave easing and prayer transition intensification
8. **Tick mark animations** - Sequential fade-in and brightness on time passage
9. **Prayer label animations** - Entrance animations with stagger
10. **Accessibility support** - Respect `prefers-reduced-motion` settings
11. **Animation orchestration** - Coordinated timing for cohesive experience
12. **Visual effect filters** - Additional SVG filters for premium aesthetic

### Design Principles

- **Performance First**: Maintain 60fps on devices from last 4 years using GPU-accelerated transforms
- **Accessibility**: Full support for `prefers-reduced-motion` preference
- **Spiritual Aesthetic**: Subtle, calming animations that enhance rather than distract
- **Progressive Enhancement**: Graceful degradation for reduced motion preferences
- **Maintainability**: Clear separation between animation logic and component state

## Architecture

### Component Structure

The enhancement maintains the existing single-component architecture with these additions:

```
PrayerClockComponent
├── Template (prayer-clock.component.html)
│   ├── SVG Container (viewBox="-15 -15 130 135")
│   │   ├── Defs (filters, gradients)
│   │   ├── Breathing Glow Circles
│   │   ├── Frame Ring
│   │   ├── Tick Marks
│   │   ├── Main Track Ring
│   │   ├── Progress Arc
│   │   ├── Prayer Markers (with interaction handlers)
│   │   ├── Moon Phase
│   │   ├── Current Time Indicator
│   │   ├── Prayer Labels
│   │   └── Center Text
│   └── Date Row (HTML)
├── Component Class (prayer-clock.component.ts)
│   ├── State Management
│   │   ├── Prayer data
│   │   ├── Current/next prayer tracking
│   │   ├── Animation states
│   │   └── Interaction states
│   ├── Animation Controllers
│   │   ├── Arc sweep animator
│   │   ├── Breathing glow animator
│   │   ├── Prayer transition orchestrator
│   │   ├── Countdown pulse controller
│   │   └── Marker reveal sequencer
│   ├── Lifecycle Hooks
│   │   ├── ngOnInit (setup animations)
│   │   ├── ngOnDestroy (cleanup)
│   │   └── ngOnChanges (update on input changes)
│   └── Interaction Handlers
│       ├── Marker hover (enter/leave)
│       └── Marker tap/click
└── Styles (prayer-clock.component.scss)
    ├── Base styles
    ├── Animation keyframes
    ├── Interaction states
    └── Reduced motion overrides
```

### Animation State Management

New state properties to add to the component:

```typescript
interface AnimationState {
  // Arc sweep reveal tracking
  revealedMarkers: Set<string>;        // Prayer names whose markers are revealed
  revealedLabels: Set<string>;         // Prayer names whose labels are revealed
  arcSweepComplete: boolean;           // Whether initial arc animation finished
  
  // Prayer transition state
  transitioningPrayer: string | null;  // Prayer currently transitioning
  previousPrayer: string | null;       // Last active prayer for fade-out
  transitionStartTime: number;         // Timestamp of transition start
  
  // Countdown pulse state
  countdownPulseActive: boolean;       // Whether countdown is pulsing
  countdownPulsePhase: number;         // Current pulse animation phase (0-1)
  
  // Interaction state
  hoveredMarker: string | null;        // Prayer name of hovered marker
  tappedMarker: string | null;         // Prayer name of tapped marker (for ripple)
  
  // Breathing glow intensification
  breathIntensity: number;             // Multiplier for breathing effect (1.0 = normal, 1.3 = intensified)
  breathIntensifyUntil: number;        // Timestamp when intensification should end
  
  // Reduced motion preference
  prefersReducedMotion: boolean;       // User's motion preference
}
```

### Animation Timing Strategy

The component uses three animation mechanisms:

1. **CSS Animations** (GPU-accelerated, declarative)
   - Ring drawing on load
   - Prayer label entrance animations
   - Tick mark fade-ins
   - Marker hover scale transitions
   - Prayer transition pulses

2. **requestAnimationFrame** (JavaScript-driven, precise timing)
   - Arc sweep animation (existing)
   - Breathing glow updates (existing, enhanced)
   - Countdown pulse timing
   - Current time indicator rotation
   - Prayer transition orchestration

3. **CSS Transitions** (interaction feedback)
   - Marker hover effects
   - Label opacity changes
   - Glow filter intensity
   - Color transitions

### Performance Considerations

**GPU Acceleration Strategy:**
- Use `transform` and `opacity` properties exclusively for animations
- Apply `will-change` hints sparingly and only during active animations
- Avoid animating `width`, `height`, `top`, `left`, or other layout properties
- Use CSS containment where appropriate

**Animation Throttling:**
- Limit simultaneous animations to 5 or fewer
- Queue prayer transitions if they occur during initial load
- Debounce hover events to prevent excessive state updates
- Use passive event listeners for touch interactions

**Memory Management:**
- Clear all intervals and animation frames in `ngOnDestroy`
- Remove event listeners when component unmounts
- Avoid creating new objects in animation loops
- Reuse calculation results where possible



## Components and Interfaces

### Enhanced Component Class Structure

```typescript
export class PrayerClockComponent implements OnInit, OnDestroy, OnChanges {
  // Existing @Input properties (unchanged)
  @Input() fajrTime = '';
  @Input() sunriseTime = '';
  // ... other prayer time inputs
  
  // Existing state properties (unchanged)
  prayers: PrayerTime[] = [];
  currentPrayerName = '';
  nextPrayerName = '';
  countdownText = '';
  currentTimeAngle = 0;
  displayAngle = 0;
  // ... other existing properties
  
  // NEW: Animation state
  animationState: AnimationState = {
    revealedMarkers: new Set(),
    revealedLabels: new Set(),
    arcSweepComplete: false,
    transitioningPrayer: null,
    previousPrayer: null,
    transitionStartTime: 0,
    countdownPulseActive: false,
    countdownPulsePhase: 0,
    hoveredMarker: null,
    tappedMarker: null,
    breathIntensity: 1.0,
    breathIntensifyUntil: 0,
    prefersReducedMotion: false
  };
  
  // NEW: Countdown timing state
  countdownMinutesRemaining = Infinity;
  countdownSecondsRemaining = Infinity;
  
  // NEW: Tick mark brightness tracking
  tickBrightness: Map<number, number> = new Map(); // angle -> brightness multiplier
  
  // Existing intervals/frames
  private breathInterval: any;
  private countdownInterval: any;
  private animationFrame: any;
  
  // NEW: Additional animation frames
  private transitionAnimationFrame: any;
  private pulseAnimationFrame: any;
  
  // Existing lifecycle methods (enhanced)
  ngOnInit(): void;
  ngOnDestroy(): void;
  ngOnChanges(): void;
  
  // Existing methods (unchanged)
  private updatePrayerData(): void;
  private parseTimeString(timeStr: string): Date | null;
  private timeToAngle(date: Date, maghribHour: number): number;
  private updateCurrentState(): void;
  private computeHijriDate(): void;
  private computeGregorianDate(): void;
  private computeMoonPhase(): void;
  getPosition(angle: number, radius: number): { x: number; y: number };
  getArcPath(startAngle: number, endAngle: number, radius: number): string;
  
  // ENHANCED: Arc animation with marker reveal
  private startArcAnimation(): void;
  
  // NEW: Animation methods
  private detectReducedMotionPreference(): void;
  private startPrayerTransition(newPrayer: string, oldPrayer: string): void;
  private animatePrayerTransition(): void;
  private updateCountdownPulse(): void;
  private intensifyBreathingGlow(): void;
  private updateTickBrightness(): void;
  private triggerMarkerFlash(prayerName: string): void;
  
  // NEW: Interaction handlers
  onMarkerHover(prayerName: string): void;
  onMarkerLeave(prayerName: string): void;
  onMarkerTap(prayerName: string): void;
  
  // NEW: Computed properties for template
  getMarkerScale(prayerName: string): number;
  getMarkerGlowIntensity(prayerName: string): number;
  getLabelOpacity(prayerName: string): number;
  getCountdownScale(): number;
  getMoonOpacity(): number;
  getIndicatorGlowOpacity(): number;
  shouldShowRipple(prayerName: string): boolean;
  getTickOpacity(angle: number): number;
  isMarkerRevealed(prayerName: string): boolean;
  isLabelRevealed(prayerName: string): boolean;
}
```

### New Interfaces

```typescript
interface AnimationState {
  revealedMarkers: Set<string>;
  revealedLabels: Set<string>;
  arcSweepComplete: boolean;
  transitioningPrayer: string | null;
  previousPrayer: string | null;
  transitionStartTime: number;
  countdownPulseActive: boolean;
  countdownPulsePhase: number;
  hoveredMarker: string | null;
  tappedMarker: string | null;
  breathIntensity: number;
  breathIntensifyUntil: number;
  prefersReducedMotion: boolean;
}

interface TransitionTimeline {
  previousMarkerDim: number;      // 0ms
  newMarkerGlow: number;           // 100ms
  labelPulse: number;              // 200ms
  centerTextFade: number;          // 300ms
  breathingIntensify: number;      // 400ms
}

interface LoadSequenceTimeline {
  ringDraw: number;                // 0ms
  arcSweep: number;                // 150ms
  markersReveal: number;           // during sweep
  labelsReveal: number;            // 200ms after each marker
  dates: number;                   // 1400ms
}
```

### SVG Filter Definitions

New filters to add to the `<defs>` section:

```xml
<!-- Strong glow for emphasis effects -->
<filter id="strongGlow" x="-50%" y="-50%" width="200%" height="200%">
  <feGaussianBlur stdDeviation="3" result="blur"/>
  <feMerge>
    <feMergeNode in="blur"/>
    <feMergeNode in="SourceGraphic"/>
  </feMerge>
</filter>

<!-- Ripple effect for tap interactions -->
<filter id="ripple" x="-200%" y="-200%" width="500%" height="500%">
  <feGaussianBlur stdDeviation="1.5" result="blur1"/>
  <feGaussianBlur stdDeviation="3" result="blur2"/>
  <feGaussianBlur stdDeviation="5" result="blur3"/>
  <feMerge>
    <feMergeNode in="blur3"/>
    <feMergeNode in="blur2"/>
    <feMergeNode in="blur1"/>
    <feMergeNode in="SourceGraphic"/>
  </feMerge>
</filter>

<!-- Trailing glow for arc sweep -->
<filter id="trailingGlow" x="-100%" y="-100%" width="300%" height="300%">
  <feGaussianBlur stdDeviation="2.5" result="blur"/>
  <feColorMatrix in="blur" type="matrix" 
    values="1 0 0 0 0
            0 1 0 0 0
            0 0 1 0 0
            0 0 0 0.6 0"/>
  <feMerge>
    <feMergeNode in="colormatrix"/>
    <feMergeNode in="SourceGraphic"/>
  </feMerge>
</filter>

<!-- Radial pulse for prayer transitions -->
<filter id="radialPulse" x="-300%" y="-300%" width="700%" height="700%">
  <feGaussianBlur stdDeviation="4" result="blur"/>
  <feColorMatrix in="blur" type="matrix"
    values="1 0 0 0 0
            0 1 0 0 0
            0 0 1 0 0
            0 0 0 0.4 0"/>
  <feMerge>
    <feMergeNode in="colormatrix"/>
  </feMerge>
</filter>
```

### Template Enhancements

Key template changes:

1. **Prayer Markers** - Add interaction handlers and conditional rendering:
```html
<ng-container *ngFor="let prayer of prayers">
  <ng-container *ngIf="prayer.time && isMarkerRevealed(prayer.name)">
    <!-- Active prayer marker with enhanced glow -->
    <circle *ngIf="currentPrayerName === prayer.name"
      [attr.cx]="getPosition(prayer.angle, 38).x"
      [attr.cy]="getPosition(prayer.angle, 38).y"
      [attr.r]="2.5 * getMarkerScale(prayer.name)"
      fill="var(--theme-accent-bright)"
      [attr.filter]="getMarkerGlowIntensity(prayer.name) > 1 ? 'url(#strongGlow)' : 'url(#markerGlow)'"
      (mouseenter)="onMarkerHover(prayer.name)"
      (mouseleave)="onMarkerLeave(prayer.name)"
      (click)="onMarkerTap(prayer.name)"
      class="prayer-marker active-marker"/>
    
    <!-- Inactive prayer marker -->
    <circle *ngIf="currentPrayerName !== prayer.name"
      [attr.cx]="getPosition(prayer.angle, 38).x"
      [attr.cy]="getPosition(prayer.angle, 38).y"
      [attr.r]="1.5 * getMarkerScale(prayer.name)"
      fill="var(--theme-accent)"
      [attr.opacity]="0.7"
      (mouseenter)="onMarkerHover(prayer.name)"
      (mouseleave)="onMarkerLeave(prayer.name)"
      (click)="onMarkerTap(prayer.name)"
      class="prayer-marker"/>
    
    <!-- Ripple effect on tap -->
    <circle *ngIf="shouldShowRipple(prayer.name)"
      [attr.cx]="getPosition(prayer.angle, 38).x"
      [attr.cy]="getPosition(prayer.angle, 38).y"
      r="0"
      fill="none"
      stroke="var(--theme-accent-bright)"
      stroke-width="1"
      filter="url(#ripple)"
      class="marker-ripple"/>
  </ng-container>
</ng-container>
```

2. **Prayer Labels** - Add reveal animation and opacity control:
```html
<ng-container *ngFor="let prayer of prayers; let i = index">
  <g *ngIf="prayer.time && isLabelRevealed(prayer.name)" 
     class="svg-label"
     [class.active-label]="currentPrayerName === prayer.name"
     [style.opacity]="getLabelOpacity(prayer.name)"
     [style.animation-delay]="(i * 30) + 'ms'">
    <!-- Prayer name and time text -->
  </g>
</ng-container>
```

3. **Countdown Text** - Add pulsing scale:
```html
<text x="50" y="58" text-anchor="middle" 
      class="center-countdown"
      [style.transform]="'scale(' + getCountdownScale() + ')'">
  {{ countdownText }}
</text>
```

4. **Current Time Indicator** - Add pulsing glow:
```html
<g [style.transform-origin]="'50px 50px'"
   [style.transform]="'rotate(' + indicatorRotation + 'deg)'">
  <circle cx="50" cy="12" r="2" 
          fill="white" 
          filter="url(#softGlow)"
          [style.opacity]="getIndicatorGlowOpacity()"
          class="time-indicator"/>
  <!-- Trailing shadow -->
  <circle cx="50" cy="12" r="1.5"
          fill="rgba(255, 255, 255, 0.3)"
          [style.transform]="'rotate(-5deg)'"
          [style.transform-origin]="'50px 50px'"/>
</g>
```

5. **Moon Phase** - Add breathing opacity:
```html
<g *ngIf="moonType === 'phase' && moonPath"
   [style.opacity]="getMoonOpacity()">
  <path [attr.d]="moonPath" fill="var(--theme-accent)"/>
</g>
```

6. **Tick Marks** - Add conditional opacity:
```html
<line *ngFor="let tick of tickMarks; let i = index"
  [attr.x1]="tick.x1" [attr.y1]="tick.y1"
  [attr.x2]="tick.x2" [attr.y2]="tick.y2"
  [attr.stroke]="tick.major ? 'rgba(var(--theme-accent-rgb), 0.35)' : 'rgba(var(--theme-text-rgb), 0.1)'"
  [attr.stroke-width]="tick.major ? 0.5 : 0.25"
  [style.opacity]="getTickOpacity((i / 24) * 360)"
  [style.animation-delay]="(i * 30) + 'ms'"
  class="tick-mark"/>
```



## Data Models

### Animation State Model

```typescript
/**
 * Tracks the current state of all animations in the prayer clock
 */
interface AnimationState {
  // Arc sweep reveal tracking
  revealedMarkers: Set<string>;        // Set of prayer names whose markers have been revealed
  revealedLabels: Set<string>;         // Set of prayer names whose labels have been revealed
  arcSweepComplete: boolean;           // True when initial arc animation finishes
  
  // Prayer transition state
  transitioningPrayer: string | null;  // Name of prayer currently transitioning (null if none)
  previousPrayer: string | null;       // Name of last active prayer for fade-out animation
  transitionStartTime: number;         // performance.now() timestamp when transition began
  
  // Countdown pulse state
  countdownPulseActive: boolean;       // True when countdown should pulse (≤5 minutes)
  countdownPulsePhase: number;         // Current phase of pulse cycle (0-1)
  
  // Interaction state
  hoveredMarker: string | null;        // Prayer name of currently hovered marker
  tappedMarker: string | null;         // Prayer name of marker that was just tapped
  
  // Breathing glow intensification
  breathIntensity: number;             // Multiplier for breathing effect (1.0-1.3)
  breathIntensifyUntil: number;        // Timestamp when intensification should end
  
  // Accessibility
  prefersReducedMotion: boolean;       // User's prefers-reduced-motion setting
}
```

### Timing Configuration Model

```typescript
/**
 * Centralized timing constants for all animations
 */
const ANIMATION_TIMINGS = {
  // Prayer transition sequence
  transition: {
    previousMarkerDim: 400,           // Duration to dim previous marker (ms)
    newMarkerGlow: 800,               // Duration to grow/glow new marker (ms)
    labelPulse: 600,                  // Duration of label scale pulse (ms)
    centerTextFadeOut: 200,           // Duration to fade out old prayer name (ms)
    centerTextFadeIn: 300,            // Duration to fade in new prayer name (ms)
    radialPulse: 1000,                // Duration of radial pulse effect (ms)
    breathIntensify: 1500,            // Duration of breathing intensification (ms)
    sequenceDelays: {
      previousMarkerDim: 0,           // Start immediately
      newMarkerGlow: 100,             // Start after 100ms
      labelPulse: 200,                // Start after 200ms
      centerTextFade: 300,            // Start after 300ms
      breathingIntensify: 400         // Start after 400ms
    }
  },
  
  // Load sequence
  load: {
    ringDraw: 1500,                   // Duration of ring drawing (ms)
    arcSweep: 2800,                   // Duration of arc sweep (ms)
    ringDrawDelay: 0,                 // Ring starts immediately
    arcSweepDelay: 150,               // Arc starts after 150ms
    labelRevealDelay: 200,            // Labels appear 200ms after markers
    datesDelay: 1400,                 // Dates appear at 1400ms
    tickStagger: 30,                  // Delay between tick marks (ms)
    labelStagger: 30                  // Delay per 60° of angular position (ms)
  },
  
  // Interaction feedback
  interaction: {
    markerHoverScale: 150,            // Duration to scale marker on hover (ms)
    markerHoverReturn: 200,           // Duration to return to normal (ms)
    rippleExpand: 600,                // Duration of ripple expansion (ms)
    markerFlash: 300                  // Duration of marker flash (ms)
  },
  
  // Countdown pulses
  countdown: {
    pulseInterval5min: 2000,          // Pulse every 2s when ≤5 minutes
    pulseInterval1min: 1000,          // Pulse every 1s when ≤1 minute
    pulseDuration: 400,               // Duration of each pulse (ms)
    secondsFade: 100,                 // Fade duration for seconds update (ms)
    glowThreshold: 10                 // Add glow when ≤10 seconds
  },
  
  // Continuous animations
  continuous: {
    breathingCycle: 4000,             // Full breathing cycle duration (ms)
    breathingInterval: 66,            // Update interval for breathing (ms)
    moonBreathingCycle: 4000,         // Moon breathing cycle (ms)
    moonPhaseOffset: 90,              // Phase offset from main breathing (degrees)
    indicatorPulse: 2000,             // Current time indicator pulse cycle (ms)
    tickPulseCycle: 3000              // Major tick mark pulse cycle (ms)
  }
};
```

### Easing Functions Model

```typescript
/**
 * Easing functions for consistent animation feel
 */
const EASING_FUNCTIONS = {
  // Cubic in-out (existing, for arc sweep)
  cubicInOut: (t: number): number => {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  },
  
  // Sine wave (for breathing effects)
  sine: (t: number): number => {
    return Math.sin(t * Math.PI * 2);
  },
  
  // Ease out (for interactions)
  easeOut: (t: number): number => {
    return 1 - Math.pow(1 - t, 3);
  },
  
  // Ease in-out (for transitions)
  easeInOut: (t: number): number => {
    return t < 0.5
      ? 2 * t * t
      : 1 - Math.pow(-2 * t + 2, 2) / 2;
  },
  
  // Pulse (for countdown and indicators)
  pulse: (t: number): number => {
    return (Math.sin(t * Math.PI * 2 - Math.PI / 2) + 1) / 2;
  }
};
```

### Marker State Model

```typescript
/**
 * Tracks the visual state of a single prayer marker
 */
interface MarkerState {
  prayerName: string;                 // Prayer identifier
  isActive: boolean;                  // True if this is the current prayer
  isRevealed: boolean;                // True if marker has been revealed by arc sweep
  isHovered: boolean;                 // True if user is hovering over marker
  scale: number;                      // Current scale multiplier (1.0 = normal)
  glowIntensity: number;              // Glow filter intensity multiplier (1.0 = normal)
  opacity: number;                    // Marker opacity (0-1)
  flashUntil: number;                 // Timestamp when flash effect should end (0 = no flash)
}
```

### Label State Model

```typescript
/**
 * Tracks the visual state of a prayer label
 */
interface LabelState {
  prayerName: string;                 // Prayer identifier
  isActive: boolean;                  // True if this is the current prayer
  isRevealed: boolean;                // True if label has been revealed
  opacity: number;                    // Label opacity (0-1)
  pulsePhase: number;                 // Current phase of pulse animation (0-1, or -1 if not pulsing)
}
```

### Reduced Motion Configuration

```typescript
/**
 * Defines which animations are disabled in reduced motion mode
 */
interface ReducedMotionConfig {
  disableAnimations: {
    breathingGlow: boolean;           // Disable breathing glow pulsing
    tickMarkAnimations: boolean;      // Disable tick mark fade-ins and pulses
    prayerLabelSlide: boolean;        // Disable label slide-in (fade only)
    markerHoverScale: boolean;        // Disable marker scale on hover
    countdownPulse: boolean;          // Disable countdown pulsing
    moonBreathing: boolean;           // Disable moon breathing effect
    indicatorPulse: boolean;          // Disable time indicator pulsing
    radialPulse: boolean;             // Disable radial pulse on transitions
    rippleEffect: boolean;            // Disable tap ripple effect
  };
  
  keepAnimations: {
    arcSweep: boolean;                // Keep arc sweep (essential)
    countdownUpdate: boolean;         // Keep countdown updates (essential)
    markerTransition: boolean;        // Keep marker state changes (essential)
    ringDraw: boolean;                // Keep ring drawing (essential)
  };
  
  reducedAmplitude: {
    breathingGlow: number;            // Reduce amplitude by 70% (0.3 = 30% of original)
  };
}

const REDUCED_MOTION_CONFIG: ReducedMotionConfig = {
  disableAnimations: {
    breathingGlow: true,
    tickMarkAnimations: true,
    prayerLabelSlide: true,
    markerHoverScale: true,
    countdownPulse: true,
    moonBreathing: true,
    indicatorPulse: true,
    radialPulse: true,
    rippleEffect: true
  },
  keepAnimations: {
    arcSweep: true,
    countdownUpdate: true,
    markerTransition: true,
    ringDraw: true
  },
  reducedAmplitude: {
    breathingGlow: 0.3
  }
};
```

