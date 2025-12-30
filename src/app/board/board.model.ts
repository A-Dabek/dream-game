export interface Item {
  name: string;
  [key: string]: unknown;
}

export interface Player {
  id: string;
  name: string;
  health: number;
  items: Item[];
  speed: number;
}

export interface TurnInfo {
  currentPlayerId: string;
  nextPlayerId: string;
  turnQueue?: string[];
}

export interface GameState {
  player: Player;
  opponent: Player;
  turnInfo: TurnInfo;
  isGameOver: boolean;
  winnerId?: string;
}

export enum GameActionType {
  PLAY_ITEM = 'PLAY_ITEM',
  SURRENDER = 'SURRENDER'
}

export interface GameAction {
  type: GameActionType;
  playerId: string;
  itemName?: string;
  timestamp: number;
}

export interface GameActionResult {
  success: boolean;
  action: GameAction;
  error?: string;
  newGameState?: GameState;
}

