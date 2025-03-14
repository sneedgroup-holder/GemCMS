#!/usr/bin/env node

import { program } from 'commander';
import { config } from 'dotenv';
import chalk from 'chalk';
import { createPost, listPosts, deletePost, buildSite } from './commands.js';
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