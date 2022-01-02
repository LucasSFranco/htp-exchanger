import * as vscode from 'vscode';

function getSelectedText(selection: vscode.Selection, document: vscode.TextDocument): { text: string, range: vscode.Range } {
    let range = new vscode.Range(selection.start, selection.end);

    return { text: range ? document.getText(range) : undefined, range };
}

export function exchange() {
    const editor = vscode.window.activeTextEditor;

    const { document, selections } = editor;

    editor.edit(editBuilder => {
        const replacementActions = selections.map(selection => {
            const { text, range } = getSelectedText(selection, document);
            
            let replacement; 
            
            if (/htp.prn\('.*'\);/g.test(text)) {
                replacement = text.replace(/htp.prn\('(.*)'\);/g, '$1').replace(/''/g, "'");
            } else {
                replacement = text.replace(/'/g, "''").replace(/([ \t]*)(.+)/g, "$1htp.prn('$2');");
            }

            return { text, range, replacement };
        });

        replacementActions.forEach(x => {
            editBuilder.replace(x.range, x.replacement);
        });
    });
}