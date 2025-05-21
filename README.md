
If no command is specified, `fetch` is assumed if a URL is provided.

### `fetch` Command (Default)

Fetches content from a webpage, processes it, and copies it to the clipboard.

**Syntax:**
`webclip fetch <url> [options]`
or simply (as `fetch` is default):
`webclip <url> [options]`

**Arguments:**
*   `<url>`: (Required) The URL of the webpage to fetch.

**Options:**
*   `-s, --selector <selector>`: CSS selector to extract specific elements (e.g., `main`, `#content`, `.article-body`). If not provided or if the selector matches no elements, the entire `<body>` content is used.
*   `-f, --format <format>`: Output format for the content.
    *   `raw` (default): Raw HTML content.
    *   `md`: Convert content to Markdown.
    *   `text`: Extract plain text content.
*   `-e, --extension <extension>`: Desired output file extension (e.g., `md`, `txt`, `html`).
    *   Note: The actual temporary file extension is primarily determined by the `--format` option (`raw`/`html` -> `.html`, `md` -> `.md`, `text` -> `.txt`). This option provides more explicit control if needed, though `getFileExtension` prioritizes format.
*   `-c, --clipboard-format <format>`: How the result is copied to the clipboard.
    *   `file` (default): Saves content to a temporary file and copies the file to the clipboard.
    *   `text`: Copies the processed content directly as text to the clipboard.

**Examples:**

1.  **Fetch the entire body of a page as HTML and copy the temporary file to clipboard:**
    ```bash
    webclip https://example.com
    ```

2.  **Fetch the main article content, convert to Markdown, and copy the temporary `.md` file:**
    ```bash
    webclip fetch https://my.blog.com/some-article -s "article.content" -f md
    ```

3.  **Fetch the text of a specific div and copy it directly as text to clipboard:**
    ```bash
    webclip https://example.com -s "#important-info" -f text -c text
    ```

4.  **Fetch raw HTML of an element and copy the temporary `.html` file:**
    ```bash
    webclip https://example.com -s "header" --format raw --clipboard-format file
    ```

### `paste` Command

Reads text from the system clipboard, writes it to a temporary file, and copies that file to the clipboard.

**Alias:** `p`

**Syntax:**
`webclip paste [options]`
or
`webclip p [options]`

**Options:**
*   `-f, --format <format>`: Output file format for the temporary file. This also determines the file extension.
    *   `text` (default): Saves as a `.txt` file.
    *   `md`: Saves as a `.md` file.
    *   `html`: Saves as an `.html` file.

**Examples:**

1.  **Copy text from clipboard, save as `sometext.txt` (temp name), and copy the file to clipboard:**
    ```bash
    # (First, copy some text to your clipboard)
    webclip paste
    ```
    or
    ```bash
    webclip p
    ```

2.  **Copy text from clipboard, save as a temporary Markdown file, and copy the file to clipboard:**
    ```bash
    # (First, copy some Markdown-formatted text to your clipboard)
    webclip paste -e md
    ```

## Clipboard Behavior for Files

*   **Windows:** Uses PowerShell to copy the actual file object to the clipboard. You can then paste this file into Explorer, an email, etc.
*   **macOS:** Direct file object copying to the clipboard is **not currently implemented** via a native command in this script. As a fallback, the **full path** to the temporary file is copied to the clipboard. You can then paste this path into a terminal (`open <path>`) or a "Go to Folder" dialog in Finder.
*   **Linux/Other:** Uses `clipboardy` to copy the **full path** to the temporary file to the clipboard. You can use this path with commands like `xdg-open <path>` or paste it where needed.

When `--clipboard-format text` is used with the `fetch` command, the processed text content itself is copied to the clipboard, which works consistently across all platforms.

## Temporary Files

*   Processed content (when not using `-c text`) is saved to a temporary file in your system's temporary directory (e.g., `/tmp` on Linux/macOS, `%TEMP%` on Windows).
*   File names are generated with a timestamp to avoid collisions:
    *   For `fetch`: `webclip_url_<timestamp>.<extension>`
    *   For `paste`: `webclip_paste_<timestamp>.<extension>`
*   **These temporary files are not automatically deleted by the script.** You may need to manually clear your system's temporary directory periodically.

## Dependencies

*   [axios](https://www.npmjs.com/package/axios): Promise based HTTP client for the browser and node.js.
*   [cheerio](https://www.npmjs.com/package/cheerio): Fast, flexible & lean implementation of core jQuery designed specifically for the server.
*   [clipboardy](https://www.npmjs.com/package/clipboardy): Access the system clipboard (copy/paste).
*   [commander](https://www.npmjs.com/package/commander): Node.js command-line interfaces made easy.
*   [turndown](https://www.npmjs.com/package/turndown): An HTML to Markdown converter in JavaScript.

## Contributing

Contributions are welcome! If you have suggestions, bug reports, or want to improve features (especially native file copying for macOS/Linux), please feel free to:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature-name`).
3.  Make your changes.
4.  Commit your changes (`git commit -am 'Add some feature'`).
5.  Push to the branch (`git push origin feature/your-feature-name`).
6.  Create a new Pull Request.

## License

This project is licensed under the MIT License - see the `LICENSE` file for details (if one exists, otherwise assume MIT or specify).