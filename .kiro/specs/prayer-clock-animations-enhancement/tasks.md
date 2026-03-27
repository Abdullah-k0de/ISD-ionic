# Implementation Plan: Prayer Clock Animations Enhancement

## Overview

This plan implements comprehensive animation enhancements for the prayer clock component in an Ionic/Angular application. The implementation adds prayer transition animations, interactive marker feedback, enhanced arc sweep with sequential reveals, countdown animations, moon phase breathing, current time indicator enhancements, refined breathing glow, tick mark animations, prayer label animations, and full accessibility support with graceful degradation. The component uses SVG-based rendering with GPU-accelerated CSS animations and requestAnimationFrame for smooth 60fps performance.

## Tasks

- [ ] 1. Set up animation infrastructure and state management
  - [x] 1.1 Add animation state interface and properties to component class
    - Create `AnimationState` interface with all tracking properties (revealedMarkers, revealedLabels, arcSweepComplete, transitioningPrayer, previousPrayer, transitionStartTime, countdownPulseActive, countdownPulsePhase, hoveredMarker, tappedMarker, breathIntensity, breathIntensifyUntil, prefersReducedMotion)
    - Add `animationState` property to component initialized with default values
    - Add `countdownMinutesRemaining` and `countdownSecondsRemaining` properties
    - Add `tickBrightness` Map for tracking tick mark brightness
    - Add `transitionAnimationFrame` and `pulseAnimationFrame` properties for animation frame tracking
    - _Requirements: 10.1, 10.2, 13.1, 13.2_

  - [x] 1.2 Create animation timing constants and easing functions
    - Define `ANIMATION_TIMINGS` constant object with all timing values (transition, load, interaction, countdown, continuous)
    - Define `EASING_FUNCTIONS` constant object with cubicInOut, sine, easeOut, easeInOut, and pulse functions
    - Define `REDUCED_MOTION_CONFIG` constant with disabled/enabled animation lists
    - _Requirements: 11.1, 11.2, 11.3, 10.1, 10.2_

  - [x] 1.3 Implement reduced motion detection
    - Create `detectReducedMotionPreference()` method that checks `window.matchMedia('(prefers-reduced-motion: reduce)')`
    - Set `animationState.prefersReducedMotion` based on media query result
    - Add media query listener to update preference if changed during session
    - Call detection method in `ngOnInit()`
    - _Requirements: 10.1, 10.2, 7.5, 8.5, 9.5_

- [ ] 2. Implement performance monitoring and device tier detection
  - [x] 2.1 Create device capability detection system
    - Implement performance benchmark using requestAnimationFrame timing test over 100ms
    - Create three-tier classification: "full", "reduced", "minimal" based on benchmark results
    - Store detected tier in component property and localStorage for persistence
    - Add method to check SVG filter support and cache result
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.9, 12.6, 12.7, 12.8_

  - [x] 2.2 Implement continuous performance monitoring
    - Track frame timing using requestAnimationFrame delta times
    - Calculate rolling average FPS over 2-second window
    - Detect sustained frame drops (below 30fps for 3+ seconds, below 20fps for 2+ seconds)
    - Implement automatic tier downgrade when performance degrades
    - Prevent automatic tier upgrades during session
    - _Requirements: 10.3, 10.6, 10.7, 13.6, 13.7, 11.6_

  - [x] 2.3 Add animation throttling based on device tier
    - Implement logic to disable complex filters on low-end devices
    - Disable interactive animations when FPS drops below 30fps
    - Disable decorative animations when FPS drops below 20fps
    - Limit simultaneous animations to 5 or fewer
    - Skip stagger delays when performance degrades
    - _Requirements: 10.6, 10.7, 10.8, 10.9, 11.4, 11.6_

  - [ ] 2.4 Add visual feedback for active animation mode
    - Display subtle icon or text indicating current tier (full/reduced/minimal)
    - Update indicator when tier changes due to performance
    - _Requirements: 13.10_

- [ ] 3. Add new SVG filters to template
  - [x] 3.1 Create strongGlow filter for emphasis effects
    - Add `<filter id="strongGlow">` to SVG `<defs>` section
    - Configure with gaussian blur stdDeviation of 3
    - Use feMerge to combine blur with source graphic
    - _Requirements: 12.1, 1.1_

  - [x] 3.2 Create ripple filter for tap interactions
    - Add `<filter id="ripple">` with multiple blur levels (1.5, 3, 5)
    - Merge all blur levels for expanding ripple effect
    - _Requirements: 12.2, 2.4_

  - [x] 3.3 Create trailingGlow filter for arc sweep
    - Add `<filter id="trailingGlow">` with blur stdDeviation 2.5
    - Apply color matrix to reduce opacity to 0.6
    - _Requirements: 3.2_

  - [x] 3.4 Create radialPulse filter for prayer transitions
    - Add `<filter id="radialPulse">` with blur stdDeviation 4
    - Apply color matrix to set opacity to 0.4
    - _Requirements: 1.5_

  - [x] 3.5 Add filter fallback logic
    - Implement filter support detection in component
    - Add conditional filter application based on device tier
    - Fall back to CSS box-shadow and opacity when filters unsupported
    - _Requirements: 12.6, 12.7, 12.8_

