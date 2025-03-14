#!/usr/bin/env node

import { program } from 'commander';
import { config } from 'dotenv';
import chalk from 'chalk';
import { createPost, listPosts, deletePost, buildSite, editPost, pushDraft, popPublic } from './commands.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs-extra';

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

program
  .version('1.0.0')
  .description('A simple CLI-based CMS for Gemtext blog sites');

program
  .command('new <title>')
  .description('Create a new blog post')
  .option('-d, --draft', 'Save as draft')
  .action(async (title, options) => {
    try {
      await createPost(title, options.draft);
      console.log(chalk.green(`✓ Created new post: ${title}`));
    } catch (error) {
      console.error(chalk.red(`Error creating post: ${error.message}`));
    }
  });

program
  .command('list')
  .description('List all blog posts')
  .option('-d, --drafts', 'Show drafts only')
  .action(async (options) => {
    try {
      await listPosts(options.drafts);
    } catch (error) {
      console.error(chalk.red(`Error listing posts: ${error.message}`));
    }
  });

program
  .command('delete <title>')
  .description('Delete a blog post')
  .action(async (title) => {
    try {
      await deletePost(title);
      console.log(chalk.green(`✓ Deleted post: ${title}`));
    } catch (error) {
      console.error(chalk.red(`Error deleting post: ${error.message}`));
    }
  });

program
  .command('edit <title>')
  .description('Edit a blog post or draft')
  .action(async (title) => {
    try {
      await editPost(title);
      console.log(chalk.green(`✓ Finished editing post: ${title}`));
    } catch (error) {
      console.error(chalk.red(`Error editing post: ${error.message}`));
    }
  });

program
  .command('push-draft <title>')
  .description('Push a draft post to published state')
  .action(async (title) => {
    try {
      const result = await pushDraft(title);
      console.log(chalk.green(`✓ Pushed draft to published: ${title}`));
      console.log(chalk.gray(`Moved from ${result.sourcePath} to ${result.targetPath}`));
    } catch (error) {
      console.error(chalk.red(`Error pushing draft: ${error.message}`));
    }
  });

program
  .command('pop-public <title>')
  .description('Move a published post back to draft state')
  .action(async (title) => {
    try {
      const result = await popPublic(title);
      console.log(chalk.green(`✓ Moved published post to draft: ${title}`));
      console.log(chalk.gray(`Moved from ${result.sourcePath} to ${result.targetPath}`));
    } catch (error) {
      console.error(chalk.red(`Error moving to draft: ${error.message}`));
    }
  });

program
  .command('build')
  .description('Build the static Gemtext site')
  .action(async () => {
    try {
      await buildSite();
      console.log(chalk.green('✓ Site built successfully'));
    } catch (error) {
      console.error(chalk.red(`Error building site: ${error.message}`));
    }
  });

program.parse(process.argv); 