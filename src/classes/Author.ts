import { appendFileSync } from 'fs';
import { join } from 'path';
import { formatString } from '../functions/utils/formatSql';

class Author {
	groupId: number;
	orderIndex: number;
	contributorId: number;

	roleName: string | undefined;

	constructor(
		groupId: number,
		orderIndex: number,
		roleName: string | undefined,
		contributorId: number,
	) {
		this.groupId = groupId;
		this.orderIndex = orderIndex;
		this.contributorId = contributorId;
		this.roleName = roleName;
	}

	createSqlStatement() {
		const path: string = join(process.cwd(), 'temp/authors.sql');

		appendFileSync(
			path,
			`,\n(${this.groupId}, ${this.orderIndex}, ${formatString(this.roleName)}, ${this.contributorId})`,
		);
	}
}

export default Author;
