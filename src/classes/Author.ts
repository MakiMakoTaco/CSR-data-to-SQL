class Author {
	// groupId: number;
	name: string;
	roleName: string;
	profileUrl: string;
	extaUrl?: string;

	constructor(
		public groupId: number,
		name: string,
		roleName: string,
		profileUrl: string,
		extraUrl?: string,
	) {
		this.groupId = groupId;
		this.name = name;
		this.roleName = roleName;
		this.profileUrl = profileUrl;
		this.extaUrl = extraUrl;
	}
}
