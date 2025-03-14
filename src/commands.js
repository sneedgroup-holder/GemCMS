import fs from 'fs-extra';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CONTENT_DIR = join(process.cwd(), 'content');
const DRAFTS_DIR = join(CONTENT_DIR, 'drafts');
const PUBLIC_DIR = join(process.cwd(), 'public');

// Ensure directories exist
await fs.ensureDir(CONTENT_DIR);
await fs.ensureDir(DRAFTS_DIR);
await fs.ensureDir(PUBLIC_DIR);

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

export async function createPost(title, isDraft = false) {
  const date = new Date();
  const slug = slugify(title);
  const fileName = `${formatDate(date)}-${slug}.gmi`;
  const targetDir = isDraft ? DRAFTS_DIR : CONTENT_DIR;
  const filePath = join(targetDir, fileName);

  const template = `# ${title}
Published: ${formatDate(date)}

This is your new blog post. Start writing in Gemtext format!

## Example Heading

* You can use lists
* Like this one
* To organize your content

> You can also include blockquotes for emphasis

=> https://gemini.circumlunar.space/ Learn more about Gemini
`;

  await fs.writeFile(filePath, template, 'utf8');
  return filePath;
}

export async function listPosts(draftsOnly = false) {
  const dir = draftsOnly ? DRAFTS_DIR : CONTENT_DIR;
  const files = await fs.readdir(dir);
  
  for (const file of files) {
    if (file.endsWith('.gmi')) {
      const content = await fs.readFile(join(dir, file), 'utf8');
      const title = content.split('\n')[0].replace('# ', '');
      console.log(`${file} - ${title}`);
    }
  }
}

export async function deletePost(title) {
  const slug = slugify(title);
  const files = await fs.readdir(CONTENT_DIR);
  const draftFiles = await fs.readdir(DRAFTS_DIR);
  
  const file = [...files, ...draftFiles].find(f => f.includes(slug));
  if (!file) throw new Error('Post not found');

  const filePath = files.includes(file) 
    ? join(CONTENT_DIR, file)
    : join(DRAFTS_DIR, file);

  await fs.remove(filePath);
}

export async function editPost(title) {
  const slug = slugify(title);
  const files = await fs.readdir(CONTENT_DIR);
  const draftFiles = await fs.readdir(DRAFTS_DIR);
  
  const file = [...files, ...draftFiles].find(f => f.includes(slug));
  if (!file) throw new Error('Post not found');

  const filePath = files.includes(file) 
    ? join(CONTENT_DIR, file)
    : join(DRAFTS_DIR, file);

  const editor = process.env.EDITOR || 'nano';
  const { spawn } = await import('child_process');
  
  return new Promise((resolve, reject) => {
    const child = spawn(editor, [filePath], {
      stdio: 'inherit',
      shell: true
    });

    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Editor exited with code ${code}`));
      }
    });

    child.on('error', (err) => {
      reject(new Error(`Failed to launch editor: ${err.message}`));
    });
  });
}

export async function pushDraft(title) {
  const slug = slugify(title);
  const draftFiles = await fs.readdir(DRAFTS_DIR);
  
  const file = draftFiles.find(f => f.includes(slug));
  if (!file) throw new Error('Draft not found');

  const sourcePath = join(DRAFTS_DIR, file);
  const targetPath = join(CONTENT_DIR, file);
  
  await fs.move(sourcePath, targetPath);
  return { file, sourcePath, targetPath };
}

export async function popPublic(title) {
  const slug = slugify(title);
  const files = await fs.readdir(CONTENT_DIR);
  
  const file = files.find(f => f.includes(slug));
  if (!file) throw new Error('Published post not found');

  const sourcePath = join(CONTENT_DIR, file);
  const targetPath = join(DRAFTS_DIR, file);
  
  await fs.move(sourcePath, targetPath);
  return { file, sourcePath, targetPath };
}

export async function buildSite() {
  // Clear public directory
  await fs.emptyDir(PUBLIC_DIR);

  // Create index.gmi
  const posts = await fs.readdir(CONTENT_DIR);
  let indexContent = '# Blog\n\n';
  
  for (const file of posts) {
    if (!file.endsWith('.gmi')) continue;
    
    const content = await fs.readFile(join(CONTENT_DIR, file), 'utf8');
    const title = content.split('\n')[0].replace('# ', '');
    indexContent += `=> ${file} ${title}\n`;
  }

  await fs.writeFile(join(PUBLIC_DIR, 'index.gmi'), indexContent, 'utf8');

  // Copy all posts to public directory
  for (const file of posts) {
    if (file.endsWith('.gmi')) {
      await fs.copy(
        join(CONTENT_DIR, file),
        join(PUBLIC_DIR, file)
      );
    }
  }
} 