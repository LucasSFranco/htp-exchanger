import * as vscode from 'vscode'

type Replacement = {
    text: string
    range: vscode.Range
    newText: string
    newRange: vscode.Range
}

function toSelection(range: vscode.Range): vscode.Selection {
    return new vscode.Selection(
        range.start.line, range.start.character,
        range.end.line, range.end.character
    )
}

export function exchange() {
    const editor = vscode.window.activeTextEditor

    const { document, selections } = editor

    let replacements: Replacement[] = []

    editor.edit(editBuilder => {
        selections.forEach((s) => {
            for (let line = s.start.line; line <= s.end.line; line++) {
                let range = document.lineAt(line).range
                const text = range ? document.getText(range) : undefined

                if(/^[ \t]*$/.test(text)) continue

                let offset: number
                let newText: string
            
                if (/htp.prn\('.*'\);/g.test(text)) {
                    offset = (s.start.character >= 9 && s.end.character <= text.length - 3) ? -9 : 0
                    newText = text.replace(/htp.prn\('(.*)'\);/g, '$1').replace(/''/g, "'")
                } else {
                    offset = 9
                    newText = text.replace(/'/g, "''").replace(/([ \t]*)(.+)/g, "$1htp.prn('$2');")
                }

                replacements.push({
                    text,
                    range,
                    newText,
                    newRange: new vscode.Range(
                        s.start.line, s.start.character + offset,
                        s.end.line, s.end.character + offset
                    )
                })
                
            }
        })

        replacements.forEach((r) => { editBuilder.replace(r.range, r.newText) })
    }).then(() => {
        editor.selections = replacements.map((r) => toSelection(r.newRange))
    })
}