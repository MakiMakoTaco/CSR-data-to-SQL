import CreditGroup from './CreditGroup';
import CelesteMap from './Map';
import Contributor from './ModContributor';

class Mod {
	constructor(
		public id: number,
		public name: string,
		public modDataId: number,
		public tierId: number,
		public notes: string | undefined,
	) {}
}

class BaseModData {
	id: number;

	constructor(id: number) {
		this.id = id;
	}
}

class BaseGameBanana extends BaseModData {
	name: string;
	submitterId: number;
	page: string;
	text: string;
	tags: string[];
	media: string[];

	constructor(id: number, submitterId: number, modData: any) {
		super(id);

		this.submitterId = submitterId;
		this.name = modData._sName;
		this.page = modData._sProfileUrl;
		this.text = modData._sText;
		this.tags = [];
		this.media = [];

		const tags = modData._aTags;
		if (tags && tags.length > 0) {
			tags.forEach((tag: any) => {
				this.tags.push(tag._sValue);
			});
		}

		const images = modData._aPreviewMedia._aImages;
		if (images && images.length > 0) {
			images.forEach((image: any) => {
				this.media.push(`${image._sBaseUrl}/${image._sFile}`);
			});
		}
	}
}

class GameBananaParent extends BaseGameBanana {
	children: GameBananaMod[];

	constructor(
		id: number,
		submitterId: number,
		modData: any,
		children: GameBananaMod[] = [],
	) {
		super(id, submitterId, modData);

		this.children = children;
	}
}

class GameBananaMod extends BaseGameBanana {
	downloadPage: string;
	category: string;
	version: string;
	description: string;
	feedbackInstructions?: string | undefined;
	credits: CreditGroup[];
	maps: CelesteMap[];
	createdAt: EpochTimeStamp;
	lastModified: EpochTimeStamp;

	constructor(
		id: number,
		submittedId: number,
		creditGroupId: number,
		contributors: Map<string, Contributor>,
		modData: any,
		maps: CelesteMap[] = [],
	) {
		super(id, submittedId, modData);

		this.maps = maps;

		this.downloadPage = modData._sDownloadUrl;
		this.category = modData._aCategory._sName;
		this.version = modData._sVersion;
		this.description = modData._sDescription;
		this.createdAt = modData._tsDateAdded; //Format correctly
		this.lastModified = modData._tsDateModified; //Format correctly

		this.credits = [];
		modData._aCredits.forEach((group: any, index: number) => {
			const creditGroup = new CreditGroup(
				creditGroupId,
				index,
				id,
				group,
				contributors,
			);
			this.credits.push(creditGroup);
		});

		if (modData._sFeedbackInstructions) {
			this.feedbackInstructions = modData._sFeedbackInstructions;
		}
	}
}

class GoogleDrive extends BaseModData {
	maps: CelesteMap[];

	constructor(id: number, maps: CelesteMap[] = []) {
		super(id);

		this.maps = maps;
	}
}

export type { BaseModData };
export {
	// Mod,
	GameBananaParent,
	GameBananaMod,
	GoogleDrive,
};
