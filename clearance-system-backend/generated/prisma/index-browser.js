
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 6.6.0
 * Query Engine version: f676762280b54cd07c770017ed3711ddde35f37a
 */
Prisma.prismaVersion = {
  client: "6.6.0",
  engine: "f676762280b54cd07c770017ed3711ddde35f37a"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.TerminationReasonScalarFieldEnum = {
  id: 'id',
  reason: 'reason',
  description: 'description',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.IdReplacementReasonScalarFieldEnum = {
  id: 'id',
  reason: 'reason',
  description: 'description',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TeacherClearanceReasonScalarFieldEnum = {
  id: 'id',
  reason: 'reason',
  description: 'description',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.DocumentScalarFieldEnum = {
  id: 'id',
  clearanceRequestId: 'clearanceRequestId',
  documentTypeId: 'documentTypeId',
  filePath: 'filePath',
  uploadedAt: 'uploadedAt'
};

exports.Prisma.DocumentTypeScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  requiredFor: 'requiredFor'
};

exports.Prisma.CertificateScalarFieldEnum = {
  id: 'id',
  clearanceRequestId: 'clearanceRequestId',
  filePath: 'filePath',
  qrCode: 'qrCode',
  signatures: 'signatures',
  issuedAt: 'issuedAt'
};

exports.Prisma.NotificationScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  clearanceRequestId: 'clearanceRequestId',
  title: 'title',
  message: 'message',
  emailSubject: 'emailSubject',
  type: 'type',
  status: 'status',
  read: 'read',
  sentAt: 'sentAt',
  emailSentAt: 'emailSentAt'
};

exports.Prisma.AuditLogScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  clearanceRequestId: 'clearanceRequestId',
  adminId: 'adminId',
  action: 'action',
  details: 'details',
  timestamp: 'timestamp'
};

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  username: 'username',
  passwordHash: 'passwordHash',
  firstName: 'firstName',
  fatherName: 'fatherName',
  grandfatherName: 'grandfatherName',
  email: 'email',
  role: 'role',
  status: 'status',
  isFirstLogin: 'isFirstLogin',
  lastLogin: 'lastLogin',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  loginAttempts: 'loginAttempts',
  isLocked: 'isLocked',
  lockedUntil: 'lockedUntil',
  lockedAt: 'lockedAt',
  emailVerified: 'emailVerified',
  emailToken: 'emailToken',
  emailTokenExpiry: 'emailTokenExpiry',
  resetToken: 'resetToken',
  resetTokenExpiry: 'resetTokenExpiry',
  browserFingerprint: 'browserFingerprint'
};

exports.Prisma.StudentScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  startDate: 'startDate',
  programId: 'programId',
  currentYear: 'currentYear',
  semester: 'semester',
  academicStatus: 'academicStatus',
  departmentId: 'departmentId'
};

exports.Prisma.TeacherScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  hireDate: 'hireDate',
  position: 'position',
  departmentId: 'departmentId',
  employmentStatus: 'employmentStatus',
  yearsOfService: 'yearsOfService'
};

exports.Prisma.AdminScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  permissions: 'permissions'
};

exports.Prisma.DepartmentScalarFieldEnum = {
  id: 'id',
  name: 'name',
  code: 'code',
  description: 'description'
};

exports.Prisma.ProgramScalarFieldEnum = {
  id: 'id',
  name: 'name',
  type: 'type',
  category: 'category',
  departmentId: 'departmentId',
  description: 'description'
};

exports.Prisma.OfficeScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  departmentId: 'departmentId'
};

exports.Prisma.ApproverScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  officeId: 'officeId',
  digitalSignature: 'digitalSignature',
  yearsOfExperience: 'yearsOfExperience',
  departmentId: 'departmentId'
};

exports.Prisma.WorkflowRuleScalarFieldEnum = {
  id: 'id',
  formType: 'formType',
  programId: 'programId',
  description: 'description'
};

exports.Prisma.WorkflowStepScalarFieldEnum = {
  id: 'id',
  workflowRuleId: 'workflowRuleId',
  stepOrder: 'stepOrder',
  officeId: 'officeId',
  description: 'description'
};

