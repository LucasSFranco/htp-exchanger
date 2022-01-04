import * as vscode from 'vscode';

export function exchange() {
    const editor = vscode.window.activeTextEditor;

    const { document, selections } = editor;

    editor.edit(editBuilder => {
        for (const selection of selections) {
            const startLine = selection.start.line;
            const endLine = selection.end.line;
        
            for (let line = startLine; line <= endLine; line++) {
                const range = document.lineAt(line).range;
                const text = range ? document.getText(range) : undefined;

                if(/^[ \t]*$/.test(text)) continue;

                let replacement; 
            
                if (/htp.prn\('.*'\);/g.test(text)) {
                    replacement = text.replace(/htp.prn\('(.*)'\);/g, '$1').replace(/''/g, "'");
                } else {
                    replacement = text.replace(/'/g, "''").replace(/([ \t]*)(.+)/g, "$1htp.prn('$2');");
                }

                editBuilder.replace(range, replacement);
            }
        }
    });
}