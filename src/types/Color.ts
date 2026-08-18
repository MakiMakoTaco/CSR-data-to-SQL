import { sheets_v4 } from 'googleapis';

export type Color =
	| sheets_v4.Schema$Color
	| { red: number; green: number; blue: number }
	| null;
