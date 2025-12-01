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
  seedCountries,
  getAllCities,
  getCitiesByCountry,
  getCitiesByState,
  createCity,
  createCitiesBulk,
  updateCity,
  updateCitiesBulk,
  deleteCity,
  deleteCitiesBulk,
  getAllStates,
  getStatesByCountry,
  getStateById,
  createState,
  createStatesBulk,
  updateState,
  updateStatesBulk,
  deleteState,
  deleteStatesBulk,
} from '@/controllers/cityController.js';

const router = express.Router();

// Country routes
router.get('/countries', getAllCountries);
router.post('/countries', authenticate, createCountry);
router.post('/countries/bulk', authenticate, createCountriesBulk);
router.post('/countries/seed', authenticate, seedCountries);
router.put('/countries/bulk', authenticate, updateCountriesBulk);
router.put('/countries/:id', authenticate, updateCountry);
router.delete('/countries/bulk', authenticate, deleteCountriesBulk);
router.delete('/countries/:id', authenticate, deleteCountry);

// State routes
router.get('/states', getAllStates);
router.get('/states/country/:countryId', getStatesByCountry);
router.get('/states/:id', getStateById);
router.post('/states', authenticate, createState);
router.post('/states/bulk', authenticate, createStatesBulk);
router.put('/states/bulk', authenticate, updateStatesBulk);
router.put('/states/:id', authenticate, updateState);
router.delete('/states/bulk', authenticate, deleteStatesBulk);
router.delete('/states/:id', authenticate, deleteState);

// City routes
router.get('/cities', getAllCities);
router.get('/cities/country/:countryId', getCitiesByCountry);
router.get('/cities/state/:stateId', getCitiesByState);
router.post('/cities', authenticate, createCity);
router.post('/cities/bulk', authenticate, createCitiesBulk);
router.put('/cities/bulk', authenticate, updateCitiesBulk);
router.put('/cities/:id', authenticate, updateCity);
router.delete('/cities/bulk', authenticate, deleteCitiesBulk);
router.delete('/cities/:id', authenticate, deleteCity);

export default router;

