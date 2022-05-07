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

export function exchange(type: 'p' | 'prn') {
    const editor = vscode.window.activeTextEditor

    const { document, selections } = editor

    let replacements: Replacement[] = []

    editor.edit(editBuilder => {
        selections.forEach((s) => {
            for (let line = s.start.line; line <= s.end.line; line++) {
                let range = document.lineAt(line).range
                const text = range ? document.getText(range) : undefined

                if (/^[ \t]*$/.test(text)) continue

                let offset: number
                let newText: string

                if ((new RegExp(`htp.${type}\\('.*'\\);`, 'g')).test(text)) {
                    offset = (s.start.character >= (type === 'prn' ? 9 : 7) && s.end.character <= text.length - 3) ? (type === 'prn' ? -9 : -7) : 0
                    newText = text.replace((new RegExp(`htp.${type}\\('(.*)'\\);`, 'g')), '$1').replace(/''/g, "'")
                } else {
                    offset = (type === 'prn' ? 9 : 7)
                    newText = text.replace(/'/g, "''").replace(/([ \t]*)(.+)/g, `$1htp.${type}('$2');`)
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