#!/usr/bin/env node
import { Command } from 'commander';
import { loginCommand } from './src/commands/login.js';
import { connectCommand } from './src/commands/connect.js';
import { envCommand } from './src/commands/env.js';
const program = new Command();
program
    .name('bimo')
    .description('bimo CLI')
    .version('1.0.0')
    .option('--gateway <url>', 'Override the default API gateway URL', 'http://localhost:8001/v1');
program.addCommand(loginCommand());
program.addCommand(connectCommand());
program.addCommand(envCommand());
program.parseAsync(process.argv);


