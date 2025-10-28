# /shared/types.ts
export type UUID = string
export type ISODate = string

export enum Role {
  ADMIN = "ADMIN",
  STAFF = "STAFF",
  CLIENT = "CLIENT"
}

export enum CaseType {
  IMMIGRATION = "IMMIGRATION",
  EMPLOYMENT = "EMPLOYMENT",
  CONTRACT = "CONTRACT",
  IP = "IP",
  FAMILY = "FAMILY",
  OTHER = "OTHER"
}

export enum CaseStatus {
  OPEN = "OPEN",
  IN_REVIEW = "IN_REVIEW",
  AWAITING_CLIENT = "AWAITING_CLIENT",
  FILED = "FILED",
  CLOSED = "CLOSED",
  ARCHIVED = "ARCHIVED"
}

export enum DocumentKind {
  ID = "ID",
  CONTRACT = "CONTRACT",
  EVIDENCE = "EVIDENCE",
  MEMO = "MEMO",
  FILING = "FILING",
  OTHER = "OTHER"
}

export enum PaymentStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED"
}

export enum TaskStatus {
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  BLOCKED = "BLOCKED",
  DONE = "DONE"
}

export const LegalFeatureFrame = {
  intake: {
    fields: ["fullName", "email", "phone", "jurisdiction", "caseType", "summary"],
    validation: ["emailFormat", "phoneFormat", "caseTypeRequired"],
    scoring: ["complexityScore", "riskScore"]
  },
  documentCollection: {
    kinds: ["ID", "EVIDENCE", "CONTRACT", "FILING"],
    upload: { maxSizeMB: 50, accepted: ["pdf", "png", "jpg", "docx"] }
  },
  caseWorkflow: {
    states: ["OPEN", "IN_REVIEW", "AWAITING_CLIENT", "FILED", "CLOSED"],
    transitions: {
      OPEN: ["IN_REVIEW", "ARCHIVED"],
      IN_REVIEW: ["AWAITING_CLIENT", "FILED"],
      AWAITING_CLIENT: ["IN_REVIEW"],
      FILED: ["CLOSED"],
      CLOSED: ["ARCHIVED"]
    }
  },
  calendaring: {
    eventTypes: ["Consultation", "FilingDeadline", "CourtDate"],
    reminders: ["24h", "3h"]
  },
  billing: {
    models: ["fixed", "hourly", "subscription"],
    invoices: true
  }
} as const

# /server/src/entities/Base.ts
import { PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm"

export abstract class BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date
}

# /server/src/entities/User.ts
import { Entity, Column, Index, OneToMany } from "typeorm"
import { BaseEntity } from "./Base"
import { Role } from "../../../shared/types"
import { LegalCase } from "./legal/LegalCase"

@Entity("users")
export class User extends BaseEntity {
  @Index({ unique: true })
  @Column()
  email!: string

  @Column()
  name!: string

  @Column({ type: "enum", enum: Role, default: Role.CLIENT })
  role!: Role

  @OneToMany(() => LegalCase, c => c.client)
  legalCases!: LegalCase[]
}

# /server/src/entities/legal/LegalCase.ts
import { Entity, Column, ManyToOne, OneToMany, Index } from "typeorm"
import { BaseEntity } from "../Base"
import { CaseStatus, CaseType } from "../../../../shared/types"
import { User } from "../User"
import { LegalDocument } from "./LegalDocument"
import { LegalTask } from "./LegalTask"

@Entity("legal_cases")
export class LegalCase extends BaseEntity {
  @Index()
  @Column({ type: "enum", enum: CaseType })
  caseType!: CaseType

  @Column({ type: "enum", enum: CaseStatus, default: CaseStatus.OPEN })
  status!: CaseStatus

  @Column({ nullable: true })
  jurisdiction!: string | null

  @Column({ type: "text" })
  summary!: string

  @ManyToOne(() => User, u => u.legalCases, { eager: true })
  client!: User

  @OneToMany(() => LegalDocument, d => d.case, { cascade: true })
  documents!: LegalDocument[]

  @OneToMany(() => LegalTask, t => t.case, { cascade: true })
  tasks!: LegalTask[]
}

# /server/src/entities/legal/LegalDocument.ts
import { Entity, Column, ManyToOne, Index } from "typeorm"
import { BaseEntity } from "../Base"
import { DocumentKind } from "../../../../shared/types"
import { LegalCase } from "./LegalCase"

@Entity("legal_documents")
export class LegalDocument extends BaseEntity {
  @Index()
  @ManyToOne(() => LegalCase, c => c.documents)
  case!: LegalCase

  @Column({ type: "enum", enum: DocumentKind })
  kind!: DocumentKind

  @Column()
  name!: string

  @Column()
  storageKey!: string

  @Column({ type: "int" })
  sizeBytes!: number
}

