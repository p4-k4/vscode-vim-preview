import * as vscode from 'vscode';

// Interfaces for vim keybindings
interface VimKeybinding {
    before: string[];
    commands: string[] | Command[];
    after?: string[];
    description?: string;
}

interface Command {
    command: string;
    args?: any;
}

interface KeybindingMatch extends vscode.QuickPickItem {
    binding: VimKeybinding;
    searchText: string;
}

class VimPreviewProvider {
    private quickPick: vscode.QuickPick<KeybindingMatch>;
    private disposables: vscode.Disposable[] = [];
    private normalModeBindings: VimKeybinding[] = [];
    private visualModeBindings: VimKeybinding[] = [];
    private leaderKey: string = '\\';
    private readonly MAX_DESCRIPTION_LENGTH = 50;

    constructor() {
        this.quickPick = vscode.window.createQuickPick<KeybindingMatch>();
        this.quickPick.placeholder = 'Type to filter vim commands (keys, commands, or descriptions)...';
        this.quickPick.matchOnDescription = true;
        this.quickPick.matchOnDetail = true;
        this.disposables.push(this.quickPick);

        // Update bindings when settings change
        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('vim')) {
                this.updateBindings();
            }
        }, null, this.disposables);

        this.updateBindings();
    }

    private updateBindings() {
        const config = vscode.workspace.getConfiguration('vim');
        this.leaderKey = config.get<string>('leader', '\\');
        this.normalModeBindings = config.get<VimKeybinding[]>('normalModeKeyBindings', []);
        this.visualModeBindings = config.get<VimKeybinding[]>('visualModeKeyBindings', []);

        // Add default VSCode Vim bindings
        this.addDefaultVimBindings();
    }

    private addDefaultVimBindings() {
        // Add common vim commands as default bindings
        const defaultBindings: VimKeybinding[] = [
            { before: ['d', 'd'], commands: ['editor.action.deleteLines'], description: 'Delete line' },
            { before: ['y', 'y'], commands: ['editor.action.clipboardCopyAction'], description: 'Copy line' },
            { before: ['p'], commands: ['editor.action.clipboardPasteAction'], description: 'Paste' },
            { before: ['u'], commands: ['undo'], description: 'Undo' },
            { before: ['ctrl+r'], commands: ['redo'], description: 'Redo' },
            { before: ['g', 'g'], commands: ['cursorTop'], description: 'Go to file start' },
            { before: ['G'], commands: ['cursorBottom'], description: 'Go to file end' },
            { before: ['0'], commands: ['cursorLineStart'], description: 'Go to line start' },
            { before: ['$'], commands: ['cursorLineEnd'], description: 'Go to line end' },
            // Add more default bindings as needed
        ];

        this.normalModeBindings = [...this.normalModeBindings, ...defaultBindings];
    }

    private normalizeKey(key: string): string {
        return key.toLowerCase().replace(/\s+/g, '');
    }

    private getCommandsString(commands: (string | Command)[]): string {
        return commands.map(cmd => 
            typeof cmd === 'string' ? cmd : cmd.command
        ).join(', ');
    }

    private truncateDescription(description: string): string {
        if (description.length <= this.MAX_DESCRIPTION_LENGTH) {
            return description;
        }
        return description.substring(0, this.MAX_DESCRIPTION_LENGTH - 3) + '...';
    }

    private getMatchingBindings(searchText: string): KeybindingMatch[] {
        const matches: KeybindingMatch[] = [];
        const allBindings = [...this.normalModeBindings, ...this.visualModeBindings];
        const normalizedSearch = this.normalizeKey(searchText);

        for (const binding of allBindings) {
            const before = binding.before.map(key => 
                key === '<leader>' ? this.leaderKey : key
            );
            
            const normalizedBinding = before.join('').toLowerCase();
            const displayBinding = before.join('');
            const commandsString = this.getCommandsString(binding.commands);

            const searchableText = [
                normalizedBinding,
                commandsString.toLowerCase(),
                binding.description?.toLowerCase() || ''
            ].join(' ');

            if (searchableText.includes(normalizedSearch)) {
                const description = binding.description 
                    ? this.truncateDescription(binding.description)
                    : '';

                matches.push({ 
                    binding,
                    label: displayBinding,
                    description: description ? `${description} - ${commandsString}` : commandsString,
                    searchText: searchableText,
                    buttons: []
                });
            }
        }

        return matches.sort((a, b) => {
            const aKeyMatch = a.binding.before.join('').toLowerCase().includes(normalizedSearch);
            const bKeyMatch = b.binding.before.join('').toLowerCase().includes(normalizedSearch);
            
            if (aKeyMatch && !bKeyMatch) return -1;
            if (!aKeyMatch && bKeyMatch) return 1;
            
            return (a.binding.description || '').localeCompare(b.binding.description || '');
        });
    }

    public async showKeyBindings(initialSearch: string = '') {
        this.quickPick.value = initialSearch;
        this.quickPick.items = this.getMatchingBindings(initialSearch);
        
        this.quickPick.onDidChangeValue(value => {
            this.quickPick.items = this.getMatchingBindings(value);
        });

        this.quickPick.onDidAccept(() => {
            const selected = this.quickPick.selectedItems[0];
            if (selected) {
                const commands = selected.binding.commands;
                if (Array.isArray(commands)) {
                    commands.forEach(cmd => {
                        if (typeof cmd === 'string') {
                            vscode.commands.executeCommand(cmd);
                        } else {
                            vscode.commands.executeCommand(cmd.command, cmd.args);
                        }
                    });
                }
            }
            this.quickPick.hide();
        });

        this.quickPick.show();
    }

    dispose() {
        this.disposables.forEach(d => d.dispose());
    }
}

export function activate(context: vscode.ExtensionContext) {
    const provider = new VimPreviewProvider();

    const disposable = vscode.commands.registerCommand('vscode-vim-preview.showKeyBindings', () => {
        provider.showKeyBindings();
    });

    context.subscriptions.push(disposable);
    context.subscriptions.push(provider);
}

export function deactivate() {}
