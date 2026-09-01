import type { Color } from '../types/Color';
import letterToNumber from '../functions/utils/letterToNumber';
import { appendFileSync } from 'node:fs';
import { join } from 'node:path';
import { formatColor, formatString } from '../functions/utils/formatSql';

enum SideType {
	standard,
	catstare,
	dlc,
	other,
}

class Side {
	archived: boolean;

	id: number;

	name: string;
	quickInstall?: string;

	type: SideType;

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

	protected typeConverter() {
		switch (this.type) {
			case SideType.standard:
				return 'standard';
			case SideType.catstare:
				return 'catstare';
			case SideType.dlc:
				return 'dlc';
			case SideType.other:
				return 'other';
		}
	}

	createSqlStatement() {
		const path: string = join(process.cwd(), 'temp/side.sql');

		appendFileSync(
			path,
			`,\n(${this.id}, ${formatString(this.name)}, ${formatString(this.typeConverter())}, null, null, null, false, ${formatString(this.quickInstall)})`,
		);
	}
}

class DLC extends Side {
	clearsForRank: number;

	color?: Color;
	colorPlus: Color;

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

	createSqlStatement() {
		const path: string = join(process.cwd(), 'temp/side.sql');

		appendFileSync(
			path,
			`,\n(${this.id}, ${formatString(this.name)}, ${formatString(this.typeConverter())}, ${this.clearsForRank}, ${formatColor(this.color)}, ${formatColor(this.colorPlus)}, ${this.archived}, ${formatString(this.quickInstall)})`,
		);
	}
}

export { Side, DLC };
