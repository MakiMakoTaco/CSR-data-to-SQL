// Import required modules
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const { exit } = require('process');
const { getMapNames } = require('./getMapNames');

// Create Google Sheets API client
const sheetsAPI = google.sheets({
	version: 'v4',
	auth: process.env.GOOGLE_API_KEY,
});

// Define the spreadsheet ID
const spreadsheetId = '1XTAL3kgpX0bG6SBfznPX8z7Qdb7lGnQRuxeUfPZMFoU';

// Define the fields to be fetched from the spreadsheet
const spreadsheetFields =
	'sheets(properties(title,sheetId,index,gridProperties(rowCount,columnCount)),data.rowData.values(formattedValue,effectiveFormat.backgroundColor,note,hyperlink))';

function formatEpochToSQLDate(epochSeconds) {
	const date = new Date(epochSeconds * 1000);
	const pad = (n) => n.toString().padStart(2, '0');
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
		date.getDate(),
	)} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
		date.getSeconds(),
	)}`;
}

function rgbToHex(color) {
	const { red, green, blue } = color;

	// Scale the RGB values to the 0-255 range
	const r = Math.round(red * 255)
		.toString(16)
		.toUpperCase()
		.padStart(2, '0');
	const g = Math.round(green * 255)
		.toString(16)
		.toUpperCase()
		.padStart(2, '0');
	const b = Math.round(blue * 255)
		.toString(16)
		.toUpperCase()
		.padStart(2, '0');

	// Combine the hexadecimal values
	return `#${r}${g}${b}`;
}

async function getSheetData(filePath) {
	try {
		console.log('Fetching sheet titles');

		const sheetNames = await sheetsAPI.spreadsheets.get({
			spreadsheetId,
			fields: 'sheets.properties.title',
		});

		console.log('Received sheet titles');

		for (let i = 0; i < sheetNames.data.sheets.length; i++) {
			const sheetName = sheetNames.data.sheets[i].properties.title;

			if (sheetName === 'Welcome & Rules') continue;

			console.log(`Fetching data for ${sheetName}`);
			const fileInfo = await sheetsAPI.spreadsheets.get({
				spreadsheetId,
				ranges: `${sheetName}`,
				fields: spreadsheetFields,
				includeGridData: true,
			});

			await sortData(fileInfo.data.sheets[0]);

			console.log(
				`All data in sheet ${sheetName} processed successfully. Creating SQL statements...`,
			);

			createSQLStatements(filePath);

			tiers = [];
			modMap.clear();
			playerProgress.forEach((player) => {
				player.mods = [];
			});
			lastPlayerId = playerId;
		}

		return;
	} catch (error) {
		console.error('Error fetching file:', error.message);
		throw error;
	}
}

const noGBMod = [];

let submitterMap = new Map();

let sideMap = new Map();
let sideId = 1;

let tiers = [];
let tierPresetMap = new Map();
let tierId = 1;

let modMap = new Map();
let modId = 1;

let playerProgress = new Map();
let playerId = 1;
let lastPlayerId = 0;

