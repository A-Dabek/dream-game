import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';
import { describe, expect, it, beforeEach } from 'vitest';
import { UrlGameConfigService } from './url-game-config.service';

describe('UrlGameConfigService', () => {
  let service: UrlGameConfigService;
  let mockDocument: { location: { search: string } };

  beforeEach(() => {
    mockDocument = {
      location: {
        search: '',
      },
    };

    TestBed.configureTestingModule({
      providers: [
        UrlGameConfigService,
        { provide: DOCUMENT, useValue: mockDocument },
      ],
    });

    service = TestBed.inject(UrlGameConfigService);
  });

  it('should parse state parameter from URL correctly', () => {
    mockDocument.location.search =
      '?state=punch,sticking_plaster|20|10;wingfoot|15|8';

    const config = service.parseConfigFromUrl();

    expect(config).toEqual({
      player1: {
        items: ['punch', 'sticking_plaster'],
        health: 20,
        speed: 10,
      },
      player2: {
        items: ['wingfoot'],
        health: 15,
        speed: 8,
      },
    });
  });

  it('should return undefined when no state parameter is present', () => {
    mockDocument.location.search = '';

    const config = service.parseConfigFromUrl();

    expect(config).toBeUndefined();
  });

  it('should handle single player configuration', () => {
    mockDocument.location.search = '?state=punch,punch|25|12';

    const config = service.parseConfigFromUrl();

    expect(config).toEqual({
      player1: {
        items: ['punch', 'punch'],
        health: 25,
        speed: 12,
      },
    });
  });

  it('should handle empty items list', () => {
    mockDocument.location.search = '?state=|30|15;wingfoot|20|10';

    const config = service.parseConfigFromUrl();

    expect(config).toEqual({
      player1: {
        health: 30,
        speed: 15,
      },
      player2: {
        items: ['wingfoot'],
        health: 20,
        speed: 10,
      },
    });
  });

  it('should return undefined for malformed state', () => {
    mockDocument.location.search = '?state=invalid|format';

    const config = service.parseConfigFromUrl();

    expect(config).toBeUndefined();
  });
});
