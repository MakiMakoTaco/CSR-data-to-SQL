import Author from './Author';
import Contributor from './ModContributor';
import checkContributor from '../functions/utils/checkContributor';

class CreditGroup {
	id: number;
	orderIndex: number;
	modId: number;
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
			const contributor = contributors.get(author._sName);

			if (contributor) {
				const creditAuthor = new Author(index, author._sRole, contributor.id);
				this.authors.push(creditAuthor);
			}
		});
	}
}

export default CreditGroup;
