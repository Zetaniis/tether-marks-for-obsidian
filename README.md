# Tether marks for Obsidian
Assign files to key registers, and quickly jump to them with a single keystroke. Inspired by vim global marks functionality and [Harpoon](https://github.com/ThePrimeagen/harpoon) Neovim plugin.

![main](https://github.com/Zetaniis/tether-marks-for-obsidian/blob/master/assets/main.png?raw=true)

## Features
- Set marks for files using key symbol registers.
- Navigate to files using a list of set marks.
- Use [Harpoon](https://github.com/ThePrimeagen/harpoon)-like workflow in your Obsidian vault. 
- Set custom key symbols as registers. You can use anything as long as it is a single keystroke (excluding modifiers: ctrl, shift, alt) and is considered as one symbol. 
- Undo last overwritten or deleted mark

## Installation

### Direct
- Download the `tether-marks-for-obsidian` repository or the release.
- Place the plugin folder into your Obsidian plugins directory.
- Enable the plugin in the Obsidian settings under the "Community Plugins" section.

### BRAT
 - Install the BRAT plugin from Community plugins
 - In the BRAT options, click on Add Beta plugin and enter `https://github.com/Zetaniis/tether-marks-for-obsidian`

## First time configuration
For maximum efficiency, the plugin is intended to be used via keyboard shortcuts. Be sure to set some through the hotkeys and plugin settings UIs. 

### Example vim config using [vimrc-support](https://github.com/esm7/obsidian-vimrc-support) plugin
In order to make the workflow more vim-like, you can bind tether-marks commands to vim key bindings by using [vimrc-support](https://github.com/esm7/obsidian-vimrc-support).

Example:
```vimscript
" mapping the plugin commands to a vim command through obcommand
exmap setmark obcommand tether-marks-obsidian:set-mark
nnoremap <Space>m :setmark<CR>
exmap gomark obcommand tether-marks-obsidian:go-to-mark
nnoremap ' :gomark<CR>
```

For all available commands that can be mapped to vim, run the ex command `obcommand`. The list should appear in the developer console.

## Potential future features
- direct navigation to previous/next harpoon mark

## Naming conventions
- Register - key symbol that will be used to tether to files. 
- Mark - key value pair, where key is the register (the key symbol) and value is the path of the file that has been marked by that register. 
