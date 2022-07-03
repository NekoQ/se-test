// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	let terminal: vscode.Terminal;
	let command = "bundle exec rspec";
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	function goTo(path: string) {
		let filename = getSpecName(path);
		vscode.workspace.openTextDocument(filename)
			.then(success => {
				console.log("Success");
			})
			.then(undefined, err => {
				vscode.window.showInformationMessage(`No such file ${filename}`);
			});
	}
	function runSpec(path: string, terminal: vscode.Terminal) {
		let filename = getSpecName(path);
		let command = `bundle exec rspec ${filename}`;
		// TODO: Maybe remove this hack
		if (filename.split("/")[1] === "assets") {
			command = `FEATURE=true ${command}`;
		}
		terminal.show();
		terminal.sendText(command);
	}

	function getSpecName(path: string): string {
		let relativePath = vscode.workspace.asRelativePath(path);
		let splitted = relativePath.split("/");
		let rspecCommand = "";
		if (splitted[0] === "app") {
			if (splitted[1] === "assets") {
				return featureSpec(relativePath);
			}
			return simpleSpec(relativePath);
		}
		if (splitted[0] === "lib") {
			return libSpec(relativePath);
		}
		return "";
	}

	// TODO: To be implemented
	function featureSpec(path: string): string {
		return `spec/${path}`;
	}

	function simpleSpec(path: string): string {
		return `spec/${path.substring(4).slice(0, -3)}_spec.rb`;
	}

	function libSpec(path: string): string {
		return `spec/${path.slice(0, -3)}_spec.rb`;
	}

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('se-tests.runSpec', () => {
		// TODO: Check for null fileName
		if (!terminal) {
			terminal = vscode.window.createTerminal("Specs^^");
		}
		let path = vscode.window.activeTextEditor?.document.fileName!;
		runSpec(path, terminal);
		// runTest(path, terminal);
	});

	let goToSpec = vscode.commands.registerCommand('se-tests.goToSpec', () => {
		let path = vscode.window.activeTextEditor?.document.fileName!;
		goTo(path);
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() { }
