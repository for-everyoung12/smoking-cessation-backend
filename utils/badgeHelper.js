const Badge = require('../models/badge.model');
const UserBadge = require('../models/userBadge.model');
const ProgressTracking = require('../models/progressTracking.model');
const SmokingStatus = require('../models/smokingStatus.model');

async function checkAndGrantBadges(userId, planId, isPro) {
  const badges = await Badge.find();
  if (!badges.length) return [];

  const progresses = await ProgressTracking.find({ user_id: userId, plan_id: planId });
  const smokingStatuses = await SmokingStatus.find({ user_id: userId, plan_id: planId });

  const noSmokeDays = progresses.filter(p => p.cigarette_count === 0).length;
  const totalMoneySaved = smokingStatuses.reduce((sum, s) => sum + (s.money_spent || 0), 0);

  const grantedBadges = [];
  const vnNow = new Date(new Date().getTime() + 7 * 60 * 60 * 1000);

  for (const badge of badges) {
    if (badge.proOnly && !isPro) {
      continue; 
    }

    let isQualified = false;
    if (badge.condition?.type === 'no_smoke_days') {
      isQualified = noSmokeDays >= badge.condition.value;
    } else if (badge.condition?.type === 'money_saved') {
      isQualified = totalMoneySaved >= badge.condition.value;
    }

    if (isQualified) {
      const existing = await UserBadge.findOne({
        user_id: userId,
        badge_id: badge._id
      });

      if (!existing) {
        const userBadge = await UserBadge.create({
          user_id: userId,
          badge_id: badge._id,
          granted_date: vnNow
        });
        grantedBadges.push(userBadge);
      }
    }
  }

  return grantedBadges;
}


module.exports = { checkAndGrantBadges };
