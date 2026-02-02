import { PrismaClient } from "@prisma/client/extension";
import '@testing-library/jest-dom';
import { beforeAll, beforeEach, afterAll, afterEach } from 'vitest';

const prisma = new PrismaClient();

beforeAll(async () => {
    await prisma.$connect();
});

afterAll(async () => {
    await prisma.$disconnect();
});

export {
    prisma
};