async function sortData(sheetData) {
	let sheetName = sheetData.properties.title;
	console.log(`Received data, starting processing`);

	if (sheetName.includes('Side') || sheetName === 'Catstare') {
		sideMap.set(sheetName, sheetName.includes('Side') ? sideId++ : 1000);
	}

	let tierName = '';

	const userIndex = [];

	for (let i = 1; i < sheetData.data[0].rowData.length; i++) {
		if (tierName === 'Silver') exit();

		if (i === 2) {
			continue;
		}

		const rowData = sheetData.data[0].rowData;
		const rowValues = rowData[i].values;
		const modName = rowValues[0]?.formattedValue ?? null;

		if (!modName) continue;

		if (i === 1) {
			console.log('Getting player names');

			for (let index = 1; index < rowValues.length; index++) {
				const playerName = rowValues[index]?.formattedValue;

				if (playerName) {
					userIndex.push(playerName);
				}
			}

			userIndex.forEach((username) => {
				if (username !== '') {
					if (!playerProgress.has(username)) {
						playerProgress.set(username, {
							id: playerId++,
							mods: [],
						});
					}
				}
			});

			console.log(
				`\x1b[32mSuccessfully sorted ${playerProgress.size} players\x1b[0m`,
			);

			continue;
		} else if (modName.includes(' Challenges - Clear Any ')) {
			const nameSplit = modName.split(' Challenges - Clear Any ');

			tierName = nameSplit[0].trim().toString();

			if (tierName.includes('DLC')) {
				sideMap.set(tierName, 1000 + Number(tierName.split(' ')[1]));
				sheetName = tierName;
			} else {
				const color = rowData[i + 1].values[0]?.effectiveFormat.backgroundColor;
				const colorPlus = rowValues[0]?.effectiveFormat.backgroundColor;

				if (sheetName === 'Catstare' && tierId < 100000) {
					tierId = 100000;
				}

				if (!tierPresetMap.has(tierName)) {
					tierPresetMap.set(tierName, {
						id: tierPresetMap.size + 1,
						name: tierName,
						appendSideName: sheetName === 'Catstare' ? false : true,
						color: JSON.stringify(color) !== '{}' ? rgbToHex(color) : '#000000',
						colorPlus:
							JSON.stringify(colorPlus) !== '{}' ?
								rgbToHex(colorPlus)
							:	'#000000',
						sideIndex: tiers.length + 1,
					});
				}

				tiers.push({
					id: tierId++,
					sideId: sideId,
					presetId: tierPresetMap.get(tierName).id,
					clearsForRank: nameSplit[1].trim(),
				});
			}

			console.log(`Starting processing for ${tierName} tier`);
			continue;
		} else if (
			modName.includes(
				`${sheetName === 'Catstare' ? 'Catstare' : tierName} Total (Out of `,
			)
		) {
			continue;
		}

		for (let index = 1; index < rowValues.length; index++) {
			const playerName = userIndex[index - 1];
			const cleared = Boolean(rowValues[index]?.formattedValue);

			if (!playerName) continue;

			const player = playerProgress.get(playerName);

			if (player && cleared) {
				player.mods.push({
					modId,
					cleared: Boolean(rowValues[index]?.formattedValue),
					proof: rowValues[index]?.hyperlink ?? null,
				});
			}
		}

		if (['DLC', 'Archived'].includes(sheetName) || sheetName.includes('DLC')) {
			const color = rowValues[0]?.effectiveFormat.backgroundColor;
			const lastColor =
				rowData[i - 1].values[0]?.effectiveFormat.backgroundColor;

			if (color !== lastColor) {
				const dlcTiers = [
					'Bronze',
					'Silver',
					'Gold',
					'Amethyst',
					'Ruby',
					'Diamond',
					'Frog',
				];

				const lastTierIndex = dlcTiers.indexOf(tierName);
				if (lastTierIndex === -1 || lastTierIndex >= dlcTiers.length) {
					tierName = dlcTiers[0];
				} else {
					tierName = dlcTiers[lastTierIndex + 1];
				}

				tiers.push({
					id:
						(Number(sheetName.split(' ')[1]) - 1) * dlcTiers.length +
						dlcTiers.indexOf(tierName) +
						101000,
					sideId: sideId,
					presetId: tierPresetMap.get(tierName).id,
					clearsForRank: null,
				});
			}
		}

		// Get mod data
		try {
			await getModData(rowValues[0]);
		} catch (e) {
			if (e === 'No link in cell') {
				console.log(`${e} A-${i + 1} (${modName})`);
				continue;
			} else {
				console.log(e, `At row: ${i + 1} - ${modName}`);
			}
		}
	}
}

