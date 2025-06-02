const express = require('express');
const router = express.Router();
const badgeController = require('../controllers/badge.controller');

// Define routes
router.get('/', badgeController.getAllBadges);
router.get('/:id', badgeController.getBadgeById);
router.post('/', badgeController.createBadge);
router.put('/:id', badgeController.updateBadge);
router.delete('/:id', badgeController.deleteBadge);

module.exports = router;
