import * as fs from 'fs';
import * as path from 'path';
import {
  CpuPlayerBuilder,
  GAME_CONFIG,
  GameOrchestrator,
  type Player,
  type ItemId,
} from '../../game-board';
import { environment } from '../../game-board-ui/environments/environment';

const orchestrator = new GameOrchestrator();

function generateRandomPlayer(id: string): Player {
  return new CpuPlayerBuilder(id, `Player ${id}`)
    .withNormalHealth(GAME_CONFIG.BASE_HEALTH, GAME_CONFIG.HEALTH_STD_DEV, 10)
    .withNormalSpeed(GAME_CONFIG.BASE_SPEED, GAME_CONFIG.SPEED_STD_DEV, 1)
    .withRandomItemsInRange(3, 5)
    .withLeftMostStrategy()
    .build();
}

function serializePlayer(p: Player): string {
  const itemIds = p.loadout.items.map((i) => i.id).join(',');
  return `${itemIds}|${p.loadout.health}|${p.loadout.speed}`;
}

async function main() {
  const numGames = environment.initializationGames || 1000;
  const numPlayers = 100;
  const players: Player[] = [];

  for (let i = 0; i < numPlayers; i++) {
    players.push(generateRandomPlayer(`player-${i}`));
  }

  console.log(
    `Starting ${numGames} games between ${numPlayers} randomized players...`,
  );

  for (let i = 0; i < numGames; i++) {
    const p1Idx = Math.floor(Math.random() * players.length);
    let p2Idx = Math.floor(Math.random() * players.length);
    while (p1Idx === p2Idx) {
      p2Idx = Math.floor(Math.random() * players.length);
    }

    // console.log(
    //   'Fight between items: ',
    //   serializePlayer(players[p1Idx]),
    //   'vs',
    //   serializePlayer(players[p2Idx]),
    // );
    await orchestrator.startGame(players[p1Idx], players[p2Idx]);

    if ((i + 1) % 100 === 0) {
      console.log(`Played ${i + 1} games...`);
    }
  }

  // Sort players by elo rating ascending
  players.sort((a, b) => a.rating.value - b.rating.value);

  // Collect item statistics
  const numTopPlayers = Math.ceil(numPlayers * 0.25);
  const numBottomPlayers = Math.ceil(numPlayers * 0.25);

  const bottomPlayers = players.slice(0, numBottomPlayers);
  const topPlayers = players.slice(-numTopPlayers);

  interface ItemStats {
    topCount: number;
    bottomCount: number;
    totalCount: number;
  }

  const itemStatsMap = new Map<ItemId, ItemStats>();

  for (const p of players) {
    const isTop = topPlayers.includes(p);
    const isBottom = bottomPlayers.includes(p);

    const itemIds = new Set(p.loadout.items.map((item) => item.id));

    for (const itemId of itemIds) {
      if (!itemStatsMap.has(itemId)) {
        itemStatsMap.set(itemId, {
          topCount: 0,
          bottomCount: 0,
          totalCount: 0,
        });
      }
      const stats = itemStatsMap.get(itemId)!;
      stats.totalCount++;
      if (isTop) stats.topCount++;
      if (isBottom) stats.bottomCount++;
    }
  }

  const itemCsvLines = Array.from(itemStatsMap.entries())
    .map(([id, stats]) => {
      const balance = (stats.topCount - stats.bottomCount) / stats.totalCount;
      return `${id},${stats.topCount},${stats.bottomCount},${stats.totalCount},${balance.toFixed(2)}`;
    })
    .sort((a, b) => {
      // Sort by balance descending
      const balanceA = parseFloat(a.split(',').pop()!);
      const balanceB = parseFloat(b.split(',').pop()!);
      return balanceB - balanceA;
    });

  const itemCsvContent = `itemId,topCount,bottomCount,totalCount,balance\n${itemCsvLines.join('\n')}`;

  const itemOutputPath = path.join(
    process.cwd(),
    'assets',
    'items_balance.csv',
  );
  fs.writeFileSync(itemOutputPath, itemCsvContent);

  const csvLines = players.map(
    (p) => `"${serializePlayer(p)}",${p.rating.value}`,
  );
  const csvContent = `config,elo\n${csvLines.join('\n')}`;

  const outputPath = path.join(process.cwd(), 'assets', 'players_elo.csv');
  fs.writeFileSync(outputPath, csvContent);

  console.log(`Results written to ${outputPath} and ${itemOutputPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
