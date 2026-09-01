import { appendFileSync } from 'fs';
import { join } from 'path';
import { formatString } from '../functions/utils/formatSql';

class Download {
	modDataId: number;
	orderIndex: number;

	version: string | undefined;
	description: string | undefined;

	fileName: string;
	fileSize: number;
	manualUrl: string;
	everestUrl: string | undefined;

	constructor(
		modDataId: number,
		orderIndex: number,
		fileName: string,
		fileSize: number,
		manualUrl: string,
		everestUrl?: string,
		version?: string,
		description?: string,
	) {
		this.modDataId = modDataId;
		this.orderIndex = orderIndex;
		this.version = version;
		this.description = description;
		this.fileName = fileName;
		this.fileSize = fileSize;
		this.manualUrl = manualUrl;
		this.everestUrl = everestUrl;
	}

	createSqlStatement() {
		const path: string = join(process.cwd(), 'temp/download_links.sql');

		appendFileSync(
			path,
			`,\n(${this.modDataId}, ${this.orderIndex}, ${formatString(this.fileName)}, ${this.fileSize}, ${formatString(this.version)}, ${formatString(this.description)}, ${formatString(this.manualUrl)}, ${formatString(this.everestUrl)})`,
		);
	}
}

export default Download;
