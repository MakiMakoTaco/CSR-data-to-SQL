import { sheets_v4 } from 'googleapis';

class Tier {
	constructor(
		public id: number,
		public name: string,
		public sideId: number,
		public presetId: number,
		public clearsForRank?: number,
	) {}
}

interface TierData {
	id: number;
	name: string;
	appendSideName: boolean;
	color: sheets_v4.Schema$Color | string;
	colorPlus: sheets_v4.Schema$Color | string;
	sideIndex: number;
}

class TierPreset implements TierData {
	constructor(
		public id: number,
		public name: string,
		public appendSideName: boolean,
		public color: sheets_v4.Schema$Color | string,
		public colorPlus: sheets_v4.Schema$Color | string,
		public sideIndex: number,
	) {}
}

class TierOverride implements TierData {
	constructor(
		public id: number,
		public name: string,
		public appendSideName: boolean,
		public color: string,
		public colorPlus: string,
		public sideIndex: number,
	) {}
}

export { Tier, TierPreset };
