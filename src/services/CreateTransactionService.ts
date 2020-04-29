// import AppError from '../errors/AppError';

import { getCustomRepository, getRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import AppError from '../errors/AppError';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    if (type !== 'income' && type !== 'outcome') {
      throw new AppError('Please select if it is a income or outcome');
    }

    const transactionRepository = getRepository(Transaction);
    const categoryRepository = getRepository(Category);
    const balance = getCustomRepository(TransactionsRepository);
    const { total } = await balance.getBalance();

    if (type === 'outcome' && total < value) {
      throw new AppError('You do not have money');
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

    return transaction;
  }
}

export default CreateTransactionService;
