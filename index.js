#!/usr/bin/env node
const { program } = require("commander");
const axios = require("axios");
const cheerio = require("cheerio");
const TurndownService = require("turndown");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { exec } = require("child_process");
const clipboardy = require("clipboardy");

program
  .name("webclip")
  .description(
    "Fetches content from a webpage or processes clipboard text, then copies it as a file to the clipboard"
  )
  .version("1.0.0");

program
  .command("fetch", { isDefault: true })
  .description("Fetches content from a webpage, then processes and copies it")
  .argument("<url>", "URL of the webpage to fetch")
  .option(
    "-s, --selector <selector>",
    "CSS selector to extract specific elements"
  )
  .option("-f, --format <format>", "Output format: raw, md, text", "raw")
  .option("-e, --extension <extension>", "Output extension: md, txt, html", "md")
  .option(
    "-c, --clipboard-format <format>",
    "Clipboard copy format: file, text",
    "file"
  )
  .action(processUrl);

program
  .command("paste")
  .alias("p")
  .description(
    "Reads text from clipboard, writes to a temp file, and copies the file to clipboard"
  )
  .option(
    "-e, --extension <extension>",
    "Output file extension: txt, md, html",
    "txt"
  )
  .action(pasteFromClipboardToFile);

async function processUrl(url, options) {
  try {
    console.log(`Fetching URL: ${url}`);
    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      responseType: "text",
    });

    const $ = cheerio.load(response.data);

    let targetElement;
    if (options.selector) {
      console.log(`Using selector: ${options.selector}`);
      const selected = $(options.selector);
      if (selected.length > 0) {
        targetElement = selected;
      } else {
        console.warn(
          `Warning: Selector "${options.selector}" matched no elements. Using <body> content.`
        );
        targetElement = $("body");
      }
    } else {
      targetElement = $("body");
    }

    let processedContent;
    switch (options.format.toLowerCase()) {
      case "text":
        processedContent = targetElement.text().trim();
        break;
      case "md":
        const turndownService = new TurndownService();
        processedContent = turndownService.turndown(targetElement.html() || "");
        break;
      case "raw":
      default:
        processedContent = targetElement.html() || "";
        break;
    }

    if (options.clipboardFormat === "text") {
      try {
        await clipboardy.write(processedContent);
        console.log("Content copied to clipboard as text.");
      } catch (err) {
        console.error("Failed to copy text to clipboard:", err.message || err);
        process.exit(1);
      }
    } else {
      const tempDir = os.tmpdir();
      const fileName = `webclip_url_${Date.now()}.${getFileExtension(
        options.extension
      )}`;
      const filePath = path.join(tempDir, fileName);
      fs.writeFileSync(filePath, processedContent);
      console.log(`Content saved to temporary file: ${filePath}`);
      await copyFileToClipboard(filePath);
    }
  } catch (error) {
    console.error("Error processing URL:", error.message);
    if (error.response) {
      console.error(`HTTP Status: ${error.response.status}`);
    }
    process.exit(1);
  }
}

async function pasteFromClipboardToFile(options) {
  try {
    console.log("Reading text from clipboard...");
    const clipboardText = await clipboardy.read();

    if (!clipboardText || clipboardText.trim() === "") {
      console.warn(
        "Clipboard is empty or contains only whitespace. No action taken."
      );
      return;
    }
    console.log("Clipboard text read successfully.");

    const tempDir = os.tmpdir();
    const fileExt = getFileExtension(options.extension);
    const fileName = `webclip_paste_${Date.now()}.${fileExt}`;
    const filePath = path.join(tempDir, fileName);

    fs.writeFileSync(filePath, clipboardText);
    console.log(`Clipboard content saved to temporary file: ${filePath}`);

    await copyFileToClipboard(filePath);
  } catch (error) {
    console.error(
      "Error processing clipboard content:",
      error.message || error
    );
    process.exit(1);
  }
}

function getFileExtension(format) {
  switch (format.toLowerCase()) {
    case "md":
    case "md":
      return "md";
    case "text":
    case "txt":
      return "txt";
    case "raw":
    case "html":
    default:
      return "html";
  }
}

async function copyFileToClipboard(filePath) {
  const platform = process.platform;
  let command;

  if (platform === "win32") {
    command = `powershell -command "Set-Clipboard -Path '${filePath.replace(
      /'/g,
      "''"
    )}'"`;
  } else if (platform === "darwin") {
    command = ``;
  } else {
    try {
      await clipboardy.write(filePath);
      console.log(
        `File path copied to clipboard (Linux/fallback): ${filePath}`
      );
    } catch (err) {
      console.error(
        `Failed to copy file path to clipboard (Linux/fallback):`,
        err.message || err
      );
    }
    return;
  }

  return new Promise((resolve, reject) => {
    exec(command, async (error) => {
      if (error || command === ``) {
        if (command !== ``) {
          console.error(
            `Failed to copy file to clipboard (${platform}):`,
            error ? error.message : "Command was empty."
          );
        }
        if (platform === "win32" || platform === "darwin") {
          console.log("Attempting to copy file path as fallback...");
          try {
            await clipboardy.write(filePath);
            console.log("File path copied to clipboard:", filePath);
            resolve();
          } catch (err) {
            console.error(
              "Fallback to copy file path also failed:",
              err.message || err
            );
            reject(err);
          }
        } else {
          reject(
            error ||
              new Error("Command was empty and no fallback for this platform.")
          );
        }
        return;
      }
      console.log(`File copied to clipboard (${platform}): ${filePath}`);
      resolve();
    });
  });
}

if (require.main === module) {
  (async () => {
    if (process.argv.length <= 2) {
      program.help();
    } else {
      await program.parseAsync(process.argv);
    }
  })();
}
