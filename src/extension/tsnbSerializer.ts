import { TextDecoder, TextEncoder } from "util";
import * as vscode from "vscode";

export interface RawNotebook {
  cells: RawNotebookCell[];
}

export interface RawNotebookCell {
  language: string;
  source: string;
  execution_count?: number;
  outputs?: Output[];
}

export interface Output {
  output_type: string;
  data: Data;
  execution_count: number;
}

export interface Data {
  type: string; // such as "x-application/custom-json-output":
  data: string; // hello world?
}

export class tsnbSerializer implements vscode.NotebookSerializer {
  async deserializeNotebook(
    content: Uint8Array,
    _token: vscode.CancellationToken
  ): Promise<vscode.NotebookData> {
    var contents = new TextDecoder().decode(content);

    let raw: RawNotebookCell[];
    try {
      raw = (<RawNotebook>JSON.parse(contents)).cells;
    } catch {
      raw = [];
    }

    const cells = raw.map(
      (item) =>
        new vscode.NotebookCellData(
          item.language === "markdown"
            ? vscode.NotebookCellKind.Markup
            : vscode.NotebookCellKind.Code,
          item.source,
          item.language
        )
    );

    return new vscode.NotebookData(cells);
  }

  async serializeNotebook(
    data: vscode.NotebookData,
    _token: vscode.CancellationToken
  ): Promise<Uint8Array> {
    let contents: RawNotebookCell[] = [];

    for (const cell of data.cells) {
      contents.push({
        language: cell.languageId,
        source: cell.value,
      });
    }

    return new TextEncoder().encode(JSON.stringify(contents));
  }
}
