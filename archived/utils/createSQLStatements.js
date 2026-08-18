/**
 * authors
 * credit_groups
 * download_links
 * maps
 * mod_requirements
 * mod_submitter
 * mod_tiers
 * mods
 * player_progress
 * players
 * sides
 * tier_overrides
 * tier_presets
 * tiers
 */

function createSQLStatements(filePath = join(__dirname, '../sqlFiles')) {
	if (noGBMod.length > 0) {
		noGBMod.forEach((mod) => {
			appendFileSync(
				join(filePath, 'no_gb_mods.txt'),
				`Tier ID: ${mod.tierId}, Mod ID: ${mod.modId}, Name: ${
					mod.name
				}, Download Links: ${mod.downloadLinks.join(', ')}\n`,
			);
		});
	}

	// tiers.forEach((tier) => {
	// 	appendFileSync(
	// 		join(filePath, 'tiers.sql'),
	// 		`,\n(${tierId}, '${tier.name}', '${tier.color}', '${tier.colorPlus}', ${tier.clearsForRank}, ${tier.sideId}, ${tier.sideIndex})`,
	// 	);
	// });

	// modMap.forEach((mod, modId) => {
	// 	appendFileSync(
	// 		join(filePath, 'mod_tiers.sql'),
	// 		`,\n(${modId}, ${mod.tierId})`,
	// 	);

	// 	// Simplified mods.sql insert with additional fields, using null for empty values and quoting literals
	// 	appendFileSync(
	// 		join(filePath, 'mods.sql'),
	// 		`,\n(${modId}, ${mod.name ? `'${mod.name}'` : null}, ${
	// 			mod.gbName ? `'${mod.gbName}'` : null
	// 		}, ${mod.isChild ? 1 : 0}, ${
	// 			mod.parentId !== null ? mod.parentId : null
	// 		}, ${mod.submitterId !== null ? mod.submitterId : null}, ${
	// 			mod.category ? `'${mod.category}'` : null
	// 		}, ${mod.version ? `'${mod.version}'` : null}, ${
	// 			mod.gbPage ? `'${mod.gbPage}'` : null
	// 		}, ${mod.gbDownloadPage ? `'${mod.gbDownloadPage}'` : null}, ${
	// 			mod.description ? `'${mod.description}'` : null
	// 		}, ${mod.text ? `'${mod.text}'` : null}, ${
	// 			Array.isArray(mod.media) && mod.media.length ?
	// 				`'${mod.media.join(' ')}'`
	// 			:	null
	// 		}, ${
	// 			Array.isArray(mod.tags) && mod.tags.length ?
	// 				`'${mod.tags.join(', ')}'`
	// 			:	null
	// 		}, ${
	// 			mod.feedbackInstructions ? `'${mod.feedbackInstructions}'` : null
	// 		}, ${mod.notes ? `'${mod.notes}'` : null}, ${
	// 			mod.createdAt ? `'${mod.createdAt}'` : null
	// 		})`,
	// 	);

	// 	// Write download links for this mod
	// 	if (Array.isArray(mod.downloadLinks)) {
	// 		if (mod.downloadLinks.length > 0) {
	// 			mod.downloadLinks.forEach((link) => {
	// 				appendFileSync(
	// 					join(filePath, 'download_links.sql'),
	// 					`,\n(${modId}, ${link.orderIndex}, ${
	// 						link.fileName ? `'${link.fileName}'` : null
	// 					}, ${
	// 						link.fileSize !== null && link.fileSize !== undefined ?
	// 							link.fileSize
	// 						:	null
	// 					}, ${link.description ? `'${link.description}'` : null}, '${
	// 						link.manualUrl
	// 					}', ${link.everestUrl ? `'${link.everestUrl}'` : null})`,
	// 				);
	// 			});
	// 		}
	// 	}
	// });

	// submitterMap.forEach((submitter, submitterName) => {
	// 	appendFileSync(
	// 		join(filePath, 'mod_submitter.sql'),
	// 		`,\n(${submitter.submitterId}, '${submitterName}', '${submitter.profileUrl}', '${submitter.avatarUrl}')`,
	// 	);
	// });

	// playerProgress.forEach((player, playerName) => {
	// 	if (player.playerId >= lastPlayerId) {
	// 		appendFileSync(
	// 			join(filePath, 'players.sql'),
	// 			`,\n(${player.playerId}, '${playerName}')`,
	// 		);
	// 	}

	// 	if (player.mods && player.mods.length > 0) {
	// 		player.mods.forEach((mod) => {
	// 			appendFileSync(
	// 				join(filePath, 'player_progress.sql'),
	// 				`,\n(${player.playerId}, ${mod.modId}, ${mod.cleared ? 1 : 0}, '${
	// 					mod.proof
	// 				}', null)`,
	// 			);
	// 		});
	// 	}
	// });
}