exports.Prisma.ApprovalActionScalarFieldEnum = {
  id: 'id',
  clearanceRequestId: 'clearanceRequestId',
  approverId: 'approverId',
  status: 'status',
  comment: 'comment',
  actionDate: 'actionDate',
  finalizedAt: 'finalizedAt',
  actionDueBy: 'actionDueBy'
};

exports.Prisma.ClearanceRequestScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  formType: 'formType',
  programId: 'programId',
  status: 'status',
  rejectionReason: 'rejectionReason',
  resubmissionCount: 'resubmissionCount',
  submittedAt: 'submittedAt',
  updatedAt: 'updatedAt',
  currentStep: 'currentStep',
  terminationReasonId: 'terminationReasonId',
  idReplacementReasonId: 'idReplacementReasonId',
  teacherClearanceReasonId: 'teacherClearanceReasonId'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};
exports.FormType = exports.$Enums.FormType = {
  TERMINATION: 'TERMINATION',
  ID_REPLACEMENT: 'ID_REPLACEMENT',
  TEACHER_CLEARANCE: 'TEACHER_CLEARANCE'
};

exports.NotificationType = exports.$Enums.NotificationType = {
  INFO: 'INFO',
  ACTION_REQUIRED: 'ACTION_REQUIRED',
  SYSTEM: 'SYSTEM',
  EMAIL: 'EMAIL'
};

exports.NotificationStatus = exports.$Enums.NotificationStatus = {
  SENT: 'SENT',
  READ: 'READ',
  FAILED: 'FAILED'
};

exports.UserRole = exports.$Enums.UserRole = {
  STUDENT: 'STUDENT',
  TEACHER: 'TEACHER',
  APPROVER: 'APPROVER',
  ADMIN: 'ADMIN'
};

exports.UserStatus = exports.$Enums.UserStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE'
};

exports.AcademicStatus = exports.$Enums.AcademicStatus = {
  ENROLLED: 'ENROLLED',
  GRADUATED: 'GRADUATED',
  WITHDRAWN: 'WITHDRAWN'
};

exports.EmploymentStatus = exports.$Enums.EmploymentStatus = {
  ACTIVE: 'ACTIVE',
  ON_LEAVE: 'ON_LEAVE',
  TERMINATED: 'TERMINATED'
};

exports.Permission = exports.$Enums.Permission = {
  MANAGE_USERS: 'MANAGE_USERS',
  REASSIGN_REQUESTS: 'REASSIGN_REQUESTS',
  APPROVE_REQUESTS: 'APPROVE_REQUESTS',
  MANAGE_WORKFLOWS: 'MANAGE_WORKFLOWS'
};

exports.ProgramType = exports.$Enums.ProgramType = {
  UNDERGRADUATE: 'UNDERGRADUATE',
  POSTGRADUATE: 'POSTGRADUATE',
  DIPLOMA: 'DIPLOMA'
};

exports.ProgramCategory = exports.$Enums.ProgramCategory = {
  REGULAR: 'REGULAR',
  EXTENSION: 'EXTENSION',
  SUMMER: 'SUMMER',
  EVENING: 'EVENING'
};

exports.ApprovalStatus = exports.$Enums.ApprovalStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED'
};

exports.RequestStatus = exports.$Enums.RequestStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  RESUBMITTED: 'RESUBMITTED',
  COMPLETED: 'COMPLETED'
};

exports.Prisma.ModelName = {
  TerminationReason: 'TerminationReason',
  IdReplacementReason: 'IdReplacementReason',
  TeacherClearanceReason: 'TeacherClearanceReason',
  Document: 'Document',
  DocumentType: 'DocumentType',
  Certificate: 'Certificate',
  Notification: 'Notification',
  AuditLog: 'AuditLog',
  User: 'User',
  Student: 'Student',
  Teacher: 'Teacher',
  Admin: 'Admin',
  Department: 'Department',
  Program: 'Program',
  Office: 'Office',
  Approver: 'Approver',
  WorkflowRule: 'WorkflowRule',
  WorkflowStep: 'WorkflowStep',
  ApprovalAction: 'ApprovalAction',
  ClearanceRequest: 'ClearanceRequest'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }

        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
