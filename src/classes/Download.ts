class Download {
	constructor(
		public orderIndex: number,
		public fileName: string,
		public fileSize: number,
		public manualUrl: string,
		public everestUrl?: string,
	) {}
}

export default Download;
