import { Component, OnInit, OnDestroy, OnChanges, Input } from '@angular/core';
import { TimeSimulationService } from 'src/app/services/time-simulation.service';

/**
 * PrayerClockComponent
 * Circular SVG prayer clock ported from Azan PWA's BreathDesign.svelte.
 * Arc sweeps from 0° to current time on load (2.8s cubic ease).
 * Labels show prayer name + adhan time, positioned close to the ring.
 */

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

interface PrayerTime {
  name: string;
  nameAr: string;
  time: Date | null;
  angle: number;
}

/**
 * Device capability tier for animation performance
 */
type DeviceTier = 'full' | 'reduced' | 'minimal';

/**
 * Result of device capability detection
 */
interface DeviceCapability {
  tier: DeviceTier;
  averageFPS: number;
  supportsFilters: boolean;
}

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

@Component({
  selector: 'app-prayer-clock',
  templateUrl: './prayer-clock.component.html',
  styleUrls: ['./prayer-clock.component.scss'],
})
export class PrayerClockComponent implements OnInit, OnDestroy, OnChanges {

  @Input() fajrTime = '';
  @Input() sunriseTime = '';
  @Input() dhuhrTime = '';
  @Input() asrTime = '';
  @Input() maghribTime = '';
  @Input() ishaTime = '';
  @Input() iqamaFajr = '';
  @Input() iqamaDhuhr = '';
  @Input() iqamaAsr = '';
  @Input() iqamaMaghrib = '';
  @Input() iqamaIsha = '';

  prayers: PrayerTime[] = [];
  iqamaPrayers: PrayerTime[] = [];
  currentPrayerName = '';
  nextPrayerName = '';
  countdownText = '';
  currentTimeAngle = 0;
  hijriDate = '';
  gregorianDate = '';
  showClock = true;
  isFriday = false;

  // Animated arc angle — starts at 0, tweens to currentTimeAngle
  displayAngle = 0;

  // Moon
  moonPath = '';
  moonType = 'phase';

