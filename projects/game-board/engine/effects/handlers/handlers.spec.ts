import { TestBed } from '@angular/core/testing';
import { EffectHandlerFactory } from './effect-handler.factory';
import { DefaultEffectHandler } from './default-effect.handler';
import { ItemCountDamageHandler } from './item-count-damage.handler';
import { EngineState } from '../../engine.types';
import { Effect, Item } from '../../../item';

describe('EffectHandlerFactory', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(EffectHandlerFactory).toBeTruthy();
  });

  describe('getHandler', () => {
    it('should return ItemCountDamageHandler for item_count_damage effect type', () => {
      const handler = EffectHandlerFactory.getHandler('item_count_damage');
      expect(handler).toBeInstanceOf(ItemCountDamageHandler);
    });

    it('should return DefaultEffectHandler for unknown effect types', () => {
      const handler = EffectHandlerFactory.getHandler('unknown_effect');
      expect(handler).toBeInstanceOf(DefaultEffectHandler);
    });

    it('should return DefaultEffectHandler for damage effect type', () => {
      const handler = EffectHandlerFactory.getHandler('damage');
      expect(handler).toBeInstanceOf(DefaultEffectHandler);
    });

    it('should return DefaultEffectHandler for healing effect type', () => {
      const handler = EffectHandlerFactory.getHandler('healing');
      expect(handler).toBeInstanceOf(DefaultEffectHandler);
    });
  });

  describe('processEffect', () => {
    const mockState: EngineState = {
      playerOne: {
        id: 'player1',
        health: 100,
        speed: 10,
        items: [],
      },
      playerTwo: {
        id: 'player2',
        health: 100,
        speed: 5,
        items: [],
      },
      turnQueue: [],
      listeners: [],
      gameOver: false,
      actionHistory: [],
    };

    it('should process item_count_damage effect and compute damage based on item count', () => {
      // Setup state with items
      const stateWithItems: EngineState = {
        ...mockState,
        playerOne: {
          ...mockState.playerOne,
          items: [
            { id: '_dummy', genre: 'basic' } as Item,
            { id: 'punch', genre: 'basic' } as Item,
          ],
        },
        playerTwo: {
          ...mockState.playerTwo,
          items: [{ id: 'hand', genre: 'basic' } as Item],
        },
      };

      const effect: Effect = {
        type: 'item_count_damage',
        value: 10,
        target: 'enemy',
      };

      const events = EffectHandlerFactory.processEffect(
        effect,
        stateWithItems,
        'player1',
      );

      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('effect');
      const effectEvent = events[0] as {
        type: 'effect';
        effect: Effect;
        playerId: string;
      };
      expect(effectEvent.effect.type).toBe('damage');
      expect(effectEvent.effect.value).toBe(3); // 2 items from player1 + 1 item from player2
      expect(effectEvent.effect.target).toBe('enemy');
    });

    it('should return original effect for unknown effect types via DefaultEffectHandler', () => {
      const effect: Effect = {
        type: 'damage',
        value: 10,
        target: 'enemy',
      };

      const events = EffectHandlerFactory.processEffect(
        effect,
        mockState,
        'player1',
      );

      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('effect');
      const effectEvent = events[0] as {
        type: 'effect';
        effect: Effect;
        playerId: string;
      };
      expect(effectEvent.effect).toBe(effect);
      expect(effectEvent.playerId).toBe('player1');
    });
  });
});

describe('DefaultEffectHandler', () => {
  let handler: DefaultEffectHandler;

  beforeEach(() => {
    handler = new DefaultEffectHandler();
  });

  it('should have effectType set to default', () => {
    expect(handler.effectType).toBe('default');
  });

  it('should return the original effect as a game event', () => {
    const mockState: EngineState = {
      playerOne: {
        id: 'player1',
        health: 100,
        speed: 10,
        items: [],
      },
      playerTwo: {
        id: 'player2',
        health: 100,
        speed: 5,
        items: [],
      },
      turnQueue: [],
      listeners: [],
      gameOver: false,
      actionHistory: [],
    };

    const originalEffect: Effect = {
      type: 'damage',
      value: 10,
      target: 'enemy',
    };

    const events = handler.handle(mockState, 'player1', originalEffect);

    expect(events).toHaveLength(1);
    expect(events[0].type).toBe('effect');
    const effectEvent = events[0] as {
      type: 'effect';
      effect: Effect;
      playerId: string;
    };
    expect(effectEvent.effect).toBe(originalEffect);
    expect(effectEvent.playerId).toBe('player1');
  });

  it('should preserve effect properties including optional ones', () => {
    const mockState: EngineState = {
      playerOne: {
        id: 'player1',
        health: 100,
        speed: 10,
        items: [],
      },
      playerTwo: {
        id: 'player2',
        health: 100,
        speed: 5,
        items: [],
      },
      turnQueue: [],
      listeners: [],
      gameOver: false,
      actionHistory: [],
    };

    const originalEffect: Effect = {
      type: 'healing',
      value: 5,
      target: 'self',
    };

    const events = handler.handle(mockState, 'player2', originalEffect);

    expect(events).toHaveLength(1);
    const effectEvent = events[0] as {
      type: 'effect';
      effect: Effect;
      playerId: string;
    };
    expect(effectEvent.playerId).toBe('player2');
    expect(effectEvent.effect.type).toBe('healing');
    expect(effectEvent.effect.value).toBe(5);
    expect(effectEvent.effect.target).toBe('self');
  });
});

