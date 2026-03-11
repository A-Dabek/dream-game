import * as fs from 'fs';
import * as path from 'path';
import {
  CpuPlayerBuilder,
  GAME_CONFIG,
  GameOrchestrator,
  type Player,
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
  const numPlayers = 50;
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

    await orchestrator.startGame(players[p1Idx], players[p2Idx]);

    if ((i + 1) % 100 === 0) {
      console.log(`Played ${i + 1} games...`);
    }
  }

  // Sort players by elo rating ascending
  players.sort((a, b) => a.rating.value - b.rating.value);

  const csvLines = players.map(
    (p) => `"${serializePlayer(p)}",${p.rating.value}`,
  );
  const csvContent = `config,elo\n${csvLines.join('\n')}`;

  const outputPath = path.join(
    process.cwd(),
    'projects',
    'game-initialization',
    'src',
    'players_elo.csv',
  );
  fs.writeFileSync(outputPath, csvContent);

  console.log(`Results written to ${outputPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