- [ ] 4. Enhance arc sweep animation with sequential reveals
  - [x] 4.1 Modify arc sweep animation to track revealed markers
    - Update existing `startArcAnimation()` method to check marker positions during sweep
    - Add markers to `animationState.revealedMarkers` Set when arc passes their angle
    - Add labels to `animationState.revealedLabels` Set 200ms after marker reveal
    - Set `animationState.arcSweepComplete` to true when animation finishes
    - _Requirements: 3.1, 3.4, 11.1_

  - [x] 4.2 Add trailing glow effect to arc sweep
    - Create secondary arc path that follows 15° behind main arc endpoint
    - Apply `trailingGlow` filter to secondary arc
    - Animate secondary arc in sync with main arc
    - _Requirements: 3.2_

  - [x] 4.3 Add completion flash effect
    - Trigger flash animation on current time indicator when arc sweep completes
    - Implement scale animation from 1.0 to 1.5 over 400ms
    - _Requirements: 3.3, 6.4_

  - [x] 4.4 Update template to conditionally render markers and labels
    - Add `isMarkerRevealed(prayerName)` method that checks `revealedMarkers` Set
    - Add `isLabelRevealed(prayerName)` method that checks `revealedLabels` Set
    - Wrap marker and label elements with `*ngIf` using reveal methods
    - _Requirements: 3.1, 3.4_

- [ ] 5. Implement prayer transition animations
  - [ ] 5.1 Create prayer transition orchestration system
    - Implement `startPrayerTransition(newPrayer, oldPrayer)` method
    - Set up transition timeline with delays: previousMarkerDim (0ms), newMarkerGlow (100ms), labelPulse (200ms), centerTextFade (300ms), breathingIntensify (400ms)
    - Update `animationState.transitioningPrayer`, `previousPrayer`, and `transitionStartTime`
    - Queue transitions if they occur during initial load sequence
    - Skip queued animations if queue exceeds 3 pending sequences
    - _Requirements: 11.2, 11.5, 11.7_

  - [ ] 5.2 Implement marker transition animations
    - Fade previous active marker from bright to dim over 400ms
    - Grow and glow new active marker from current size to larger state over 800ms
    - Apply `strongGlow` filter to new active marker
    - Trigger radial pulse effect from new marker position
    - _Requirements: 1.1, 1.3, 1.5_

  - [ ] 5.3 Implement label pulse animation
    - Scale corresponding prayer label from 1.0 to 1.15 and back over 600ms
    - Use ease-in-out timing function
    - _Requirements: 1.2_

  - [ ] 5.4 Implement center text fade transition
    - Fade out old prayer name over 200ms
    - Fade in new prayer name over 300ms with 200ms delay
    - _Requirements: 1.4_

  - [ ] 5.5 Implement breathing glow intensification
    - Call `intensifyBreathingGlow()` method at 400ms into transition
    - Increase `breathIntensity` to 1.3 for 1.5 seconds
    - Set `breathIntensifyUntil` timestamp
    - Update breathing glow calculation to use intensity multiplier
    - _Requirements: 7.3_

  - [ ] 5.6 Integrate transition detection into update cycle
    - Modify `updateCurrentState()` to detect prayer changes
    - Call `startPrayerTransition()` when current prayer changes
    - Ensure transitions respect reduced motion preferences
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 10.1, 10.2_

