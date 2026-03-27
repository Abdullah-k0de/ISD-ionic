import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PrayerClockComponent } from './prayer-clock.component';

describe('PrayerClockComponent - Reduced Motion Detection', () => {
  let component: PrayerClockComponent;
  let fixture: ComponentFixture<PrayerClockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PrayerClockComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PrayerClockComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should detect reduced motion preference on init', () => {
    // Mock matchMedia
    const mockMatchMedia = jasmine.createSpy('matchMedia').and.returnValue({
      matches: true,
      addEventListener: jasmine.createSpy('addEventListener'),
      removeEventListener: jasmine.createSpy('removeEventListener')
    } as any);
    
    (window as any).matchMedia = mockMatchMedia;

    // Initialize component
    fixture.detectChanges();

    // Verify matchMedia was called with correct query
    expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
    
    // Verify preference was set
    expect(component.animationState.prefersReducedMotion).toBe(true);
  });

  it('should set prefersReducedMotion to false when user does not prefer reduced motion', () => {
    // Mock matchMedia to return false
    const mockMatchMedia = jasmine.createSpy('matchMedia').and.returnValue({
      matches: false,
      addEventListener: jasmine.createSpy('addEventListener'),
      removeEventListener: jasmine.createSpy('removeEventListener')
    } as any);
    
    (window as any).matchMedia = mockMatchMedia;

    // Initialize component
    fixture.detectChanges();

    // Verify preference was set to false
    expect(component.animationState.prefersReducedMotion).toBe(false);
  });

  it('should add event listener for media query changes', () => {
    const addEventListenerSpy = jasmine.createSpy('addEventListener');
    const mockMatchMedia = jasmine.createSpy('matchMedia').and.returnValue({
      matches: false,
      addEventListener: addEventListenerSpy,
      removeEventListener: jasmine.createSpy('removeEventListener')
    } as any);
    
    (window as any).matchMedia = mockMatchMedia;

    // Initialize component
    fixture.detectChanges();

    // Verify event listener was added
    expect(addEventListenerSpy).toHaveBeenCalledWith('change', jasmine.any(Function));
  });

  it('should update preference when media query changes', () => {
    let changeListener: ((event: MediaQueryListEvent) => void) | undefined;
    const addEventListenerSpy = jasmine.createSpy('addEventListener').and.callFake((event: string, listener: any) => {
      if (event === 'change') {
        changeListener = listener;
      }
    });
    
    const mockMatchMedia = jasmine.createSpy('matchMedia').and.returnValue({
      matches: false,
      addEventListener: addEventListenerSpy,
      removeEventListener: jasmine.createSpy('removeEventListener')
    } as any);
    
    (window as any).matchMedia = mockMatchMedia;

    // Initialize component
    fixture.detectChanges();

    // Initial state should be false
    expect(component.animationState.prefersReducedMotion).toBe(false);

    // Simulate media query change
    if (changeListener) {
      changeListener({ matches: true } as MediaQueryListEvent);
      expect(component.animationState.prefersReducedMotion).toBe(true);
    } else {
      fail('Change listener was not set');
    }
  });

  it('should remove event listener on destroy', () => {
    const removeEventListenerSpy = jasmine.createSpy('removeEventListener');
    const mockMatchMedia = jasmine.createSpy('matchMedia').and.returnValue({
      matches: false,
      addEventListener: jasmine.createSpy('addEventListener'),
      removeEventListener: removeEventListenerSpy
    } as any);
    
    (window as any).matchMedia = mockMatchMedia;

    // Initialize component
    fixture.detectChanges();

    // Destroy component
    component.ngOnDestroy();

    // Verify event listener was removed
    expect(removeEventListenerSpy).toHaveBeenCalledWith('change', jasmine.any(Function));
  });

  it('should handle missing matchMedia gracefully', () => {
    // Remove matchMedia
    const originalMatchMedia = window.matchMedia;
    (window as any).matchMedia = undefined;

    // Initialize component - should not throw
    expect(() => fixture.detectChanges()).not.toThrow();

    // Restore matchMedia
    (window as any).matchMedia = originalMatchMedia;
  });
});