async function getModData(cellData) {
	const name = cellData?.formattedValue.replaceAll("'", "''");
	const notes = cellData?.note?.replaceAll("'", "''") ?? null;

	const link = cellData?.hyperlink;
	const linkSplit = link?.replace('//', '/').split('/');

	const parentId = modId;
	const modIds = [];

	console.log(`Fetching data for ${cellData?.formattedValue}`);

	switch (linkSplit[1]) {
		case 'gamebanana.com':
			const requestOptions = {
				method: 'GET',
				redirect: 'follow',
			};

			if (linkSplit[2] === 'mods') {
				modIds.push(linkSplit[3]);
			} else {
				console.log('Mod is a collection, fetching profile page');

				let page = 0;
				let hasNextPage = true;

				const profileUrl = `https://gamebanana.com/apiv11/Collection/${linkSplit[3]}/ProfilePage`;
				const profileResult = await fetch(profileUrl, requestOptions);
				const profileJson = await profileResult.json();

				sortModData(profileJson, name, maps, notes, false, null, true);

				modId++;

				while (hasNextPage) {
					page++;

					console.log(
						`Fetching page ${page} of ${Math.ceil(profileJson._nItemCount / 15)}`,
					);

					const url = `https://gamebanana.com/apiv11/Collection/${linkSplit[3]}/Items?_nPage=${page}`;
					const collectionResult = await fetch(url, requestOptions);
					const resultJson = await collectionResult.json();

					resultJson._aRecords.forEach((item) => {
						if (item._sModelName !== 'Mod') {
							console.log(
								`Skipping item with model name: ${item._sModelName}. Name of item: ${item._sName}`,
							);
						} else {
							modIds.push(item._sProfileUrl.replace('//', '/').split('/')[3]);
						}
					});

					hasNextPage = !resultJson._aMetadata._bIsComplete;
				}
			}

			for (let i = 0; i < modIds.length; i++) {
				const id = modIds[i];

				const baseUrl = 'https://gamebanana.com/apiv11';

				const url = `${baseUrl}/Mod/${id}/ProfilePage`;
				const modResult = await fetch(url, requestOptions);

				const resultJson = await modResult.json();

				const maps = await getMapNames(resultJson._aFiles[0]._sDownloadUrl);

				sortModData(
					resultJson,
					name,
					maps,
					modIds.length === 1 ? cellData?.notes : null,
					modIds.length > 1,
					modIds.length > 1 ? parentId : null,
				);

				modId++;
			}

			break;
		case 'drive.google.com':
			const url = `https://drive.google.com/uc?export=download&id=${linkSplit[linkSplit.length - 2]}`;
			const maps = await getMapNames(url);

			modMap.set(modId, {
				tierId,
				name,
				gbName: null,
				isChild: false,
				parentId: null,
				submitterId: null,
				category: null,
				version: null,
				gbPage: null,
				gbDownloadPage: null,
				description: null,
				text: null,
				media: null,
				gb_tags: null,
				feedbackInstructions: null,
				notes,
				createdAt: null,
				tags: null,
				downloadLinks: [link],
				// authors: [{}],
			});

			break;
		default:
			modMap.set(modId, {
				tierId,
				name,
				gbName: null,
				isChild: false,
				parentId: null,
				submitterId: null,
				category: null,
				version: null,
				gbPage: null,
				gbDownloadPage: null,
				description: null,
				text: null,
				media: null,
				gb_tags: null,
				feedbackInstructions: null,
				notes,
				createdAt: null,
				tags: null,
				downloadLinks: null,
				// authors: [{}],
			});

			noGBMod.push({
				tierId,
				modId,
				name,
				downloadLinks: [link],
			});

			modId++;
			return;
	}

	/**
	 * ._tsDateAdded, ._sProfileUrl(Mod Page), ._sName, ._sDownloadUrl(Downloads Page), ._sDescription, ._sText, ._sFeedbackInstructions, ._sVersion, ._aEmbeddedMedia
	 * ._aTags[foreach]: ._sValue
	 * ._aCategory: ._sName
	 * ._aSubmitter: ._sName, ._sProfileUrl, ._sAvatarUrl
	 * ._aPreviewMedia._aImages[foreach]: ._sBaseUrl + ._sFile
	 * ._aRequirements[foreach]: name: [0], link: [1]
	 * ._aFiles[foreach]: ._sFile(Downloaded file name), ._nFilesize, ._sDescription, ._sDownloadUrl
	 * ._aFiles._aModManagerIntegrations[0]: ._sDownloadUrl
	 * ._aCredits[foreach]: ._sGroupName
	 * ._aCredits._aAuthors[foreach]: ._sRole, ._sName, ._sProfileUrl, ._sUrl(external url like youtube)
	 */
}

