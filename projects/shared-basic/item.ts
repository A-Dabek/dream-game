import { Genre } from './genre';

export type ItemId = string;

export interface Item {
  readonly id: ItemId;
  readonly instanceId?: string;
  readonly genre: Genre;
  readonly remainingUsages: number;
}
