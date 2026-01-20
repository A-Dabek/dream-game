import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { BoardUiComponent } from './board-ui.component';
import { GameContainerComponent } from './game-container.component';
import { UiStateService } from './ui-state.service';

describe('BoardUiComponent Integration Test', () => {
  let fixture: ComponentFixture<GameContainerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [BoardUiComponent, GameContainerComponent],
      providers: [UiStateService],
    });

    // Use real timers so async flows and Promises resolve normally in TestBed
    vi.useRealTimers();

    // Create the container component so it initializes the game and UiStateService
    fixture = TestBed.createComponent(GameContainerComponent);
    // initially detectChanges to run ngOnInit and start the game
    fixture.detectChanges();
  });

  function queryElement(selector: string) {
    return fixture.debugElement.query(By.css(selector));
  }

  function queryElementText(selector: string): string {
    const element = queryElement(selector);
    return element ? element.nativeElement.textContent.trim() : '';
  }

  function queryAll(selector: string) {
    return fixture.debugElement.queryAll(By.css(selector));
  }

  test('should ensure no mismatch between UI state and engine state after interaction', async () => {
    // Ensure initial rendering
    fixture.detectChanges();

    const triggerItemSelected = () => {
      // Find the nested board UI inside the container
      const boardDebug = fixture.debugElement.query(
        By.directive(BoardUiComponent),
      );
      if (!boardDebug) throw new Error('app-board-ui not found');

      const playerHand = boardDebug.query(By.css('app-player-hand'));
      playerHand.triggerEventHandler('itemSelected', {
        id: '_blueprint_attack',
        instanceId: 'p1',
      });
    };

    const waitForStateUpdates = async () => {
      // Small real-time driven waits to allow TestBed async processing and Observables to run
      for (let i = 0; i < 10; i++) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        fixture.detectChanges();
        // allow microtask queue to drain
        await Promise.resolve();
      }
    };

    try {
      triggerItemSelected();
      await waitForStateUpdates();

      // Assert: Verify opponent's health (health-text inside opponent-area)
      const opponentHealth = queryElementText('.opponent-area .health-text');
      expect(opponentHealth).toEqual('11');

      // Assert: Verify turn queue has an opponent item
      const turnItems = queryAll('app-turn-queue .turn-item');
      expect(turnItems.length).toBeGreaterThan(0);
      const hasOpponent = turnItems.some((el) =>
        el.nativeElement.classList.contains('opponent'),
      );
      expect(hasOpponent).toBe(true);

      // Assert: Verify player items rendered at least one item display
      const playerItemDisplays = queryAll('app-player-hand app-item-display');
      expect(playerItemDisplays.length).toBeGreaterThan(0);

      // Assert: Verify game-over state is not rendered
      const gameOverEl = queryElement('.game-over');
      expect(gameOverEl).toBeNull();
    } catch (e) {
      throw new Error('Test failed due to state mismatch: ' + e);
    }
  }, 30000); // Increased timeout to 30 seconds to allow async flows
});
