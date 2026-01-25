import { Injectable } from '@angular/core';
import { share, Subject } from 'rxjs';
import { GameAction } from '../board';

/**
 * Service to bridge UI inputs and HumanStrategy.
 */
@Injectable({
  providedIn: 'root',
})
export class HumanInputService {
  private _actions$ = new Subject<GameAction>();
  readonly actions$ = this._actions$.pipe(share());

  /**
   * Submits an action from the UI.
   */
  submitAction(action: GameAction): void {
    this._actions$.next(action);
  }
}
