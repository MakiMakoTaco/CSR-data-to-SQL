function sortModData(
	modData,
	name,
	notes,
	isChild = false,
	parentId = null,
	isParent = false,
) {
	let mod = {
		tierId,
		id: modId,
		name: isChild ? 'null' : name,
		gbName: null,
		isChild,
		parentId,
		requiredMapClears: null,
		submitterId: null,
		category: null,
		version: null,
		gbPage: null,
		gbDownloadPage: null,
		description: null,
		text: null,
		media: [],
		gbTags: [],
		feedbackInstructions: null,
		notes,
		createdAt: null,
		tags: [],
		downloadLinks: [],
		// authors: [{}],
	};

	let submitterId = null;

	try {
		const submitter = modData._aSubmitter;
		const submitterExists = submitterMap.has(submitter._sName);

		if (!submitterExists) {
			submitterMap.set(submitter._sName, {
				submitterId: submitterMap.size + 1,
				profileUrl: submitter._sProfileUrl,
				avatarUrl: submitter._sAvatarUrl,
			});
		}

		submitterId = submitterMap.get(submitter._sName).submitterId;
	} catch (e) {
		console.error(`Error processing submitter data for ${name}`);
	}

	// requiredMapClears

	mod.gbName = modData._sName.replaceAll("'", "''");
	mod.submitterId = submitterId;
	mod.category = modData?._aCategory?._sName.replaceAll("'", "''") ?? null;
	mod.version = modData._sVersion;
	mod.gbPage = modData._sProfileUrl;
	mod.gbDownloadPage = modData?._sDownloadUrl ?? null;
	mod.description = modData._sDescription?.replaceAll("'", "''") ?? null;
	mod.text = modData._sText?.replaceAll("'", "''") ?? null;
	mod.createdAt =
		modData._tsDateAdded ? formatEpochToSQLDate(modData._tsDateAdded) : null;

	if (!isParent) {
		mod.media = modData._aEmbeddedMedia ?? [];
		for (let i = 0; i < modData._aPreviewMedia._aImages.length; i++) {
			const images = modData._aPreviewMedia._aImages[i];

			mod.media.push(`${images._sBaseUrl}/${images._sFile}`);
		}
		if (mod.media.length === 0) mod.media = null;
	}

	if (modData._aTags && modData._aTags?.length > 0) {
		modData._aTags.forEach((tag) => {
			mod.tags.push(tag._sValue.replaceAll("'", "''"));
		});
	}
	if (mod.tags.length === 0) mod.tags = null;

	if (modData._sFeedbackInstructions) {
		mod.feedbackInstructions =
			modData._sFeedbackInstructions.replaceAll("'", "''") ?? null;
	}

	if (modData._aFiles && modData._aFiles.length > 0) {
		for (let i = 0; i < modData._aFiles.length; i++) {
			const file = modData._aFiles[i];

			mod.downloadLinks.push({
				orderIndex: mod.downloadLinks.length,
				fileName: file._sFile,
				fileSize: file._nFilesize,
				description: file._sDescription,
				manualUrl: file._sDownloadUrl,
				everestUrl: file._aModManagerIntegrations?.[0]._sDownloadUrl,
			});
		}
	}

	modMap.set(modId, mod);
}

module.exports = { sortModData };
