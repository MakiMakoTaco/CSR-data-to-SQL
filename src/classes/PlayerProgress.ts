class PlayerProgress {
	constructor(
		public playerId: number,
		public modId: number,
		public cleared: true,
		public proof: string,
		public submittedAt: Date,
	) {}
}

export { PlayerProgress };
