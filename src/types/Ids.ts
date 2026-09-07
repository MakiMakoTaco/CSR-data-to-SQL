import Contributor from '../classes/Contributor';
import { Player } from '../classes/Player';

interface Ids {
	players: Map<string, Player>;
	contributors: Map<string, Contributor>;
	tierPresets: Map<string, number>;
	modData: Map<string, number>;
	modId: number;
	modDataId: number;
	creditGroupId: number;
}

export type { Ids };
