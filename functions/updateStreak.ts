import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

const msInDay = 1000 * 60 * 60 * 24;

const getDayStamp = (date: Date) => {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { profileId } = await req.json();
    if (!profileId) {
      return Response.json({ error: 'profileId is required' }, { status: 400 });
    }

    const parentAccounts = await base44.entities.ParentAccount.filter({
      parent_user_id: user.id
    });

    if (!parentAccounts.length) {
      return Response.json({ error: 'Parent account not found' }, { status: 403 });
    }

    const profiles = await base44.entities.UserProfile.filter({ id: profileId });
    if (!profiles.length) {
      return Response.json({ error: 'Profile not found' }, { status: 404 });
    }

    const profile = profiles[0];
    const parentAccountId = parentAccounts[0].id;

    if (profile.parent_account_id && profile.parent_account_id !== parentAccountId) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const today = getDayStamp(new Date());
    const lastActivityDate = profile.last_activity_date ? getDayStamp(new Date(profile.last_activity_date)) : null;

    let newStreak = profile.current_streak || 0;
    let longestStreak = profile.longest_streak || 0;

    if (!lastActivityDate) {
      newStreak = 1;
    } else {
      const diffDays = Math.floor((today.getTime() - lastActivityDate.getTime()) / msInDay);
      if (diffDays === 0) {
        return Response.json({
          current_streak: newStreak,
          longest_streak: longestStreak
        });
      }
      if (diffDays === 1) {
        newStreak += 1;
      } else {
        newStreak = 1;
      }
    }

    if (newStreak > longestStreak) {
      longestStreak = newStreak;
    }

    await base44.asServiceRole.entities.UserProfile.update(profileId, {
      current_streak: newStreak,
      longest_streak: longestStreak,
      last_activity_date: today.toISOString()
    });

    return Response.json({
      current_streak: newStreak,
      longest_streak: longestStreak
    });
  } catch (error) {
    console.error('Update streak error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
