interface PlayerClears {
	modId: number;
	cleared: true;
	proof: string;
	submittedAt: Date;
}

class Player {
	clears: [PlayerClears?];
	discordId?: string;

	constructor(
		public id: number,
		public name: string,
	) {
		this.clears = [];
	}

	public addClear(modId: number, proof: string) {
		const modData: PlayerClears = {
			modId: modId,
			cleared: true,
			proof: proof,
			submittedAt: new Date(Date.now()),
		};

		if (!this.clears) {
			this.clears = [modData];
		} else {
			this.clears.push(modData);
		}
	}
}

export { Player };