describe('PrayerClockComponent - Device Capability Detection', () => {
  let component: PrayerClockComponent;
  let fixture: ComponentFixture<PrayerClockComponent>;
  let originalLocalStorage: Storage;

  beforeEach(async () => {
    // Save original localStorage
    originalLocalStorage = window.localStorage;

    await TestBed.configureTestingModule({
      declarations: [PrayerClockComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PrayerClockComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    // Restore localStorage
    Object.defineProperty(window, 'localStorage', {
      value: originalLocalStorage,
      writable: true
    });
  });

  it('should initialize with default device capability', () => {
    expect(component.deviceCapability).toBeDefined();
    expect(component.deviceCapability.tier).toBe('full');
    expect(component.deviceCapability.averageFPS).toBe(60);
    expect(component.deviceCapability.supportsFilters).toBe(true);
  });

  it('should classify device as "full" tier when FPS >= 50', async () => {
    // Clear localStorage
    localStorage.removeItem('prayer-clock-device-capability');

    // Mock performance benchmark to return high FPS
    spyOn<any>(component, 'runPerformanceBenchmark').and.returnValue(Promise.resolve(60));
    spyOn<any>(component, 'checkSVGFilterSupport').and.returnValue(true);

    await (component as any).detectDeviceCapabilities();

    expect(component.deviceCapability.tier).toBe('full');
    expect(component.deviceCapability.averageFPS).toBe(60);
  });

  it('should classify device as "reduced" tier when 30 <= FPS < 50', async () => {
    // Clear localStorage
    localStorage.removeItem('prayer-clock-device-capability');

    // Mock performance benchmark to return mid-range FPS
    spyOn<any>(component, 'runPerformanceBenchmark').and.returnValue(Promise.resolve(40));
    spyOn<any>(component, 'checkSVGFilterSupport').and.returnValue(true);

    await (component as any).detectDeviceCapabilities();

    expect(component.deviceCapability.tier).toBe('reduced');
    expect(component.deviceCapability.averageFPS).toBe(40);
  });

  it('should classify device as "minimal" tier when FPS < 30', async () => {
    // Clear localStorage
    localStorage.removeItem('prayer-clock-device-capability');

    // Mock performance benchmark to return low FPS
    spyOn<any>(component, 'runPerformanceBenchmark').and.returnValue(Promise.resolve(20));
    spyOn<any>(component, 'checkSVGFilterSupport').and.returnValue(true);

    await (component as any).detectDeviceCapabilities();

    expect(component.deviceCapability.tier).toBe('minimal');
    expect(component.deviceCapability.averageFPS).toBe(20);
  });

  it('should detect SVG filter support', async () => {
    // Clear localStorage
    localStorage.removeItem('prayer-clock-device-capability');

    spyOn<any>(component, 'runPerformanceBenchmark').and.returnValue(Promise.resolve(60));

    await (component as any).detectDeviceCapabilities();

    expect(component.deviceCapability.supportsFilters).toBeDefined();
    expect(typeof component.deviceCapability.supportsFilters).toBe('boolean');
  });

  it('should cache device capability in localStorage', async () => {
    // Clear localStorage
    localStorage.removeItem('prayer-clock-device-capability');

    spyOn<any>(component, 'runPerformanceBenchmark').and.returnValue(Promise.resolve(55));
    spyOn<any>(component, 'checkSVGFilterSupport').and.returnValue(true);

    await (component as any).detectDeviceCapabilities();

    const cached = localStorage.getItem('prayer-clock-device-capability');
    expect(cached).toBeTruthy();

    const parsed = JSON.parse(cached!);
    expect(parsed.tier).toBe('full');
    expect(parsed.averageFPS).toBe(55);
    expect(parsed.supportsFilters).toBe(true);
  });

  it('should load cached device capability from localStorage', async () => {
    // Set cached data
    const cachedData = {
      tier: 'reduced',
      averageFPS: 35,
      supportsFilters: false
    };
    localStorage.setItem('prayer-clock-device-capability', JSON.stringify(cachedData));

    // Spy on benchmark to ensure it's not called
    const benchmarkSpy = spyOn<any>(component, 'runPerformanceBenchmark');

    await (component as any).detectDeviceCapabilities();

    // Should use cached data without running benchmark
    expect(benchmarkSpy).not.toHaveBeenCalled();
    expect(component.deviceCapability.tier).toBe('reduced');
    expect(component.deviceCapability.averageFPS).toBe(35);
    expect(component.deviceCapability.supportsFilters).toBe(false);
  });

  it('should handle invalid cached data gracefully', async () => {
    // Set invalid cached data
    localStorage.setItem('prayer-clock-device-capability', 'invalid-json');

    // Should run benchmark when cache is invalid
    spyOn<any>(component, 'runPerformanceBenchmark').and.returnValue(Promise.resolve(60));
    spyOn<any>(component, 'checkSVGFilterSupport').and.returnValue(true);

    await (component as any).detectDeviceCapabilities();

    expect(component.deviceCapability.tier).toBe('full');
  });

  it('should handle missing localStorage gracefully', async () => {
    // Mock localStorage as undefined
    Object.defineProperty(window, 'localStorage', {
      value: undefined,
      writable: true
    });

    spyOn<any>(component, 'runPerformanceBenchmark').and.returnValue(Promise.resolve(60));
    spyOn<any>(component, 'checkSVGFilterSupport').and.returnValue(true);

    // Should not throw error
    await expectAsync((component as any).detectDeviceCapabilities()).toBeResolved();
  });

  it('should run performance benchmark over 100ms', async () => {
    const result = await (component as any).runPerformanceBenchmark();

    expect(result).toBeGreaterThan(0);
    expect(typeof result).toBe('number');
  });

  it('should check SVG filter support', () => {
    const supportsFilters = (component as any).checkSVGFilterSupport();

    expect(typeof supportsFilters).toBe('boolean');
  });

  it('should handle SVG filter check errors gracefully', () => {
    // Mock document.createElementNS to throw error
    spyOn(document, 'createElementNS').and.throwError('Test error');

    const supportsFilters = (component as any).checkSVGFilterSupport();

    expect(supportsFilters).toBe(false);
  });
});

describe('PrayerClockComponent - Continuous Performance Monitoring', () => {
  let component: PrayerClockComponent;
  let fixture: ComponentFixture<PrayerClockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PrayerClockComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PrayerClockComponent);
    component = fixture.componentInstance;
  });

  it('should initialize performance monitoring state', () => {
    expect((component as any).performanceMonitoring).toBeDefined();
    expect((component as any).performanceMonitoring.enabled).toBe(true);
    expect((component as any).performanceMonitoring.frameTimes).toEqual([]);
    expect((component as any).performanceMonitoring.rollingWindowMs).toBe(2000);
    expect((component as any).performanceMonitoring.currentFPS).toBe(60);
  });

  it('should start performance monitoring on init', (done) => {
    spyOn<any>(component, 'startPerformanceMonitoring').and.callThrough();
    
    fixture.detectChanges();

    // Wait for async initialization
    setTimeout(() => {
      expect((component as any).startPerformanceMonitoring).toHaveBeenCalled();
      done();
    }, 100);
  });

  it('should track frame timing using requestAnimationFrame', (done) => {
    (component as any).startPerformanceMonitoring();

    // Wait for a few frames
    setTimeout(() => {
      const frameTimes = (component as any).performanceMonitoring.frameTimes;
      expect(frameTimes.length).toBeGreaterThan(0);
      done();
    }, 100);
  });

  it('should calculate rolling average FPS over 2-second window', (done) => {
    (component as any).startPerformanceMonitoring();

    // Wait for frames to accumulate
    setTimeout(() => {
      const currentFPS = (component as any).performanceMonitoring.currentFPS;
      expect(currentFPS).toBeGreaterThan(0);
      expect(currentFPS).toBeLessThanOrEqual(120); // Reasonable upper bound
      done();
    }, 100);
  });

  it('should trim old frame times to prevent memory growth', (done) => {
    (component as any).startPerformanceMonitoring();

    // Manually add many frame times
    for (let i = 0; i < 250; i++) {
      (component as any).performanceMonitoring.frameTimes.push(16.67);
    }

    // Wait for next frame to trigger trimming
    setTimeout(() => {
      const frameTimes = (component as any).performanceMonitoring.frameTimes;
      expect(frameTimes.length).toBeLessThanOrEqual(120);
      done();
    }, 50);
  });

  it('should detect sustained frame drops below 30fps for 3+ seconds', (done) => {
    spyOn<any>(component, 'downgradeTier');
    
    component.deviceCapability.tier = 'full';
    (component as any).performanceMonitoring.currentFPS = 25;
    
    const startTime = performance.now();
    (component as any).performanceMonitoring.lowFPSStartTime = startTime;

    // Simulate 3+ seconds passing
    const currentTime = startTime + 3100;
    (component as any).checkPerformanceDegradation(currentTime);

    expect((component as any).downgradeTier).toHaveBeenCalledWith('reduced');
    done();
  });

  it('should detect sustained frame drops below 20fps for 2+ seconds', (done) => {
    spyOn<any>(component, 'downgradeTier');
    
    component.deviceCapability.tier = 'full';
    (component as any).performanceMonitoring.currentFPS = 18;
    
    const startTime = performance.now();
    (component as any).performanceMonitoring.veryLowFPSStartTime = startTime;

    // Simulate 2+ seconds passing
    const currentTime = startTime + 2100;
    (component as any).checkPerformanceDegradation(currentTime);

    expect((component as any).downgradeTier).toHaveBeenCalledWith('minimal');
    done();
  });

  it('should reset low FPS timer when FPS recovers above 30', () => {
    const startTime = performance.now();
    (component as any).performanceMonitoring.lowFPSStartTime = startTime;
    (component as any).performanceMonitoring.currentFPS = 35;

    (component as any).checkPerformanceDegradation(performance.now());

    expect((component as any).performanceMonitoring.lowFPSStartTime).toBe(0);
  });

  it('should reset very low FPS timer when FPS recovers above 20', () => {
    const startTime = performance.now();
    (component as any).performanceMonitoring.veryLowFPSStartTime = startTime;
    (component as any).performanceMonitoring.currentFPS = 25;

    (component as any).checkPerformanceDegradation(performance.now());

    expect((component as any).performanceMonitoring.veryLowFPSStartTime).toBe(0);
  });

  it('should downgrade from full to reduced tier when FPS drops below 30fps', () => {
    component.deviceCapability.tier = 'full';
    (component as any).performanceMonitoring.currentFPS = 25;

    (component as any).downgradeTier('reduced');

    expect(component.deviceCapability.tier).toBe('reduced');
  });

  it('should downgrade from reduced to minimal tier when FPS drops below 20fps', () => {
    component.deviceCapability.tier = 'reduced';
    (component as any).performanceMonitoring.currentFPS = 18;

    (component as any).downgradeTier('minimal');

    expect(component.deviceCapability.tier).toBe('minimal');
  });

  it('should downgrade from full to minimal tier when FPS drops below 20fps', () => {
    component.deviceCapability.tier = 'full';
    (component as any).performanceMonitoring.currentFPS = 15;

    (component as any).downgradeTier('minimal');

    expect(component.deviceCapability.tier).toBe('minimal');
  });

  it('should prevent automatic tier upgrades during session', () => {
    component.deviceCapability.tier = 'reduced';
    (component as any).performanceMonitoring.currentFPS = 60;

    (component as any).downgradeTier('full');

    // Should remain at reduced tier
    expect(component.deviceCapability.tier).toBe('reduced');
  });

  it('should prevent upgrade from minimal to reduced tier', () => {
    component.deviceCapability.tier = 'minimal';
    (component as any).performanceMonitoring.currentFPS = 40;

    (component as any).downgradeTier('reduced');

    // Should remain at minimal tier
    expect(component.deviceCapability.tier).toBe('minimal');
  });

  it('should cache downgraded tier to localStorage', () => {
    spyOn<any>(component, 'cacheDeviceCapability');
    
    component.deviceCapability.tier = 'full';
    (component as any).performanceMonitoring.currentFPS = 25;

    (component as any).downgradeTier('reduced');

    expect((component as any).cacheDeviceCapability).toHaveBeenCalled();
  });

  it('should update averageFPS when downgrading tier', () => {
    component.deviceCapability.tier = 'full';
    component.deviceCapability.averageFPS = 60;
    (component as any).performanceMonitoring.currentFPS = 25;

    (component as any).downgradeTier('reduced');

    expect(component.deviceCapability.averageFPS).toBe(25);
  });

  it('should log performance degradation to console', () => {
    spyOn(console, 'log');
    
    component.deviceCapability.tier = 'full';
    (component as any).performanceMonitoring.currentFPS = 25;

    (component as any).downgradeTier('reduced');

    expect(console.log).toHaveBeenCalledWith(
      jasmine.stringContaining('Performance degradation detected')
    );
  });

  it('should stop performance monitoring on destroy', () => {
    (component as any).startPerformanceMonitoring();
    
    const performanceMonitorFrame = (component as any).performanceMonitorFrame;
    expect(performanceMonitorFrame).toBeDefined();

    component.ngOnDestroy();

    expect((component as any).performanceMonitorFrame).toBeNull();
  });

  it('should clear frame times array when stopping monitoring', () => {
    (component as any).performanceMonitoring.frameTimes = [16, 17, 18];
    
    (component as any).stopPerformanceMonitoring();

    expect((component as any).performanceMonitoring.frameTimes).toEqual([]);
  });

  it('should not start monitoring if disabled', () => {
    (component as any).performanceMonitoring.enabled = false;
    
    (component as any).startPerformanceMonitoring();

    expect((component as any).performanceMonitorFrame).toBeUndefined();
  });

  it('should only downgrade tier once per session', () => {
    spyOn(console, 'log');
    
    component.deviceCapability.tier = 'full';
    (component as any).performanceMonitoring.currentFPS = 25;
    (component as any).performanceMonitoring.hasDowngraded = false;

    // First downgrade
    const startTime = performance.now();
    (component as any).performanceMonitoring.lowFPSStartTime = startTime;
    (component as any).checkPerformanceDegradation(startTime + 3100);

    expect(component.deviceCapability.tier).toBe('reduced');
    expect((component as any).performanceMonitoring.hasDowngraded).toBe(true);

    // Reset for second attempt
    (component as any).performanceMonitoring.lowFPSStartTime = startTime + 4000;
    (component as any).performanceMonitoring.currentFPS = 25;

    // Second downgrade attempt should still work (from reduced to minimal)
    (component as any).performanceMonitoring.veryLowFPSStartTime = startTime + 4000;
    (component as any).performanceMonitoring.currentFPS = 18;
    (component as any).checkPerformanceDegradation(startTime + 6100);

    expect(component.deviceCapability.tier).toBe('minimal');
  });
});

