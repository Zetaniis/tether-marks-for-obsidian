# Tether marks for obsidian
The `tether-marks` plugin for Obsidian inspired by global vim mark functionality and [Harpoon](https://github.com/ThePrimeagen/harpoon) Neovim plugin. Lets you set file references within key symbol registers and navigate to the corresponding files with ease and speed.

## Features
- Tether/set marks for files using key symbol registers.
- Navigate to files using a list of set marks.
- Use Neovim-Harpoon-plugin-like workflow in your Obsidian. 
- Set custom key symbols. You can use anything as long as it is a single keystroke (excluding modifiers: ctrl, shift, alt) and is considered one symbol. 

## Installation
### BRAT
 - Install the BRAT plugin from Community plugins
 - In the BRAT options, click on Add Beta plugin and enter `https://github.com/Zetaniis/tether-marks-obsidian`
 - The plugin will auto update on every Obsidian startup

### Raw
- Download the `tether-marks-obsidian` plugin from the repository.
- Place the plugin folder into your Obsidian plugins directory.
- Enable the plugin in the Obsidian settings under the "Community Plugins" section.

## Example vim config using [vimrc-support](https://github.com/esm7/obsidian-vimrc-support) plugin
In order to make the workflow more vim-like, you can bind tether-marks commands to vim key bindings by using [vimrc-support](https://github.com/esm7/obsidian-vimrc-support).

Example:
```vimscript
" mapping the plugin commands to a vim command through obcommand
exmap setmark obcommand tether-marks-obsidian:set-mark
nnoremap <Space>m :setmark<CR>
exmap gomark obcommand tether-marks-obsidian:go-to-mark
nnoremap ' :gomark<CR>
```

For all available commands that can be mapped to vim, run ex command `obcommand`. The list should appear in the developer console.

## Naming conventions
- Register - key symbol that will be used to tether to files. 
- Mark - key value pair, where key is the register (the key symbol) and value is the path of the file that has been marked by that register. 