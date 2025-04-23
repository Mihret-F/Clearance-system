
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
  lockCycles: 'lockCycles',
  lockedUntil: 'lockedUntil',
  lockedAt: 'lockedAt',
  emailVerified: 'emailVerified',
  emailVerificationSkipped: 'emailVerificationSkipped',
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
  academicStatus: 'academicStatus'
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

exports.Prisma.ProgramScalarFieldEnum = {
  id: 'id',
  name: 'name',
  type: 'type',
  category: 'category'
};

exports.Prisma.DepartmentScalarFieldEnum = {
  id: 'id',
  name: 'name'
};

exports.Prisma.OfficeScalarFieldEnum = {
  id: 'id',
  officeName: 'officeName',
  departmentId: 'departmentId'
};

exports.Prisma.ApproverScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  officeId: 'officeId',
  departmentId: 'departmentId',
  digitalSignature: 'digitalSignature',
  yearsOfExperience: 'yearsOfExperience'
};

exports.Prisma.ClearanceRequestScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  formType: 'formType',
  programId: 'programId',
  terminationReasonId: 'terminationReasonId',
  idReplacementReasonId: 'idReplacementReasonId',
  teacherReason: 'teacherReason',
  status: 'status',
  submittedAt: 'submittedAt',
  updatedAt: 'updatedAt',
  currentStep: 'currentStep',
  rejectedStep: 'rejectedStep',
  rejectionReason: 'rejectionReason'
};

exports.Prisma.ApprovalActionScalarFieldEnum = {
  id: 'id',
  requestId: 'requestId',
  approverId: 'approverId',
  stepOrder: 'stepOrder',
  status: 'status',
  comment: 'comment',
  actionDate: 'actionDate'
};

exports.Prisma.TerminationReasonScalarFieldEnum = {
  id: 'id',
  reason: 'reason',
  description: 'description'
};

exports.Prisma.IdReplacementReasonScalarFieldEnum = {
  id: 'id',
  reason: 'reason',
  description: 'description'
};

exports.Prisma.WorkflowRuleScalarFieldEnum = {
  id: 'id',
  formType: 'formType',
  programId: 'programId',
  description: 'description'
};

exports.Prisma.WorkflowStepScalarFieldEnum = {
  id: 'id',
  ruleId: 'ruleId',
  officeId: 'officeId',
  stepOrder: 'stepOrder',
  description: 'description'
};

exports.Prisma.DocumentTypeScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description'
};

exports.Prisma.DocumentScalarFieldEnum = {
  id: 'id',
  requestId: 'requestId',
  documentTypeId: 'documentTypeId',
  filePath: 'filePath',
  uploadedAt: 'uploadedAt'
};

exports.Prisma.NotificationScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  requestId: 'requestId',
  message: 'message',
  status: 'status',
  createdAt: 'createdAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
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

exports.Semester = exports.$Enums.Semester = {
  SPRING: 'SPRING',
  FALL: 'FALL',
  SUMMER: 'SUMMER'
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

exports.FormType = exports.$Enums.FormType = {
  TERMINATION: 'TERMINATION',
  ID_REPLACEMENT: 'ID_REPLACEMENT',
  TEACHER_CLEARANCE: 'TEACHER_CLEARANCE'
};

exports.RequestStatus = exports.$Enums.RequestStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  COMPLETED: 'COMPLETED'
};

exports.NotificationStatus = exports.$Enums.NotificationStatus = {
  SENT: 'SENT',
  READ: 'READ'
};

exports.Prisma.ModelName = {
  User: 'User',
  Student: 'Student',
  Teacher: 'Teacher',
  Program: 'Program',
  Department: 'Department',
  Office: 'Office',
  Approver: 'Approver',
  ClearanceRequest: 'ClearanceRequest',
  ApprovalAction: 'ApprovalAction',
  TerminationReason: 'TerminationReason',
  IdReplacementReason: 'IdReplacementReason',
  WorkflowRule: 'WorkflowRule',
  WorkflowStep: 'WorkflowStep',
  DocumentType: 'DocumentType',
  Document: 'Document',
  Notification: 'Notification'
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
