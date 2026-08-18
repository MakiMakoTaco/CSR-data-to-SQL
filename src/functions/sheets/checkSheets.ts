// Import required modules
import fs from 'fs';
import path, { join } from 'path';
import { google } from 'googleapis';
import { exit } from 'process';
import sortData from './sortData';

// Create Google Sheets API client
const sheetsAPI = google.sheets({
	version: 'v4',
	auth: process.env.GOOGLE_API_KEY,
});

// Define the spreadsheet ID
const spreadsheetId = '1XTAL3kgpX0bG6SBfznPX8z7Qdb7lGnQRuxeUfPZMFoU';

// Define the fields to be fetched from the spreadsheet
const spreadsheetFields =
	'sheets(conditionalFormats(ranges.startRowIndex,booleanRule(condition.type,format.backgroundColor)),properties(title,sheetId,index,gridProperties(rowCount,columnCount)),data.rowData.values(formattedValue,effectiveFormat.backgroundColor,note,hyperlink))';

function formatEpochToSQLDate(epochSeconds: number) {
	const date = new Date(epochSeconds * 1000);
	const pad = (n: number) => n.toString().padStart(2, '0');
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
		date.getDate(),
	)} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
		date.getSeconds(),
	)}`;
}

async function getSheetData(filePath: string = join(__dirname, './sqlFiles')) {
	try {
		console.log('Fetching sheet titles');

		console.log(process.env.GOOGLE_API_KEY);

		const sheetNames = await sheetsAPI.spreadsheets.get({
			spreadsheetId,
			fields: 'sheets.properties.title',
		});

		if (!sheetNames.data.sheets) {
			throw new Error('No sheets found');
		}

		console.log('Received sheet titles');

		interface ids {
			tierPresets: Map<string, number>;
			modData: Map<string, number>;
			players: Map<string, number>;
			modId: number;
		}

		let ids: ids = {
			tierPresets: new Map(),
			modData: new Map(),
			players: new Map(),
			modId: 1,
		};
		for (let i = 0; i < sheetNames.data.sheets.length; i++) {
			const sheetName = sheetNames.data.sheets[i].properties?.title;

			if (!sheetName) {
				console.error(`Could not find name for sheet at index ${i}`);
				continue;
			}
			if (sheetName === 'Welcome & Rules') continue;
			// if (sheetName !== 'DLC') continue;

			console.log(`Fetching data for ${sheetName}`);
			const fileInfo = await sheetsAPI.spreadsheets.get({
				spreadsheetId,
				ranges: [sheetName],
				fields: spreadsheetFields,
				includeGridData: true,
			});

			if (fileInfo.data.sheets) {
				ids = await sortData(fileInfo.data.sheets[0], ids);
			}

			console.log(
				`All data in sheet ${sheetName} processed successfully. Creating SQL statements...`,
			);

			// createSQLStatements(filePath);

			// tiers = [];
			// modMap.clear();
			// playerProgress.forEach((player) => {
			// 	player.mods = [];
			// });
			// lastPlayerId = playerId;
		}

		return;
	} catch (error: any) {
		console.error('Error fetching file:', error.message);
		throw error;
	}
}

export default getSheetData;
