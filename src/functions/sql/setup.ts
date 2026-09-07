import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

function setupSqlFiles() {
	const filePath: string = join(process.cwd(), 'output');

	if (!existsSync(filePath)) {
		mkdirSync(filePath);
	}

	writeFileSync(join(filePath, 'log.txt'), '');

	writeFileSync(
		join(filePath, 'authors.sql'),
		'INSERT INTO authors(group_id, order_index, role_name, contributor_id) VALUES',
	);

	writeFileSync(
		join(filePath, 'contributors.sql'),
		'INSERT INTO contributors(id, name, title, profile_url, avatar_url) VALUES',
	);

	writeFileSync(
		join(filePath, 'credit_groups.sql'),
		'INSERT INTO credit_groups(id, mod_data_id, order_index, name) VALUES',
	);

	writeFileSync(
		join(filePath, 'download_links.sql'),
		'INSERT INTO download_links(mod_data_id, order_index, file_name, file_size, version, description, manual_url, everest_url) VALUES',
	);

	writeFileSync(
		join(filePath, 'maps.sql'),
		'INSERT INTO maps(mod_data_id, mod_index, name) VALUES',
	);

	writeFileSync(
		join(filePath, 'mod_data.sql'),
		'INSERT INTO mod_data(id, gb_name, is_child, parent_id, submitter_id, page, gb_download_page, description, text, category, version, media, gb_tags, requirements, dev_notes, feedback_instructions, created_at, updated_at) VALUES',
	);

	writeFileSync(
		join(filePath, 'mods.sql'),
		'INSERT INTO mods(id, name, mod_data_id, tier_id, notes) VALUES',
	);

	writeFileSync(
		join(filePath, 'player_progress.sql'),
		'INSERT INTO player_progress(player_id, mod_id, cleared, proof) VALUES',
	);

	writeFileSync(
		join(filePath, 'players.sql'),
		'INSERT INTO players(id, name) VALUES',
	);

	writeFileSync(
		join(filePath, 'sides.sql'),
		'INSERT INTO sides(id, name, type, clears_for_rank, color, color_plus, archived, quick_install) VALUES',
	);

	// writeFileSync(
	// 	join(filePath, 'tier_overrides.sql'),
	// 	'INSERT INTO tier_overrides(id, name, append_side_name color, color_plus, side_index) VALUES',
	// );

	writeFileSync(
		join(filePath, 'tier_presets.sql'),
		'INSERT INTO tier_presets(id, name, append_side_name, color, color_plus, side_index) VALUES',
	);

	writeFileSync(
		join(filePath, 'tiers.sql'),
		'INSERT INTO tiers(id, side_id, preset_id, clears_for_rank) VALUES',
	);

	console.log('\x1b[32m✅ Prepared all sql files\x1b[0m');
}

export default setupSqlFiles;
