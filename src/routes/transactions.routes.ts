import { Router } from 'express';
import { getCustomRepository } from 'typeorm';
import multer from 'multer';
import Papa from 'papaparse';
import fs from 'fs';
import csvToJson from 'csvtojson';
import uploadConfig from '../config/upload';
import CreateTransactionService from '../services/CreateTransactionService';
import TransactionsRepository from '../repositories/TransactionsRepository';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();

const upload = multer(uploadConfig);

transactionsRouter.get('/', async (request, response) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository);

  const transactions = await transactionsRepository.find();
  const balance = await transactionsRepository.getBalance();

  transactions.forEach(tran => {
    delete tran.category_id;
  });

  return response.json({ transactions, balance});
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;

  const createTransaction = new CreateTransactionService();

  const transaction = await createTransaction.execute({
    title,
    value,
    type,
    category,
  });

  return response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;

  const transactionsRepository = new DeleteTransactionService();

  await transactionsRepository.execute({ id });

  return response.status(204).send();
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    console.log(request.file);

    const importTransactionsRepository = new ImportTransactionsService();

    const transaction = await importTransactionsRepository.execute({
      filePath: request.file.path,
    });

    return response.json(transaction);
  },
);

export default transactionsRouter;
