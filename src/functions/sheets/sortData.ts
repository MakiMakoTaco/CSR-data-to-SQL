// Imports

// Types
import type { sheets_v4 } from 'googleapis';
import type { Color } from '../../types/Color';
import type { Ids } from '../../types/Ids';
import type { PlayerClear } from '../../types/PlayerClear';

// Classes
import { Side, DLC } from '../../classes/Side';
import { Tier, TierPreset } from '../../classes/Tier';
import { BaseModData, Mod } from '../../classes/Mod';
import { Player } from '../../classes/Player';

// Utils
import {
	fetchGameBananaModData,
	fetchGameBananaParentData,
	fetchGoogleDriveData,
} from '../utils/fetchModData';
import { appendFileSync } from 'node:fs';
import path from 'node:path';

async function sortData(sheetData: sheets_v4.Schema$Sheet, ids: Ids) {
	const conditionalFormats = sheetData.conditionalFormats;

	if (!sheetData.properties || !sheetData.properties.title) {
		throw new Error('Sheet contains no properties');
	}

	const sheetName: string = sheetData.properties.title;
	console.log('\x1b[32m✅ Received data\x1b[0m');
	console.log('Starting processing');

	let side: Side | DLC = new Side(
		sheetName,
		sheetData.data?.[0].rowData?.[3].values?.[0].hyperlink ?? undefined,
	);
	if (!['DLC', 'Archived'].includes(sheetName)) {
		side.id = ids.sideId;
		side.createSqlStatement();

		ids.sideId++;
	}

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
	let tierIndex: number = 1;
	let tierName: string = '';

	const playerIndex: Player[] = [];

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
				side.createSqlStatement();
			}

			continue;
		}

		if (i === 1) {
			console.log('Getting player names');

			for (let index = 1; index < rowValues.length; index++) {
				const playerName = rowValues[index]?.formattedValue;

				if (playerName) {
					let player: Player | undefined = ids.players.get(playerName);
					if (!player) {
						player = new Player(ids.players.size + 1, playerName);
						player.createSqlStatement();

						ids.players.set(player.name, player);
					}

					playerIndex.push(player);
				}
			}

			console.log(
				`\x1b[32mSuccessfully sorted ${playerIndex.length} players\x1b[0m`,
			);

			continue;
		}

		if (
			cellText.includes(' Challenges - Clear Any ') ||
			(['DLC', 'Archived'].includes(sheetName) &&
				JSON.stringify(rowValues[0].effectiveFormat?.backgroundColor) !==
					JSON.stringify(
						rowData[i - 1].values?.[0].effectiveFormat?.backgroundColor,
					))
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
					undefined,
					rowValues[0].hyperlink ?? undefined,
				);

				side.id = ids.sideId;
				ids.sideId++;

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
				if (!color) {
					console.error(
						'\x1b[31mNo Color found when trying to create a new tier\x1b[0m',
					);
					continue;
				}

				const newTier = new TierPreset(
					ids.tierPresets.size + 1,
					tierName,
					sheetName === 'Catstare' ? false : true,
					color,
					colorPlus,
					tierIndex,
				);
				newTier.createSqlStatement();

				ids.tierPresets.set(tierName, newTier.id);
				presetTierId = newTier.id;
			} else {
				presetTierId = tierPreset;
			}

			ids.tierId++;
			tier = new Tier(
				ids.tierId,
				side.id,
				presetTierId,
				!tierName.includes('DLC') ? tierClears : null,
			);
			tier.createSqlStatement();
			tierIndex++;

			console.log(`Starting maps for ${tierName}`);

			if (!['DLC', 'Archived'].includes(sheetName)) continue;
		}

		console.log(`Processing data for ${cellText}`);

		// Get mod data

		const hyperlink =
			rowValues[0].hyperlink ||
			rowValues[0].textFormatRuns?.[0].format?.link?.uri;
		if (!hyperlink) {
			console.error(
				`\x1b[31mUnable to find usable link for ${cellText}\x1b[0m`,
				rowValues[0],
				rowValues[0].textFormatRuns,
			);
			continue;
		}

		let modDataId: number = ids.modData.get(hyperlink) ?? ids.modDataId;

		if (!ids.modData.has(hyperlink)) {
			ids.modData.set(hyperlink, modDataId);

			let mod!: BaseModData | null;

			if (hyperlink.includes('gamebanana.com')) {
				if (
					!['/collections/', '/mods/', '/wips/'].some((type) =>
						hyperlink.includes(type),
					)
				) {
					mod = new BaseModData(ids.modDataId, hyperlink);
					console.error(
						`\x1b[31mUnable to create new GameBanana class for mod at row ${i + 1} (${cellText}, ${hyperlink})\x1b[0m`,
					);
					appendFileSync(
						path.join(process.cwd(), 'output/log.txt'),
						`ID: ${ids.modDataId}, Unable to create new GameBanana class for mod ${cellText}: ${hyperlink}. Created base mod without any applicable children instead\n`,
					);
				} else {
					const splitHyperlink: string[] = hyperlink.split('/');
					const gamebananaId: string = splitHyperlink.pop() ?? '';
					const modType: string = splitHyperlink.pop() ?? '';

					if (!gamebananaId) {
						console.error(
							`\x1b[31mUnable to find GameBanana ID for new mod ${cellText}\x1b[0m`,
						);
						appendFileSync(
							path.join(process.cwd(), 'output/log.txt'),
							`Unable to find GameBanana ID for new mod ${cellText}\n`,
						);
						continue;
					}

					if (hyperlink.includes('/collections/')) {
						console.log('Mod is a collection, fetching profile page');

						const data = await fetchGameBananaParentData(
							ids.modDataId,
							gamebananaId,
							ids.creditGroupId,
							ids.contributors,
						);

						ids.modDataId = data.modDataId + 1;
						ids.creditGroupId = data.lastCreditGroupId;
						mod = data.parent;
					} else if (
						hyperlink.includes('/mods/') ||
						hyperlink.includes('/wips/')
					) {
						const data = await fetchGameBananaModData(
							ids.modDataId,
							modType,
							gamebananaId,
							ids.creditGroupId,
							ids.contributors,
						);

						if (data) {
							ids.creditGroupId = data.lastCreditGroupId;
							mod = data.mod;
						}
					}
				}
			} else if (hyperlink.includes('drive.google.com')) {
				const googleDriveId: string | undefined =
					hyperlink.match(/(?<=\/d\/)(.*)(?=\/)/g)?.[0];

				if (!googleDriveId) {
					console.error(
						`\x1b[31mUnable to find Google Drive ID for mod with name ${cellText}\x1b[0m`,
					);
					appendFileSync(
						path.join(process.cwd(), 'output/log.txt'),
						`Unable to find Google Drive ID for mod with name ${cellText}\n`,
					);
					continue;
				}

				mod = await fetchGoogleDriveData(
					ids.modDataId,
					hyperlink,
					googleDriveId,
				);
			} else if (hyperlink.includes('docs.google.com')) {
				mod = new BaseModData(ids.modDataId, hyperlink);
			} else {
				console.error(
					`\x1b[31mUnable to create new BaseMod class for mod at row ${i + 1} (${cellText}, ${hyperlink})\x1b[0m`,
				);
				appendFileSync(
					path.join(process.cwd(), 'output/log.txt'),
					`Unable to create new BaseMod class for mod at row ${i + 1} (${cellText}, ${hyperlink})\n`,
				);
				continue;
			}

			if (mod) {
				mod.createSqlStatement();
			} else {
				mod = new BaseModData(ids.modDataId, hyperlink);
				mod.createSqlStatement();

				appendFileSync(
					path.join(process.cwd(), 'output/log.txt'),
					`Mod Data ID ${ids.modDataId} has been created with base mod data\n`,
				);
			}

			ids.modDataId++;
		} else {
			console.log(`Found existing mod data for ${cellText}`);
		}

		const mod = new Mod(
			ids.modId,
			cellText,
			modDataId,
			ids.tierId,
			rowValues[0].note ?? undefined,
		);
		mod.createSqlStatement();

		ids.modId++;

		for (let index = 1; index < rowValues.length; index++) {
			const player = playerIndex[index - 1];
			const cleared = Boolean(rowValues[index]?.formattedValue);
			const proof =
				rowValues[index].hyperlink ??
				rowValues[index].textFormatRuns
					?.map((valueFormat) => valueFormat?.format?.link?.uri)
					.join(' ');

			if (!player || !cleared || !proof) continue;

			const clear: PlayerClear = { cleared: true, modId: mod.id, proof };
			player.addClear(clear);
		}
	}

	console.log(`\x1b[32mFinished processing ${side.name}\x1b[0m`);
	return ids;
}

export default sortData;
