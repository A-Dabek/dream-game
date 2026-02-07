import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TurnQueueComponent } from './turn-queue.component';
import { describe, it, expect, beforeEach } from 'vitest';

describe('TurnQueueComponent', () => {
  let component: TurnQueueComponent;
  let fixture: ComponentFixture<TurnQueueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TurnQueueComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TurnQueueComponent);
    component = fixture.componentInstance;
  });

  it('should generate stable IDs when turn queue shifts', () => {
    // Initial state
    fixture.componentRef.setInput('turnQueue', [
      'player',
      'opponent',
      'player',
    ]);
    fixture.componentRef.setInput('playerId', 'player');
    fixture.detectChanges();

    const initialItems = component.turnItems();
    expect(initialItems.map((i) => i.id)).toEqual([
      'player-0',
      'opponent-0',
      'player-1',
    ]);

    // Advance turn (player finishes)
    fixture.componentRef.setInput('turnQueue', [
      'opponent',
      'player',
      'opponent',
    ]);
    fixture.detectChanges();

    const nextItems = component.turnItems();
    // opponent-0 and player-1 should be preserved
    expect(nextItems[0].id).toBe('opponent-0');
    expect(nextItems[1].id).toBe('player-1');
    expect(nextItems[2].id).toBe('opponent-1');
  });

  it('should handle multi-turn advancement', () => {
    fixture.componentRef.setInput('turnQueue', [
      'player',
      'player',
      'opponent',
    ]);
    fixture.componentRef.setInput('playerId', 'player');
    fixture.detectChanges();

    expect(component.turnItems().map((i) => i.id)).toEqual([
      'player-0',
      'player-1',
      'opponent-0',
    ]);

    // Advance 2 turns
    fixture.componentRef.setInput('turnQueue', ['opponent', 'player']);
    fixture.detectChanges();

    const items = component.turnItems();
    expect(items[0].id).toBe('opponent-0');
    expect(items[1].id).toBe('player-2');
  });

  it('should handle consecutive turns by the same player', () => {
    fixture.componentRef.setInput('turnQueue', [
      'player',
      'player',
      'opponent',
    ]);
    fixture.componentRef.setInput('playerId', 'player');
    fixture.detectChanges();

    const initialIds = component.turnItems().map((i) => i.id);
    expect(initialIds).toEqual(['player-0', 'player-1', 'opponent-0']);

    // Advance 1 turn - still player's turn
    fixture.componentRef.setInput('turnQueue', [
      'player',
      'opponent',
      'player',
    ]);
    fixture.detectChanges();

    const nextIds = component.turnItems().map((i) => i.id);
    // player-0 should be removed, player-1 moves to front, opponent-0 moves to index 1
    expect(nextIds[0]).toBe('player-1');
    expect(nextIds[1]).toBe('opponent-0');
    expect(nextIds[2]).toBe('player-2');
  });

  it('should treat fixed-length shift-by-one updates as advancement', () => {
    fixture.componentRef.setInput('turnQueue', [
      'player',
      'opponent',
      'player',
      'opponent',
      'player',
      'opponent',
    ]);
    fixture.componentRef.setInput('playerId', 'player');
    fixture.detectChanges();

    expect(component.turnItems().map((i) => i.id)).toEqual([
      'player-0',
      'opponent-0',
      'player-1',
      'opponent-1',
      'player-2',
      'opponent-2',
    ]);

    fixture.componentRef.setInput('turnQueue', [
      'opponent',
      'player',
      'opponent',
      'player',
      'opponent',
      'player',
    ]);
    fixture.detectChanges();

    expect(component.turnItems().map((i) => i.id)).toEqual([
      'opponent-0',
      'player-1',
      'opponent-1',
      'player-2',
      'opponent-2',
      'player-3',
    ]);
  });

  it('should reorder fixed-length queues even when a suffix overlaps', () => {
    fixture.componentRef.setInput('turnQueue', [
      'player',
      'opponent',
      'player',
      'opponent',
      'player',
      'opponent',
    ]);
    fixture.componentRef.setInput('playerId', 'player');
    fixture.detectChanges();

    fixture.componentRef.setInput('turnQueue', [
      'player',
      'opponent',
      'opponent',
      'player',
      'opponent',
      'player',
    ]);
    fixture.detectChanges();

    expect(component.turnItems().map((i) => i.id)).toEqual([
      'player-0',
      'opponent-0',
      'opponent-1',
      'player-2',
      'opponent-2',
      'player-3',
    ]);
  });

  it('should handle changing turn order without any turn advancement', () => {
    fixture.componentRef.setInput('turnQueue', [
      'player',
      'opponent',
      'player',
      'opponent',
      'player',
      'opponent',
      'player',
      'opponent',
    ]);
    fixture.componentRef.setInput('playerId', 'player');
    fixture.detectChanges();

    const initialIds = component.turnItems().map((i) => i.id);
    expect(initialIds).toMatchInlineSnapshot(`
      [
        "player-0",
        "opponent-0",
        "player-1",
        "opponent-1",
        "player-2",
        "opponent-2",
        "player-3",
        "opponent-3",
      ]
    `);

    fixture.componentRef.setInput('turnQueue', [
      'player',
      'player',
      'opponent',
      'opponent',
      'player',
      'player',
      'opponent',
      'opponent',
    ]);
    fixture.detectChanges();

    const nextIds = component.turnItems().map((i) => i.id);
    expect(nextIds).toMatchInlineSnapshot(`
      [
        "player-0",
        "player-1",
        "opponent-1",
        "opponent-2",
        "player-3",
        "player-4",
        "opponent-3",
        "opponent-4",
      ]
    `);
  });

  it('should increment offset when head changes to something not in old queue', () => {
    fixture.componentRef.setInput('turnQueue', ['player']);
    fixture.componentRef.setInput('playerId', 'player');
    fixture.detectChanges();

    expect(component.turnItems()[0].id).toBe('player-0');

    fixture.componentRef.setInput('turnQueue', ['opponent']);
    fixture.detectChanges();

    expect(component.turnItems()[0].id).toBe('opponent-0');
  });
});
