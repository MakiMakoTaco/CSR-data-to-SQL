import checkContributor from '../functions/utils/checkContributor';
import CreditGroup from './CreditGroup';
import Download from './Download';
import CelesteMap from './Map';
import Contributor from './Contributor';
import { appendFileSync } from 'fs';
import { join } from 'path';
import { formatArray, formatString } from '../functions/utils/formatSql';

class Mod {
	id: number;
	modDataId: number;
	tierId: number;

	name: string;
	notes: string | undefined;

	constructor(
		id: number,
		name: string,
		modDataId: number,
		tierId: number,
		notes: string | undefined,
	) {
		this.id = id;
		this.modDataId = modDataId;
		this.tierId = tierId;
		this.name = name;
		this.notes = notes;
	}

	createSqlStatement() {
		const path: string = join(process.cwd(), 'temp/mods.sql');

		appendFileSync(
			path,
			`,\n(${this.id}, ${formatString(this.name)}, ${this.modDataId}, ${this.tierId}, ${formatString(this.notes)})`,
		);
	}
}

class BaseModData {
	id: number;
	page: string;

	constructor(id: number, page: string) {
		this.id = id;
		this.page = page;
	}

	createSqlStatement() {
		const path: string = join(process.cwd(), 'temp/mod_data.sql');

		appendFileSync(
			path,
			`,\n(${this.id}, null, false, null, null, ${formatString(this.page)}, null, null, null, null, null, null, null, null, null, null)`,
		);
	}
}

class BaseGameBanana extends BaseModData {
	submitterId: number;

	name: string;
	text: string;

	tags: string[];

	createdAt: EpochTimeStamp;
	lastModified: EpochTimeStamp;

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
		this.createdAt = modData._tsDateAdded;
		this.lastModified = modData._tsDateModified;
		this.tags = [];

		const tags: any = modData._aTags;
		if (tags && tags.length > 0) {
			tags.forEach((tag: any) => {
				this.tags.push(tag._sValue);
			});
		}
	}

	createSqlStatement() {
		const path: string = join(process.cwd(), 'temp/mod_data.sql');

		appendFileSync(
			path,
			`,\n(${this.id}, ${formatString(this.name)}, false, null, ${this.submitterId}, ${formatString(this.page)}, null, null, ${formatString(this.text)}, null, null, null, ${formatArray(this.tags)}, null, ${this.createdAt}, ${this.lastModified})`,
		);
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

	createSqlStatement() {
		this.createSqlStatement();

		this.children.forEach((child) => {
			child.createSqlStatement(true, this.id);
		});
	}
}

class GameBananaMod extends BaseGameBanana {
	downloadPage: string;
	category: string;
	version: string;
	description: string;
	feedbackInstructions?: string | undefined;

	media: string[];

	credits: CreditGroup[];
	maps: CelesteMap[];
	downloads: Download[];

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

		if (modData._sFeedbackInstructions) {
			this.feedbackInstructions = modData._sFeedbackInstructions;
		}

		this.media = [];
		const images: any = modData._aPreviewMedia._aImages;
		if (images && images.length > 0) {
			images.forEach((image: any) => {
				this.media.push(`${image._sBaseUrl}/${image._sFile}`);
			});
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
				id,
				index,
				file._sFile,
				file._nFilesize,
				file._sDownloadUrl,
				file._aModManagerIntegrations[0]._sDownloadUrl,
				file._sVersion,
				file._sDescription,
			);

			this.downloads.push(download);
		});
	}

	createSqlStatement(isChild: boolean = false, parentId: number | null = null) {
		const path: string = join(process.cwd(), 'temp/mod_data.sql');

		appendFileSync(
			path,
			`,\n(${this.id}, ${formatString(this.name)}, ${isChild}, ${parentId}, ${this.submitterId}, ${formatString(this.page)}, ${formatString(this.downloadPage)}, ${formatString(this.description)}, ${formatString(this.text)}, ${formatString(this.category)}, ${formatString(this.version)}, ${formatArray(this.media)}, ${formatArray(this.tags)}, ${formatString(this.feedbackInstructions)}, ${this.createdAt}, ${this.lastModified})`,
		);

		this.downloads.forEach((download: Download) => {
			download.createSqlStatement();
		});

		this.maps.forEach((map: CelesteMap) => {
			map.createSqlStatement();
		});

		this.credits.forEach((group: CreditGroup) => {
			group.createSqlStatement();
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

	createSqlStatement() {
		this.createSqlStatement();
		this.download.createSqlStatement();

		this.maps.forEach((map: CelesteMap) => {
			map.createSqlStatement();
		});
	}
}

export { Mod, BaseModData, GameBananaParent, GameBananaMod, GoogleDrive };
