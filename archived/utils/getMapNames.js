import fs from 'fs';
import { unzipSync, strFromU8 } from 'fflate';
import { exit } from 'process';

// const input = 'https://gamebanana.com/dl/1539722' || 'https://filecache38.gamebanana.com/mods/cat_isle_c7728.zip';
// const input = 'https://drive.google.com/uc?export=download&id=1KhVFlc2d0PDE_ceimGwzd-iaRuSwrfuY';

async function getMapNames(input) {
	const zip = await fetch(input).then(async (r) => await r.arrayBuffer());

	const files = unzipSync(new Uint8Array(zip));

	const SIDs = [];
	Object.keys(files).forEach((file) => {
		if (file.match(/Maps\/(.+?)\.bin/)) {
			SIDs.push(file.match(/Maps\/(.+?)\.bin/)[1].replaceAll(/[/-]/g, '_'));
		}
	});

	console.log(SIDs);
	exit();

	const dialog = files['Dialog/English.txt'];

	if (dialog) {
		const maps = [];
		SIDs.forEach((match) => {
			const reg = new RegExp(`(?<=${match}= *\\r?\\n?).+`, 'i');

			const text = strFromU8(dialog);
			let map = text.match(reg)?.[0];

			maps.push(map.trim());
		});

		return maps;

		// fs.writeFile(
		// 	'/home/zelda/Documents/Code/CSR Website/src/lib/importer/test6.txt',
		// 	maps.join('\n'),
		// 	(err) => {
		// 		if (err) {
		// 			console.error(err);
		// 		} else {
		// 			console.log('Successfully written file');
		// 		}
		// 	}
		// );
	} else {
		console.log('Could not find file');
		return null;
	}
}

getMapNames('https://filecache38.gamebanana.com/mods/cat_isle_c7728.zip');

export default { getMapNames };
