# Change Log

All notable changes to the "VSCode Vim Preview" extension will be documented in this file.

## [0.0.9] - 2024

### Added
- Support for VSCode keybindings in addition to Vim keybindings

### Changed
- Removed extension setting default bindings

## [0.0.8] - 2024

### Changed
- Simplified extension to use configurable keybinding
- Removed automatic key watching
- Added user-configurable trigger key setting
- Improved reliability and vim compatibility

## [0.0.7] - 2024

### Fixed
- Fixed key handling to prevent interference with normal vim navigation
- Changed to leader-key-only triggering for better vim compatibility
- Added proper key propagation to maintain vim functionality
- Improved leader key binding updates

## [0.0.6] - 2024

### Added
- Automatic QuickPick triggering on vim-related keys
- Support for VSCode Vim's default bindings
- Key sequence tracking with timeout
- Real-time filtering based on typed sequences

## [0.0.5] - 2024

### Changed
- Simplified QuickPick item formatting
- Standardized display format: keys - description - commandID
- Removed markdown formatting and icons for cleaner presentation

## [0.0.4] - 2024

### Improved
- Enhanced display formatting with bold keys and italic command IDs
- Added description truncation for better readability
- Improved visual hierarchy with icons and separators
- Added consistent formatting across all items

## [0.0.3] - 2024

### Added
- Support for custom binding descriptions
- Ability to search by command IDs
- Enhanced search across all fields (keys, commands, descriptions)
- Prioritized search results based on match type

## [0.0.2] - 2024

### Improved
- Enhanced fuzzy search functionality to work without spaces between keys
- Better matching of key sequences to match actual vim usage
- Improved key sequence display while maintaining readability

## [0.0.1] - 2024

### Added
- Initial release
- Real-time preview of vim keybindings through QuickPick interface
- Support for leader key combinations
- Normal and visual mode keybinding support
- Live filtering of available commands
- Direct command execution from preview
