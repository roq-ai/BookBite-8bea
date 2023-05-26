import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from 'server/db';
import { errorHandlerMiddleware } from 'server/middlewares';
import { menuValidationSchema } from 'validationSchema/menus';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return getMenuById();
    case 'PUT':
      return updateMenuById();
    case 'DELETE':
      return deleteMenuById();
    default:
      return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }

  async function getMenuById() {
    const data = await prisma.menu.findFirst({
      where: { id: req.query.id as string },
    });
    return res.status(200).json(data);
  }

  async function updateMenuById() {
    await menuValidationSchema.validate(req.body);
    const data = await prisma.menu.update({
      where: { id: req.query.id as string },
      data: {
        ...req.body,
      },
    });
    return res.status(200).json(data);
  }
  async function deleteMenuById() {
    const data = await prisma.menu.delete({
      where: { id: req.query.id as string },
    });
    return res.status(200).json(data);
  }
}

export default function apiHandler(req: NextApiRequest, res: NextApiResponse) {
  return errorHandlerMiddleware(handler)(req, res);
}