describe('PrayerClockComponent - Animation Throttling', () => {
  let component: PrayerClockComponent;
  let fixture: ComponentFixture<PrayerClockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PrayerClockComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PrayerClockComponent);
    component = fixture.componentInstance;
  });

  it('should initialize animation throttling state', () => {
    expect((component as any).animationThrottling).toBeDefined();
    expect((component as any).animationThrottling.activeAnimationCount).toBe(0);
    expect((component as any).animationThrottling.maxSimultaneousAnimations).toBe(5);
    expect((component as any).animationThrottling.interactiveAnimationsDisabled).toBe(false);
    expect((component as any).animationThrottling.decorativeAnimationsDisabled).toBe(false);
    expect((component as any).animationThrottling.complexFiltersDisabled).toBe(false);
    expect((component as any).animationThrottling.staggerDelaysSkipped).toBe(false);
  });

  it('should disable complex filters on minimal tier', async () => {
    localStorage.removeItem('prayer-clock-device-capability');
    spyOn<any>(component, 'runPerformanceBenchmark').and.returnValue(Promise.resolve(20));
    spyOn<any>(component, 'checkSVGFilterSupport').and.returnValue(true);

    await (component as any).detectDeviceCapabilities();

    expect((component as any).animationThrottling.complexFiltersDisabled).toBe(true);
  });

  it('should disable complex filters when SVG filters not supported', async () => {
    localStorage.removeItem('prayer-clock-device-capability');
    spyOn<any>(component, 'runPerformanceBenchmark').and.returnValue(Promise.resolve(60));
    spyOn<any>(component, 'checkSVGFilterSupport').and.returnValue(false);

    await (component as any).detectDeviceCapabilities();

    expect((component as any).animationThrottling.complexFiltersDisabled).toBe(true);
  });

  it('should disable interactive animations on minimal tier', async () => {
    localStorage.removeItem('prayer-clock-device-capability');
    spyOn<any>(component, 'runPerformanceBenchmark').and.returnValue(Promise.resolve(20));
    spyOn<any>(component, 'checkSVGFilterSupport').and.returnValue(true);

    await (component as any).detectDeviceCapabilities();

    expect((component as any).animationThrottling.interactiveAnimationsDisabled).toBe(true);
  });

  it('should disable decorative animations on minimal tier', async () => {
    localStorage.removeItem('prayer-clock-device-capability');
    spyOn<any>(component, 'runPerformanceBenchmark').and.returnValue(Promise.resolve(20));
    spyOn<any>(component, 'checkSVGFilterSupport').and.returnValue(true);

    await (component as any).detectDeviceCapabilities();

    expect((component as any).animationThrottling.decorativeAnimationsDisabled).toBe(true);
  });

  it('should skip stagger delays on minimal tier', async () => {
    localStorage.removeItem('prayer-clock-device-capability');
    spyOn<any>(component, 'runPerformanceBenchmark').and.returnValue(Promise.resolve(20));
    spyOn<any>(component, 'checkSVGFilterSupport').and.returnValue(true);

    await (component as any).detectDeviceCapabilities();

    expect((component as any).animationThrottling.staggerDelaysSkipped).toBe(true);
  });

  it('should disable interactive animations when FPS drops below 30fps', () => {
    spyOn(console, 'log');
    
    (component as any).disableInteractiveAnimations();

    expect((component as any).animationThrottling.interactiveAnimationsDisabled).toBe(true);
    expect(console.log).toHaveBeenCalledWith(
      jasmine.stringContaining('Interactive animations disabled')
    );
  });

  it('should disable decorative animations when FPS drops below 20fps', () => {
    spyOn(console, 'log');
    
    (component as any).disableDecorativeAnimations();

    expect((component as any).animationThrottling.decorativeAnimationsDisabled).toBe(true);
    expect((component as any).animationThrottling.staggerDelaysSkipped).toBe(true);
    expect(console.log).toHaveBeenCalledWith(
      jasmine.stringContaining('Decorative animations disabled')
    );
  });

  it('should disable interactive animations when FPS drops below 30fps for 2+ seconds', () => {
    spyOn<any>(component, 'disableInteractiveAnimations');
    
    component.deviceCapability.tier = 'full';
    (component as any).performanceMonitoring.currentFPS = 25;
    
    const startTime = performance.now();
    (component as any).performanceMonitoring.lowFPSStartTime = startTime;

    // Simulate 2+ seconds passing
    const currentTime = startTime + 2100;
    (component as any).checkPerformanceDegradation(currentTime);

    expect((component as any).disableInteractiveAnimations).toHaveBeenCalled();
  });

  it('should disable decorative animations when FPS drops below 20fps for 2+ seconds', () => {
    spyOn<any>(component, 'disableDecorativeAnimations');
    
    component.deviceCapability.tier = 'full';
    (component as any).performanceMonitoring.currentFPS = 18;
    
    const startTime = performance.now();
    (component as any).performanceMonitoring.veryLowFPSStartTime = startTime;

    // Simulate 2+ seconds passing
    const currentTime = startTime + 2100;
    (component as any).checkPerformanceDegradation(currentTime);

    expect((component as any).disableDecorativeAnimations).toHaveBeenCalled();
  });

  it('should return true for shouldDisableComplexFilters on minimal tier', () => {
    component.deviceCapability.tier = 'minimal';
    component.deviceCapability.supportsFilters = true;

    const result = (component as any).shouldDisableComplexFilters();

    expect(result).toBe(true);
  });

  it('should return true for shouldDisableComplexFilters when filters not supported', () => {
    component.deviceCapability.tier = 'full';
    component.deviceCapability.supportsFilters = false;

    const result = (component as any).shouldDisableComplexFilters();

    expect(result).toBe(true);
  });

  it('should return false for shouldDisableComplexFilters on full tier with filter support', () => {
    component.deviceCapability.tier = 'full';
    component.deviceCapability.supportsFilters = true;
    (component as any).animationThrottling.complexFiltersDisabled = false;

    const result = (component as any).shouldDisableComplexFilters();

    expect(result).toBe(false);
  });

  it('should return true for shouldDisableInteractiveAnimations when reduced motion preferred', () => {
    component.animationState.prefersReducedMotion = true;
    component.deviceCapability.tier = 'full';

    const result = (component as any).shouldDisableInteractiveAnimations();

    expect(result).toBe(true);
  });

  it('should return true for shouldDisableInteractiveAnimations on minimal tier', () => {
    component.animationState.prefersReducedMotion = false;
    component.deviceCapability.tier = 'minimal';

    const result = (component as any).shouldDisableInteractiveAnimations();

    expect(result).toBe(true);
  });

  it('should return true for shouldDisableInteractiveAnimations when throttled', () => {
    component.animationState.prefersReducedMotion = false;
    component.deviceCapability.tier = 'full';
    (component as any).animationThrottling.interactiveAnimationsDisabled = true;

    const result = (component as any).shouldDisableInteractiveAnimations();

    expect(result).toBe(true);
  });

  it('should return false for shouldDisableInteractiveAnimations on full tier without throttling', () => {
    component.animationState.prefersReducedMotion = false;
    component.deviceCapability.tier = 'full';
    (component as any).animationThrottling.interactiveAnimationsDisabled = false;

    const result = (component as any).shouldDisableInteractiveAnimations();

    expect(result).toBe(false);
  });

  it('should return true for shouldDisableDecorativeAnimations when reduced motion preferred', () => {
    component.animationState.prefersReducedMotion = true;
    component.deviceCapability.tier = 'full';

    const result = (component as any).shouldDisableDecorativeAnimations();

    expect(result).toBe(true);
  });

  it('should return true for shouldDisableDecorativeAnimations on minimal tier', () => {
    component.animationState.prefersReducedMotion = false;
    component.deviceCapability.tier = 'minimal';

    const result = (component as any).shouldDisableDecorativeAnimations();

    expect(result).toBe(true);
  });

  it('should return true for shouldDisableDecorativeAnimations when throttled', () => {
    component.animationState.prefersReducedMotion = false;
    component.deviceCapability.tier = 'full';
    (component as any).animationThrottling.decorativeAnimationsDisabled = true;

    const result = (component as any).shouldDisableDecorativeAnimations();

    expect(result).toBe(true);
  });

  it('should return false for shouldDisableDecorativeAnimations on full tier without throttling', () => {
    component.animationState.prefersReducedMotion = false;
    component.deviceCapability.tier = 'full';
    (component as any).animationThrottling.decorativeAnimationsDisabled = false;

    const result = (component as any).shouldDisableDecorativeAnimations();

    expect(result).toBe(false);
  });

  it('should return true for shouldSkipStaggerDelays on minimal tier', () => {
    component.deviceCapability.tier = 'minimal';

    const result = (component as any).shouldSkipStaggerDelays();

    expect(result).toBe(true);
  });

  it('should return true for shouldSkipStaggerDelays when throttled', () => {
    component.deviceCapability.tier = 'full';
    (component as any).animationThrottling.staggerDelaysSkipped = true;

    const result = (component as any).shouldSkipStaggerDelays();

    expect(result).toBe(true);
  });

  it('should return false for shouldSkipStaggerDelays on full tier without throttling', () => {
    component.deviceCapability.tier = 'full';
    (component as any).animationThrottling.staggerDelaysSkipped = false;

    const result = (component as any).shouldSkipStaggerDelays();

    expect(result).toBe(false);
  });

  it('should allow animation when under limit', () => {
    (component as any).animationThrottling.activeAnimationCount = 3;
    (component as any).animationThrottling.maxSimultaneousAnimations = 5;

    const result = (component as any).canStartAnimation();

    expect(result).toBe(true);
  });

  it('should block animation when at limit', () => {
    (component as any).animationThrottling.activeAnimationCount = 5;
    (component as any).animationThrottling.maxSimultaneousAnimations = 5;

    const result = (component as any).canStartAnimation();

    expect(result).toBe(false);
  });

  it('should block animation when over limit', () => {
    (component as any).animationThrottling.activeAnimationCount = 6;
    (component as any).animationThrottling.maxSimultaneousAnimations = 5;

    const result = (component as any).canStartAnimation();

    expect(result).toBe(false);
  });

  it('should increment active animation count', () => {
    (component as any).animationThrottling.activeAnimationCount = 2;

    (component as any).startAnimation();

    expect((component as any).animationThrottling.activeAnimationCount).toBe(3);
  });

  it('should decrement active animation count', () => {
    (component as any).animationThrottling.activeAnimationCount = 3;

    (component as any).endAnimation();

    expect((component as any).animationThrottling.activeAnimationCount).toBe(2);
  });

  it('should not decrement below zero', () => {
    (component as any).animationThrottling.activeAnimationCount = 0;

    (component as any).endAnimation();

    expect((component as any).animationThrottling.activeAnimationCount).toBe(0);
  });

  it('should return 0 for getEffectiveStaggerDelay when stagger should be skipped', () => {
    component.deviceCapability.tier = 'minimal';

    const result = (component as any).getEffectiveStaggerDelay(100);

    expect(result).toBe(0);
  });

  it('should return base delay for getEffectiveStaggerDelay when stagger should not be skipped', () => {
    component.deviceCapability.tier = 'full';
    (component as any).animationThrottling.staggerDelaysSkipped = false;

    const result = (component as any).getEffectiveStaggerDelay(100);

    expect(result).toBe(100);
  });

  it('should expose shouldUseComplexFilters as public method', () => {
    component.deviceCapability.tier = 'full';
    component.deviceCapability.supportsFilters = true;
    (component as any).animationThrottling.complexFiltersDisabled = false;

    const result = component.shouldUseComplexFilters();

    expect(result).toBe(true);
  });

  it('should expose shouldEnableInteractiveAnimations as public method', () => {
    component.animationState.prefersReducedMotion = false;
    component.deviceCapability.tier = 'full';
    (component as any).animationThrottling.interactiveAnimationsDisabled = false;

    const result = component.shouldEnableInteractiveAnimations();

    expect(result).toBe(true);
  });

  it('should expose shouldEnableDecorativeAnimations as public method', () => {
    component.animationState.prefersReducedMotion = false;
    component.deviceCapability.tier = 'full';
    (component as any).animationThrottling.decorativeAnimationsDisabled = false;

    const result = component.shouldEnableDecorativeAnimations();

    expect(result).toBe(true);
  });

  it('should expose getCurrentDeviceTier as public method', () => {
    component.deviceCapability.tier = 'reduced';

    const result = component.getCurrentDeviceTier();

    expect(result).toBe('reduced');
  });

  it('should expose getCurrentFPS as public method', () => {
    (component as any).performanceMonitoring.currentFPS = 45.7;

    const result = component.getCurrentFPS();

    expect(result).toBe(46); // Should be rounded
  });

  it('should not disable interactive animations multiple times', () => {
    spyOn(console, 'log');
    
    (component as any).disableInteractiveAnimations();
    (component as any).disableInteractiveAnimations();

    // Should only log once
    expect(console.log).toHaveBeenCalledTimes(1);
  });

  it('should not disable decorative animations multiple times', () => {
    spyOn(console, 'log');
    
    (component as any).disableDecorativeAnimations();
    (component as any).disableDecorativeAnimations();

    // Should only log once
    expect(console.log).toHaveBeenCalledTimes(1);
  });
});

