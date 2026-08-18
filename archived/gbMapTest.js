const fs = require('fs');
const { unzipSync, strFromU8 } = require('fflate');

const input = 'https://gamebanana.com/dl/1544747';
// const input = 'https://drive.google.com/uc?export=download&id=1KhVFlc2d0PDE_ceimGwzd-iaRuSwrfuY';

async function getMapNames(input) {
	const zip = await fetch(input).then((r) => r.arrayBuffer());

	const files = unzipSync(new Uint8Array(zip));

	const SIDs = [];
	Object.keys(files).forEach((file) => {
		if (file.match(/Maps\/(.+?)\.bin/)) {
			SIDs.push(
				file
					.match(/Maps\/(.+?)\.bin/)[1]
					.replaceAll('/', '_')
					.replaceAll('-', '_'),
			);
		}
	});

	// const dialog = files['Dialog/English.txt'];
	const dialog = files['CollabUtils2CollabID.txt'];

	if (dialog) {
		// const maps = [];
		// SIDs.forEach((match) => {
		// 	const reg = new RegExp(`(?<=${match}= *\\r?\\n?).+`, 'i');

		// 	const text = strFromU8(dialog);
		// 	let map = text.match(reg)?.[0];

		// 	maps.push(map.trim());
		// });

		// return maps;

		fs.writeFile(
			'/home/zelda/Documents/Code/CSR Sheet to SQL/output/test.txt',
			// maps.join('\n'),
			dialog,
			(err) => {
				if (err) {
					console.error(err);
				} else {
					console.log('Successfully written file');
				}
			},
		);
	} else {
		console.log('Could not find file');
		return null;
	}
}

getMapNames(input);

module.exports = { getMapNames };
