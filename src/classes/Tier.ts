import { appendFileSync } from 'fs';
import { sheets_v4 } from 'googleapis';
import { join } from 'path';
import { formatColor, formatString } from '../functions/utils/formatSql';

class Tier {
	id: number;
	sideId: number;
	presetId: number;
	clearsForRank: number | null;

	constructor(
		id: number,
		sideId: number,
		presetId: number,
		clearsForRank: number | null,
	) {
		this.id = id;
		this.sideId = sideId;
		this.presetId = presetId;
		this.clearsForRank = clearsForRank;
	}

	createSqlStatement() {
		const path: string = join(process.cwd(), 'output/tiers.sql');

		appendFileSync(
			path,
			`,\n(${this.id}, ${this.sideId}, ${this.presetId}, ${this.clearsForRank})`,
		);
	}
}

interface TierData {
	id: number;
	name: string;
	appendSideName: boolean;
	color: sheets_v4.Schema$Color;
	colorPlus: sheets_v4.Schema$Color;
	sideIndex: number;
}

class TierPreset implements TierData {
	appendSideName: boolean;

	id: number;
	sideIndex: number;

	name: string;

	color: sheets_v4.Schema$Color;
	colorPlus: sheets_v4.Schema$Color;

	constructor(
		id: number,
		name: string,
		appendSideName: boolean,
		color: sheets_v4.Schema$Color,
		colorPlus: sheets_v4.Schema$Color,
		sideIndex: number,
	) {
		this.appendSideName = appendSideName;
		this.id = id;
		this.sideIndex = sideIndex;
		this.name = name;
		this.color = color;
		this.colorPlus = colorPlus;
	}

	createSqlStatement() {
		const path: string = join(process.cwd(), 'output/tier_presets.sql');

		appendFileSync(
			path,
			`,\n(${this.id}, ${formatString(this.name)}, ${this.appendSideName}, ${formatColor(this.color)}, ${formatColor(this.colorPlus)}, ${this.sideIndex})`,
		);
	}
}

// class TierOverride implements TierData {
// 	constructor(
// 		public id: number,
// 		public name: string,
// 		public appendSideName: boolean,
// 		public color: string,
// 		public colorPlus: string,
// 		public sideIndex: number,
// 	) {}
// }

export { Tier, TierPreset };
