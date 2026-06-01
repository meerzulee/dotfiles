-- Additional React/Rails development configuration
return {
  -- Enhanced Treesitter support
  {
    "nvim-treesitter/nvim-treesitter",
    opts = function(_, opts)
      vim.list_extend(opts.ensure_installed, {
        "javascript",
        "typescript",
        "tsx",
        "html",
        "css",
        "json",
        "yaml",
        "ruby",
        "embedded_template", -- for ERB
      })
    end,
  },

  -- Auto tag completion for JSX
  {
    "windwp/nvim-ts-autotag",
    event = { "BufReadPre", "BufNewFile" },
    opts = {
      opts = {
        enable_close = true,
        enable_rename = true,
        enable_close_on_slash = true,
      },
      per_filetype = {
        ["html"] = {
          enable_close = false,
        },
      },
    },
  },

  -- Better JSX commenting
  {
    "JoosepAlviste/nvim-ts-context-commentstring",
    lazy = true,
    opts = {
      enable_autocmd = false,
    },
  },

  -- Tailwind and HTML LSP configuration
  {
    "neovim/nvim-lspconfig",
    opts = {
      servers = {
        -- Enhanced Tailwind CSS settings for shadcn
        tailwindcss = {
          settings = {
            tailwindCSS = {
              experimental = {
                classRegex = {
                  { "cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]" },
                  { "cn\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]" },
                  { "clsx\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]" },
                },
              },
            },
          },
        },
        -- HTML LSP for ERB files
        html = {
          filetypes = { "html", "erb", "eruby", "javascriptreact", "typescriptreact" },
        },
      },
    },
  },

  -- Vite test runner (optional, only if you use Vitest)
  {
    "marilari88/neotest-vitest",
    dependencies = {
      "nvim-neotest/neotest",
      "nvim-neotest/nvim-nio",
    },
    ft = { "javascript", "javascriptreact", "typescript", "typescriptreact" },
    config = function()
      require("neotest").setup({
        adapters = {
          require("neotest-vitest"),
        },
      })
    end,
  },

  -- React snippets are already included in LazyVim's friendly-snippets
  -- TypeScript, ESLint, Prettier are handled by LazyVim extras
}