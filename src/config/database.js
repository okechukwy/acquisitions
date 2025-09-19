import 'dotenv/config';

import { neon} from '@neondatabase/serverless';

import { drizlle} from 'drizzle-orm/neon-http';

const sql = neon(process.env.DATABASE_URL);
const db = drizlle(sql);

export default { db, sql};