- [ ] 6. Implement interactive prayer marker feedback
  - [ ] 6.1 Add marker hover handlers
    - Create `onMarkerHover(prayerName)` method that sets `hoveredMarker` in state
    - Create `onMarkerLeave(prayerName)` method that clears `hoveredMarker`
    - Add `(mouseenter)` and `(mouseleave)` event bindings to marker circles in template
    - _Requirements: 2.1, 2.5_

  - [ ] 6.2 Implement marker scale on hover
    - Create `getMarkerScale(prayerName)` method that returns 1.4 if hovered, 1.0 otherwise
    - Apply scale to marker radius in template using computed method
    - Add CSS transition with 150ms ease-out for hover, 200ms for leave
    - _Requirements: 2.1, 2.5_

  - [ ] 6.3 Implement glow intensity on hover
    - Create `getMarkerGlowIntensity(prayerName)` method that returns 1.5 if hovered, 1.0 otherwise
    - Conditionally apply `strongGlow` filter when intensity > 1
    - _Requirements: 2.2_

  - [ ] 6.4 Implement label highlight on marker hover
    - Create `getLabelOpacity(prayerName)` method that returns 1.0 if marker hovered, normal opacity otherwise
    - Apply opacity to label group in template
    - _Requirements: 2.3_

  - [ ] 6.5 Implement tap ripple effect
    - Create `onMarkerTap(prayerName)` method that sets `tappedMarker` and clears after 600ms
    - Create `shouldShowRipple(prayerName)` method that checks if marker was recently tapped
    - Add ripple circle element with CSS animation expanding from r=0 to r=15 over 600ms
    - Apply `ripple` filter to ripple circle
    - Add `(click)` event binding to marker circles
    - _Requirements: 2.4_

  - [ ] 6.6 Disable hover effects on touch devices and low-end devices
    - Detect touch-only devices and disable hover handlers
    - Disable hover effects when device tier is "minimal" or FPS drops below 30
    - _Requirements: 10.6, 10.8_

- [ ] 7. Implement countdown animation effects
  - [ ] 7.1 Add countdown time tracking
    - Parse countdown text to extract minutes and seconds remaining
    - Update `countdownMinutesRemaining` and `countdownSecondsRemaining` in countdown update cycle
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [ ] 7.2 Implement countdown pulse timing
    - Create `updateCountdownPulse()` method called from requestAnimationFrame
    - Activate pulsing when countdown ≤ 5 minutes with 2-second interval
    - Increase pulse frequency to 1-second interval when countdown ≤ 1 minute
    - Update `countdownPulsePhase` using pulse easing function
    - _Requirements: 4.1, 4.2_

  - [ ] 7.3 Implement countdown scale animation
    - Create `getCountdownScale()` method that returns scale based on pulse phase (1.0 to 1.05)
    - Apply transform scale to countdown text element in template
    - _Requirements: 4.1, 4.2_

  - [ ] 7.4 Add seconds digit fade transition
    - Add CSS transition with 100ms duration to countdown text
    - Trigger on seconds update
    - _Requirements: 4.3_

  - [ ] 7.5 Add glow effect for final 10 seconds
    - Apply `softGlow` filter to countdown text when seconds ≤ 10
    - _Requirements: 4.4_

  - [ ] 7.6 Ensure countdown animations respect accessibility
    - Disable countdown pulse when `prefersReducedMotion` is true
    - Maintain countdown updates even when animations disabled
    - _Requirements: 4.5, 10.1, 10.2_

- [ ] 8. Implement moon phase animation
  - [ ] 8.1 Add moon phase breathing effect
    - Create `getMoonOpacity()` method that calculates opacity using sine wave
    - Vary opacity between 0.35 and 0.55 over 4-second cycle
    - Offset phase by 90 degrees from main breathing glow
    - _Requirements: 5.2, 5.5_

  - [ ] 8.2 Add moon phase fade-in on load
    - Add CSS animation for moon group with 1.2s ease-in duration
    - Set animation delay to 1.5s
    - _Requirements: 5.1_

  - [ ] 8.3 Add full moon glow effect
    - Conditionally apply `softGlow` filter when moon is in full phase
    - _Requirements: 5.3_

  - [ ] 8.4 Add new moon outline
    - Display faint outline circle when moon is in new phase instead of being invisible
    - _Requirements: 5.4_

  - [ ] 8.5 Disable moon breathing in reduced motion mode
    - Return constant opacity when `prefersReducedMotion` is true
    - _Requirements: 5.2, 10.1, 10.2_

- [ ] 9. Enhance current time indicator
  - [ ] 9.1 Add pulsing glow effect to indicator
    - Create `getIndicatorGlowOpacity()` method using pulse easing function
    - Vary opacity between 0.6 and 1.0 over 2-second cycle
    - Apply to indicator circle in template
    - _Requirements: 6.1_

  - [ ] 9.2 Add trailing shadow effect
    - Create secondary circle element 5° behind indicator position
    - Set fill to semi-transparent white (rgba(255, 255, 255, 0.3))
    - Apply rotation transform offset by -5 degrees
    - _Requirements: 6.3_

  - [ ] 9.3 Implement marker flash when indicator passes
    - Create `triggerMarkerFlash(prayerName)` method
    - Detect when indicator angle passes marker angle in update cycle
    - Set marker flash state with 300ms duration
    - Briefly brighten marker by 50%
    - _Requirements: 6.2_

  - [ ] 9.4 Add completion pulse animation
    - Trigger scale animation from 1.0 to 1.5 over 400ms when arc sweep completes
    - Use CSS animation or JavaScript-driven transform
    - _Requirements: 6.4_

  - [ ] 9.5 Ensure smooth rotation without jitter
    - Verify indicator rotation uses transform for GPU acceleration
    - Maintain consistent update timing via requestAnimationFrame
    - _Requirements: 6.5_

