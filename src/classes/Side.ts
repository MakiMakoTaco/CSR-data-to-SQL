import type { Color } from '../types/Color';
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
	showTierNames: boolean;
	shoutoutOnClear: boolean;

	id!: number;

	name: string;
	quickInstall?: string;

	type: SideType;

	constructor(name: string, quickInstall?: string) {
		this.name = name;
		this.archived = false;

		if (quickInstall) this.quickInstall = quickInstall;

		if (name.includes('Side')) {
			this.type = SideType.standard;
			this.showTierNames = true;
			this.shoutoutOnClear = true;
		} else if (name === 'Catstare') {
			this.type = SideType.catstare;
			this.showTierNames = true;
			this.shoutoutOnClear = false;
		} else if (name.includes('DLC')) {
			this.type = SideType.dlc;
			this.showTierNames = false;
			this.shoutoutOnClear = false;
		} else {
			this.type = SideType.other;
			this.showTierNames = true;
			this.shoutoutOnClear = false;
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
		const path: string = join(process.cwd(), 'output/sides.sql');

		appendFileSync(
			path,
			`,\n(${this.id}, ${formatString(this.name)}, ${formatString(this.typeConverter())}, null, null, null, ${this.archived}, ${formatString(this.quickInstall)}, ${this.showTierNames}, ${this.shoutoutOnClear})`,
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
		const path: string = join(process.cwd(), 'output/sides.sql');

		appendFileSync(
			path,
			`,\n(${this.id}, ${formatString(this.name)}, ${formatString(this.typeConverter())}, ${this.clearsForRank}, ${formatColor(this.color)}, ${formatColor(this.colorPlus)}, ${this.archived}, ${formatString(this.quickInstall)}, ${this.showTierNames}, ${this.shoutoutOnClear})`,
		);
	}
}

export { Side, DLC };
