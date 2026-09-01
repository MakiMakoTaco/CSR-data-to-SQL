import Contributor from '../classes/Contributor';

interface Ids {
	contributors: Map<string, Contributor>;
	tierPresets: Map<string, number>;
	modData: Map<string, number>;
	players: Map<string, number>;
	modId: number;
	modDataId: number;
	creditGroupId: number;
}

export type { Ids };
