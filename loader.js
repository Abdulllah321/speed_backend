import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('@/')) {
    const newPath = join(__dirname, 'src', specifier.slice(2));
    return nextResolve(pathToFileURL(newPath).href, context);
  }
  return nextResolve(specifier, context);
}

