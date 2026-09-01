import Author from './Author';
import Contributor from './Contributor';
import checkContributor from '../functions/utils/checkContributor';
import { join } from 'path';
import { appendFileSync } from 'fs';
import { formatString } from '../functions/utils/formatSql';

class CreditGroup {
	id: number;
	modId: number;
	orderIndex: number;

	name: string;

	authors: Author[];

	constructor(
		id: number,
		orderIndex: number,
		modId: number,
		creditData: any,
		contributors: Map<string, Contributor>,
	) {
		this.id = id;
		this.orderIndex = orderIndex;
		this.modId = modId;
		this.name = creditData._sGroupName;

		this.authors = [];
		creditData._aAuthors.forEach((author: any, index: number) => {
			contributors = checkContributor(contributors, author);
			const contributor: Contributor | undefined = contributors.get(
				author._sName,
			);

			if (contributor) {
				const creditAuthor: Author = new Author(
					id,
					index,
					author._sRole,
					contributor.id,
				);
				this.authors.push(creditAuthor);
			}
		});
	}

	createSqlStatement() {
		const path: string = join(process.cwd(), 'temp/credit_groups.sql');

		appendFileSync(
			path,
			`,\n(${this.id}, ${this.modId}, ${this.orderIndex}, ${formatString(this.name)})`,
		);

		this.authors.forEach((author: Author) => {
			author.createSqlStatement();
		});
	}
}

export default CreditGroup;