# /server/src/entities/legal/LegalTask.ts
import { Entity, Column, ManyToOne, Index } from "typeorm"
import { BaseEntity } from "../Base"
import { TaskStatus } from "../../../../shared/types"
import { LegalCase } from "./LegalCase"

@Entity("legal_tasks")
export class LegalTask extends BaseEntity {
  @Index()
  @ManyToOne(() => LegalCase, c => c.tasks)
  case!: LegalCase

  @Column()
  title!: string

  @Column({ type: "text", nullable: true })
  description!: string | null

  @Column({ type: "enum", enum: TaskStatus, default: TaskStatus.TODO })
  status!: TaskStatus

  @Column({ type: "timestamptz", nullable: true })
  dueAt!: Date | null
}

# /server/src/entities/business/BusinessAccount.ts
import { Entity, Column, OneToMany, Index } from "typeorm"
import { BaseEntity } from "../Base"
import { BusinessFiling } from "./BusinessFiling"

@Entity("business_accounts")
export class BusinessAccount extends BaseEntity {
  @Index({ unique: true })
  @Column()
  name!: string

  @Column()
  ein!: string

  @Column({ nullable: true })
  industry!: string | null

  @OneToMany(() => BusinessFiling, f => f.account)
  filings!: BusinessFiling[]
}

# /server/src/entities/business/BusinessFiling.ts
import { Entity, Column, ManyToOne, Index } from "typeorm"
import { BaseEntity } from "../Base"
import { BusinessAccount } from "./BusinessAccount"

@Entity("business_filings")
export class BusinessFiling extends BaseEntity {
  @ManyToOne(() => BusinessAccount, a => a.filings)
  account!: BusinessAccount

  @Index()
  @Column()
  filingType!: string

  @Column({ type: "timestamptz" })
  filingDate!: Date

  @Column({ default: false })
  paid!: boolean
}

# /server/src/data-source.ts
import "reflect-metadata"
import { DataSource } from "typeorm"
import { User } from "./entities/User"
import { LegalCase } from "./entities/legal/LegalCase"
import { LegalDocument } from "./entities/legal/LegalDocument"
import { LegalTask } from "./entities/legal/LegalTask"
import { BusinessAccount } from "./entities/business/BusinessAccount"
import { BusinessFiling } from "./entities/business/BusinessFiling"

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  synchronize: false,
  logging: false,
  entities: [User, LegalCase, LegalDocument, LegalTask, BusinessAccount, BusinessFiling],
  migrations: ["dist/server/migrations/*.js"],
  subscribers: []
})

# /server/src/http.ts
import express from "express"
import cors from "cors"
import { json } from "body-parser"
import { legalRouter } from "./routes/legal"
import { businessRouter } from "./routes/business"

export function createHttpServer() {
  const app = express()
  app.use(cors())
  app.use(json({ limit: "10mb" }))
  app.use("/api/legal", legalRouter)
  app.use("/api/business", businessRouter)
  return app
}

# /server/src/index.ts
import { AppDataSource } from "./data-source"
import { createHttpServer } from "./http"

const port = Number(process.env.PORT || 8080)

AppDataSource.initialize().then(() => {
  const app = createHttpServer()
  app.listen(port, () => {})
})

# /server/src/routes/legal.ts
import { Router } from "express"
import { AppDataSource } from "../data-source"
import { LegalCase } from "../entities/legal/LegalCase"
import { LegalDocument } from "../entities/legal/LegalDocument"
import { LegalTask } from "../entities/legal/LegalTask"
import { CaseStatus, CaseType, DocumentKind, TaskStatus } from "../../shared/types"

export const legalRouter = Router()

legalRouter.post("/cases", async (req, res) => {
  const repo = AppDataSource.getRepository(LegalCase)
  const c = repo.create({
    caseType: req.body.caseType as CaseType,
    status: req.body.status ?? CaseStatus.OPEN,
    jurisdiction: req.body.jurisdiction ?? null,
    summary: req.body.summary,
    client: { id: req.body.clientId } as any
  })
  const saved = await repo.save(c)
  res.json(saved)
})

legalRouter.get("/cases", async (_req, res) => {
  const repo = AppDataSource.getRepository(LegalCase)
  const list = await repo.find({ order: { createdAt: "DESC" } })
  res.json(list)
})

legalRouter.patch("/cases/:id/status", async (req, res) => {
  const repo = AppDataSource.getRepository(LegalCase)
  await repo.update({ id: req.params.id }, { status: req.body.status as CaseStatus })
  const updated = await repo.findOneByOrFail({ id: req.params.id })
  res.json(updated)
})

legalRouter.post("/cases/:id/documents", async (req, res) => {
  const repo = AppDataSource.getRepository(LegalDocument)
  const d = repo.create({
    case: { id: req.params.id } as any,
    kind: req.body.kind as DocumentKind,
    name: req.body.name,
    storageKey: req.body.storageKey,
    sizeBytes: Number(req.body.sizeBytes)
  })
  const saved = await repo.save(d)
  res.json(saved)
})

