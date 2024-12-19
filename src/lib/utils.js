import jwt from 'jsonwebtoken';

export const generateToken = (userId, res) => {
  const token = jwt.sign(
    { userId: userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return token;
};


export const toProperCase = (str) => {
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};


export const calculateAge = (dob) => {
  const diffMs = Date.now() - dob.getTime();
  const ageDate = new Date(diffMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
};