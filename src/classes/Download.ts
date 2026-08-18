class Download {
	constructor(
		public modId: number,
		public orderIndex: number,
		public fileName: string,
		public fileSize: number,
		public manualUrl: string,
		public everestUrl?: string,
		public description?: string,
	) {}
}
