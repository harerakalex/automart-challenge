const admin = (req, res, next) => {
  if (!req.userData.is_admin) return res.status(403).json({ status: 403, error: 'Unathorized access.' });
  next();
};

export default admin;