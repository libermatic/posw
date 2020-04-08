import { db } from '../../store';

export default async function ({ customer }) {
  const { loyalty_program } = await db.customers.get(customer);
  return loyalty_program ? null : [];
}
