import {
	appendFileSync,
	createReadStream,
	createWriteStream,
	readdirSync,
	renameSync,
} from 'node:fs';
import path from 'node:path';
import { createInterface } from 'node:readline';

function tidySql() {
	const outputPath = path.join(process.cwd(), 'output');
	const dir = readdirSync(outputPath);

	dir.forEach((file) => {
		if (file.includes('.sql')) {
			const sqlFile = path.join(outputPath, file);
			const tempFile = path.join(sqlFile + '.tmp');

			appendFileSync(sqlFile, ';');

			const readStream = createReadStream(sqlFile);
			const writeStream = createWriteStream(tempFile);
			const rl = createInterface({
				input: readStream,
			});

			let isFirstLine = true;

			rl.on('line', (line) => {
				if (isFirstLine) {
					writeStream.write(line.slice(0, -1) + '\n');
					isFirstLine = false;
				} else {
					writeStream.write(line + '\n');
				}
			});

			rl.on('close', () => {
				renameSync(tempFile, sqlFile);
			});
		}
	});
}

tidySql();

export default tidySql;
