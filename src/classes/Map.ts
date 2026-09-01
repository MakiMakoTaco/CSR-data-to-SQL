import { appendFileSync } from 'fs';
import { join } from 'path';
import { formatString } from '../functions/utils/formatSql';

class CelesteMap {
	modDataId: number;
	modIndex: number;

	name: string;

	constructor(modDataId: number, modIndex: number, name: string) {
		this.modDataId = modDataId;
		this.modIndex = modIndex;
		this.name = name;
	}

	createSqlStatement() {
		const path: string = join(process.cwd(), 'temp/maps.sql');

		appendFileSync(
			path,
			`,\n(${this.modDataId}, ${this.modIndex}, ${formatString(this.name)})`,
		);
	}
}

export default CelesteMap;
