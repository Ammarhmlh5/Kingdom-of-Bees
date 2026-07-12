
import { Router } from 'express';
import { getBeeBreeds, getBeeBreedById } from '../controllers/bee-breed.controller';

const router = Router();

// Routes
router.get('/', getBeeBreeds);
router.get('/:id', getBeeBreedById);

export default router;
