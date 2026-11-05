// Imports
import type { Ids } from '../../types/Ids';

import { google } from 'googleapis';
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
	'sheets(conditionalFormats(ranges.startRowIndex,booleanRule(condition.type,format.backgroundColor)),properties(title,sheetId,index,gridProperties(rowCount,columnCount)),data.rowData.values(formattedValue,effectiveFormat.backgroundColor,note,hyperlink,textFormatRuns.format.link.uri))';

async function getSheetData() {
	try {
		console.log('Fetching sheet titles');

		const sheetNames = await sheetsAPI.spreadsheets.get({
			spreadsheetId,
			fields: 'sheets.properties.title',
		});

		if (!sheetNames.data.sheets) {
			throw new Error('No sheets found');
		}

		console.log('\x1b[32mReceived sheet titles\x1b[0m');

		let ids: Ids = {
			players: new Map(),
			contributors: new Map(),
			tierPresets: new Map(),
			modData: new Map(),
			sideId: 1,
			tierId: 1,
			modId: 1,
			modDataId: 1,
			creditGroupId: 1,
		};

		for (let i = 0; i < sheetNames.data.sheets.length; i++) {
			const sheetName = sheetNames.data.sheets[i].properties?.title;

			if (!sheetName) {
				console.warn(
					`\x1b[33mCould not find name for sheet at index ${i}\x1b[0m`,
				);
				continue;
			}
			if (sheetName === 'Welcome & Rules') continue;
			// if (!['DLC', 'Archived'].includes(sheetName)) continue;

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
		}

		return;
	} catch (error: any) {
		throw error;
	}
}

export default getSheetData;
