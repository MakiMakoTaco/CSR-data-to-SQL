import {
	GameBananaParent,
	GameBananaMod,
	GoogleDrive,
} from '../../classes/Mod';
import CelesteMap from '../../classes/Map';
import createMaps from './getMapNames';

const baseGamebananaUrl = 'https://gamebanana.com/apiv11';

async function fetchGameBananaParentData(
	modId: number,
	parentGamebananaId: string | number,
) {
	const profileUrl: string = `${baseGamebananaUrl}/Collection/${parentGamebananaId}/ProfilePage`;
	const profileResponse: Response = await fetch(profileUrl);
	const parentProfile: any = await profileResponse.json();

	const parent = new GameBananaParent(modId, parentGamebananaId);

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
			modId++;

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
				modId,
				childGamebananaId,
			);
			parent.children.push(mod);
		}

		hasNextPage = !collectionPage._aMetadata._bIsComplete;
		page++;
	}

	return { modId, parent };
}

async function fetchGameBananaModData(
	modId: number,
	gamebananaId: string | number,
) {
	const url: string = `${baseGamebananaUrl}/Mod/${gamebananaId}/ProfilePage`;
	const modResponse: Response = await fetch(url);
	const modData: any = await modResponse.json();

	const maps: CelesteMap[] = [];
	try {
		maps.push(...(await createMaps(modId, modData._aFiles[0]._sDownloadUrl)));
	} catch (error) {
		console.error(error);
	}

	const mod: GameBananaMod = new GameBananaMod(modId, 1, modData, maps);

	return mod;
}

async function fetchGoogleDriveData(modId: number, googleDriveId: string) {
	const downloadUrl: string = `https://drive.google.com/uc?export=download&id=${googleDriveId}`;
	const maps: CelesteMap[] = [];

	try {
		maps.push(...(await createMaps(modId, downloadUrl)));
	} catch (error) {
		console.error(error);
	}

	const mod = new GoogleDrive(modId, maps);

	return mod;
}

export {
	fetchGameBananaParentData,
	fetchGameBananaModData,
	fetchGoogleDriveData,
};
