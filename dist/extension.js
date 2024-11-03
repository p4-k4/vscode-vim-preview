/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(__webpack_require__(1));
class VimPreviewProvider {
    quickPick;
    disposables = [];
    normalModeBindings = [];
    visualModeBindings = [];
    leaderKey = '\\';
    MAX_DESCRIPTION_LENGTH = 50;
    constructor() {
        this.quickPick = vscode.window.createQuickPick();
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
    updateBindings() {
        const config = vscode.workspace.getConfiguration('vim');
        this.leaderKey = config.get('leader', '\\');
        this.normalModeBindings = config.get('normalModeKeyBindings', []);
        this.visualModeBindings = config.get('visualModeKeyBindings', []);
        // Add default VSCode Vim bindings
        this.addDefaultVimBindings();
    }
    addDefaultVimBindings() {
        // Add common vim commands as default bindings
        const defaultBindings = [
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
    normalizeKey(key) {
        return key.toLowerCase().replace(/\s+/g, '');
    }
    getCommandsString(commands) {
        return commands.map(cmd => typeof cmd === 'string' ? cmd : cmd.command).join(', ');
    }
    truncateDescription(description) {
        if (description.length <= this.MAX_DESCRIPTION_LENGTH) {
            return description;
        }
        return description.substring(0, this.MAX_DESCRIPTION_LENGTH - 3) + '...';
    }
    getMatchingBindings(searchText) {
        const matches = [];
        const allBindings = [...this.normalModeBindings, ...this.visualModeBindings];
        const normalizedSearch = this.normalizeKey(searchText);
        for (const binding of allBindings) {
            const before = binding.before.map(key => key === '<leader>' ? this.leaderKey : key);
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
            if (aKeyMatch && !bKeyMatch)
                return -1;
            if (!aKeyMatch && bKeyMatch)
                return 1;
            return (a.binding.description || '').localeCompare(b.binding.description || '');
        });
    }
    async showKeyBindings(initialSearch = '') {
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
                        }
                        else {
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
function activate(context) {
    const provider = new VimPreviewProvider();
    const disposable = vscode.commands.registerCommand('vscode-vim-preview.showKeyBindings', () => {
        provider.showKeyBindings();
    });
    context.subscriptions.push(disposable);
    context.subscriptions.push(provider);
}
function deactivate() { }


/***/ }),
/* 1 */
/***/ ((module) => {

module.exports = require("vscode");

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(0);
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;
//# sourceMappingURL=extension.js.map