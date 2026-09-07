import 'dotenv/config';
import setupSqlFiles from './functions/sql/setup';
import getSheetData from './functions/sheets/checkSheets';
import tidySql from './functions/sql/tidy';

async function main() {
	console.log('Creating initial SQL files');
	setupSqlFiles();

	console.log('Starting sheet processing');
	try {
		await getSheetData();
	} catch (error: any) {
		console.log('\x1b[31m' + error + '\x1b[0m');
	}

	console.log('Tidying up SQL files');
	tidySql();

	console.log(
		'\x1b[32mFinished processing sheets and generating SQL files\x1b[0m',
	);
}

main();
