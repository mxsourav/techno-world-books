import { Router } from 'express';
import { 
  getAll, 
  create, 
  update, 
  remove, 
  toggleActive, 
  validate 
} from '../../controllers/coupon.controller.js';

const router = Router();

router.get('/', getAll);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', remove);
router.patch('/:id/toggle', toggleActive);
router.post('/validate', validate);

export default router;
