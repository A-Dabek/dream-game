import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  computed,
  signal,
  effect,
  untracked,
} from '@angular/core';
import { IconComponent } from './icon.component';

/**
 * Displays upcoming turns and provides skip-turn functionality.
 *
 * It uses a sequence-matching algorithm to assign stable IDs to turn items.
 * This stability is crucial for Angular's track-by logic to correctly identify
 * which elements are removed from the queue, allowing CSS leave animations
 * to trigger properly even during complex turn transitions.
 */
@Component({
  selector: 'app-turn-queue',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    @for (turn of turnItems(); track turn.id) {
      <div
        class="turn-item"
        [class.player]="turn.playerId === playerId()"
        [class.opponent]="turn.playerId !== playerId()"
        [class.current]="$first"
        animate.leave="turn-slide-out"
      >
        <app-icon
          [name]="turn.playerId === playerId() ? 'police-badge' : 'brutal-helm'"
        />
        @if ($first && turn.playerId === playerId()) {
          <div
            class="skip-button"
            (click)="skipTurn.emit()"
            role="button"
            aria-label="Skip Turn"
            tabindex="0"
            (keydown.enter)="skipTurn.emit()"
            (keydown.space)="$event.preventDefault(); skipTurn.emit()"
          >
            <app-icon name="fast-forward-button" />
          </div>
        }
      </div>
    }
  `,
})
export class TurnQueueComponent {
  readonly turnQueue = input.required<string[]>();
  readonly playerId = input.required<string>();
  readonly skipTurn = output<void>();

  private readonly turnItemsSignal = signal<
    { id: string; playerId: string }[]
  >([]);
  private readonly nextIdByPlayer: Record<string, number> = {};

  /** Remembers the last seen queue to detect advancements and reuse IDs. */
  private lastQueue: string[] = [];
  private lastItems: { id: string; playerId: string }[] = [];

  constructor() {
    effect(() => {
      const current = this.turnQueue();

      untracked(() => {
        if (current.length === 0) {
          this.lastQueue = [];
          this.lastItems = [];
          this.turnItemsSignal.set([]);
          return;
        }

        if (this.lastQueue.length === 0) {
          const initialItems = this.createItems(current);
          this.lastQueue = [...current];
          this.lastItems = initialItems;
          this.turnItemsSignal.set(initialItems);
          return;
        }

        const isFixedLength =
          current.length > 0 && current.length === this.lastQueue.length;

        // Fixed-length queues: only treat a full one-step shift as advancement.
        let nextItems: { id: string; playerId: string }[];
        if (isFixedLength && this.isShiftByOne(this.lastQueue, current)) {
          nextItems = this.applyAdvance(current, 1);
        } else if (isFixedLength) {
          nextItems = this.applyReorder(current);
        } else {
          // Identify how many turns were consumed by finding the longest prefix overlap
          // between the new queue and the suffix of the old one.
          const itemsPassed = this.calculateItemsPassed(
            this.lastQueue,
            current,
          );
          nextItems =
            itemsPassed < this.lastQueue.length
              ? this.applyAdvance(current, itemsPassed)
              : this.applyReorder(current);
        }

        this.lastQueue = [...current];
        this.lastItems = nextItems;
        this.turnItemsSignal.set(nextItems);
      });
    });
  }

  /**
   * Map of the raw turn queue to display objects with stable IDs.
   * ID format: `${playerId}-${globalTurnIndex}`
   */
  readonly turnItems = computed(() => this.turnItemsSignal());

  /**
   * Finds the number of items that have passed by comparing old and new queues.
   * Returns the index in oldQueue where the overlap with newQueue begins.
   */
  private calculateItemsPassed(oldQueue: string[], newQueue: string[]): number {
    for (let i = 0; i < oldQueue.length; i++) {
      const suffix = oldQueue.slice(i);
      if (
        suffix.length <= newQueue.length &&
        suffix.every((id, idx) => id === newQueue[idx])
      ) {
        return i;
      }
    }
    // No overlap found; entire old queue was consumed
    return oldQueue.length;
  }

  private isShiftByOne(oldQueue: string[], newQueue: string[]): boolean {
    if (oldQueue.length < 2 || oldQueue.length !== newQueue.length) {
      return false;
    }

    for (let i = 1; i < oldQueue.length; i++) {
      if (oldQueue[i] !== newQueue[i - 1]) {
        return false;
      }
    }

    return true;
  }

  private applyAdvance(
    newQueue: string[],
    itemsPassed: number,
  ): { id: string; playerId: string }[] {
    const remaining = this.lastItems.slice(itemsPassed);
    const reusedCount = Math.min(remaining.length, newQueue.length);
    const nextItems = remaining.slice(0, reusedCount);

    for (let i = reusedCount; i < newQueue.length; i++) {
      nextItems.push(this.createItem(newQueue[i]));
    }

    return nextItems;
  }

  private applyReorder(
    newQueue: string[],
  ): { id: string; playerId: string }[] {
    const nextItems: { id: string; playerId: string }[] = [];
    let oldIndex = 0;

    for (const playerId of newQueue) {
      const matchIndex = this.findNextMatchIndex(
        this.lastItems,
        oldIndex,
        playerId,
      );

      if (matchIndex === -1) {
        nextItems.push(this.createItem(playerId));
        continue;
      }

      nextItems.push(this.lastItems[matchIndex]);
      oldIndex = matchIndex + 1;
    }

    return nextItems;
  }

  private findNextMatchIndex(
    items: { id: string; playerId: string }[],
    startIndex: number,
    playerId: string,
  ): number {
    for (let i = startIndex; i < items.length; i++) {
      if (items[i].playerId === playerId) {
        return i;
      }
    }
    return -1;
  }

  private createItems(queue: string[]): { id: string; playerId: string }[] {
    return queue.map((playerId) => this.createItem(playerId));
  }

  private createItem(playerId: string): { id: string; playerId: string } {
    const nextId = this.nextIdByPlayer[playerId] ?? 0;
    this.nextIdByPlayer[playerId] = nextId + 1;
    return { id: `${playerId}-${nextId}`, playerId };
  }
}
