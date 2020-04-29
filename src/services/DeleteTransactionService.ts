import { getRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import AppError from '../errors/AppError';

interface Request {
  id: string;
}

class DeleteTransactionService {
  public async execute({ id }: Request): Promise<void> {
    const transactionRepository = getRepository(Transaction);
    const categoryRepository = getRepository(Category);

    const transaction = await transactionRepository.findOne(id);

    if (!transaction) {
      throw new AppError('This transaction does not exist');
    }

    if (transaction.category_id) {
      await categoryRepository.delete(transaction.category_id);
    }

    await transactionRepository.delete(id);
  }
}

export default DeleteTransactionService;