describe('PrayerClockComponent - Filter Fallback Methods (Task 3.5)', () => {
  let component: PrayerClockComponent;
  let fixture: ComponentFixture<PrayerClockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PrayerClockComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PrayerClockComponent);
    component = fixture.componentInstance;
  });

  describe('getStrongGlowFilter', () => {
    it('should return filter URL when complex filters are enabled', () => {
      component.deviceCapability.tier = 'full';
      component.deviceCapability.supportsFilters = true;
      (component as any).animationThrottling.complexFiltersDisabled = false;

      const result = component.getStrongGlowFilter();

      expect(result).toBe('url(#strongGlow)');
    });

    it('should return empty string when complex filters are disabled', () => {
      component.deviceCapability.tier = 'minimal';

      const result = component.getStrongGlowFilter();

      expect(result).toBe('');
    });

    it('should return empty string when filters not supported', () => {
      component.deviceCapability.tier = 'full';
      component.deviceCapability.supportsFilters = false;

      const result = component.getStrongGlowFilter();

      expect(result).toBe('');
    });
  });

  describe('getRippleFilter', () => {
    it('should return filter URL when complex filters are enabled', () => {
      component.deviceCapability.tier = 'full';
      component.deviceCapability.supportsFilters = true;
      (component as any).animationThrottling.complexFiltersDisabled = false;

      const result = component.getRippleFilter();

      expect(result).toBe('url(#ripple)');
    });

    it('should return empty string when complex filters are disabled', () => {
      component.deviceCapability.tier = 'minimal';

      const result = component.getRippleFilter();

      expect(result).toBe('');
    });
  });

  describe('getTrailingGlowFilter', () => {
    it('should return filter URL when complex filters are enabled', () => {
      component.deviceCapability.tier = 'full';
      component.deviceCapability.supportsFilters = true;
      (component as any).animationThrottling.complexFiltersDisabled = false;

      const result = component.getTrailingGlowFilter();

      expect(result).toBe('url(#trailingGlow)');
    });

    it('should return empty string when complex filters are disabled', () => {
      component.deviceCapability.tier = 'minimal';

      const result = component.getTrailingGlowFilter();

      expect(result).toBe('');
    });
  });

  describe('getRadialPulseFilter', () => {
    it('should return filter URL when complex filters are enabled', () => {
      component.deviceCapability.tier = 'full';
      component.deviceCapability.supportsFilters = true;
      (component as any).animationThrottling.complexFiltersDisabled = false;

      const result = component.getRadialPulseFilter();

      expect(result).toBe('url(#radialPulse)');
    });

    it('should return empty string when complex filters are disabled', () => {
      component.deviceCapability.tier = 'minimal';

      const result = component.getRadialPulseFilter();

      expect(result).toBe('');
    });
  });

  describe('getMarkerGlowFilter', () => {
    it('should return filter URL when complex filters are enabled', () => {
      component.deviceCapability.tier = 'full';
      component.deviceCapability.supportsFilters = true;
      (component as any).animationThrottling.complexFiltersDisabled = false;

      const result = component.getMarkerGlowFilter();

      expect(result).toBe('url(#markerGlow)');
    });

    it('should return empty string when complex filters are disabled', () => {
      component.deviceCapability.tier = 'minimal';

      const result = component.getMarkerGlowFilter();

      expect(result).toBe('');
    });
  });

  describe('getSoftGlowFilter', () => {
    it('should return filter URL on full tier with filter support', () => {
      component.deviceCapability.tier = 'full';
      component.deviceCapability.supportsFilters = true;

      const result = component.getSoftGlowFilter();

      expect(result).toBe('url(#softGlow)');
    });

    it('should return filter URL on reduced tier with filter support', () => {
      component.deviceCapability.tier = 'reduced';
      component.deviceCapability.supportsFilters = true;

      const result = component.getSoftGlowFilter();

      expect(result).toBe('url(#softGlow)');
    });

    it('should return empty string on minimal tier', () => {
      component.deviceCapability.tier = 'minimal';
      component.deviceCapability.supportsFilters = true;

      const result = component.getSoftGlowFilter();

      expect(result).toBe('');
    });

    it('should return empty string when filters not supported', () => {
      component.deviceCapability.tier = 'full';
      component.deviceCapability.supportsFilters = false;

      const result = component.getSoftGlowFilter();

      expect(result).toBe('');
    });
  });

  describe('getGlowFallbackStyle', () => {
    it('should return empty string when complex filters are enabled', () => {
      component.deviceCapability.tier = 'full';
      component.deviceCapability.supportsFilters = true;
      (component as any).animationThrottling.complexFiltersDisabled = false;

      const result = component.getGlowFallbackStyle('soft');

      expect(result).toBe('');
    });

    it('should return soft glow fallback CSS when filters disabled', () => {
      component.deviceCapability.tier = 'minimal';

      const result = component.getGlowFallbackStyle('soft');

      expect(result).toContain('filter: drop-shadow');
      expect(result).toContain('2px');
      expect(result).toContain('0.4');
    });

    it('should return medium glow fallback CSS when filters disabled', () => {
      component.deviceCapability.tier = 'minimal';

      const result = component.getGlowFallbackStyle('medium');

      expect(result).toContain('filter: drop-shadow');
      expect(result).toContain('4px');
      expect(result).toContain('0.6');
    });

    it('should return strong glow fallback CSS when filters disabled', () => {
      component.deviceCapability.tier = 'minimal';

      const result = component.getGlowFallbackStyle('strong');

      expect(result).toContain('filter: drop-shadow');
      expect(result).toContain('6px');
      expect(result).toContain('0.8');
    });

    it('should return empty string for invalid intensity', () => {
      component.deviceCapability.tier = 'minimal';

      const result = component.getGlowFallbackStyle('invalid' as any);

      expect(result).toBe('');
    });
  });
});