- [ ] 10. Refine breathing glow effect
  - [ ] 10.1 Update breathing glow to use sine wave easing
    - Modify existing breathing glow calculation to use `EASING_FUNCTIONS.sine`
    - Replace linear interpolation with sine wave for scale and opacity
    - _Requirements: 7.1_

  - [-] 10.2 Add phase offset between inner and outer circles
    - Apply 45-degree phase offset to outer circle (radius 32) relative to inner circle (radius 26)
    - Calculate offset as `(breathPhase + 0.125) % 1.0` for outer circle
    - _Requirements: 7.2_

  - [-] 10.3 Implement intensification on prayer change
    - Modify `intensifyBreathingGlow()` to increase intensity by 30% (multiply by 1.3)
    - Apply intensification for 1.5 seconds after prayer transition
    - Check `breathIntensifyUntil` timestamp in breathing update cycle
    - _Requirements: 7.3_

  - [-] 10.4 Maintain existing update interval
    - Keep 66ms update interval for smooth animation
    - _Requirements: 7.4_

  - [-] 10.5 Reduce amplitude in reduced motion mode
    - Multiply breathing amplitude by 0.3 when `prefersReducedMotion` is true
    - _Requirements: 7.5, 10.1, 10.2_

- [ ] 11. Implement tick mark animations
  - [ ] 11.1 Add sequential fade-in on load
    - Create CSS animation for tick marks with opacity 0 to final opacity
    - Apply staggered animation-delay of 30ms per tick mark
    - Use tick mark index to calculate delay
    - _Requirements: 8.1, 11.1_

  - [ ] 11.2 Implement fade-in during arc sweep
    - Reveal tick marks as arc sweep passes their positions
    - Coordinate with marker reveal logic
    - _Requirements: 8.3_

  - [ ] 11.3 Add brightness pulse when indicator passes major ticks
    - Create `updateTickBrightness()` method called from update cycle
    - Detect when indicator passes major tick mark (every 6 hours)
    - Brighten tick by 50% for 300ms using `tickBrightness` Map
    - _Requirements: 8.2_

  - [ ] 11.4 Add subtle pulsing to major tick marks
    - Create `getTickOpacity(angle)` method that calculates pulsing opacity
    - Vary major tick opacity between 0.35 and 0.45 over 3-second cycle
    - Apply to major tick marks only
    - _Requirements: 8.4_

  - [ ] 11.5 Disable tick animations in reduced motion mode
    - Skip all tick mark animations when `prefersReducedMotion` is true
    - Display ticks at full opacity immediately
    - _Requirements: 8.5, 10.1, 10.2_

- [ ] 12. Implement prayer label animations
  - [ ] 12.1 Add entrance animation with slide effect
    - Create CSS animation that fades in and slides from 10% closer to center
    - Set animation duration to 400ms
    - Apply to label groups in template
    - _Requirements: 9.1, 11.1_

  - [ ] 12.2 Add staggered delays based on angular position
    - Calculate delay as `(angularPosition / 60) * 30ms`
    - Apply as inline style or CSS variable
    - _Requirements: 9.4, 11.1_

  - [ ] 12.3 Coordinate label reveal with arc sweep
    - Fade in labels 200ms after corresponding marker is revealed
    - Use `isLabelRevealed()` method to control visibility
    - _Requirements: 9.2, 3.4_

  - [ ] 12.4 Add active state transition
    - Transition label color and font-weight over 300ms with ease-in-out
    - Apply when label becomes active prayer
    - _Requirements: 9.3_

  - [ ] 12.5 Use fade-only in reduced motion mode
    - Disable slide animation when `prefersReducedMotion` is true
    - Keep fade-in effect only
    - _Requirements: 9.5, 10.1, 10.2_

