import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from 'server/db';
import { errorHandlerMiddleware } from 'server/middlewares';
import { favoriteValidationSchema } from 'validationSchema/favorites';
import { convertQueryToPrismaUtil } from '../../../server/utils';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return getFavorites();
    case 'POST':
      return createFavorite();
    default:
      return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }

  async function getFavorites() {
    const data = await prisma.favorite.findMany(convertQueryToPrismaUtil(req.query, 'favorite'));
    return res.status(200).json(data);
  }

  async function createFavorite() {
    await favoriteValidationSchema.validate(req.body);
    const body = { ...req.body };

    const data = await prisma.favorite.create({
      data: body,
    });
    return res.status(200).json(data);
  }
}

export default function apiHandler(req: NextApiRequest, res: NextApiResponse) {
  return errorHandlerMiddleware(handler)(req, res);
}
