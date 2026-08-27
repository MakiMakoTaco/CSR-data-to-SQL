class Contributor {
	constructor(
		public id: number,
		public name: string,
		public title: string | undefined,
		public profileUrl: string | undefined,
		public avatarUrl: string | undefined,
	) {}
}

export default Contributor;
