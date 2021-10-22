import { NextFunction, Request, Response } from "express";

import Joi from 'joi';

export const GetCarValidation = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const schema = Joi.object({
            modelo: Joi.string(),
            cor: Joi.string(),
            ano: Joi.number().min(1950).max(2022),
            acessorio: Joi.string(),
            quantidadePassageiros: Joi.number(),
            size: Joi.number(),
            start: Joi.number()
        });

        const { error } = schema.validate(req.query, { abortEarly: true });
        if (error) throw error
        return next();
    } catch (error) {
        return res.status(400).json(error);
    }
}