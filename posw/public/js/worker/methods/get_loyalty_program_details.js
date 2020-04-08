import { db } from '../../store';

async function getProgram(name) {
  const program = await db.loyalty_programs.get(name);
  if (!program) {
    return null;
  }
  return Object.assign(program, { loyalty_program: name });
}

export default async function ({
  customer,
  loyalty_program = null,
  expiry_date = null,
  company = null,
  silent = false,

  // unused params
  include_expired_entry = false,
}) {
  if (!loyalty_program) {
    const { loyalty_program: customer_loyalty_program } =
      (await db.customers.get(customer)) || {};
    if (!customer_loyalty_program && !silent) {
      return null;
    }
    return {
      loyalty_program:
        customer_loyalty_program &&
        (await getProgram(customer_loyalty_program)),
    };
  }
  return { loyalty_program: await getProgram(loyalty_program) };
}
