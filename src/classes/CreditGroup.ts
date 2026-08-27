import Author from './Author';
import Contributor from './ModContributor';

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
			let contributor = contributors.get(author._sName);

			if (!contributor) {
				const newContributor: Contributor = new Contributor(
					contributors.size + 1,
					author._sName,
					author._ProfileUrl,
					author._sAvatarUrl,
				);

				contributors.set(author._sName, newContributor);
				contributor = contributors.get(author._sName);
			} else if (author._sProfileUrl && !contributor.profileUrl) {
				contributor.profileUrl = author._sProfileUrl;
				contributor.avatarUrl = author._sAvatarUrl;
			}

			if (contributor) {
				const creditAuthor = new Author(index, author._sRole, contributor?.id);
				this.authors.push(creditAuthor);
			}
		});
	}
}

export default CreditGroup;
