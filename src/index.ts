import 'dotenv/config';
import setupSqlFiles from './functions/sql/setup';
import getSheetData from './functions/sheets/checkSheets';

async function main() {
	console.log('Creating initial SQL files');
	// setupSqlFiles();

	console.log('Starting sheet processing');
	try {
		await getSheetData();
	} catch (error: any) {
		console.log(error);
	}

	console.log('Finished processing sheets and generating SQL files');
}

main();
