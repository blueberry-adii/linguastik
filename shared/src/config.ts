import * as os from 'os';
import * as path from 'path';
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const CONFIG_DIR = path.join(os.homedir(), '.lingo-dev');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

const ConfigSchema = z.object({
    apiKey: z.string().optional(),
    targetLang: z.string().default('en'),
});

type Config = z.infer<typeof ConfigSchema>;