describe('ItemCountDamageHandler', () => {
  let handler: ItemCountDamageHandler;

  beforeEach(() => {
    handler = new ItemCountDamageHandler();
  });

  it('should have effectType set to item_count_damage', () => {
    expect(handler.effectType).toBe('item_count_damage');
  });

  it('should compute damage based on total items from both players', () => {
    const mockState: EngineState = {
      playerOne: {
        id: 'player1',
        health: 100,
        speed: 10,
        items: [
          { id: '_dummy', genre: 'basic' } as Item,
          { id: 'punch', genre: 'basic' } as Item,
          { id: 'hand', genre: 'basic' } as Item,
        ],
      },
      playerTwo: {
        id: 'player2',
        health: 100,
        speed: 5,
        items: [{ id: 'sticky_boot', genre: 'basic' } as Item],
      },
      turnQueue: [],
      listeners: [],
      gameOver: false,
      actionHistory: [],
    };

    const effect: Effect = {
      type: 'item_count_damage',
      value: 100, // This value should be ignored in favor of computed value
      target: 'enemy',
    };

    const events = handler.handle(mockState, 'player1', effect);

    expect(events).toHaveLength(1);
    expect(events[0].type).toBe('effect');
    const effectEvent = events[0] as {
      type: 'effect';
      effect: Effect;
      playerId: string;
    };
    expect(effectEvent.effect.type).toBe('damage');
    expect(effectEvent.effect.value).toBe(4); // 3 from player1 + 1 from player2
    expect(effectEvent.effect.target).toBe('enemy');
  });

  it('should handle empty items arrays', () => {
    const mockState: EngineState = {
      playerOne: {
        id: 'player1',
        health: 100,
        speed: 10,
        items: [],
      },
      playerTwo: {
        id: 'player2',
        health: 100,
        speed: 5,
        items: [],
      },
      turnQueue: [],
      listeners: [],
      gameOver: false,
      actionHistory: [],
    };

    const effect: Effect = {
      type: 'item_count_damage',
      value: 10,
      target: 'enemy',
    };

    const events = handler.handle(mockState, 'player1', effect);

    expect(events).toHaveLength(1);
    const effectEvent = events[0] as {
      type: 'effect';
      effect: Effect;
      playerId: string;
    };
    expect(effectEvent.effect.type).toBe('damage');
    expect(effectEvent.effect.value).toBe(0);
  });

  it('should work when player is playerTwo', () => {
    const mockState: EngineState = {
      playerOne: {
        id: 'player1',
        health: 100,
        speed: 10,
        items: [{ id: '_dummy', genre: 'basic' } as Item],
      },
      playerTwo: {
        id: 'player2',
        health: 100,
        speed: 5,
        items: [
          { id: 'punch', genre: 'basic' } as Item,
          { id: 'hand', genre: 'basic' } as Item,
        ],
      },
      turnQueue: [],
      listeners: [],
      gameOver: false,
      actionHistory: [],
    };

    const effect: Effect = {
      type: 'item_count_damage',
      value: 10,
      target: 'enemy',
    };

    const events = handler.handle(mockState, 'player2', effect);

    expect(events).toHaveLength(1);
    const effectEvent = events[0] as {
      type: 'effect';
      effect: Effect;
      playerId: string;
    };
    expect(effectEvent.effect.type).toBe('damage');
    expect(effectEvent.effect.value).toBe(3); // 1 from player1 + 2 from player2
  });

  it('should preserve target from original effect', () => {
    const mockState: EngineState = {
      playerOne: {
        id: 'player1',
        health: 100,
        speed: 10,
        items: [],
      },
      playerTwo: {
        id: 'player2',
        health: 100,
        speed: 5,
        items: [],
      },
      turnQueue: [],
      listeners: [],
      gameOver: false,
      actionHistory: [],
    };

    const effect: Effect = {
      type: 'item_count_damage',
      value: 10,
      target: 'self', // Self-targeting
    };

    const events = handler.handle(mockState, 'player1', effect);

    const effectEvent = events[0] as {
      type: 'effect';
      effect: Effect;
      playerId: string;
    };
    expect(effectEvent.effect.target).toBe('self');
  });

  it('should default target to enemy when not specified', () => {
    const mockState: EngineState = {
      playerOne: {
        id: 'player1',
        health: 100,
        speed: 10,
        items: [],
      },
      playerTwo: {
        id: 'player2',
        health: 100,
        speed: 5,
        items: [],
      },
      turnQueue: [],
      listeners: [],
      gameOver: false,
      actionHistory: [],
    };

    const effect: Effect = {
      type: 'item_count_damage',
      value: 10,
    };

    const events = handler.handle(mockState, 'player1', effect);

    const effectEvent = events[0] as {
      type: 'effect';
      effect: Effect;
      playerId: string;
    };
    expect(effectEvent.effect.target).toBe('enemy');
  });
});
