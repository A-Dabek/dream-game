import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { App } from './app';
import { UrlGameConfigService } from './game/url-game-config.service';
import { GamePlayersConfig } from '@dream/game-board';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});

describe('UrlGameConfigService', () => {
  let service: UrlGameConfigService;
  let originalLocation: Location;

  // Helper to set window.location.search for testing
  const setWindowLocation = (search: string): void => {
    Object.defineProperty(window, 'location', {
      value: {
        ...originalLocation,
        search,
      },
      writable: true,
      configurable: true,
    });
  };

  beforeEach(async () => {
    // Store original location before any modifications
    originalLocation = window.location;

    await TestBed.configureTestingModule({
      providers: [UrlGameConfigService],
    }).compileComponents();

    service = TestBed.inject(UrlGameConfigService);
  });

  afterEach(() => {
    // Restore original location after each test
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
      configurable: true,
    });
  });

  it('should parse state parameter from URL correctly', () => {
    setWindowLocation('?state=punch,sticking_plaster|20|10;wingfoot|15|8');

    const config: GamePlayersConfig | undefined = service.parseConfigFromUrl();

    expect(config).toBeDefined();
    expect(config?.player1).toBeDefined();
    expect(config?.player1?.items).toEqual(['punch', 'sticking_plaster']);
    expect(config?.player1?.health).toBe(20);
    expect(config?.player1?.speed).toBe(10);
    expect(config?.player2).toBeDefined();
    expect(config?.player2?.items).toEqual(['wingfoot']);
    expect(config?.player2?.health).toBe(15);
    expect(config?.player2?.speed).toBe(8);
  });

  it('should return undefined when no state parameter is present', () => {
    setWindowLocation('');

    const config: GamePlayersConfig | undefined = service.parseConfigFromUrl();

    expect(config).toBeUndefined();
  });

  it('should handle single player configuration', () => {
    setWindowLocation('?state=punch,punch|25|12');

    const config: GamePlayersConfig | undefined = service.parseConfigFromUrl();

    expect(config).toBeDefined();
    expect(config?.player1).toBeDefined();
    expect(config?.player1?.items).toEqual(['punch', 'punch']);
    expect(config?.player1?.health).toBe(25);
    expect(config?.player1?.speed).toBe(12);
    expect(config?.player2).toBeUndefined();
  });

  it('should handle empty items list (falls back to undefined)', () => {
    setWindowLocation('?state=|30|15;wingfoot|20|10');

    const config: GamePlayersConfig | undefined = service.parseConfigFromUrl();

    expect(config).toBeDefined();
    expect(config?.player1).toBeDefined();
    // Empty items list results in undefined (falls back to defaults)
    expect(config?.player1?.items).toBeUndefined();
    expect(config?.player1?.health).toBe(30);
    expect(config?.player1?.speed).toBe(15);
    expect(config?.player2).toBeDefined();
    expect(config?.player2?.items).toEqual(['wingfoot']);
  });
});
