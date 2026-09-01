import {
	GameBananaParent,
	GameBananaMod,
	GoogleDrive,
} from '../../classes/Mod';
import CelesteMap from '../../classes/Map';
import createMaps from './getMapNames';
import { google } from 'googleapis';
import Contributor from '../../classes/Contributor';
import Download from '../../classes/Download';

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
				`Fetching data for map ${i + 1} out of ${collectionPage._aMetadata._bIsComplete ? parentProfile._nItemCount / 15 : 15}`,
			);

			if (record._sModelName !== 'Mod') {
				console.log(
					`Skipping item with model name: ${record._sModelName}. Name of item: ${record._sName}`,
				);

				continue;
			}

			const childGamebananaId: string = record._sProfileUrl.split('/').pop();

			const mod: GameBananaMod = await fetchGameBananaModData(
				modDataId,
				childGamebananaId,
				lastCreditGroupId,
				contributors,
			);
			parent.children.push(mod);
		}

		hasNextPage = !collectionPage._aMetadata._bIsComplete;
		page++;
	}

	return { modDataId, parent };
}

async function fetchGameBananaModData(
	modDataId: number,
	gamebananaId: string | number,
	lastCreditGroupId: number,
	contributors: Map<string, Contributor>,
) {
	const url: string = `${baseGamebananaUrl}/Mod/${gamebananaId}/ProfilePage`;
	const modResponse: Response = await fetch(url);
	const modData: any = await modResponse.json();

	const maps: CelesteMap[] = [];
	maps.push(
		...(await createMaps(modDataId, modData._aFiles[0]._sDownloadUrl)).maps,
	);

	const mod: GameBananaMod = new GameBananaMod(
		modDataId,
		lastCreditGroupId,
		contributors,
		modData,
		maps,
	);

	return mod;
}

async function fetchGoogleDriveData(
	modDataId: number,
	hyperlink: string,
	googleDriveId: string,
) {
	const downloadUrl: string = `https://drive.google.com/uc?export=download&id=${googleDriveId}`;
	const maps: CelesteMap[] = [];
	const mapsData = await createMaps(modDataId, downloadUrl);

	maps.push(...mapsData.maps);
	const download: Download = new Download(
		modDataId,
		1,
		mapsData.data.name ?? `googledrive_${googleDriveId}`,
		mapsData.data.size,
		downloadUrl,
	);

	const mod: GoogleDrive = new GoogleDrive(
		modDataId,
		hyperlink,
		download,
		maps,
	);

	return mod;
}

export {
	fetchGameBananaParentData,
	fetchGameBananaModData,
	fetchGoogleDriveData,
};
