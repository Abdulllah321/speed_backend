import express from 'express';
import { authenticate } from '@/middleware/authMiddleware.js';
import {
  getAllCountries,
  createCountry,
  createCountriesBulk,
  updateCountry,
  updateCountriesBulk,
  deleteCountry,
  deleteCountriesBulk,
  getAllCities,
  getCitiesByCountry,
  createCity,
  createCitiesBulk,
  updateCity,
  updateCitiesBulk,
  deleteCity,
  deleteCitiesBulk,
} from '@/controllers/cityController.js';

const router = express.Router();

// Country routes
router.get('/countries', getAllCountries);
router.post('/countries', authenticate, createCountry);
router.post('/countries/bulk', authenticate, createCountriesBulk);
router.put('/countries/bulk', authenticate, updateCountriesBulk);
router.put('/countries/:id', authenticate, updateCountry);
router.delete('/countries/bulk', authenticate, deleteCountriesBulk);
router.delete('/countries/:id', authenticate, deleteCountry);

// City routes
router.get('/cities', getAllCities);
router.get('/cities/country/:countryId', getCitiesByCountry);
router.post('/cities', authenticate, createCity);
router.post('/cities/bulk', authenticate, createCitiesBulk);
router.put('/cities/bulk', authenticate, updateCitiesBulk);
router.put('/cities/:id', authenticate, updateCity);
router.delete('/cities/bulk', authenticate, deleteCitiesBulk);
router.delete('/cities/:id', authenticate, deleteCity);

export default router;

