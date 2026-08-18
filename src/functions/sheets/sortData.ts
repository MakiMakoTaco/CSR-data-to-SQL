// Imports

// Types
import type { sheets_v4 } from 'googleapis';
import type { BaseModData } from '../../classes/Mod';
import type { Color } from '../../types/Color';

// Classes
import { Side, DLC } from '../../classes/Side';
import { Tier, TierPreset } from '../../classes/Tier';
// import { Mod } from '../../classes/Mod';
import { Player } from '../../classes/Player';

// Utils
import letterToNumber from '../utils/letterToNumber';
import {
	fetchGameBananaModData,
	fetchGameBananaParentData,
	fetchGoogleDriveData,
} from '../utils/fetchModData';
import { appendFile, appendFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { exit } from 'node:process';

const filePath = join(__dirname, '../../../output');

async function sortData(
	sheetData: sheets_v4.Schema$Sheet,
	ids: {
		tierPresets: Map<string, number>;
		modData: Map<string, number>;
		players: Map<string, number>;
		modId: number;
	},
) {
	const conditionalFormats = sheetData.conditionalFormats;

	if (!sheetData.properties || !sheetData.properties.title) {
		throw new Error('Sheet contains no properties');
	}

	const sheetName: string = sheetData.properties.title;
	console.log(`Received data, starting processing`);

	let side: Side | DLC = new Side(sheetName);
	const standardTiers = [
		'Bronze',
		'Silver',
		'Gold',
		'Amethyst',
		'Ruby',
		'Diamond',
		'Frog',
	];

	if (!sheetData.data?.[0].rowData?.length) {
		throw new Error(`${sheetName} has no row data`);
	}

	let tier: Tier;
	let tierId: number = 1;
	let tierName: string = '';

	let tierIndex: number = 0;

	const playerIndex: [Player?] = [];

	for (let i = 1; i < sheetData.data[0].rowData.length; i++) {
		if (i === 2) {
			continue;
		}

		const rowData = sheetData.data[0].rowData;
		const rowValues = rowData[i].values;
		const cellText = rowValues?.[0].formattedValue;

		if (!rowValues || !cellText) continue;

		if (cellText.includes(' Total (Out of ')) {
			if (
				side.name.includes('DLC') &&
				side instanceof DLC &&
				conditionalFormats
			) {
				const tierFormats = conditionalFormats.filter(
					(format) => format.ranges?.[0].startRowIndex === i,
				);
				const defaultColorFormat = tierFormats.find(
					(format) => format.booleanRule?.condition?.type === 'NUMBER_BETWEEN',
				);

				side.color = defaultColorFormat?.booleanRule?.format?.backgroundColor;

				appendFileSync(
					join(filePath, 'side.json'),
					`,"${side.name}": ${JSON.stringify(side)}`,
				);
			}

			continue;
		}

		if (i === 1) {
			console.log('Getting player names');

			for (let index = 1; index < rowValues.length; index++) {
				const playerName = rowValues[index]?.formattedValue;

				if (playerName) {
					const existingPlayer = ids.players.get(playerName);
					const player: Player = new Player(
						existingPlayer ? existingPlayer : ids.players.size + 1,
						playerName,
					);

					if (!existingPlayer) {
						ids.players.set(player.name, player.id);
					}

					playerIndex.push(player);
				}
			}

			console.log(
				`\x1b[32mSuccessfully sorted ${ids.players.size} players\x1b[0m`,
			);

			continue;
		}

		if (
			cellText.includes(' Challenges - Clear Any ') ||
			['DLC', 'Archived'].includes(sheetName)
		) {
			const colorPlus = rowValues[0]?.effectiveFormat?.backgroundColor ?? {
				red: 0,
				green: 0,
				blue: 0,
			};

			const nameSplit = cellText.split(' Challenges - Clear Any ');
			tierName = nameSplit.length >= 2 ? nameSplit[0].trim() : tierName;
			const tierClears: number =
				nameSplit.length >= 2 ? Number(nameSplit[1].trim()) : 0;

			if (tierName.includes('DLC') && side.name !== tierName) {
				side = new DLC(
					tierName,
					colorPlus,
					tierClears,
					sheetName === 'Archived' ? true : false,
				);

				continue;
			}

			let color: Color | undefined;

			if (['DLC', 'Archived'].includes(sheetName)) {
				color = rowValues[0].effectiveFormat?.backgroundColor;
				const lastColor =
					rowData[i - 1].values?.[0].effectiveFormat?.backgroundColor;

				if (!color) continue;
				if (JSON.stringify(color) === JSON.stringify(lastColor)) continue;

				const lastTierIndex = standardTiers.indexOf(tierName);

				if (lastTierIndex === -1 || lastTierIndex >= standardTiers.length) {
					tierName = standardTiers[0];
				} else {
					tierName = standardTiers[lastTierIndex + 1];
				}
			}

			let presetTierId: number;
			const tierPreset = ids.tierPresets.get(tierName);

			if (!tierPreset) {
				if (!tierName.includes('DLC')) {
					color = rowData[i + 1].values?.[0].effectiveFormat
						?.backgroundColor ?? { red: 0, green: 0, blue: 0 };
				}
				if (!color) continue;

				const newTier = new TierPreset(
					ids.tierPresets.size + 1,
					tierName,
					sheetName === 'Catstare' ? false : true,
					color,
					colorPlus,
					tierIndex++,
				);

				ids.tierPresets.set(tierName, newTier.id);
				presetTierId = newTier.id;
			} else {
				presetTierId = tierPreset;
			}

			if (side.name.includes('DLC')) {
				tierId =
					(Number(side.name.split(' ')[1]) - 1) * standardTiers.length +
					standardTiers.indexOf(tierName) +
					101000;
			} else if (sheetName === 'Catstare') {
				tierId = 100000 + tierIndex - 1;
			} else if (sheetName === 'Super-Side') {
				tierId = tierIndex;
			} else {
				tierId =
					letterToNumber(side.name.split('-')[0]) * standardTiers.length +
					1 +
					tierIndex;
			}

			tier = new Tier(
				tierId,
				tierName,
				side.id,
				presetTierId,
				!tierName.includes('DLC') ? tierClears : undefined,
			);

			console.log(`Starting processing for ${tierName} in ${side.name}`);
			appendFileSync(
				join(filePath, 'tier.json'),
				`,"${tier.name}": ${JSON.stringify(tier)}`,
			);

			continue;
		}

		// Get mod data
		const hyperlink = rowValues[0].hyperlink;
		if (!hyperlink) continue;
		// if (!hyperlink.includes('drive.google.com')) continue;

		let modDataId: number = ids.modData.get(hyperlink) ?? ids.modData.size + 1;

		if (!ids.modData.has(hyperlink)) {
			let mod: BaseModData;
			if (hyperlink.includes('gamebanana.com')) {
				if (
					!['/collections/', '/mods/'].some((type) => hyperlink.includes(type))
				) {
					console.error(
						`Unable to create new GameBanana class for mod at row ${i + 1} (${cellText}, ${hyperlink})`,
					);
					continue;
				}

				const gamebananaId: string = hyperlink.split('/').pop() ?? '';
				if (!gamebananaId) {
					throw new Error(
						`Unable to find GameBanana ID for new mod "${cellText}"`,
					);
				}

				if (hyperlink.includes('/collections/')) {
					console.log('Mod is a collection, fetching profile page');

					const data = await fetchGameBananaParentData(ids.modId, gamebananaId);
					ids.modId = data.modId;
					mod = data.parent;
				} else if (hyperlink.includes('/mods/')) {
					mod = await fetchGameBananaModData(ids.modId, gamebananaId);
					ids.modId++;
				}
			} else if (hyperlink.includes('drive.google.com')) {
				const googleDriveId: string | undefined =
					hyperlink.match(/(?<=\/d\/)(.*)(?=\/)/g)?.[0];

				if (!googleDriveId) {
					console.error(
						`Unable to find Google Drive ID for mod with name ${cellText}`,
					);
					continue;
				}

				mod = await fetchGoogleDriveData(ids.modId, googleDriveId);
			} else {
				console.error(
					`Unable to create new BaseMod class for mod at row ${i + 1} (${cellText}, ${hyperlink})`,
				);
				continue;
			}

			ids.modData.set(hyperlink, modDataId);
		}

		// const mod = new Mod(
		// 	ids.modId + 1,
		// 	cellText,
		// 	modDataId,
		// 	tierId,
		// 	rowValues[0].note ?? undefined,
		// );

		// for (let index = 1; index < rowValues.length; index++) {
		// 	const player = playerIndex[index - 1];
		// 	const cleared = Boolean(rowValues[index]?.formattedValue);
		// 	const proof = rowValues[index].hyperlink;

		// 	if (!player || !cleared || !proof) continue;

		// 	player.addClear(mod.id, proof);
		// }
	}

	if (!['DLC', 'Archived'].includes(sheetName)) {
		appendFileSync(
			join(filePath, 'side.json'),
			`,"${side.name}": ${JSON.stringify(side)}`,
		);
		console.log(ids.tierPresets);
	}

	return ids;
}

export default sortData;
