import * as vscode from 'vscode';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';

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

// Interface for VSCode keybindings
interface VSCodeKeybinding {
    key: string;
    command: string;
    when?: string;
    description?: string;
}

interface KeybindingMatch extends vscode.QuickPickItem {
    binding: VimKeybinding | VSCodeKeybinding;
    bindingType: 'vim' | 'vscode';
    searchText: string;
}

class VimPreviewProvider {
    private quickPick: vscode.QuickPick<KeybindingMatch>;
    private disposables: vscode.Disposable[] = [];
    private normalModeBindings: VimKeybinding[] = [];
    private visualModeBindings: VimKeybinding[] = [];
    private vscodeBindings: VSCodeKeybinding[] = [];
    private leaderKey: string = '\\';
    private readonly MAX_DESCRIPTION_LENGTH = 50;

    constructor() {
        this.quickPick = vscode.window.createQuickPick<KeybindingMatch>();
        this.quickPick.placeholder = 'Type to filter keybindings (keys, commands, or descriptions)...';
        this.quickPick.matchOnDescription = true;
        this.quickPick.matchOnDetail = true;
        this.disposables.push(this.quickPick);

        // Update bindings when settings change
        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('vim') || e.affectsConfiguration('keybindings')) {
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

        // Load VSCode keybindings
        this.loadVSCodeKeybindings();
    }

    private getKeybindingsPath(): string {
        const platform = os.platform();
        const homeDir = os.homedir();
        
        switch (platform) {
            case 'darwin': // macOS
                return path.join(homeDir, 'Library', 'Application Support', 'Code', 'User', 'keybindings.json');
            case 'win32': // Windows
                return path.join(homeDir, 'AppData', 'Roaming', 'Code', 'User', 'keybindings.json');
            default: // Linux and others
                return path.join(homeDir, '.config', 'Code', 'User', 'keybindings.json');
        }
    }

    private async loadVSCodeKeybindings() {
        try {
            const keybindingsPath = this.getKeybindingsPath();
            if (!fs.existsSync(keybindingsPath)) {
                return;
            }

            const content = fs.readFileSync(keybindingsPath, 'utf8');
            // Dynamically import strip-json-comments
            const stripJsonComments = (await import('strip-json-comments')).default;
            // Remove comments from JSON before parsing
            const jsonContent = stripJsonComments(content);
            const keybindings: VSCodeKeybinding[] = JSON.parse(jsonContent);
            this.vscodeBindings = keybindings.filter(binding => {
                if (!binding || typeof binding !== 'object') {
                    return false;
                }
                if (!('key' in binding) || !('command' in binding)) {
                    return false;
                }
                if (binding.command.startsWith('-')) {
                    return false;
                }
                return true;
            });
        } catch (error) {
            console.error('Error loading VSCode keybindings:', error);
            this.vscodeBindings = [];
        }
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
        if (!description || description.length <= this.MAX_DESCRIPTION_LENGTH) {
            return description || '';
        }
        return description.substring(0, this.MAX_DESCRIPTION_LENGTH - 3) + '...';
    }

    private isVimBinding(binding: VimKeybinding | VSCodeKeybinding): binding is VimKeybinding {
        return 'before' in binding && Array.isArray(binding.before);
    }

    private getMatchingBindings(searchText: string): KeybindingMatch[] {
        const matches: KeybindingMatch[] = [];
        const normalizedSearch = this.normalizeKey(searchText);

        // Add Vim bindings
        const allVimBindings = [...this.normalModeBindings, ...this.visualModeBindings];
        for (const binding of allVimBindings) {
            if (!binding.before || !Array.isArray(binding.before)) {
                continue;
            }

            const before = binding.before.map(key => {
                if (key === '<leader>') {
                    return this.leaderKey;
                }
                return key;
            });
            
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
                    bindingType: 'vim',
                    label: `[Vim] ${displayBinding}`,
                    description: description ? `${description} - ${commandsString}` : commandsString,
                    searchText: searchableText,
                    buttons: []
                });
            }
        }

        // Add VSCode bindings
        for (const binding of this.vscodeBindings) {
            if (!binding.key || !binding.command) {
                continue;
            }

            const searchableText = [
                binding.key.toLowerCase(),
                binding.command.toLowerCase(),
                binding.description?.toLowerCase() || '',
                binding.when?.toLowerCase() || ''
            ].join(' ');

            if (searchableText.includes(normalizedSearch)) {
                const description = binding.description 
                    ? this.truncateDescription(binding.description)
                    : '';

                matches.push({
                    binding,
                    bindingType: 'vscode',
                    label: `[VSCode] ${binding.key}`,
                    description: description 
                        ? `${description} - ${binding.command}${binding.when ? ` (when: ${binding.when})` : ''}`
                        : `${binding.command}${binding.when ? ` (when: ${binding.when})` : ''}`,
                    searchText: searchableText,
                    buttons: []
                });
            }
        }

        return matches.sort((a, b) => {
            // Sort by type first (Vim bindings before VSCode bindings)
            if (a.bindingType !== b.bindingType) {
                return a.bindingType === 'vim' ? -1 : 1;
            }

            // Then sort by key match
            const aKeyMatch = this.isVimBinding(a.binding)
                ? a.binding.before.join('').toLowerCase().includes(normalizedSearch)
                : a.binding.key.toLowerCase().includes(normalizedSearch);
            const bKeyMatch = this.isVimBinding(b.binding)
                ? b.binding.before.join('').toLowerCase().includes(normalizedSearch)
                : b.binding.key.toLowerCase().includes(normalizedSearch);
            
            if (aKeyMatch && !bKeyMatch) {
                return -1;
            }
            if (!aKeyMatch && bKeyMatch) {
                return 1;
            }
            
            // Finally sort by description
            const aDesc = a.binding.description || '';
            const bDesc = b.binding.description || '';
            return aDesc.localeCompare(bDesc);
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
                if (this.isVimBinding(selected.binding)) {
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
                } else {
                    vscode.commands.executeCommand(selected.binding.command);
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
