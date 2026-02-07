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

  it('renders the queue entries provided by the producer', () => {
    const turns = [
      { playerId: 'player', id: 'player-0' },
      { playerId: 'opponent', id: 'opponent-0' },
    ];

    fixture.componentRef.setInput('turnQueue', turns);
    fixture.componentRef.setInput('playerId', 'player');
    fixture.detectChanges();

    expect(component.turnItems()).toEqual(turns);
  });
});
