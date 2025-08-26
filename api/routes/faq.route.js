import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filePath = path.join(__dirname, '../data/faqs.json');

// GET all FAQs
router.get('/', async (req, res) => {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    res.status(200).json(JSON.parse(data));
  } catch (err) {
    res.status(500).json({ error: 'Failed to load FAQs' });
  }
});

// POST new FAQ
router.post('/', async (req, res) => {
  try {
    const { question, answer, category } = req.body;
    const data = JSON.parse(await fs.readFile(filePath, 'utf-8'));
    data.push({ question, answer, category });
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    res.status(201).json({ message: 'FAQ added' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add FAQ' });
  }
});

// PUT update FAQ by index
router.put('/:index', async (req, res) => {
  try {
    const index = parseInt(req.params.index);
    const { question, answer, category } = req.body;
    const data = JSON.parse(await fs.readFile(filePath, 'utf-8'));
    if (data[index]) {
      data[index] = { question, answer, category };
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
      res.status(200).json({ message: 'FAQ updated' });
    } else {
      res.status(404).json({ error: 'FAQ not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to update FAQ' });
  }
});

// DELETE FAQ by index
router.delete('/:index', async (req, res) => {
  try {
    const index = parseInt(req.params.index);
    const data = JSON.parse(await fs.readFile(filePath, 'utf-8'));
    if (data[index]) {
      data.splice(index, 1);
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
      res.status(200).json({ message: 'FAQ deleted' });
    } else {
      res.status(404).json({ error: 'FAQ not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete FAQ' });
  }
});

export default router;
