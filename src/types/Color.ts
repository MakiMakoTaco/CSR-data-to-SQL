import { sheets_v4 } from 'googleapis';

type Color =
	| sheets_v4.Schema$Color
	| { red: number; green: number; blue: number }
	| null;

export type { Color };
