/**
 * Filter utility to isolate newly registered user stores from Demo accounts
 */
const isDemoUser = (user) => {
  if (!user) return false;
  const email = (user.email || '').toLowerCase();
  return email === 'owner@xpired.com' || email === 'staff@xpired.com';
};

/**
 * Returns a MongoDB query filter scoped to the authenticated user.
 * - Demo accounts (owner@xpired.com, staff@xpired.com) see demo data.
 * - Any newly registered user only sees their own store products/data (clean slate).
 */
const getScopedUserQuery = (user) => {
  if (isDemoUser(user)) {
    return {
      $or: [
        { isDemo: true },
        { user: user._id },
        { addedBy: user._id },
      ],
    };
  }

  return {
    isDemo: false,
    $or: [
      { user: user._id },
      { addedBy: user._id },
    ],
  };
};

module.exports = { isDemoUser, getScopedUserQuery };
