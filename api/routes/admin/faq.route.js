import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to faqs.json
const filePath = path.join(__dirname, '../data/faqs.json');

// GET /api/admin/faqs — Return current FAQs for admin preview
router.get('/', async (req, res) => {
  try {
    const fileData = await fs.readFile(filePath, 'utf-8');
    const faqs = JSON.parse(fileData);
    res.status(200).json(faqs);
  } catch (err) {
    console.error('❌ Failed to load FAQs for admin:', err);
    res.status(500).json({ error: 'Failed to load FAQs' });
  }
});

// POST /api/admin/faqs — Overwrite faqs.json with new list and create a backup
router.post('/', async (req, res) => {
  try {
    const updatedFaqs = req.body;

    if (!Array.isArray(updatedFaqs)) {
      return res.status(400).json({ error: 'Invalid FAQ format. Expected an array.' });
    }

    // Create a timestamped backup before overwriting
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(__dirname, `../data/faqs.backup.${timestamp}.json`);

    const currentData = await fs.readFile(filePath, 'utf-8');
    await fs.writeFile(backupPath, currentData, 'utf-8');

    // Overwrite with new data
    await fs.writeFile(filePath, JSON.stringify(updatedFaqs, null, 2), 'utf-8');

    res.status(200).json({ message: 'FAQs updated successfully with backup created' });
  } catch (err) {
    console.error('❌ Failed to update FAQs:', err);
    res.status(500).json({ error: 'Failed to update FAQs' });
  }
});

export default router;
