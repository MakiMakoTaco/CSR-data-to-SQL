import type { Color } from '../types/Color';
import letterToNumber from '../functions/utils/letterToNumber';

enum SideType {
	standard,
	catstare,
	dlc,
	other,
}

class Side {
	id: number;
	name: string;
	type: SideType;
	archived: boolean;
	quickInstall?: string;

	constructor(name: string, quickInstall?: string) {
		this.name = name;
		this.archived = false;

		if (quickInstall) this.quickInstall = quickInstall;

		if (name === 'Super-Side') {
			this.id = 1;
			this.type = SideType.standard;
		} else if (name.includes('Side')) {
			this.id = letterToNumber(name.split('-')[0]) + 1;
			this.type = SideType.standard;
		} else if (name === 'Catstare') {
			this.id = 1000;
			this.type = SideType.catstare;
		} else if (name.includes('DLC')) {
			this.id = 1000 + Number(name.split(' ')[1]);
			this.type = SideType.dlc;
		} else {
			this.id = 0;
			this.type = SideType.other;
		}
	}
}

class DLC extends Side {
	color?: Color;
	colorPlus: Color;
	clearsForRank: number;

	constructor(
		name: string,
		colorPlus: Color,
		clearsForRank: number,
		archived: boolean,
		color?: Color,
		quickInstall?: string,
	) {
		super(name, quickInstall);

		this.color = color;
		this.colorPlus = colorPlus;
		this.clearsForRank = clearsForRank;
		this.archived = archived;
	}
}

export { Side, DLC };