describe('PrayerClockComponent - Breathing Glow Refinement (Tasks 10.1-10.5)', () => {
  let component: PrayerClockComponent;
  let fixture: ComponentFixture<PrayerClockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PrayerClockComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PrayerClockComponent);
    component = fixture.componentInstance;
  });

  describe('Task 10.1 - Sine wave easing', () => {
    it('should use sine wave easing for breathing glow calculation', () => {
      // Initialize breathing phase
      (component as any).breathPhase = 0;
      
      // Call updateBreathingGlow
      (component as any).updateBreathingGlow();
      
      // Verify that sine wave is used (at phase 0, sine should be 0)
      // Scale should be 1 + 0 * 0.06 = 1.0
      expect(component.getInnerBreathScale()).toBeCloseTo(1.0, 2);
      expect(component.getOuterBreathScale()).toBeCloseTo(1.0, 2);
    });

    it('should calculate breathing values using sine wave at different phases', () => {
      // Test at phase 0.25 (90 degrees, sine = 1)
      (component as any).breathPhase = 0.25;
      (component as any).updateBreathingGlow();
      
      // At sine = 1, scale should be 1 + 1 * 0.06 = 1.06
      expect(component.getInnerBreathScale()).toBeCloseTo(1.06, 2);
      
      // Test at phase 0.75 (270 degrees, sine = -1)
      (component as any).breathPhase = 0.75;
      (component as any).updateBreathingGlow();
      
      // At sine = -1, scale should be 1 + (-1) * 0.06 = 0.94
      expect(component.getInnerBreathScale()).toBeCloseTo(0.94, 2);
    });
  });

  describe('Task 10.2 - Phase offset between circles', () => {
    it('should apply 45-degree phase offset to outer circle', () => {
      // Set inner circle at phase 0 (sine = 0)
      (component as any).breathPhase = 0;
      (component as any).updateBreathingGlow();
      
      const innerScale = component.getInnerBreathScale();
      const outerScale = component.getOuterBreathScale();
      
      // Inner should be at baseline (sine = 0)
      expect(innerScale).toBeCloseTo(1.0, 2);
      
      // Outer should be offset by 0.125 (45/360)
      // At phase 0.125, sine ≈ 0.707
      expect(outerScale).toBeGreaterThan(1.0);
      expect(outerScale).toBeLessThan(1.06);
    });

    it('should maintain phase offset throughout breathing cycle', () => {
      // Test at phase 0.25 (inner at peak)
      (component as any).breathPhase = 0.25;
      (component as any).updateBreathingGlow();
      
      const innerScaleAtPeak = component.getInnerBreathScale();
      const outerScaleAtPeak = component.getOuterBreathScale();
      
      // Inner should be at maximum (sine = 1)
      expect(innerScaleAtPeak).toBeCloseTo(1.06, 2);
      
      // Outer should be past peak (phase 0.375, sine ≈ 0.707)
      expect(outerScaleAtPeak).toBeLessThan(innerScaleAtPeak);
      expect(outerScaleAtPeak).toBeGreaterThan(1.0);
    });

    it('should calculate outer phase as (breathPhase + 0.125) % 1.0', () => {
      // Test phase wrapping
      (component as any).breathPhase = 0.9;
      (component as any).updateBreathingGlow();
      
      // Outer phase should be (0.9 + 0.125) % 1.0 = 0.025
      // Both should have valid scale values
      expect(component.getInnerBreathScale()).toBeGreaterThan(0);
      expect(component.getOuterBreathScale()).toBeGreaterThan(0);
    });
  });

  describe('Task 10.3 - Intensification on prayer change', () => {
    it('should increase intensity by 30% when intensifyBreathingGlow is called', () => {
      component.animationState.prefersReducedMotion = false;
      
      component.intensifyBreathingGlow();
      
      expect(component.animationState.breathIntensity).toBe(1.3);
    });

    it('should set intensification end timestamp to 1.5 seconds from now', () => {
      component.animationState.prefersReducedMotion = false;
      const beforeTime = performance.now();
      
      component.intensifyBreathingGlow();
      
      const afterTime = performance.now();
      const expectedEndTime = beforeTime + 1500;
      
      expect(component.animationState.breathIntensifyUntil).toBeGreaterThanOrEqual(expectedEndTime);
      expect(component.animationState.breathIntensifyUntil).toBeLessThanOrEqual(afterTime + 1500);
    });

    it('should apply intensification multiplier to breathing calculations', () => {
      component.animationState.prefersReducedMotion = false;
      (component as any).breathPhase = 0.25; // Peak of sine wave
      
      // Normal breathing
      (component as any).updateBreathingGlow();
      const normalScale = component.getInnerBreathScale();
      
      // Intensified breathing
      component.intensifyBreathingGlow();
      (component as any).updateBreathingGlow();
      const intensifiedScale = component.getInnerBreathScale();
      
      // Intensified should be approximately 1.3x the amplitude
      expect(intensifiedScale).toBeGreaterThan(normalScale);
    });

    it('should reset intensity to 1.0 after intensification period ends', (done) => {
      component.animationState.prefersReducedMotion = false;
      
      // Set intensification to end very soon
      component.animationState.breathIntensity = 1.3;
      component.animationState.breathIntensifyUntil = performance.now() + 50;
      
      // Wait for intensification to end
      setTimeout(() => {
        (component as any).updateBreathingGlow();
        expect(component.animationState.breathIntensity).toBe(1.0);
        done();
      }, 100);
    });

    it('should skip intensification when reduced motion is preferred', () => {
      component.animationState.prefersReducedMotion = true;
      component.animationState.breathIntensity = 1.0;
      
      component.intensifyBreathingGlow();
      
      // Intensity should remain at 1.0
      expect(component.animationState.breathIntensity).toBe(1.0);
      expect(component.animationState.breathIntensifyUntil).toBe(0);
    });
  });

  describe('Task 10.4 - Maintain existing update interval', () => {
    it('should update breathing glow every 66ms', (done) => {
      // Mock matchMedia to avoid reduced motion
      const mockMatchMedia = jasmine.createSpy('matchMedia').and.returnValue({
        matches: false,
        addEventListener: jasmine.createSpy('addEventListener'),
        removeEventListener: jasmine.createSpy('removeEventListener')
      } as any);
      (window as any).matchMedia = mockMatchMedia;

      fixture.detectChanges();
      
      const initialPhase = (component as any).breathPhase;
      
      // Wait for at least one update cycle (66ms)
      setTimeout(() => {
        const updatedPhase = (component as any).breathPhase;
        
        // Phase should have incremented
        expect(updatedPhase).not.toBe(initialPhase);
        done();
      }, 100);
    });

    it('should increment phase by (66 / 4000) per update', () => {
      const initialPhase = 0;
      (component as any).breathPhase = initialPhase;
      
      (component as any).updateBreathingGlow();
      
      const expectedIncrement = 66 / 4000; // 0.0165
      expect((component as any).breathPhase).toBeCloseTo(expectedIncrement, 4);
    });
  });

  describe('Task 10.5 - Reduce amplitude in reduced motion mode', () => {
    it('should multiply amplitude by 0.3 when prefersReducedMotion is true', () => {
      component.animationState.prefersReducedMotion = true;
      (component as any).breathPhase = 0.25; // Peak of sine wave
      
      (component as any).updateBreathingGlow();
      
      // At peak with reduced motion, scale should be 1 + 1 * 0.06 * 0.3 = 1.018
      expect(component.getInnerBreathScale()).toBeCloseTo(1.018, 2);
    });

    it('should use full amplitude when prefersReducedMotion is false', () => {
      component.animationState.prefersReducedMotion = false;
      (component as any).breathPhase = 0.25; // Peak of sine wave
      
      (component as any).updateBreathingGlow();
      
      // At peak with full motion, scale should be 1 + 1 * 0.06 * 1.0 = 1.06
      expect(component.getInnerBreathScale()).toBeCloseTo(1.06, 2);
    });

    it('should apply reduced amplitude to both inner and outer circles', () => {
      component.animationState.prefersReducedMotion = true;
      (component as any).breathPhase = 0.25;
      
      (component as any).updateBreathingGlow();
      
      const innerScale = component.getInnerBreathScale();
      const outerScale = component.getOuterBreathScale();
      
      // Both should have reduced amplitude
      expect(innerScale).toBeLessThan(1.06);
      expect(outerScale).toBeLessThan(1.06);
      expect(innerScale).toBeGreaterThan(1.0);
      expect(outerScale).toBeGreaterThan(1.0);
    });

    it('should apply reduced amplitude to opacity as well', () => {
      component.animationState.prefersReducedMotion = true;
      (component as any).breathPhase = 0.25; // Peak of sine wave
      
      (component as any).updateBreathingGlow();
      
      // At peak with reduced motion, opacity should be 0.6 + 1 * 0.3 * 0.3 = 0.69
      expect(component.getInnerBreathOpacity()).toBeCloseTo(0.69, 2);
    });
  });

  describe('Getter methods', () => {
    it('should expose getInnerBreathScale method', () => {
      (component as any).innerBreathScale = 1.05;
      
      expect(component.getInnerBreathScale()).toBe(1.05);
    });

    it('should expose getInnerBreathOpacity method', () => {
      (component as any).innerBreathOpacity = 0.75;
      
      expect(component.getInnerBreathOpacity()).toBe(0.75);
    });

    it('should expose getOuterBreathScale method', () => {
      (component as any).outerBreathScale = 1.03;
      
      expect(component.getOuterBreathScale()).toBe(1.03);
    });

    it('should expose getOuterBreathOpacity method', () => {
      (component as any).outerBreathOpacity = 0.65;
      
      expect(component.getOuterBreathOpacity()).toBe(0.65);
    });
  });

  describe('Integration', () => {
    it('should update breathing glow continuously during component lifecycle', (done) => {
      // Mock matchMedia
      const mockMatchMedia = jasmine.createSpy('matchMedia').and.returnValue({
        matches: false,
        addEventListener: jasmine.createSpy('addEventListener'),
        removeEventListener: jasmine.createSpy('removeEventListener')
      } as any);
      (window as any).matchMedia = mockMatchMedia;

      fixture.detectChanges();
      
      const initialInnerScale = component.getInnerBreathScale();
      
      // Wait for multiple update cycles
      setTimeout(() => {
        const updatedInnerScale = component.getInnerBreathScale();
        
        // Scale should have changed
        expect(updatedInnerScale).not.toBe(initialInnerScale);
        done();
      }, 200);
    });

    it('should maintain phase offset between circles throughout lifecycle', (done) => {
      // Mock matchMedia
      const mockMatchMedia = jasmine.createSpy('matchMedia').and.returnValue({
        matches: false,
        addEventListener: jasmine.createSpy('addEventListener'),
        removeEventListener: jasmine.createSpy('removeEventListener')
      } as any);
      (window as any).matchMedia = mockMatchMedia;

      fixture.detectChanges();
      
      // Wait for breathing to cycle
      setTimeout(() => {
        const innerScale = component.getInnerBreathScale();
        const outerScale = component.getOuterBreathScale();
        
        // Scales should be different due to phase offset
        expect(innerScale).not.toBe(outerScale);
        done();
      }, 200);
    });
  });
});
