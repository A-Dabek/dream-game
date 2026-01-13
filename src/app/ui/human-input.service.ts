import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { GameAction } from '../board';

/**
 * Service to bridge UI inputs and HumanStrategy.
 */
@Injectable({
  providedIn: 'root',
})
export class HumanInputService {
  private _actions$ = new ReplaySubject<GameAction>(1);
  readonly actions$ = this._actions$.asObservable();

  /**
   * Submits an action from the UI.
   */
  submitAction(action: GameAction): void {
    this._actions$.next(action);
  }
}
