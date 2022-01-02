import * as vscode from 'vscode';
import { exchange } from './exchange';

export function activate() {
	vscode.commands.registerCommand('htp-exchanger.exchange', () => { exchange(); });
}
