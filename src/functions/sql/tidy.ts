import {
	appendFileSync,
	createReadStream,
	createWriteStream,
	mkdirSync,
	readdirSync,
} from 'node:fs';
import path from 'node:path';
import { createInterface } from 'node:readline';

async function tidySql() {
	const outputPath = path.join(process.cwd(), 'output');
	const dir = readdirSync(outputPath);
	const mergedFile = path.join(outputPath, 'merged/output.sql');

	if (!mergedFile) mkdirSync(mergedFile);

	for await (const file of dir) {
		if (file.includes('.sql')) {
			const sqlFile = path.join(outputPath, file);

			appendFileSync(sqlFile, ';');

			const readStream = createReadStream(sqlFile);
			const writeStream = createWriteStream(mergedFile, { flags: 'a' });
			const rl = createInterface({
				input: readStream,
			});

			await new Promise<void>((resolve) => {
				let isFirstLine = true;

				rl.on('line', (line) => {
					if (isFirstLine) {
						const firstLine = line.slice(0, -1) + '\n';
						writeStream.write(firstLine);
						isFirstLine = false;
					} else {
						writeStream.write(line + '\n');
					}
				});

				rl.on('close', () => {
					writeStream.write('\n');
					writeStream.end(() => {
						resolve();
					});
				});
			});
		}
	}

	appendFileSync(
		mergedFile,
		'ALTER TABLE authors ADD CONSTRAINT authors_contributor_id_fkey FOREIGN KEY (contributor_id) REFERENCES contributors(id) ON DELETE RESTRICT;\n' +
			'ALTER TABLE authors ADD CONSTRAINT authors_group_id_fkey FOREIGN KEY(group_id) REFERENCES credit_groups(id) ON DELETE CASCADE;\n' +
			'ALTER TABLE credit_groups ADD CONSTRAINT credit_groups_mod_id_fkey FOREIGN KEY(mod_data_id) REFERENCES mod_data(id) ON DELETE CASCADE;\n' +
			'ALTER TABLE download_links ADD CONSTRAINT download_links_mod_id_fkey FOREIGN KEY(mod_data_id) REFERENCES mod_data(id) ON DELETE CASCADE;\n' +
			'ALTER TABLE mods ADD CONSTRAINT mods_tier_id_fkey FOREIGN KEY (tier_id) REFERENCES tiers(id) ON DELETE CASCADE;\n' +
			'ALTER TABLE player_progress ADD CONSTRAINT player_progress_player_id_fkey FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE;\n' +
			'\n' +
			'ALTER TABLE contributors ALTER id ADD GENERATED ALWAYS AS IDENTITY;\n' +
			'ALTER TABLE credit_groups ALTER id ADD GENERATED ALWAYS AS IDENTITY;\n' +
			'ALTER TABLE mod_data ALTER id ADD GENERATED ALWAYS AS IDENTITY;\n' +
			'ALTER TABLE mods ALTER id ADD GENERATED ALWAYS AS IDENTITY;\n' +
			'ALTER TABLE players ALTER id ADD GENERATED ALWAYS AS IDENTITY;\n' +
			'ALTER TABLE sides ALTER id ADD GENERATED ALWAYS AS IDENTITY;\n' +
			'ALTER TABLE tier_presets ALTER id ADD GENERATED ALWAYS AS IDENTITY;\n' +
			'ALTER TABLE tiers ALTER id ADD GENERATED ALWAYS AS IDENTITY;\n' +
			'\n' +
			"SELECT SETVAL('admins_id_seq', (SELECT MAX(id) FROM admins));\n" +
			"SELECT SETVAL('authors_id_seq', (SELECT MAX(id) FROM authors));\n" +
			"SELECT SETVAL('contributors_id_seq', (SELECT MAX(id) FROM contributors));\n" +
			"SELECT SETVAL('credit_groups_id_seq', (SELECT MAX(id) FROM credit_groups));\n" +
			"SELECT SETVAL('download_links_id_seq', (SELECT MAX(id) FROM download_links));\n" +
			// "SELECT SETVAL('maps_id_seq', (SELECT MAX(id) FROM maps));\n" +
			"SELECT SETVAL('mod_data_id_seq', (SELECT MAX(id) FROM mod_data));\n" +
			"SELECT SETVAL('mods_id_seq', (SELECT MAX(id) FROM mods));\n" +
			"SELECT SETVAL('player_progress_id_seq', (SELECT MAX(id) FROM player_progress));\n" +
			"SELECT SETVAL('players_id_seq', (SELECT MAX(id) FROM players));\n" +
			"SELECT SETVAL('sides_id_seq', (SELECT MAX(id) FROM sides));\n" +
			// "SELECT SETVAL('tier_overrides_id_seq', (SELECT MAX(id) FROM tier_overrides));\n" +
			"SELECT SETVAL('tier_presets_id_seq', (SELECT MAX(id) FROM tier_presets));\n" +
			"SELECT SETVAL('tiers_id_seq', (SELECT MAX(id) FROM tiers));\n",
	);
}

export default tidySql;
