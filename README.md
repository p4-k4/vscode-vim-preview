# VSCode Vim Preview

A Visual Studio Code extension that provides a real-time preview of vim keybinding commands, acting as an interactive cheat sheet that responds to your keypresses.

## Features

- 🔍 Real-time preview of available vim commands and VSCODE keybinds
- ⌨️ User-configurable trigger key
- ⚡ Live filtering as you type
- 📝 Support for custom binding descriptions
- 🔎 Search by keys, command IDs, or descriptions
- 🚀 Execute commands directly from the preview

## Usage

### Trigger the Preview
Two ways to access the keybindings preview:

1. Use the default shortcut: `ctrl+shift+v`
2. Open command palette (Cmd+Shift+P / Ctrl+Shift+P) and type "Show Vim Key Bindings Preview"

### Configure Custom Trigger Key
You can change the trigger key in VSCode settings:
1. Open Settings (Cmd+, / Ctrl+,)
2. Search for "VSCode Vim Preview"
3. Edit the "Trigger Key" setting
4. Enter your preferred key combination (e.g., "cmd+k cmd+v")

### Search and Execute Commands
Once the preview is open:
1. Type to filter available commands
2. Search by:
   - Key combinations (e.g., "ff" for leader+f+f)
   - Command IDs (e.g., "quickOpen")
   - Descriptions (if configured)
3. Press Enter to execute the selected command

## Custom Descriptions

You can add descriptions to your keybindings to make them more discoverable:

```json
"vim.normalModeKeyBindings": [
    {
        "description": "Write file",
        "before": [",", "w"],
        "commands": ["workbench.action.files.save"]
    },
    {
        "description": "Quick file search",
        "before": ["<leader>", "f", "f"],
        "commands": ["workbench.action.quickOpen"]
    }
]
```

The extension will use these descriptions in the preview interface, making it easier to find and understand your keybindings.

## Supported Bindings

The extension supports:
- Custom leader key configurations
- Normal mode keybindings
- Visual mode keybindings
- Default VSCode Vim commands
- User-defined keybindings

## Requirements

- Visual Studio Code 1.95.0 or higher
- VSCode Vim extension installed and configured

## Extension Settings

### VSCode Vim Preview Settings
- `vscode-vim-preview.triggerKey`: Key combination to trigger the preview (default: "ctrl+shift+v")

### VSCode Vim Settings Read by the Extension
- `vim.leader`: Your configured leader key
- `vim.normalModeKeyBindings`: Your normal mode key mappings
- `vim.visualModeKeyBindings`: Your visual mode key mappings

## Known Issues

None reported yet. Please submit issues on the GitHub repository.

## Release Notes

### 0.0.8
- Added user-configurable trigger key
- Simplified extension functionality
- Improved reliability and vim compatibility

See [CHANGELOG.md](CHANGELOG.md) for full version history.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This extension is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

Paurini Taketakehikuroa Wiringi