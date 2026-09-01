import Contributor from '../../classes/Contributor';

function checkContributor(contributors: Map<string, Contributor>, player: any) {
	let contributor = contributors.get(player._sName);

	if (!contributor) {
		const newContributor: Contributor = new Contributor(
			contributors.size + 1,
			player._sName,
			player._sUserTitle,
			player._ProfileUrl,
			player._sAvatarUrl,
		);

		contributors.set(player._sName, newContributor);
	} else if (player._sProfileUrl && !contributor.profileUrl) {
		contributor.title = player._sUserTitle;
		contributor.profileUrl = player._sProfileUrl;
		contributor.avatarUrl = player._sAvatarUrl;
	}

	return contributors;
}

export default checkContributor;