// change input data after changing above function
function sortModData(
	modData,
	name,
	maps,
	notes,
	isChild = false,
	parentId = null,
	isParent = false,
) {
	let mod = {
		tierId,
		id: modId,
		name: isChild ? 'null' : name,
		gbName: null,
		isChild,
		parentId,
		requiredMapClears: null,
		submitterId: null,
		category: null,
		version: null,
		gbPage: null,
		gbDownloadPage: null,
		description: null,
		text: null,
		media: [],
		gbTags: [],
		feedbackInstructions: null,
		notes,
		createdAt: null,
		tags: [],
		downloadLinks: [],
		maps: maps ?? [],
		// authors: [{}],
	};

	let submitterId = null;

	try {
		const submitter = modData._aSubmitter;
		const submitterExists = submitterMap.has(submitter._sName);

		if (!submitterExists) {
			submitterMap.set(submitter._sName, {
				submitterId: submitterMap.size + 1,
				profileUrl: submitter._sProfileUrl,
				avatarUrl: submitter._sAvatarUrl,
			});
		}

		submitterId = submitterMap.get(submitter._sName).submitterId;
	} catch (e) {
		console.error(`Error processing submitter data for ${name}`);
	}

	// requiredMapClears

	mod.gbName = modData._sName.replaceAll("'", "''");
	mod.submitterId = submitterId;
	mod.category = modData?._aCategory?._sName.replaceAll("'", "''") ?? null;
	mod.version = modData._sVersion;
	mod.gbPage = modData._sProfileUrl;
	mod.gbDownloadPage = modData?._sDownloadUrl ?? null;
	mod.description = modData._sDescription?.replaceAll("'", "''") ?? null;
	mod.text = modData._sText?.replaceAll("'", "''") ?? null;
	mod.createdAt =
		modData._tsDateAdded ? formatEpochToSQLDate(modData._tsDateAdded) : null;

	if (!isParent) {
		mod.media = modData._aEmbeddedMedia ?? [];
		for (let i = 0; i < modData._aPreviewMedia._aImages.length; i++) {
			const images = modData._aPreviewMedia._aImages[i];

			mod.media.push(`${images._sBaseUrl}/${images._sFile}`);
		}
		if (mod.media.length === 0) mod.media = null;
	}

	if (modData._aTags && modData._aTags?.length > 0) {
		modData._aTags.forEach((tag) => {
			mod.tags.push(tag._sValue.replaceAll("'", "''"));
		});
	}
	if (mod.tags.length === 0) mod.tags = null;

	if (modData._sFeedbackInstructions) {
		mod.feedbackInstructions =
			modData._sFeedbackInstructions.replaceAll("'", "''") ?? null;
	}

	if (modData._aFiles && modData._aFiles.length > 0) {
		for (let i = 0; i < modData._aFiles.length; i++) {
			const file = modData._aFiles[i];

			mod.downloadLinks.push({
				orderIndex: mod.downloadLinks.length,
				fileName: file._sFile,
				fileSize: file._nFilesize,
				description: file._sDescription,
				manualUrl: file._sDownloadUrl,
				everestUrl: file._aModManagerIntegrations?.[0]._sDownloadUrl,
			});
		}
	}

	modMap.set(modId, mod);
}