- [ ] 13. Add CSS animations and transitions
  - [ ] 13.1 Create keyframe animations for entrance effects
    - Define `@keyframes fadeInSlide` for label entrance (opacity 0→1, transform translateY)
    - Define `@keyframes fadeIn` for simple fade-ins
    - Define `@keyframes ringDraw` for ring drawing (existing, verify)
    - Define `@keyframes rippleExpand` for tap ripple (r: 0→15, opacity: 1→0)
    - Define `@keyframes pulse` for scale pulsing (scale: 1.0→1.15→1.0)
    - _Requirements: 9.1, 2.4, 1.2_

  - [ ] 13.2 Add transition classes for interactive states
    - Create `.prayer-marker` class with transition for transform and filter (150ms ease-out)
    - Create `.prayer-marker:hover` state with scale transform
    - Create `.svg-label` class with transition for opacity and color (300ms ease-in-out)
    - Create `.center-countdown` class with transition for transform (100ms)
    - _Requirements: 2.1, 2.5, 9.3, 4.3_

  - [ ] 13.3 Add reduced motion media query overrides
    - Create `@media (prefers-reduced-motion: reduce)` block
    - Disable all animation-name properties except essential ones
    - Set animation-duration to 0.01ms for disabled animations
    - Remove transform transitions for slide effects
    - _Requirements: 10.1, 10.2, 7.5, 8.5, 9.5_

  - [ ] 13.4 Add will-change hints for performance
    - Apply `will-change: transform, opacity` to animated elements during active animations only
    - Remove will-change after animations complete to avoid memory overhead
    - _Requirements: 10.3, 10.4_

- [ ] 14. Implement animation orchestration and coordination
  - [ ] 14.1 Create load sequence coordinator
    - Implement timing for: ring draw (0ms) → arc sweep (150ms) → markers reveal (during sweep) → labels fade (200ms after markers) → dates (1400ms)
    - Ensure each phase waits for previous phase or runs in parallel as designed
    - _Requirements: 11.1_

  - [ ] 14.2 Create prayer transition sequence coordinator
    - Implement timing for: previous marker dim (0ms) → new marker glow (100ms) → label pulse (200ms) → center text fade (300ms) → breathing intensify (400ms)
    - Use single requestAnimationFrame loop to coordinate all transition animations
    - _Requirements: 11.2_

  - [ ] 14.3 Implement consistent easing across related animations
    - Use cubic-bezier for entrance animations
    - Use ease-out for interaction feedback
    - Use ease-in-out for state transitions
    - _Requirements: 11.3_

  - [ ] 14.4 Add simultaneous animation limiting
    - Track count of active animations
    - Limit to 5 or fewer simultaneous animations
    - Queue additional animations if limit reached
    - _Requirements: 11.4_

  - [ ] 14.5 Implement transition queuing during load
    - Queue prayer transitions that occur during initial load sequence
    - Execute queued transitions after load completes
    - Skip queued animations if queue exceeds 3 pending sequences
    - _Requirements: 11.5, 11.7_

  - [ ] 14.6 Add performance-based orchestration adjustments
    - Skip stagger delays when performance degrades
    - Execute animations simultaneously to reduce total time
    - _Requirements: 11.6_

- [ ] 15. Add cleanup and lifecycle management
  - [ ] 15.1 Update ngOnDestroy to clear all animation frames
    - Cancel `transitionAnimationFrame` if active
    - Cancel `pulseAnimationFrame` if active
    - Clear all existing intervals (breathInterval, countdownInterval, animationFrame)
    - Remove media query listeners
    - _Requirements: 10.3_

  - [ ] 15.2 Add proper cleanup for event listeners
    - Remove all dynamically added event listeners
    - Clear timeout references for delayed animations
    - _Requirements: 10.3_

  - [ ] 15.3 Implement memory-efficient animation loops
    - Avoid creating new objects in animation loops
    - Reuse calculation results where possible
    - Clear Sets and Maps when no longer needed
    - _Requirements: 10.3_

- [ ] 16. Checkpoint - Test all animations and verify performance
  - Verify all animations run smoothly at 60fps on target devices
  - Test reduced motion mode disables appropriate animations
  - Test device tier detection and automatic degradation
  - Test prayer transition orchestration timing
  - Test interactive feedback on markers
  - Verify arc sweep reveals markers and labels sequentially
  - Test countdown pulse timing at different thresholds
  - Verify moon phase breathing synchronization
  - Test tick mark animations and brightness pulses
  - Verify label entrance animations with stagger
  - Test filter fallbacks on devices without SVG filter support
  - Ensure all animations respect accessibility preferences
  - Verify no memory leaks or performance degradation over time
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- The checkpoint ensures all animations work cohesively and perform well
- All animations use GPU-accelerated properties (transform, opacity) for performance
- The implementation maintains backward compatibility with existing prayer clock functionality
- Device tier detection ensures appropriate experience on all devices
- Reduced motion support provides accessible experience for users with motion sensitivity
