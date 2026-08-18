require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { getSheetData } = require('./utils/checkSheets');

function setupSQLFiles(filePath = path.join(__dirname, './sqlFiles')) {
	if (!fs.existsSync(filePath)) {
		fs.mkdirSync(filePath);
	}

	fs.writeFileSync(path.join(filePath, 'no_gb_mods.txt'), '');

	fs.writeFileSync(
		path.join(filePath, 'authors.sql'),
		'INSERT INTO authors(group_id, name, role_name, profile_url, extra_url) VALUES',
	);

	fs.writeFileSync(
		path.join(filePath, 'credit_groups.sql'),
		'INSERT INTO credit_groups(mod_id, order_index, name) VALUES',
	);

	fs.writeFileSync(
		path.join(filePath, 'download_links.sql'),
		'INSERT INTO download_links(mod_id, order_index, file_name, file_size, description, manual_url, everest_url) VALUES',
	);

	fs.writeFileSync(
		path.join(filePath, 'maps.sql'),
		'INSERT INTO maps(mod_id, mod_index, name) VALUES',
	);

	fs.writeFileSync(
		path.join(filePath, 'mod_requirements.sql'),
		'INSERT INTO mod_requirements(mod_id, order_index, name, url) VALUES',
	);

	fs.writeFileSync(
		path.join(filePath, 'mod_submitter.sql'),
		'INSERT INTO mod_submitter(name, profile_url, avatar_url) VALUES',
	);

	fs.writeFileSync(
		path.join(filePath, 'mod_data.sql'),
		'INSERT INTO mod_tiers(id, gb_name, is_child, parent_id, required_map_clears, submitter_id, category, version, gb_page, gb_download_page, description, text, media, gb_tags, feedback_instructions, created_at) VALUES',
	);

	fs.writeFileSync(
		path.join(filePath, 'mods.sql'),
		'INSERT INTO mods(id, name, mod_data_id, tier_id, notes) VALUES',
	);

	fs.writeFileSync(
		path.join(filePath, 'player_progress.sql'),
		'INSERT INTO player_progress(player_id, mod_id, cleared, proof, submitted_at) VALUES',
	);

	fs.writeFileSync(
		path.join(filePath, 'players.sql'),
		'INSERT INTO players(id, name) VALUES',
	);

	fs.writeFileSync(
		path.join(filePath, 'sides.sql'),
		'INSERT INTO sides(id, name, type, clears_for_rank, color, color_plus, archived, quick_install) VALUES',
	);

	fs.writeFileSync(
		path.join(filePath, 'tier_overrides.sql'),
		'INSERT INTO tier_overrides(id, name, append_side_name color, color_plus, side_index) VALUES',
	);

	fs.writeFileSync(
		path.join(filePath, 'tier_presets.sql'),
		'INSERT INTO tiers(id, name, append_side_name, color, color_plus, side_index) VALUES',
	);

	fs.writeFileSync(
		path.join(filePath, 'tiers.sql'),
		'INSERT INTO tiers(id, side_id, preset_id, clears_for_rank) VALUES',
	);
}

async function generateSQLFiles() {
	setupSQLFiles();

	console.log('Starting sheet processing');
	await getSheetData();

	console.log('Finished processing sheets and generating SQL files');
}

generateSQLFiles();
