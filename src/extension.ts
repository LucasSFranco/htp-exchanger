import * as vscode from 'vscode';
import { exchange } from './exchange';

export function activate() {
	vscode.commands.registerCommand('htp-exchanger.exchange-prn', () => { exchange('prn'); });
	vscode.commands.registerCommand('htp-exchanger.exchange-p', () => { exchange('p'); });
}
