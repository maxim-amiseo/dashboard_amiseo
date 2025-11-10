import { promises as fs } from 'fs';
import path from 'path';

export type KPI = {
  label: string;
  value: string;
  helper?: string;
};

export type Initiative = {
  title: string;
  status: 'active' | 'paused' | 'monitoring' | 'planning';
  details: string;
};

export type EcommerceSnapshot = {
  revenue: string;
  conversionRate: string;
  returningCustomers: string;
  topProduct: string;
  avgOrderValue: string;
  cartAbandonment: string;
};

export type ClientRecord = {
  id: string;
  name: string;
  industry: string;
  summary: string;
  kpis: KPI[];
  monthlyHighlights: string[];
  thisMonthActions: string[];
  nextMonthActions: string[];
  initiatives: Initiative[];
  ecommerce?: EcommerceSnapshot;
};

export type UserRecord = {
  id: string;
  username: string;
  password: string;
  role: 'admin' | 'client';
  displayName: string;
  clientId?: string;
};

const dataDir = path.join(process.cwd(), 'data');
const clientsPath = path.join(dataDir, 'clients.json');
const usersPath = path.join(dataDir, 'users.json');

async function readJsonFile<T>(filePath: string): Promise<T> {
  const raw = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(raw) as T;
}

async function writeJsonFile<T>(filePath: string, data: T) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export async function getAllUsers() {
  return readJsonFile<UserRecord[]>(usersPath);
}

export async function getUserByUsername(username: string) {
  const users = await getAllUsers();
  return users.find((user) => user.username.toLowerCase() === username.toLowerCase()) ?? null;
}

export async function getAllClients() {
  return readJsonFile<ClientRecord[]>(clientsPath);
}

export async function getClientById(id: string) {
  const clients = await getAllClients();
  return clients.find((client) => client.id === id) ?? null;
}

export async function saveClient(nextClient: ClientRecord) {
  const clients = await getAllClients();
  const index = clients.findIndex((client) => client.id === nextClient.id);

  if (index === -1) {
    clients.push(nextClient);
  } else {
    clients[index] = nextClient;
  }

  await writeJsonFile(clientsPath, clients);
  return nextClient;
}