function createSQLStatements(filePath = join(__dirname, '../sqlFiles')) {
	if (noGBMod.length > 0) {
		noGBMod.forEach((mod) => {
			appendFileSync(
				join(filePath, 'no_gb_mods.txt'),
				`Tier ID: ${mod.tierId}, Mod ID: ${mod.modId}, Name: ${
					mod.name
				}, Download Links: ${mod.downloadLinks.join(', ')}\n`,
			);
		});
	}

	// tiers.forEach((tier) => {
	// 	appendFileSync(
	// 		join(filePath, 'tiers.sql'),
	// 		`,\n(${tierId}, '${tier.name}', '${tier.color}', '${tier.colorPlus}', ${tier.clearsForRank}, ${tier.sideId}, ${tier.sideIndex})`,
	// 	);
	// });

	// modMap.forEach((mod, modId) => {
	// 	appendFileSync(
	// 		join(filePath, 'mod_tiers.sql'),
	// 		`,\n(${modId}, ${mod.tierId})`,
	// 	);

	// 	// Simplified mods.sql insert with additional fields, using null for empty values and quoting literals
	// 	appendFileSync(
	// 		join(filePath, 'mods.sql'),
	// 		`,\n(${modId}, ${mod.name ? `'${mod.name}'` : null}, ${
	// 			mod.gbName ? `'${mod.gbName}'` : null
	// 		}, ${mod.isChild ? 1 : 0}, ${
	// 			mod.parentId !== null ? mod.parentId : null
	// 		}, ${mod.submitterId !== null ? mod.submitterId : null}, ${
	// 			mod.category ? `'${mod.category}'` : null
	// 		}, ${mod.version ? `'${mod.version}'` : null}, ${
	// 			mod.gbPage ? `'${mod.gbPage}'` : null
	// 		}, ${mod.gbDownloadPage ? `'${mod.gbDownloadPage}'` : null}, ${
	// 			mod.description ? `'${mod.description}'` : null
	// 		}, ${mod.text ? `'${mod.text}'` : null}, ${
	// 			Array.isArray(mod.media) && mod.media.length ?
	// 				`'${mod.media.join(' ')}'`
	// 			:	null
	// 		}, ${
	// 			Array.isArray(mod.tags) && mod.tags.length ?
	// 				`'${mod.tags.join(', ')}'`
	// 			:	null
	// 		}, ${
	// 			mod.feedbackInstructions ? `'${mod.feedbackInstructions}'` : null
	// 		}, ${mod.notes ? `'${mod.notes}'` : null}, ${
	// 			mod.createdAt ? `'${mod.createdAt}'` : null
	// 		})`,
	// 	);

	// 	// Write download links for this mod
	// 	if (Array.isArray(mod.downloadLinks)) {
	// 		if (mod.downloadLinks.length > 0) {
	// 			mod.downloadLinks.forEach((link) => {
	// 				appendFileSync(
	// 					join(filePath, 'download_links.sql'),
	// 					`,\n(${modId}, ${link.orderIndex}, ${
	// 						link.fileName ? `'${link.fileName}'` : null
	// 					}, ${
	// 						link.fileSize !== null && link.fileSize !== undefined ?
	// 							link.fileSize
	// 						:	null
	// 					}, ${link.description ? `'${link.description}'` : null}, '${
	// 						link.manualUrl
	// 					}', ${link.everestUrl ? `'${link.everestUrl}'` : null})`,
	// 				);
	// 			});
	// 		}
	// 	}
	// });

	// submitterMap.forEach((submitter, submitterName) => {
	// 	appendFileSync(
	// 		join(filePath, 'mod_submitter.sql'),
	// 		`,\n(${submitter.submitterId}, '${submitterName}', '${submitter.profileUrl}', '${submitter.avatarUrl}')`,
	// 	);
	// });

	// playerProgress.forEach((player, playerName) => {
	// 	if (player.playerId >= lastPlayerId) {
	// 		appendFileSync(
	// 			join(filePath, 'players.sql'),
	// 			`,\n(${player.playerId}, '${playerName}')`,
	// 		);
	// 	}

	// 	if (player.mods && player.mods.length > 0) {
	// 		player.mods.forEach((mod) => {
	// 			appendFileSync(
	// 				join(filePath, 'player_progress.sql'),
	// 				`,\n(${player.playerId}, ${mod.modId}, ${mod.cleared ? 1 : 0}, '${
	// 					mod.proof
	// 				}', null)`,
	// 			);
	// 		});
	// 	}
	// });
}

// Export the functions
module.exports = { getSheetData };
