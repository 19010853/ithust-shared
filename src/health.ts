import { Request, Response } from 'express';

export function createHealthHandler(message: string): (_req: Request, res: Response) => void {
  return function (_req: Request, res: Response): void {
    res.status(200).json({ message });
  };
}
