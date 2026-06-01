-- Emmet configuration with proper keybindings and LSP setup
return {
  -- Emmet LSP configuration
  {
    "neovim/nvim-lspconfig",
    opts = {
      servers = {
        emmet_language_server = {
          filetypes = {
            "css",
            "eruby",
            "html",
            "javascript",
            "javascriptreact",
            "less",
            "sass",
            "scss",
            "pug",
            "typescriptreact",
            "vue",
            "svelte",
          },
          init_options = {
            showExpandedAbbreviation = "always",
            showAbbreviationSuggestions = true,
            showSuggestionsAsSnippets = true,
            syntaxProfiles = {},
            variables = {},
            excludeLanguages = {},
          },
        },
      },
    },
  },

  -- Alternative: emmet-vim plugin with custom keybindings
  {
    "mattn/emmet-vim",
    event = { "InsertEnter" },
    ft = {
      "html",
      "css",
      "scss",
      "javascript",
      "javascriptreact",
      "typescript",
      "typescriptreact",
      "vue",
      "svelte",
    },
    config = function()
      -- Set Emmet leader key (default is <C-y>)
      vim.g.user_emmet_leader_key = "<C-e>"

      -- Enable Emmet only for specific file types
      vim.g.user_emmet_install_global = 0
      vim.cmd([[
        autocmd FileType html,css,scss,javascript,javascriptreact,typescript,typescriptreact,vue,svelte EmmetInstall
      ]])

      -- Custom settings for JSX
      vim.g.user_emmet_settings = {
        javascript = {
          extends = "jsx",
        },
        typescript = {
          extends = "tsx",
        },
        typescriptreact = {
          extends = "tsx",
        },
        javascriptreact = {
          extends = "jsx",
        },
      }
    end,
  },
}