import Contributor from '../classes/ModContributor';

interface Ids {
	contributors: Map<string, Contributor>;
	tierPresets: Map<string, number>;
	modData: Map<string, number>;
	players: Map<string, number>;
	modId: number;
	creditGroupId: number;
}

export type { Ids };
