import { Router } from 'express';
import multer from 'multer';
import { 
  getAdminStats, 
  analyzeImportBookCatalog, 
  executeImportBookCatalog,
  getBookPreview,
  uploadBookCover,
  uploadBookPdf,
  deleteBook,
  deleteAllBooks,
  updateBook
} from '../../controllers/admin.controller.js';

const router = Router();

// In-memory storage for file analysis
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

// Stats
router.get('/stats', getAdminStats);

// Import Catalog
router.post('/import/analyze', upload.single('file'), analyzeImportBookCatalog);
router.post('/import/execute', executeImportBookCatalog);

// Book Management
router.delete('/books/all', deleteAllBooks);
router.delete('/books/:id', deleteBook);
router.patch('/books/:id', updateBook);

// Book Media/Preview
router.get('/books/:id/preview', getBookPreview);
router.post('/books/:id/cover', upload.single('file'), uploadBookCover);
router.post('/books/:id/pdf', upload.single('file'), uploadBookPdf);

export default router;
