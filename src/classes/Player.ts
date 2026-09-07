import { appendFileSync } from 'node:fs';
import { join } from 'node:path';
import { formatString } from '../functions/utils/formatSql';
import { PlayerClear } from '../types/PlayerClear';

class Player {
	public id: number;
	public name: string;

	constructor(id: number, name: string) {
		this.id = id;
		this.name = name;
	}

	createSqlStatement() {
		const path: string = join(process.cwd(), 'output/players.sql');

		appendFileSync(path, `,\n(${this.id}, ${formatString(this.name)})`);
	}

	addClear(clear: PlayerClear) {
		const path: string = join(process.cwd(), 'output/player_progress.sql');

		appendFileSync(
			path,
			`,\n(${this.id}, ${clear.modId}, ${clear.cleared}, ${formatString(clear.proof)})`,
		);
	}
}

export { Player };