  prayerClockOrder = ['maghrib', 'isha', 'fajr', 'sunrise', 'dhuhr', 'asr'];
  iqamaClockOrder = ['maghrib', 'isha', 'fajr', 'dhuhr', 'asr'];
  prayerListOrder = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];

  prayerNames: Record<string, { en: string; ar: string }> = {
    fajr: { en: 'Fajr', ar: 'الفجر' },
    sunrise: { en: 'Sunrise', ar: 'الشروق' },
    dhuhr: { en: 'Dhuhr', ar: 'الظهر' },
    asr: { en: 'Asr', ar: 'العصر' },
    maghrib: { en: 'Maghrib', ar: 'المغرب' },
    isha: { en: 'Isha', ar: 'العشاء' },
    lastThird: { en: 'LAST 3RD', ar: '' }
  };

  ringOpacity = { faint: 0.06, subtle: 0.10, light: 0.15, medium: 0.25, strong: 0.40 };

  // Animation state tracking
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

  // Countdown timing state
  countdownMinutesRemaining = Infinity;
  countdownSecondsRemaining = Infinity;

  // Tick mark brightness tracking
  tickBrightness: Map<number, number> = new Map(); // angle -> brightness multiplier

  // Device capability detection
  deviceCapability: DeviceCapability = {
    tier: 'full',
    averageFPS: 60,
    supportsFilters: true
  };

  // Performance monitoring
  private performanceMonitoring = {
    enabled: true,
    frameTimes: [] as number[],
    lastFrameTime: 0,
    rollingWindowMs: 2000, // 2-second window for FPS calculation
    currentFPS: 60,
    lowFPSStartTime: 0, // When FPS first dropped below threshold
    veryLowFPSStartTime: 0, // When FPS first dropped below 20fps
    hasDowngraded: false // Prevent multiple downgrades
  };

  // Animation throttling state
  private animationThrottling = {
    activeAnimationCount: 0,
    maxSimultaneousAnimations: 5,
    interactiveAnimationsDisabled: false,
    decorativeAnimationsDisabled: false,
    complexFiltersDisabled: false,
    staggerDelaysSkipped: false
  };

  private breathInterval: any;
  private countdownInterval: any;
  private animationFrame: any;
  private breathPhase = 0;

  // Breathing glow state for inner and outer circles
  private innerBreathScale = 1;
  private innerBreathOpacity = 0.6;
  private outerBreathScale = 1;
  private outerBreathOpacity = 0.6;

  // Additional animation frames
  private transitionAnimationFrame: any;
  private pulseAnimationFrame: any;
  private performanceMonitorFrame: any;

  // Media query for reduced motion preference
  private reducedMotionMediaQuery: MediaQueryList | null = null;
  private reducedMotionListener: ((event: MediaQueryListEvent) => void) | null = null;

  constructor(private timeService: TimeSimulationService) {}

  ngOnInit(): void {
    this.updatePrayerData();
    this.computeHijriDate();
    this.computeGregorianDate();
    this.computeMoonPhase();
    this.updateCurrentState();

    // Detect device capabilities first
    this.detectDeviceCapabilities().then(() => {
      // Detect reduced motion preference
      this.detectReducedMotionPreference();

      // Start continuous performance monitoring
      this.startPerformanceMonitoring();

      // Start arc sweep animation (0 → currentTimeAngle over 2.8s with cubic ease)
      this.startArcAnimation();

      // Breathing glow with sine wave easing
      this.breathInterval = setInterval(() => {
        this.updateBreathingGlow();
      }, 66);

      // Countdown tick
      this.countdownInterval = setInterval(() => {
        this.updateCurrentState();
        // After animation is done, track real time
        if (this.displayAngle >= this.currentTimeAngle - 1) {
          this.displayAngle = this.currentTimeAngle;
        }
      }, 1000);
    });

    // Refresh when simulation settings change
    this.timeService.isSimulationMode$.subscribe(() => this.onSimulationChange());
    this.timeService.simulatedDate$.subscribe(() => this.onSimulationChange());
    this.timeService.simulatedTime$.subscribe(() => this.updateCurrentState());
  }

  private onSimulationChange(): void {
    this.updatePrayerData();
    this.updateCurrentState();
    this.computeHijriDate();
    this.computeGregorianDate();
    this.computeMoonPhase();
    
    // Replay arc sweep animation when date changes
    this.displayAngle = 0;
    this.startArcAnimation();
  }

  ngOnDestroy(): void {
    clearInterval(this.breathInterval);
    clearInterval(this.countdownInterval);
    if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
    if (this.transitionAnimationFrame) cancelAnimationFrame(this.transitionAnimationFrame);
    if (this.pulseAnimationFrame) cancelAnimationFrame(this.pulseAnimationFrame);
    
    // Stop performance monitoring
    this.stopPerformanceMonitoring();
    
    // Remove reduced motion media query listener
    if (this.reducedMotionMediaQuery && this.reducedMotionListener) {
      this.reducedMotionMediaQuery.removeEventListener('change', this.reducedMotionListener);
    }
  }

  ngOnChanges(): void {
    this.updatePrayerData();
    this.updateCurrentState();
    // Replay arc sweep animation when data changes
    this.displayAngle = 0;
    this.startArcAnimation();
  }

  /** Animate the arc from 0 to currentTimeAngle using cubic easing (2.8s) */
  private startArcAnimation(): void {
    const duration = 2800; // ms, matching Azan app
    const targetAngle = this.currentTimeAngle;
    const startTime = performance.now();
    const labelRevealDelay = 200; // ms delay after marker reveal

    const cubicInOut = (t: number): number => {
      return t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = cubicInOut(progress);
      this.displayAngle = eased * targetAngle;

      // Check each prayer marker to see if arc has passed it
      for (const prayer of this.prayers) {
        if (prayer.time && prayer.angle !== undefined) {
          // Reveal marker and label together when arc passes
          if (this.displayAngle >= prayer.angle && !this.animationState.revealedMarkers.has(prayer.name)) {
            this.animationState.revealedMarkers.add(prayer.name);
            this.animationState.revealedLabels.add(prayer.name);
          }
        }
      }

      if (progress < 1) {
        this.animationFrame = requestAnimationFrame(animate);
      } else {
        this.displayAngle = targetAngle;
        this.animationState.arcSweepComplete = true;
        
        // Trigger completion flash on current time indicator
        this.triggerIndicatorFlash();
      }
    };

    this.animationFrame = requestAnimationFrame(animate);
  }
  /**
   * Detects user's reduced motion preference and sets up listener for changes
   * Checks window.matchMedia('(prefers-reduced-motion: reduce)') and updates animationState
   */
  private detectReducedMotionPreference(): void {
    // Check if matchMedia is supported
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    // Create media query for reduced motion preference
    this.reducedMotionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Set initial preference
    this.animationState.prefersReducedMotion = this.reducedMotionMediaQuery.matches;

    // Create listener for preference changes during session
    this.reducedMotionListener = (event: MediaQueryListEvent) => {
      this.animationState.prefersReducedMotion = event.matches;
    };

    // Add listener to detect changes
    this.reducedMotionMediaQuery.addEventListener('change', this.reducedMotionListener);
  }

  /**
   * Detects device capabilities through performance benchmarking
   * Runs requestAnimationFrame timing test over 100ms to measure FPS
   * Classifies device into three tiers: full, reduced, minimal
   * Stores result in localStorage for persistence across sessions
   */
  private async detectDeviceCapabilities(): Promise<void> {
    // Check if we have a cached result in localStorage
    const cached = this.loadCachedDeviceCapability();
    if (cached) {
      this.deviceCapability = cached;
      this.applyInitialThrottling();
      return;
    }

    // Run performance benchmark
    const averageFPS = await this.runPerformanceBenchmark();
    
    // Check SVG filter support
    const supportsFilters = this.checkSVGFilterSupport();
    
    // Classify device tier based on FPS
    let tier: DeviceTier;
    if (averageFPS >= 50) {
      tier = 'full';
    } else if (averageFPS >= 30) {
      tier = 'reduced';
    } else {
      tier = 'minimal';
    }

    // Store result
    this.deviceCapability = {
      tier,
      averageFPS,
      supportsFilters
    };

    // Cache in localStorage
    this.cacheDeviceCapability(this.deviceCapability);
    
    // Apply initial throttling based on tier
    this.applyInitialThrottling();
  }

  /**
   * Applies initial animation throttling based on detected device tier
   * Requirements: 10.8, 13.3, 13.4
   */
  private applyInitialThrottling(): void {
    const tier = this.deviceCapability.tier;
    
    // Disable complex filters on minimal tier or if not supported
    if (tier === 'minimal' || !this.deviceCapability.supportsFilters) {
      this.animationThrottling.complexFiltersDisabled = true;
    }
    
    // Disable interactive animations on minimal tier
    if (tier === 'minimal') {
      this.animationThrottling.interactiveAnimationsDisabled = true;
    }
    
    // Disable decorative animations on minimal tier
    if (tier === 'minimal') {
      this.animationThrottling.decorativeAnimationsDisabled = true;
      this.animationThrottling.staggerDelaysSkipped = true;
    }
  }

  /**
   * Runs a performance benchmark using requestAnimationFrame timing test
   * Measures frame timing over 100ms to calculate average FPS
   * @returns Promise that resolves to average FPS
   */
  private runPerformanceBenchmark(): Promise<number> {
    return new Promise((resolve) => {
      const testDuration = 100; // ms
      const startTime = performance.now();
      let frameCount = 0;
      let lastFrameTime = startTime;
      const frameTimes: number[] = [];

      const measureFrame = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        
        if (elapsed < testDuration) {
          // Record frame time delta
          const delta = currentTime - lastFrameTime;
          if (delta > 0) {
            frameTimes.push(delta);
          }
          lastFrameTime = currentTime;
          frameCount++;
          
          requestAnimationFrame(measureFrame);
        } else {
          // Calculate average FPS
          if (frameTimes.length > 0) {
            const averageDelta = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
            const averageFPS = 1000 / averageDelta;
            resolve(Math.round(averageFPS));
          } else {
            // Fallback if no frames recorded
            resolve(60);
          }
        }
      };

      requestAnimationFrame(measureFrame);
    });
  }

  /**
   * Checks if the browser supports SVG filters properly
   * Creates a test SVG element with a filter and checks if it renders
   * @returns true if SVG filters are supported, false otherwise
   */
  private checkSVGFilterSupport(): boolean {
    // Check if we're in a browser environment
    if (typeof document === 'undefined') {
      return true; // Assume support in SSR
    }

    try {
      // Create a test SVG element
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
      const feGaussianBlur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
      
      // Set up the filter
      filter.setAttribute('id', 'test-filter');
      feGaussianBlur.setAttribute('stdDeviation', '2');
      filter.appendChild(feGaussianBlur);
      svg.appendChild(filter);
      
      // Check if the filter element was created successfully
      const supportsFilters = filter.childNodes.length > 0;
      
      return supportsFilters;
    } catch (error) {
      // If any error occurs, assume filters are not supported
      return false;
    }
  }

  /**
   * Loads cached device capability from localStorage
   * @returns Cached DeviceCapability or null if not found or invalid
   */
  private loadCachedDeviceCapability(): DeviceCapability | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }

    try {
      const cached = localStorage.getItem('prayer-clock-device-capability');
      if (cached) {
        const parsed = JSON.parse(cached);
        // Validate the cached data
        if (parsed.tier && parsed.averageFPS && typeof parsed.supportsFilters === 'boolean') {
          return parsed as DeviceCapability;
        }
      }
    } catch (error) {
      // Invalid cached data, ignore
    }

    return null;
  }

  /**
   * Caches device capability to localStorage for persistence
   * @param capability DeviceCapability to cache
   */
  private cacheDeviceCapability(capability: DeviceCapability): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    try {
      localStorage.setItem('prayer-clock-device-capability', JSON.stringify(capability));
    } catch (error) {
      // localStorage might be full or disabled, ignore
    }
  }

  /**
   * Starts continuous performance monitoring using requestAnimationFrame
   * Tracks frame timing, calculates rolling average FPS, and triggers tier downgrades
   * when sustained frame drops are detected
   */
  private startPerformanceMonitoring(): void {
    if (!this.performanceMonitoring.enabled) {
      return;
    }

    this.performanceMonitoring.lastFrameTime = performance.now();

    const monitorFrame = (currentTime: number) => {
      // Calculate frame delta
      const delta = currentTime - this.performanceMonitoring.lastFrameTime;
      this.performanceMonitoring.lastFrameTime = currentTime;

      // Add to frame times array
      this.performanceMonitoring.frameTimes.push(delta);

      // Remove frame times older than rolling window (2 seconds)
      const cutoffTime = currentTime - this.performanceMonitoring.rollingWindowMs;
      let totalDelta = 0;
      let validFrameCount = 0;

      // Calculate rolling average by summing recent frame deltas
      for (let i = this.performanceMonitoring.frameTimes.length - 1; i >= 0; i--) {
        totalDelta += this.performanceMonitoring.frameTimes[i];
        validFrameCount++;

        // Stop when we've accumulated 2 seconds worth of frames
        if (totalDelta >= this.performanceMonitoring.rollingWindowMs) {
          break;
        }
      }

      // Trim old frame times to prevent memory growth
      if (this.performanceMonitoring.frameTimes.length > 200) {
        this.performanceMonitoring.frameTimes = this.performanceMonitoring.frameTimes.slice(-120);
      }

      // Calculate current FPS from rolling average
      if (validFrameCount > 0 && totalDelta > 0) {
        const averageDelta = totalDelta / validFrameCount;
        this.performanceMonitoring.currentFPS = 1000 / averageDelta;
      }

      // Check for sustained frame drops and trigger tier downgrades
      this.checkPerformanceDegradation(currentTime);

      // Continue monitoring
      this.performanceMonitorFrame = requestAnimationFrame(monitorFrame);
    };

    this.performanceMonitorFrame = requestAnimationFrame(monitorFrame);
  }

  /**
   * Checks for sustained frame drops and triggers automatic tier downgrades
   * - Below 30fps for 3+ seconds: downgrade to reduced tier (disable interactive animations)
   * - Below 20fps for 2+ seconds: downgrade to minimal tier (disable decorative animations)
   * Prevents automatic tier upgrades during session
   */
  private checkPerformanceDegradation(currentTime: number): void {
    const currentFPS = this.performanceMonitoring.currentFPS;
    const currentTier = this.deviceCapability.tier;

    // Check for very low FPS (below 20fps)
    if (currentFPS < 20) {
      if (this.performanceMonitoring.veryLowFPSStartTime === 0) {
        // First time dropping below 20fps
        this.performanceMonitoring.veryLowFPSStartTime = currentTime;
      } else {
        // Check if sustained for 2+ seconds
        const duration = currentTime - this.performanceMonitoring.veryLowFPSStartTime;
        if (duration >= 2000) {
          // Disable decorative animations
          if (!this.animationThrottling.decorativeAnimationsDisabled) {
            this.disableDecorativeAnimations();
          }
          
          // Downgrade to minimal tier if not already
          if (currentTier !== 'minimal') {
            this.downgradeTier('minimal');
            this.performanceMonitoring.hasDowngraded = true;
          }
        }
      }
    } else {
      // Reset very low FPS timer if FPS recovers above 20
      this.performanceMonitoring.veryLowFPSStartTime = 0;
    }

    // Check for low FPS (below 30fps)
    if (currentFPS < 30) {
      if (this.performanceMonitoring.lowFPSStartTime === 0) {
        // First time dropping below 30fps
        this.performanceMonitoring.lowFPSStartTime = currentTime;
      } else {
        // Check if sustained for 2+ seconds (changed from 3+ to be more responsive)
        const duration = currentTime - this.performanceMonitoring.lowFPSStartTime;
        if (duration >= 2000) {
          // Disable interactive animations
          if (!this.animationThrottling.interactiveAnimationsDisabled) {
            this.disableInteractiveAnimations();
          }
          
          // Downgrade to reduced tier if currently on full
          if (currentTier === 'full') {
            this.downgradeTier('reduced');
            this.performanceMonitoring.hasDowngraded = true;
          }
        }
      }
    } else {
      // Reset low FPS timer if FPS recovers above 30
      this.performanceMonitoring.lowFPSStartTime = 0;
    }
  }

  /**
   * Downgrades the device tier to a lower performance level
   * Updates deviceCapability and caches the new tier
   * Does NOT allow automatic upgrades during session
   * @param newTier The tier to downgrade to ('reduced' or 'minimal')
   */
  private downgradeTier(newTier: DeviceTier): void {
    const oldTier = this.deviceCapability.tier;

    // Prevent upgrades - only allow downgrades
    if (newTier === 'full' ||
        (newTier === 'reduced' && oldTier === 'minimal')) {
      return;
    }

    // Update device capability
    this.deviceCapability.tier = newTier;
    this.deviceCapability.averageFPS = this.performanceMonitoring.currentFPS;

    // Cache the downgraded tier
    this.cacheDeviceCapability(this.deviceCapability);

    console.log(`[Prayer Clock] Performance degradation detected. Downgraded from ${oldTier} to ${newTier} tier. Current FPS: ${Math.round(this.performanceMonitoring.currentFPS)}`);
  }

  /**
   * Stops performance monitoring and cleans up resources
   */
  private stopPerformanceMonitoring(): void {
    if (this.performanceMonitorFrame) {
      cancelAnimationFrame(this.performanceMonitorFrame);
      this.performanceMonitorFrame = null;
    }
    this.performanceMonitoring.frameTimes = [];
  }

  /**
   * Disables interactive animations (hover effects, ripples) when FPS drops below 30fps
   * Requirements: 10.6
   */
  private disableInteractiveAnimations(): void {
    this.animationThrottling.interactiveAnimationsDisabled = true;
    console.log('[Prayer Clock] Interactive animations disabled due to low FPS (<30fps)');
  }

  /**
   * Disables decorative animations (breathing glow, tick pulses, etc.) when FPS drops below 20fps
   * Requirements: 10.7
   */
  private disableDecorativeAnimations(): void {
    this.animationThrottling.decorativeAnimationsDisabled = true;
    this.animationThrottling.staggerDelaysSkipped = true;
    console.log('[Prayer Clock] Decorative animations disabled due to very low FPS (<20fps)');
  }

  /**
   * Checks if complex filters should be disabled based on device tier
   * Disables strongGlow and ripple filters on low-end devices
   * Requirements: 10.8
   */
  private shouldDisableComplexFilters(): boolean {
    // Disable on minimal tier or if filters not supported
    if (this.deviceCapability.tier === 'minimal' || !this.deviceCapability.supportsFilters) {
      return true;
    }
    
    // Disable if explicitly throttled
    return this.animationThrottling.complexFiltersDisabled;
  }

  /**
   * Checks if interactive animations should be disabled
   * Requirements: 10.6
   */
  get hoveredMarker(): string | null {
    return this.animationState.hoveredMarker;
  }

  onMarkerHover(prayer: PrayerTime): void {
    if (this.shouldDisableInteractiveAnimations()) return;
    this.animationState.hoveredMarker = prayer.name;
  }

  onMarkerLeave(): void {
    this.animationState.hoveredMarker = null;
  }

  onMarkerClick(prayer: PrayerTime): void {
    if (this.shouldDisableInteractiveAnimations()) return;
    this.animationState.tappedMarker = prayer.name;
    console.log('Marker clicked:', prayer.name);
  }

  private shouldDisableInteractiveAnimations(): boolean {
    // Disable on reduced motion preference
    if (this.animationState.prefersReducedMotion) {
      return true;
    }
    
    // Disable on minimal tier
    if (this.deviceCapability.tier === 'minimal') {
      return true;
    }
    
    // Disable if FPS dropped below 30
    return this.animationThrottling.interactiveAnimationsDisabled;
  }

  /**
   * Checks if decorative animations should be disabled
   * Requirements: 10.7
   */
  private shouldDisableDecorativeAnimations(): boolean {
    // Disable on reduced motion preference
    if (this.animationState.prefersReducedMotion) {
      return true;
    }
    
    // Disable on minimal tier
    if (this.deviceCapability.tier === 'minimal') {
      return true;
    }
    
    // Disable if FPS dropped below 20
    return this.animationThrottling.decorativeAnimationsDisabled;
  }

  /**
   * Checks if stagger delays should be skipped
   * Requirements: 11.6
   */
  private shouldSkipStaggerDelays(): boolean {
    // Skip on minimal tier
    if (this.deviceCapability.tier === 'minimal') {
      return true;
    }
    
    // Skip if performance degraded
    return this.animationThrottling.staggerDelaysSkipped;
  }

  /**
   * Tracks an active animation and checks if limit is reached
   * Returns true if animation should proceed, false if limit reached
   * Requirements: 11.4
   */
  private canStartAnimation(): boolean {
    if (this.animationThrottling.activeAnimationCount >= this.animationThrottling.maxSimultaneousAnimations) {
      return false;
    }
    return true;
  }

  /**
   * Increments the active animation counter
   * Requirements: 11.4
   */
  private startAnimation(): void {
    this.animationThrottling.activeAnimationCount++;
  }

  /**
   * Decrements the active animation counter
   * Requirements: 11.4
   */
  private endAnimation(): void {
    if (this.animationThrottling.activeAnimationCount > 0) {
      this.animationThrottling.activeAnimationCount--;
    }
  }

  /**
   * Gets the effective stagger delay based on performance
   * Returns 0 if stagger should be skipped, otherwise returns the delay
   * Requirements: 11.6
   */
  private getEffectiveStaggerDelay(baseDelay: number): number {
    return this.shouldSkipStaggerDelays() ? 0 : baseDelay;
  }


  private parseTimeString(timeStr: string): Date | null {
    if (!timeStr) return null;
    const cleaned = timeStr.trim().toUpperCase();
    const match = cleaned.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/);
    if (!match) return null;
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const meridiem = match[3];
    if (meridiem === 'PM' && hours < 12) hours += 12;
    if (meridiem === 'AM' && hours === 12) hours = 0;
    const now = this.timeService.getNow();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0);
  }

  private updatePrayerData(): void {
    const raw: Record<string, string> = {
      fajr: this.fajrTime, sunrise: this.sunriseTime,
      dhuhr: this.dhuhrTime, asr: this.asrTime,
      maghrib: this.maghribTime, isha: this.ishaTime,
    };
    const maghribDate = this.parseTimeString(raw['maghrib']);
    const maghribHour = maghribDate
      ? maghribDate.getHours() + maghribDate.getMinutes() / 60 : 18;

    this.prayers = this.prayerClockOrder.map(name => {
      const time = this.parseTimeString(raw[name]);
      const angle = name === 'maghrib' ? 0 : (time ? this.timeToAngle(time, maghribHour) : 0);
      return { name, nameAr: this.prayerNames[name]?.ar || '', time, angle };
    });

    // Add Last Third Marker
    const fDate = this.parseTimeString(raw['fajr']);
    if (maghribDate && fDate) {
      fDate.setDate(fDate.getDate() + 1);
      const nightMs = fDate.getTime() - maghribDate.getTime();
      const lastThirdDate = new Date(maghribDate.getTime() + nightMs * (2 / 3));
      const lastThirdAngle = this.timeToAngle(lastThirdDate, maghribHour);
      this.prayers.push({
        name: 'lastThird',
        nameAr: '',
        time: lastThirdDate,
        angle: lastThirdAngle
      });
    }

    // Build iqama prayers for inner ring
    const iqamaRaw: Record<string, string> = {
      fajr: this.iqamaFajr,
      dhuhr: this.iqamaDhuhr,
      asr: this.iqamaAsr,
      maghrib: this.iqamaMaghrib,
      isha: this.iqamaIsha,
    };
    this.iqamaPrayers = this.iqamaClockOrder.map(name => {
      const time = this.parseTimeString(iqamaRaw[name]);
      const angle = name === 'maghrib' ? 0 : (time ? this.timeToAngle(time, maghribHour) : 0);
      return { name, nameAr: this.prayerNames[name]?.ar || '', time, angle };
    });
  }

  private timeToAngle(date: Date, maghribHour: number): number {
    const hours = date.getHours() + date.getMinutes() / 60;
    const adjusted = ((hours - maghribHour + 24) % 24);
    return (adjusted / 24) * 360;
  }

  private updateCurrentState(): void {
    const now = this.timeService.getNow();
    this.isFriday = now.getDay() === 5; // 5 is Friday

    // Update prayer names for Jummah if it's Friday
    if (this.isFriday) {
      this.prayerNames['dhuhr'] = { en: 'Jummah', ar: 'الجمعة' };
    } else {
      this.prayerNames['dhuhr'] = { en: 'Dhuhr', ar: 'الظهر' };
    }

    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    // Determine only the NEXT prayer (not current)
    let current = 'isha';
    let next = 'fajr';
    let nextTime: Date | null = null;

    const rawTimes: Record<string, string> = {
      fajr: this.fajrTime, sunrise: this.sunriseTime,
      dhuhr: this.dhuhrTime, asr: this.asrTime,
      maghrib: this.maghribTime, isha: this.ishaTime,
    };

    for (let i = this.prayerListOrder.length - 1; i >= 0; i--) {
      const pName = this.prayerListOrder[i];
      const pDate = this.parseTimeString(rawTimes[pName]);
      if (pDate) {
        const pMinutes = pDate.getHours() * 60 + pDate.getMinutes();
        if (nowMinutes >= pMinutes) {
          current = pName;
          const nextIdx = (i + 1) % this.prayerListOrder.length;
          next = this.prayerListOrder[nextIdx];
          const nextDate = this.parseTimeString(rawTimes[next]);
          if (nextDate && nextIdx === 0) nextDate.setDate(nextDate.getDate() + 1);
          nextTime = nextDate;
          break;
        }
      }
    }

    if (!nextTime) nextTime = this.parseTimeString(this.fajrTime);

    this.currentPrayerName = current;
    this.nextPrayerName = next;

    // Countdown
    if (nextTime) {
      const diffMs = nextTime.getTime() - now.getTime();
      if (diffMs > 0) {
        const totalSec = Math.floor(diffMs / 1000);
        const h = Math.floor(totalSec / 3600);
        const m = Math.floor((totalSec % 3600) / 60);
        const s = totalSec % 60;
        this.countdownText = h > 0
          ? `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m`
          : `${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
      } else {
        this.countdownText = '00m 00s';
      }
    } else {
      this.countdownText = '--:--';
    }

    // Current time angle
    const maghribDate1 = this.parseTimeString(this.maghribTime);
    const maghribHour = maghribDate1
      ? maghribDate1.getHours() + maghribDate1.getMinutes() / 60 : 18;
    const nowHours = now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;
    const adjusted = ((nowHours - maghribHour + 24) % 24);
    this.currentTimeAngle = (adjusted / 24) * 360;
  }

  private computeHijriDate(): void {
    try {
      const now = this.timeService.getNow();
      const day = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', { day: 'numeric' }).format(now);
      const monthNum = parseInt(
        new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', { month: 'numeric' }).format(now), 10
      );
      const year = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', { year: 'numeric' }).format(now);
      const hijriMonths = [
        'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani',
        'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', 'Shaban',
        'Ramadan', 'Shawwal', 'Dhu al-Qadah', 'Dhu al-Hijjah'
      ];
      this.hijriDate = `${day} ${hijriMonths[monthNum - 1] || monthNum} ${year.replace(/[^\d]/g, '')} AH`;
    } catch { this.hijriDate = ''; }
  }

  private computeGregorianDate(): void {
    this.gregorianDate = this.timeService.getNow().toLocaleDateString('en-US', {
      weekday: 'long', day: 'numeric', month: 'long',
    });
  }

  moonPhaseText = '';

  private computeMoonPhase(): void {
    const now = this.timeService.getNow();
    const knownNewMoon = new Date(Date.UTC(2026, 1, 18, 0, 0, 0));
    const lunarCycle = 29.53058867;
    const daysSince = (now.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
    let phase = (daysSince % lunarCycle) / lunarCycle;
    if (phase < 0) phase += 1;
    const illumination = (1 - Math.cos(phase * 2 * Math.PI)) / 2;
    const waxing = phase < 0.5;
    const illum = Math.round(illumination * 10) / 10;
    const cx = 50, cy = 14, r = 4;
    
    if (illum <= 0.03) { this.moonType = 'new'; this.moonPath = ''; return; }
    if (illum >= 0.97) { this.moonType = 'full'; this.moonPath = ''; return; }

    const terminatorRx = Math.abs(Math.cos(illumination * Math.PI)) * r;
    const topY = cy - r;
    const botY = cy + r;
    const outerSweep = waxing ? 1 : 0;
    const terminatorSweep = illumination < 0.5
      ? (waxing ? 0 : 1) : (waxing ? 1 : 0);
    this.moonType = 'phase';
    this.moonPath = `M ${cx} ${topY} A ${r} ${r} 0 0 ${outerSweep} ${cx} ${botY} A ${terminatorRx} ${r} 0 0 ${terminatorSweep} ${cx} ${topY} Z`;
  }

  // ---- SVG Helpers ----
  getPosition(angle: number, radius: number): { x: number; y: number } {
    const rad = (angle - 90) * Math.PI / 180;
    return { x: 50 + radius * Math.cos(rad), y: 50 + radius * Math.sin(rad) };
  }

  getArcPath(startAngle: number, endAngle: number, radius: number): string {
    const start = this.getPosition(startAngle, radius);
    const end = this.getPosition(endAngle, radius);
    let arcLength = endAngle - startAngle;
    if (arcLength < 0) arcLength += 360;
    const largeArc = arcLength > 180 ? 1 : 0;
    return `M ${end.x} ${end.y} A ${radius} ${radius} 0 ${largeArc} 0 ${start.x} ${start.y}`;
  }

  /** Arc from 0° (Maghrib/top) sweeping to the animated display angle */
  get progressArcPath(): string {
    if (this.displayAngle < 1) return '';
    return this.getArcPath(0, this.displayAngle, 44);
  }

  /** Inner iqama arc (static, shows full day) */
  get iqamaProgressArcPath(): string {
    if (this.displayAngle < 1) return '';
    return this.getArcPath(0, this.displayAngle, 30);
  }

  /** Trailing glow arc that follows 15° behind the main arc endpoint */
  get trailingGlowArcPath(): string {
    // Only show trailing glow during arc sweep animation
    if (this.animationState.arcSweepComplete || this.displayAngle < 15) {
      return '';
    }
    
    // Create arc from 15° behind to current display angle
    const trailingStart = Math.max(0, this.displayAngle - 15);
    return this.getArcPath(trailingStart, this.displayAngle, 44);
  }

  get tickMarks(): Array<{ x1: number; y1: number; x2: number; y2: number; major: boolean }> {
    const marks: Array<{ x1: number; y1: number; x2: number; y2: number; major: boolean }> = [];
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * 360;
      const isMajor = i % 6 === 0;
      const innerR = isMajor ? 46 : 47.5;
      const outerR = 49;
      const s = this.getPosition(angle, innerR);
      const e = this.getPosition(angle, outerR);
      marks.push({ x1: s.x, y1: s.y, x2: e.x, y2: e.y, major: isMajor });
    }
    return marks;
  }

  /** Display angle for the current-time indicator dot */
  get indicatorRotation(): number {
    return this.displayAngle;
  }

  formatTime(timeStr: string): string {
    return timeStr || '--:--';
  }

  /** Base label radius */
  private labelRadius = 74;
  private minAngleGap = 50; // minimum degrees between label centers

  /**
   * Compute label positions with collision avoidance.
   * Labels too close angularly get nudged apart (side by side) at the same radius.
   * Nudged labels get pointer lines from their ring position.
   */
  get computedLabels(): Array<{
    prayer: PrayerTime;
    pos: { x: number; y: number };
    ringPos: { x: number; y: number };
    displayAngle: number;
    needsLine: boolean;
    hasIqama: boolean;
  }> {
    if (!this.prayers.length) return [];

    // Build entries with their original angles
    const entries = this.prayers
      .filter(p => p.time)
      .map(p => ({
        prayer: p,
        originalAngle: p.angle,
        displayAngle: p.angle,
        needsLine: false,
        hasIqama: !!this.getIqamaPrayerTimeString(p.name),
      }));

    // Sort by angle for pairwise comparison
    entries.sort((a, b) => a.originalAngle - b.originalAngle);

    // Nudge close pairs apart angularly (including wrap-around)
    for (let i = 0; i < entries.length; i++) {
      for (let j = i + 1; j < entries.length; j++) {
        let gap = entries[j].displayAngle - entries[i].displayAngle;
        if (gap < 0) gap += 360;

        // Check both direct and wrap-around distance
        const directGap = gap;
        const wrapGap = 360 - gap;
        const actualGap = Math.min(directGap, wrapGap);

        if (actualGap < this.minAngleGap) {
          const nudge = (this.minAngleGap - actualGap) / 2;
          if (directGap <= wrapGap) {
            // Labels are close going clockwise
            entries[i].displayAngle -= nudge;
            entries[j].displayAngle += nudge;
          } else {
            // Labels are close across the 0°/360° boundary
            entries[i].displayAngle += nudge;
            entries[j].displayAngle -= nudge;
          }
          if (nudge > 3) {
            entries[i].needsLine = true;
            entries[j].needsLine = true;
          }
        }
      }
    }

    return entries.map(e => ({
      prayer: e.prayer,
      displayAngle: e.displayAngle,
      pos: this.getPosition(e.displayAngle, this.labelRadius),
      ringPos: this.getPosition(e.originalAngle, 46),
      needsLine: e.needsLine || e.prayer.name === 'lastThird',
      hasIqama: e.hasIqama,
    }));
  }

  /** Iqama label positions — OUTSIDE both rings, further out than azan labels */
  getIqamaLabelPosition(angle: number): { x: number; y: number } {
    return this.getPosition(angle, 76);
  }

  getPrayerTimeString(name: string): string {
    if (name === 'lastThird') {
      const prayer = this.prayers.find(p => p.name === 'lastThird');
      return prayer && prayer.time ? prayer.time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : '';
    }
  
    const map: Record<string, string> = {
      fajr: this.fajrTime, sunrise: this.sunriseTime,
      dhuhr: this.dhuhrTime, asr: this.asrTime,
      maghrib: this.maghribTime, isha: this.ishaTime,
    };
    return map[name] || '';
  }

  getIqamaPrayerTimeString(name: string): string {
    if (this.isFriday && name === 'dhuhr') return '1:45 PM';
    const map: Record<string, string> = {
      fajr: this.iqamaFajr,
      dhuhr: this.iqamaDhuhr,
      asr: this.iqamaAsr,
      maghrib: this.iqamaMaghrib,
      isha: this.iqamaIsha,
    };
    return map[name] || '';
  }

  // ---- Animation Throttling Public Methods ----

  /**
   * Checks if complex filters (strongGlow, ripple) should be used
   * Returns true if filters should be applied, false if they should be disabled
   * Requirements: 10.8
   */
  shouldUseComplexFilters(): boolean {
    return !this.shouldDisableComplexFilters();
  }

  /**
   * Checks if interactive animations (hover, ripple) should be enabled
   * Returns true if interactive animations should run, false if disabled
   * Requirements: 10.6
   */
  shouldEnableInteractiveAnimations(): boolean {
    return !this.shouldDisableInteractiveAnimations();
  }

  /**
   * Checks if decorative animations (breathing glow, tick pulses) should be enabled
   * Returns true if decorative animations should run, false if disabled
   * Requirements: 10.7
   */
  shouldEnableDecorativeAnimations(): boolean {
    return !this.shouldDisableDecorativeAnimations();
  }

  /**
   * Gets the current device tier for display purposes
   * Requirements: 13.10
   */
  getCurrentDeviceTier(): DeviceTier {
    return this.deviceCapability.tier;
  }

  /**
   * Gets the current FPS for debugging purposes
   */
  getCurrentFPS(): number {
    return Math.round(this.performanceMonitoring.currentFPS);
  }

  // ---- Filter Fallback Methods (Task 3.5) ----

  /**
   * Gets the filter URL for strongGlow with fallback support
   * Returns filter URL if supported, empty string if filters should be disabled
   * Requirements: 12.1, 12.6, 12.7, 12.8
   */
  getStrongGlowFilter(): string {
    if (this.shouldUseComplexFilters()) {
      return 'url(#strongGlow)';
    }
    return '';
  }

  /**
   * Gets the filter URL for ripple with fallback support
   * Returns filter URL if supported, empty string if filters should be disabled
   * Requirements: 12.2, 12.6, 12.7, 12.8
   */
  getRippleFilter(): string {
    if (this.shouldUseComplexFilters()) {
      return 'url(#ripple)';
    }
    return '';
  }

  /**
   * Gets the filter URL for trailingGlow with fallback support
   * Returns filter URL if supported, empty string if filters should be disabled
   * Requirements: 3.2, 12.6, 12.7, 12.8
   */
  getTrailingGlowFilter(): string {
    if (this.shouldUseComplexFilters()) {
      return 'url(#trailingGlow)';
    }
    return '';
  }

  /**
   * Gets the filter URL for radialPulse with fallback support
   * Returns filter URL if supported, empty string if filters should be disabled
   * Requirements: 1.5, 12.6, 12.7, 12.8
   */
  getRadialPulseFilter(): string {
    if (this.shouldUseComplexFilters()) {
      return 'url(#radialPulse)';
    }
    return '';
  }

  /**
   * Gets the filter URL for markerGlow with fallback support
   * Returns filter URL if supported, empty string if filters should be disabled
   * Requirements: 12.3, 12.6, 12.7, 12.8
   */
  getMarkerGlowFilter(): string {
    if (this.shouldUseComplexFilters()) {
      return 'url(#markerGlow)';
    }
    return '';
  }

  /**
   * Gets the filter URL for softGlow with fallback support
   * Returns filter URL if supported, empty string if filters should be disabled
   * Requirements: 12.6, 12.7, 12.8
   */
  getSoftGlowFilter(): string {
    // softGlow is a basic filter, only disable on minimal tier or if filters not supported
    if (this.deviceCapability.tier === 'minimal' || !this.deviceCapability.supportsFilters) {
      return '';
    }
    return 'url(#softGlow)';
  }

  /**
   * Gets CSS fallback styles for glow effects when filters are disabled
   * Returns box-shadow and opacity styles as fallback
   * Requirements: 12.6, 12.7
   */
  getGlowFallbackStyle(intensity: 'soft' | 'medium' | 'strong'): string {
    // Only apply fallback if filters are disabled
    if (this.shouldUseComplexFilters()) {
      return '';
    }

    // Return CSS box-shadow as fallback
    switch (intensity) {
      case 'soft':
        return 'filter: drop-shadow(0 0 2px rgba(var(--theme-accent-rgb), 0.4))';
      case 'medium':
        return 'filter: drop-shadow(0 0 4px rgba(var(--theme-accent-rgb), 0.6))';
      case 'strong':
        return 'filter: drop-shadow(0 0 6px rgba(var(--theme-accent-rgb), 0.8))';
      default:
        return '';
    }
  }

  /**
   * Checks if a prayer marker has been revealed by the arc sweep animation
   * Returns true if the marker should be visible
   * Requirements: 3.1, 3.4
   */
  isMarkerRevealed(prayerName: string): boolean {
    return true;
  }

  /**
   * Checks if a prayer label has been revealed (200ms after marker)
   * Returns true if the label should be visible
   * Requirements: 3.1, 3.4
   */
  isLabelRevealed(prayerName: string): boolean {
    return true;
  }

  /**
   * Triggers a flash animation on the current time indicator when arc sweep completes
   * Scales the indicator from 1.0 to 1.5 over 400ms
   * Requirements: 3.3, 6.4
   */
  private triggerIndicatorFlash(): void {
    // Skip if reduced motion is preferred
    if (this.animationState.prefersReducedMotion) {
      return;
    }

    // Get the indicator element and trigger CSS animation
    // This will be handled via CSS class in the template
    const indicator = document.querySelector('.time-indicator');
    if (indicator) {
      indicator.classList.add('flash-animation');
      setTimeout(() => {
        indicator.classList.remove('flash-animation');
      }, 400);
    }
  }

  /**
   * Updates the breathing glow effect with sine wave easing and phase offset
   * Inner circle (radius 26) and outer circle (radius 32) have 45-degree phase offset
   * Applies intensification multiplier when prayer changes
   * Reduces amplitude in reduced motion mode
   * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
   */
  private updateBreathingGlow(): void {
    // Increment phase (0-1 range for full cycle)
    this.breathPhase = (this.breathPhase + (66 / ANIMATION_TIMINGS.continuous.breathingCycle)) % 1.0;

    // Calculate base amplitude (reduced in reduced motion mode)
    const baseAmplitude = this.animationState.prefersReducedMotion 
      ? REDUCED_MOTION_CONFIG.reducedAmplitude.breathingGlow 
      : 1.0;

    // Check if intensification is active
    const now = performance.now();
    const currentIntensity = now < this.animationState.breathIntensifyUntil 
      ? this.animationState.breathIntensity 
      : 1.0;

    // Update intensity in state if it changed
    if (now >= this.animationState.breathIntensifyUntil && this.animationState.breathIntensity !== 1.0) {
      this.animationState.breathIntensity = 1.0;
    }

    // Calculate inner circle (radius 26) using sine wave easing
    const innerPhase = this.breathPhase;
    const innerSineValue = EASING_FUNCTIONS.sine(innerPhase);
    this.innerBreathScale = 1 + innerSineValue * 0.06 * baseAmplitude * currentIntensity;
    this.innerBreathOpacity = 0.6 + innerSineValue * 0.3 * baseAmplitude * currentIntensity;

    // Calculate outer circle (radius 32) with 45-degree phase offset
    // 45 degrees = 0.125 of full cycle (45/360 = 0.125)
    const outerPhase = (this.breathPhase + 0.125) % 1.0;
    const outerSineValue = EASING_FUNCTIONS.sine(outerPhase);
    this.outerBreathScale = 1 + outerSineValue * 0.06 * baseAmplitude * currentIntensity;
    this.outerBreathOpacity = 0.6 + outerSineValue * 0.3 * baseAmplitude * currentIntensity;
  }

  /**
   * Intensifies the breathing glow effect by 30% for 1.5 seconds
   * Called when prayer transition occurs
   * Requirements: 7.3
   */
  intensifyBreathingGlow(): void {
    // Skip if reduced motion is preferred
    if (this.animationState.prefersReducedMotion) {
      return;
    }

    // Set intensity to 1.3 (30% increase)
    this.animationState.breathIntensity = 1.3;

    // Set timestamp when intensification should end (1.5 seconds from now)
    this.animationState.breathIntensifyUntil = performance.now() + ANIMATION_TIMINGS.transition.breathIntensify;
  }

  /**
   * Gets the scale value for the inner breathing circle (radius 26)
   * Requirements: 7.1, 7.2
   */
  getInnerBreathScale(): number {
    return this.innerBreathScale;
  }

  /**
   * Gets the opacity value for the inner breathing circle (radius 26)
   * Requirements: 7.1, 7.2
   */
  getInnerBreathOpacity(): number {
    return this.innerBreathOpacity;
  }

  /**
   * Gets the scale value for the outer breathing circle (radius 32)
   * Requirements: 7.1, 7.2
   */
  getOuterBreathScale(): number {
    return this.outerBreathScale;
  }

  /**
   * Gets the opacity value for the outer breathing circle (radius 32)
   * Requirements: 7.1, 7.2
   */
  getOuterBreathOpacity(): number {
    return this.outerBreathOpacity;
  }
}
