import type { Unzipped } from 'fflate';
import { unzipSync, strFromU8 } from 'fflate';
import CelesteMap from '../../classes/Map';

// const input = 'https://gamebanana.com/dl/1539722' || 'https://filecache38.gamebanana.com/mods/cat_isle_c7728.zip';
// const input = 'https://drive.google.com/uc?export=download&id=1KhVFlc2d0PDE_ceimGwzd-iaRuSwrfuY';

async function getMapNames(downloadUrl: string) {
	let downloadResponse: Response = await fetch(downloadUrl);
	const files: Unzipped = unzipSync(
		new Uint8Array(await downloadResponse.arrayBuffer()),
	);

	const SIDs: string[] = [];
	Object.keys(files).forEach((file: string) => {
		const binFileCheck: RegExpMatchArray | null =
			file.match(/Maps\/(.+?)\.bin/);

		if (binFileCheck) {
			SIDs.push(binFileCheck[1].replaceAll(/[/-]/g, '_'));
		}
	});

	const dialog: Uint8Array<ArrayBuffer> = files['Dialog/English.txt'];

	if (dialog) {
		const mapNames: string[] = [];
		for (const sid of SIDs) {
			const reg: RegExp = new RegExp(`(?<=${sid}= *\\r?\\n?).+`, 'i');

			const text: string = strFromU8(dialog);
			const map: string | undefined = text.match(reg)?.[0];

			if (!map) {
				console.error(`Unable to find ingame name for SID ${sid}`);
				continue;
			}

			mapNames.push(map.trim());
		}

		return mapNames;
	} else {
		throw new Error('Unable to find "Dialog/English.txt"');
	}
}

async function createMaps(modId: number, downloadUrl: string) {
	const mapNames: string[] = await getMapNames(downloadUrl);

	try {
		const maps: CelesteMap[] = [];
		mapNames.forEach((mapName: string, index: number) => {
			const map = new CelesteMap(modId, index, mapName);
			maps.push(map);
		});

		return maps;
	} catch (error) {
		throw error;
	}
}

export default createMaps;