legalRouter.post("/cases/:id/tasks", async (req, res) => {
  const repo = AppDataSource.getRepository(LegalTask)
  const t = repo.create({
    case: { id: req.params.id } as any,
    title: req.body.title,
    description: req.body.description ?? null,
    status: req.body.status ?? TaskStatus.TODO,
    dueAt: req.body.dueAt ? new Date(req.body.dueAt) : null
  })
  const saved = await repo.save(t)
  res.json(saved)
})

# /server/src/routes/business.ts
import { Router } from "express"
import { AppDataSource } from "../data-source"
import { BusinessAccount } from "../entities/business/BusinessAccount"
import { BusinessFiling } from "../entities/business/BusinessFiling"

export const businessRouter = Router()

businessRouter.post("/accounts", async (req, res) => {
  const repo = AppDataSource.getRepository(BusinessAccount)
  const a = repo.create({ name: req.body.name, ein: req.body.ein, industry: req.body.industry ?? null })
  const saved = await repo.save(a)
  res.json(saved)
})

businessRouter.post("/accounts/:id/filings", async (req, res) => {
  const repo = AppDataSource.getRepository(BusinessFiling)
  const f = repo.create({ account: { id: req.params.id } as any, filingType: req.body.filingType, filingDate: new Date(req.body.filingDate), paid: !!req.body.paid })
  const saved = await repo.save(f)
  res.json(saved)
})

businessRouter.get("/accounts", async (_req, res) => {
  const repo = AppDataSource.getRepository(BusinessAccount)
  const list = await repo.find({ relations: { filings: true } })
  res.json(list)
})

# /clients/sdk.ts
export type HttpClientOptions = { baseUrl?: string; token?: string }

export class KimuntuSDK {
  baseUrl: string
  token?: string
  constructor(opts: HttpClientOptions = {}) {
    this.baseUrl = opts.baseUrl || "http://localhost:8080/api"
    this.token = opts.token
  }
  async request(path: string, init?: RequestInit) {
    const headers = new Headers(init?.headers)
    headers.set("Content-Type", "application/json")
    if (this.token) headers.set("Authorization", `Bearer ${this.token}`)
    const res = await fetch(`${this.baseUrl}${path}`, { ...init, headers })
    const text = await res.text()
    const data = text ? JSON.parse(text) : null
    if (!res.ok) throw Object.assign(new Error("RequestFailed"), { status: res.status, data })
    return data
  }
  createLegalCase(input: { clientId: string; caseType: string; summary: string; jurisdiction?: string }) {
    return this.request(`/legal/cases`, { method: "POST", body: JSON.stringify(input) })
  }
  listLegalCases() {
    return this.request(`/legal/cases`)
  }
  updateCaseStatus(id: string, status: string) {
    return this.request(`/legal/cases/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) })
  }
  addCaseDocument(id: string, input: { kind: string; name: string; storageKey: string; sizeBytes: number }) {
    return this.request(`/legal/cases/${id}/documents`, { method: "POST", body: JSON.stringify(input) })
  }
  addCaseTask(id: string, input: { title: string; description?: string; status?: string; dueAt?: string }) {
    return this.request(`/legal/cases/${id}/tasks`, { method: "POST", body: JSON.stringify(input) })
  }
  createBusinessAccount(input: { name: string; ein: string; industry?: string }) {
    return this.request(`/business/accounts`, { method: "POST", body: JSON.stringify(input) })
  }
  addBusinessFiling(id: string, input: { filingType: string; filingDate: string; paid?: boolean }) {
    return this.request(`/business/accounts/${id}/filings`, { method: "POST", body: JSON.stringify(input) })
  }
  listBusinessAccounts() {
    return this.request(`/business/accounts`)
  }
}

# /server/README_run.md
pnpm i
pnpm tsx src/index.ts

# /server/tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "rootDir": "src",
    "outDir": "dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  },
  "include": ["src"]
}

# /package.json
{
  "name": "kimuntupro-ts",
  "private": true,
  "workspaces": ["server", "clients", "shared"],
  "scripts": {}
}

# /server/package.json
{
  "name": "server",
  "type": "commonjs",
  "dependencies": {
    "express": "^4.19.2",
    "cors": "^2.8.5",
    "pg": "^8.11.3",
    "reflect-metadata": "^0.2.2",
    "typeorm": "^0.3.20"
  },
  "devDependencies": {
    "tsx": "^4.19.2",
    "typescript": "^5.6.3"
  }
}

# /clients/package.json
{
  "name": "clients",
  "type": "module",
  "dependencies": {},
  "devDependencies": {
    "typescript": "^5.6.3"
  }
}
