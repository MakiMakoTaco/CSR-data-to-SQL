import { appendFileSync } from 'fs';
import { join } from 'path';
import { formatString } from '../functions/utils/formatSql';

class Contributor {
	id: number;

	name: string;
	title: string | undefined;
	profileUrl: string | undefined;
	avatarUrl: string | undefined;

	constructor(
		id: number,
		name: string,
		title: string | undefined,
		profileUrl: string | undefined,
		avatarUrl: string | undefined,
	) {
		this.id = id;
		this.name = name;
		this.title = title;
		this.profileUrl = profileUrl;
		this.avatarUrl = avatarUrl;
	}

	createSqlStatement() {
		const path: string = join(process.cwd(), 'temp/contributors.sql');

		appendFileSync(
			path,
			`,\n(${this.id}, ${formatString(this.name)}, ${formatString(this.title)}, ${formatString(this.profileUrl)}, ${formatString(this.avatarUrl)})`,
		);
	}
}

export default Contributor;
