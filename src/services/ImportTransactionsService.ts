import csvToJson from 'csvtojson';
import { getCustomRepository, getRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';
import AppError from '../errors/AppError';

interface Request {
  filePath: string;
}

class ImportTransactionsService {
  async execute({ filePath }: Request): Promise<Transaction[]> {
    const transactionsCcvToJson = await csvToJson().fromFile(filePath);
    const transactions = [];

    // console.log(transactions);

    const transactionRepository = getRepository(Transaction);
    const categoryRepository = getRepository(Category);
    const balance = getCustomRepository(TransactionsRepository);

    for (const transactionEach of transactionsCcvToJson) {
      const { title, type, value, category } = transactionEach;

      if (type !== 'income' && type !== 'outcome') {
        throw new AppError('Please select if it is a income or outcome');
      }

      const { total } = await balance.getBalance();

      if (type === 'outcome' && total < value) {
        continue;
      }

      const categoryExist = await categoryRepository.findOne({
        where: {
          title: category,
        },
      });

      if (!categoryExist) {
        const newCategory = categoryRepository.create({
          title: category,
        });

        await categoryRepository.save(newCategory);
      }

      const transaction = transactionRepository.create({
        title,
        value,
        type,
        category: await categoryRepository.findOne({
          where: {
            title: category,
          },
        }),
      });

      await transactionRepository.save(transaction);

      transactions.push(transaction);
    }

    if (transactions.length === 0) {
      throw new AppError('Nothing to register');
    }

    return transactions;
  }
}

export default ImportTransactionsService;
