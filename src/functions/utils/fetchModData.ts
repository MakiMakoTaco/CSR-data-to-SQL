import {
	GameBananaParent,
	GameBananaMod,
	GoogleDrive,
} from '../../classes/Mod';
import CelesteMap from '../../classes/Map';
import createMaps from './getMapNames';
import Contributor from '../../classes/Contributor';
import Download from '../../classes/Download';
import { appendFileSync } from 'fs';
import path from 'path';

const baseGamebananaUrl = 'https://gamebanana.com/apiv11';

async function fetchGameBananaParentData(
	modDataId: number,
	parentGamebananaId: string | number,
	lastCreditGroupId: number,
	contributors: Map<string, Contributor>,
) {
	const profileUrl: string = `${baseGamebananaUrl}/Collection/${parentGamebananaId}/ProfilePage`;
	const profileResponse: Response = await fetch(profileUrl);
	const parentProfile: any = await profileResponse.json();

	const parent = new GameBananaParent(modDataId, contributors, parentProfile);

	let page: number = 1;
	let hasNextPage: boolean = true;

	while (hasNextPage) {
		console.log(
			`Fetching page ${page} of ${Math.ceil(parentProfile._nItemCount / 15)}`,
		);

		const url: string = `${baseGamebananaUrl}/Collection/${parentGamebananaId}/Items?_nPage=${page}`;
		const collectionResponse: Response = await fetch(url);
		const collectionPage: any = await collectionResponse.json();

		for (let i = 0; i < collectionPage._aRecords.length; i++) {
			modDataId++;

			const record: any = collectionPage._aRecords[i];
			console.log(
				`Fetching data for mod ${i + 1} out of ${collectionPage._aMetadata._bIsComplete ? (parentProfile._nItemCount < 15 ? parentProfile._nItemCount : parentProfile._nItemCount % 15) : 15}`,
			);

			if (record._sModelName !== 'Mod') {
				console.log(
					`Skipping item with model name: ${record._sModelName}. Name of item: ${record._sName}`,
				);

				continue;
			}

			const splitProfileUrl: string[] = record._sProfileUrl.split('/');
			const childGamebananaId: string = splitProfileUrl.pop() ?? '';
			const childGamebananaType: string = splitProfileUrl.pop() ?? '';

			try {
				const data = await fetchGameBananaModData(
					modDataId,
					childGamebananaType,
					childGamebananaId,
					lastCreditGroupId,
					contributors,
				);

				if (!data) {
					console.error('\x1b[31mUnable to fetch data for child mod\x1b[0m');
					appendFileSync(
						path.join(process.cwd(), 'output/log.txt'),
						`Unable to fetch data for child mod ${(page - 1) * 15 + (i + 1)} (${record._sName ?? null}) in ${parent.name}. ID ${modDataId} has been skipped\n`,
					);
					continue;
				}

				parent.children.push(data.mod);
				lastCreditGroupId = data.lastCreditGroupId;
			} catch (error: any) {
				console.error(`\x1b[31m${error.message}\x1b[0m`);
			}
		}

		hasNextPage = !collectionPage._aMetadata._bIsComplete;
		page++;
	}

	return { modDataId, lastCreditGroupId, parent };
}

async function fetchGameBananaModData(
	modDataId: number,
	modType: string,
	gamebananaId: string | number,
	lastCreditGroupId: number,
	contributors: Map<string, Contributor>,
) {
	const type = modType === 'mods' ? 'Mod' : 'Wip';
	const url: string = `${baseGamebananaUrl}/${type}/${gamebananaId}/ProfilePage`;
	const modResponse: Response = await fetch(url);
	const modData: any = await modResponse.json();

	if (modData._bIsPrivate || modData._bIsTrashed || !modData || !modData._sName)
		return null;

	// let mapsData: { maps: CelesteMap[]; size: number } | null = null;
	const maps: CelesteMap[] = [];

	// try {
	// 	mapsData = await createMaps(modDataId, modData._aFiles[0]._sDownloadUrl);
	// } catch (error: any) {
	// 	if (error.message.includes('failed http request')) {
	// 		try {
	// 			const downloadId = modData._aFiles[0]._sDownloadUrl.split('/').pop();
	// 			mapsData = await createMaps(
	// 				modDataId,
	// 				`https://celestemodupdater.0x0a.de/banana-mirror/${downloadId}.zip`,
	// 			);
	// 		} catch (error) {
	// 			console.error(error);
	// 		}
	// 	}
	// }

	// if (mapsData) {
	// 	maps.push(...mapsData.maps);
	// }

	const mod: GameBananaMod = new GameBananaMod(
		modDataId,
		lastCreditGroupId,
		contributors,
		modData,
		maps,
	);
	lastCreditGroupId = lastCreditGroupId + mod.credits.length;

	return { mod, lastCreditGroupId };
}

async function fetchGoogleDriveData(
	modDataId: number,
	hyperlink: string,
	googleDriveId: string,
) {
	const downloadUrl: string = `https://drive.google.com/uc?export=download&id=${googleDriveId}`;
	const maps: CelesteMap[] = [];

	try {
		// const mapsData = await createMaps(modDataId, downloadUrl);

		// maps.push(...mapsData.maps);
		const download: Download = new Download(
			modDataId,
			1,
			`googledrive_${googleDriveId}`,
			1,
			downloadUrl,
		);

		const mod: GoogleDrive = new GoogleDrive(
			modDataId,
			hyperlink,
			download,
			maps,
		);

		return mod;
	} catch (error) {
		console.error(error);
		return null;
	}
}

export {
	fetchGameBananaParentData,
	fetchGameBananaModData,
	fetchGoogleDriveData,
};
