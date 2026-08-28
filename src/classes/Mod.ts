import checkContributor from '../functions/utils/checkContributor';
import CreditGroup from './CreditGroup';
import Download from './Download';
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
	page: string;

	constructor(id: number, page: string) {
		this.id = id;
		this.page = page;
	}
}

class BaseGameBanana extends BaseModData {
	name: string;
	submitterId: number;
	text: string;
	tags: string[];
	media: string[];

	constructor(
		id: number,
		contributors: Map<string, Contributor>,
		modData: any,
	) {
		super(id, modData._sProfileUrl);

		const submitter: any = modData._aSubmitter;

		contributors = checkContributor(contributors, submitter);
		const contributor: Contributor | undefined = contributors.get(
			submitter._sName,
		);

		let submitterId: number = 0;
		if (contributor) submitterId = contributor.id;

		this.submitterId = submitterId;
		this.name = modData._sName;
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
		contributors: Map<string, Contributor>,
		modData: any,
		children: GameBananaMod[] = [],
	) {
		super(id, contributors, modData);

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
	downloads: Download[];
	createdAt: EpochTimeStamp;
	lastModified: EpochTimeStamp;

	constructor(
		id: number,
		lastCreditGroupId: number,
		contributors: Map<string, Contributor>,
		modData: any,
		maps: CelesteMap[] = [],
	) {
		super(id, contributors, modData);

		this.maps = maps;

		this.downloadPage = modData._sDownloadUrl;
		this.category = modData._aCategory._sName;
		this.version = modData._sVersion;
		this.description = modData._sDescription;
		this.createdAt = modData._tsDateAdded; //Format correctly
		this.lastModified = modData._tsDateModified; //Format correctly

		if (modData._sFeedbackInstructions) {
			this.feedbackInstructions = modData._sFeedbackInstructions;
		}

		this.credits = [];
		modData._aCredits.forEach((group: any, index: number) => {
			const creditGroup = new CreditGroup(
				lastCreditGroupId,
				index,
				id,
				group,
				contributors,
			);
			this.credits.push(creditGroup);
		});

		this.downloads = [];
		modData._aFiles.forEach((file: any, index: number) => {
			const download: Download = new Download(
				index,
				file._sFile,
				file._nFilesize,
				file._sDownloadUrl,
				file._aModManagerIntegrations[0]._sDownloadUrl,
			);

			this.downloads.push(download);
		});
	}
}

class GoogleDrive extends BaseModData {
	download: Download;
	maps: CelesteMap[];

	constructor(
		id: number,
		page: string,
		download: Download,
		maps: CelesteMap[] = [],
	) {
		super(id, page);

		this.download = download;
		this.maps = maps;
	}
}

export { Mod, BaseModData, GameBananaParent, GameBananaMod, GoogleDrive };
