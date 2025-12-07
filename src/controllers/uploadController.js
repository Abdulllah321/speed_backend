import multer from 'multer';
import prisma from '@/models/database.js';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

const uploadRoot = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadRoot)) fs.mkdirSync(uploadRoot, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadRoot),
  filename: (_req, file, cb) => {
    const ts = Date.now();
    const safe = file.originalname.replace(/[^a-zA-Z0-9_.-]/g, '_');
    cb(null, `${ts}_${safe}`);
  },
});

export const uploadSingle = [
  multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }).single('file'),
  async (req, res) => {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ status: false, message: 'No file provided' });
      }

      const fullPath = path.join(uploadRoot, file.filename);
      if (file.mimetype.startsWith('image/')) {
        try {
          const buf = await sharp(fullPath)
            .rotate()
            .jpeg({ quality: 85 })
            .toBuffer();
          fs.writeFileSync(fullPath, buf);
        } catch (e) {
          console.warn('Image post-process failed:', e);
        }
      }

      const record = await prisma.fileUpload.create({
        data: {
          filename: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          path: path.join('uploads', file.filename),
          createdById: req.user?.userId || null,
        },
      });

      res.status(201).json({ status: true, data: { id: record.id, filename: record.filename, mimetype: record.mimetype, size: record.size, createdAt: record.createdAt } });
    } catch (error) {
      console.error('Error uploading file:', error);
      res.status(500).json({ status: false, message: error.message || 'Failed to upload file' });
    }
  },
];

export const uploadMultiple = [
  multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }).array('files', 10),
  async (req, res) => {
    try {
      const files = req.files || [];
      if (!files.length) {
        return res.status(400).json({ status: false, message: 'No files provided' });
      }

      const created = await Promise.all(
        files.map((file) =>
          prisma.fileUpload.create({
            data: {
              filename: file.originalname,
              mimetype: file.mimetype,
              size: file.size,
              path: path.join('uploads', file.filename),
              createdById: req.user?.userId || null,
            },
            select: { id: true, filename: true, mimetype: true, size: true, createdAt: true },
          })
        )
      );

      res.status(201).json({ status: true, data: created });
    } catch (error) {
      console.error('Error uploading files:', error);
      res.status(500).json({ status: false, message: error.message || 'Failed to upload files' });
    }
  },
];

export async function listUploads(req, res) {
  try {
    const items = await prisma.fileUpload.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, filename: true, mimetype: true, size: true, createdAt: true, createdById: true },
    });
    res.json({ status: true, data: items });
  } catch (error) {
    console.error('Error listing uploads:', error);
    res.status(500).json({ status: false, message: error.message || 'Failed to list uploads' });
  }
}

export async function getUpload(req, res) {
  try {
    const { id } = req.params;
    const item = await prisma.fileUpload.findUnique({ where: { id } });
    if (!item) return res.status(404).json({ status: false, message: 'File not found' });
    res.json({ status: true, data: { id: item.id, filename: item.filename, mimetype: item.mimetype, size: item.size, createdAt: item.createdAt } });
  } catch (error) {
    console.error('Error getting upload:', error);
    res.status(500).json({ status: false, message: error.message || 'Failed to get upload' });
  }
}

export async function downloadUpload(req, res) {
  try {
    const { id } = req.params;
    const item = await prisma.fileUpload.findUnique({ where: { id } });
    if (!item) return res.status(404).json({ status: false, message: 'File not found' });
    const abs = path.join(process.cwd(), 'public', item.path || '');
    if (!fs.existsSync(abs)) return res.status(404).json({ status: false, message: 'File not found' });
    res.setHeader('Content-Type', item.mimetype);
    res.setHeader('Content-Disposition', `attachment; filename="${item.filename}"`);
    const stream = fs.createReadStream(abs);
    stream.pipe(res);
  } catch (error) {
    console.error('Error downloading upload:', error);
    res.status(500).json({ status: false, message: error.message || 'Failed to download upload' });
  }
}

export async function deleteUpload(req, res) {
  try {
    const { id } = req.params;
    const item = await prisma.fileUpload.findUnique({ where: { id } });
    if (!item) return res.status(404).json({ status: false, message: 'File not found' });
    if (item.path) {
      const abs = path.join(process.cwd(), 'public', item.path);
      if (fs.existsSync(abs)) {
        try { fs.unlinkSync(abs); } catch {}
      }
    }
    await prisma.fileUpload.delete({ where: { id } });
    res.json({ status: true, message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting upload:', error);
    res.status(500).json({ status: false, message: error.message || 'Failed to delete upload' });
  }
}
