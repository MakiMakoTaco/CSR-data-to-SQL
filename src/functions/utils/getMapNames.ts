import type { ZipEntry } from 'unzipit';

import { HTTPRangeReader, unzip } from 'unzipit';
import CelesteMap from '../../classes/Map';

// const input = 'https://gamebanana.com/dl/1539722' || 'https://filecache38.gamebanana.com/mods/cat_isle_c7728.zip';
// const input = 'https://drive.google.com/uc?export=download&id=1KhVFlc2d0PDE_ceimGwzd-iaRuSwrfuY';

async function getMapNames(downloadUrl: string) {
	let entries!: { [key: string]: ZipEntry };

	try {
		const reader = new HTTPRangeReader(downloadUrl);
		entries = (await unzip(reader)).entries;
	} catch (error: any) {
		throw new Error(error);
	}

	let size: number = 0;
	let dialog!: ArrayBuffer;
	const sids: string[] = [];

	for (const [name, entry] of Object.entries(entries)) {
		size += entry.size;

		if (['Dialog/English.txt', 'Dialog/english.txt'].includes(name)) {
			dialog = await entry.arrayBuffer();
		}

		const binFileCheck: RegExpMatchArray | null =
			name.match(/Maps\/(.+?)\.bin/);

		if (binFileCheck) {
			sids.push(binFileCheck[1].replaceAll(/[ /-]/g, '_'));
		}
	}

	if (dialog) {
		const mapNames: string[] = [];
		for (const sid of sids) {
			const reg: RegExp = new RegExp(`(?<=${sid}= *\\r?\\n?).+`, 'i');

			const text: string = new TextDecoder().decode(dialog);
			const map: string | undefined = text.match(reg)?.[0];

			if (!map) {
				console.warn(
					`\x1b[33mUnable to find ingame name for SID ${sid}\x1b[0m`,
				);
				continue;
			}

			mapNames.push(map.trim());
		}

		return {
			mapNames,
			size,
		};
	} else {
		throw new Error('Unable to find "Dialog/English.txt"');
	}
}

async function createMaps(modDataId: number, downloadUrl: string) {
	const mapData = await getMapNames(downloadUrl);

	try {
		const maps: CelesteMap[] = [];
		mapData.mapNames.forEach((mapName: string, index: number) => {
			const map = new CelesteMap(modDataId, index + 1, mapName);
			maps.push(map);
		});

		return { maps, size: mapData.size };
	} catch (error) {
		throw error;
	}
}

export default createMaps;
