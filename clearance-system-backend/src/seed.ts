import { PrismaClient } from "../generated/prisma";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

// Helper function to hash passwords
async function hashPassword(password: string): Promise<string> {
	return await bcrypt.hash(password, 10);
}

async function main() {
	try {
		// Step 0: Cleanup existing data (in reverse order to avoid foreign key issues)
		console.log("Cleaning up existing data...");
		await prisma.auditLog.deleteMany({});
		await prisma.notification.deleteMany({});
		await prisma.approvalAction.deleteMany({});
		await prisma.document.deleteMany({});
		await prisma.terminationReason.deleteMany({});
		await prisma.idReplacementReason.deleteMany({});
		await prisma.teacherClearanceReason.deleteMany({});
		await prisma.certificate.deleteMany({});
		await prisma.clearanceRequest.deleteMany({});
		await prisma.workflowStep.deleteMany({});
		await prisma.workflowRule.deleteMany({});
		await prisma.approver.deleteMany({});
		await prisma.admin.deleteMany({});
		await prisma.student.deleteMany({});
		await prisma.teacher.deleteMany({});
		await prisma.user.deleteMany({});
		await prisma.office.deleteMany({});
		await prisma.program.deleteMany({});
		await prisma.documentType.deleteMany({});
		await prisma.department.deleteMany({});
		console.log("Cleanup completed.");

		// Step 1: Create Departments
		console.log("Creating departments...");
		await prisma.department.createMany({
			data: [
				{
					id: "dept1",
					name: "Software Engineering",
					code: "SE",
					description: "Software Engineering Department",
				},
				{
					id: "dept2",
					name: "Computer Science",
					code: "CS",
					description: "Computer Science Department",
				},
				{
					id: "dept3",
					name: "Electrical Engineering",
					code: "EE",
					description: "Electrical Engineering Department",
				},
				{
					id: "dept4",
					name: "Mechanical Engineering",
					code: "ME",
					description: "Mechanical Engineering Department",
				},
			],
		});

		// Step 2: Create Programs
		console.log("Creating programs...");
		await prisma.program.createMany({
			data: [
				{
					id: "prog1",
					name: "Postgraduate Regular",
					type: "POSTGRADUATE",
					category: "REGULAR",
					departmentId: "dept1",
					description: "Postgraduate Regular Program",
				},
				{
					id: "prog2",
					name: "Postgraduate Extension",
					type: "POSTGRADUATE",
					category: "EXTENSION",
					departmentId: "dept1",
					description: "Postgraduate Extension Program",
				},
				{
					id: "prog3",
					name: "Diploma Summer",
					type: "DIPLOMA",
					category: "SUMMER",
					departmentId: "dept2",
					description: "Diploma Summer Program",
				},
				{
					id: "prog4",
					name: "Diploma Regular",
					type: "DIPLOMA",
					category: "REGULAR",
					departmentId: "dept3",
					description: "Diploma Regular Program",
				},
				{
					id: "prog5",
					name: "Diploma Evening",
					type: "DIPLOMA",
					category: "EVENING",
					departmentId: "dept4",
					description: "Diploma Evening Program",
				},
			],
		});

		// Step 3: Create Offices
		console.log("Creating offices...");
		await prisma.office.createMany({
			data: [
				{
					id: "off1",
					name: "Academic Advisor SE",
					description: "Software Engineering Academic Advisor",
					departmentId: "dept1",
				},
				{
					id: "off2",
					name: "Academic Advisor CS",
					description: "Computer Science Academic Advisor",
					departmentId: "dept2",
				},
				{
					id: "off3",
					name: "Academic Advisor EE",
					description: "Electrical Engineering Academic Advisor",
					departmentId: "dept3",
				},
				{
					id: "off4",
					name: "Department Head SE",
					description: "Software Engineering Department Head",
					departmentId: "dept1",
				},
				{
					id: "off5",
					name: "Department Head CS",
					description: "Computer Science Department Head",
					departmentId: "dept2",
				},
				{
					id: "off6",
					name: "Department Head EE",
					description: "Electrical Engineering Department Head",
					departmentId: "dept3",
				},
				{
					id: "off7",
					name: "Dormitory Head",
					description: "Students Dormitory Head",
				},
				{
					id: "off8",
					name: "Library A",
					description: "Library A Chief of Circulation",
				},
				{
					id: "off9",
					name: "Library B",
					description: "Library B Chief of Circulation (Main)",
				},
				{ id: "off10", name: "Library C", description: "Library C" },
				{
					id: "off11",
					name: "Post Graduate Dean",
					description: "Postgraduate Program Dean",
				},
				{ id: "off12", name: "Registrar", description: "University Registrar" },
				{ id: "off13", name: "Book Store", description: "Campus Book Store" },
				{
					id: "off14",
					name: "Campus Police",
					description: "Campus Police Office",
				},
				{
					id: "off15",
					name: "Students Cafeteria Head",
					description: "Cafeteria Head",
				},
				{ id: "off16", name: "Finance Office", description: "Finance Office" },
				{
					id: "off17",
					name: "Continuing Education",
					description: "Continuing Education Office",
				},
				{
					id: "off18",
					name: "Main Library",
					description: "Main University Library",
				},
				{
					id: "off19",
					name: "College Community Service",
					description: "College Community Service Coordinator",
				},
				{
					id: "off20",
					name: "Research and Tech Transfer",
					description: "Research and Technology Transfer Directorate",
				},
				{
					id: "off21",
					name: "Industry Liaison",
					description: "Industry Liaison and Technology Transfer",
				},
				{
					id: "off22",
					name: "Community Service",
					description: "Community Service Directorate",
				},
				{
					id: "off23",
					name: "Senior Research Staff",
					description: "Senior Staff for Research and Community Service",
				},
				{
					id: "off24",
					name: "Library Equipment Store",
					description: "Library Equipment Store",
				},
				{
					id: "off25",
					name: "Property Group",
					description: "Property Management Group",
				},
				{
					id: "off26",
					name: "Chief Cashier",
					description: "Chief Cashier Office",
				},
				{
					id: "off27",
					name: "Assistant Cashier",
					description: "Assistant Cashier Office",
				},
				{
					id: "off28",
					name: "College Dean",
					description: "College Dean Office",
				},
				{
					id: "off29",
					name: "College Accounting",
					description: "College Accounting Staff",
				},
				{
					id: "off30",
					name: "College Cashier",
					description: "College Cashier",
				},
				{
					id: "off31",
					name: "Collecting Accounting",
					description: "Collecting Accounting Staff",
				},
				{ id: "off32", name: "IBEK", description: "IBEK Department" },
				{
					id: "off33",
					name: "Revenue Collection",
					description: "Revenue Collection Specialist",
				},
				{
					id: "off34",
					name: "General Service",
					description: "General Service Directorate",
				},
				{ id: "off35", name: "Auditor", description: "Auditor Office" },
				{
					id: "off36",
					name: "Legal Service",
					description: "Legal Service Office",
				},
				{
					id: "off37",
					name: "Cooperative Association",
					description: "Teachers and Staff Cooperative Association",
				},
				{
					id: "off38",
					name: "Ethics Directorate",
					description: "Ethics and Anti-Corruption Directorate",
				},
			],
		});

		// Step 4: Create Document Types
		console.log("Creating document types...");
		await prisma.documentType.createMany({
			data: [
				{
					id: "dt1",
					name: "Payment Receipt",
					description: "Proof of payment",
					requiredFor: ["TERMINATION", "ID_REPLACEMENT"],
				},
				{
					id: "dt2",
					name: "Clearance Form",
					description: "Signed clearance form",
					requiredFor: ["TERMINATION", "TEACHER_CLEARANCE"],
				},
				{
					id: "dt3",
					name: "ID Photo",
					description: "Photo for ID replacement",
					requiredFor: ["ID_REPLACEMENT"],
				},
			],
		});

		// Step 5: Create Users with Unique Hashed Passwords
		console.log("Creating users...");
		// Students
		await prisma.user.create({
			data: {
				id: "user1",
				username: "student1",
				passwordHash: await hashPassword("Default@123"),
				firstName: "John",
				fatherName: "Doe",
				grandfatherName: "Smith",
				email: "student1@example.com",
				role: "STUDENT",
				status: "ACTIVE",
				isFirstLogin: true,
				createdAt: new Date(),
				updatedAt: new Date(),
				loginAttempts: 0,
				isLocked: false,
				emailVerified: false,
			},
		});
		await prisma.user.create({
			data: {
				id: "user2",
				username: "student2",
				passwordHash: await hashPassword("Simple#456"),
				firstName: "Jane",
				fatherName: "Roe",
				grandfatherName: "Brown",
				email: "student2@example.com",
				role: "STUDENT",
				status: "ACTIVE",
				isFirstLogin: true,
				createdAt: new Date(),
				updatedAt: new Date(),
				loginAttempts: 0,
				isLocked: false,
				emailVerified: false,
			},
		});
		await prisma.user.create({
			data: {
				id: "user3",
				username: "student3",
				passwordHash: await hashPassword("Str0ng!P@ss1"),
				firstName: "Alice",
				fatherName: "Smith",
				grandfatherName: "Jones",
				email: "student3@example.com",
				role: "STUDENT",
				status: "ACTIVE",
				isFirstLogin: false,
				createdAt: new Date(),
				updatedAt: new Date(),
				loginAttempts: 0,
				isLocked: false,
				emailVerified: true,
			},
		});
		await prisma.user.create({
			data: {
				id: "user4",
				username: "student4",
				passwordHash: await hashPassword("C0mpl3x#W0rd2"),
				firstName: "Bob",
				fatherName: "Johnson",
				grandfatherName: "Davis",
				email: "student4@example.com",
				role: "STUDENT",
				status: "ACTIVE",
				isFirstLogin: false,
				createdAt: new Date(),
				updatedAt: new Date(),
				loginAttempts: 0,
				isLocked: false,
				emailVerified: true,
			},
		});

		// Teachers
		await prisma.user.create({
			data: {
				id: "user5",
				username: "teacher1",
				passwordHash: await hashPassword("Basic$789"),
				firstName: "Emma",
				fatherName: "Wilson",
				grandfatherName: "Taylor",
				email: "teacher1@example.com",
				role: "TEACHER",
				status: "ACTIVE",
				isFirstLogin: true,
				createdAt: new Date(),
				updatedAt: new Date(),
				loginAttempts: 0,
				isLocked: false,
				emailVerified: false,
			},
		});
		await prisma.user.create({
			data: {
				id: "user6",
				username: "teacher2",
				passwordHash: await hashPassword("Easy&012"),
				firstName: "Liam",
				fatherName: "Moore",
				grandfatherName: "Clark",
				email: "teacher2@example.com",
				role: "TEACHER",
				status: "ACTIVE",
				isFirstLogin: true,
				createdAt: new Date(),
				updatedAt: new Date(),
				loginAttempts: 0,
				isLocked: false,
				emailVerified: false,
			},
		});
		await prisma.user.create({
			data: {
				id: "user7",
				username: "teacher3",
				passwordHash: await hashPassword("T3ach3r!Rul3z3"),
				firstName: "Olivia",
				fatherName: "Lewis",
				grandfatherName: "Walker",
				email: "teacher3@example.com",
				role: "TEACHER",
				status: "ACTIVE",
				isFirstLogin: false,
				createdAt: new Date(),
				updatedAt: new Date(),
				loginAttempts: 0,
				isLocked: false,
				emailVerified: true,
			},
		});
		await prisma.user.create({
			data: {
				id: "user8",
				username: "teacher4",
				passwordHash: await hashPassword("Pr0f3ss0r#2025"),
				firstName: "Noah",
				fatherName: "Hall",
				grandfatherName: "Allen",
				email: "teacher4@example.com",
				role: "TEACHER",
				status: "ACTIVE",
				isFirstLogin: false,
				createdAt: new Date(),
				updatedAt: new Date(),
				loginAttempts: 0,
				isLocked: false,
				emailVerified: true,
			},
		});

		// Approvers
		await prisma.user.create({
			data: {
				id: "user9",
				username: "advisor_se",
				passwordHash: await hashPassword("Adv1s0r!S3cur31"),
				firstName: "Sophia",
				fatherName: "King",
				grandfatherName: "Wright",
				email: "advisor_se@example.com",
				role: "APPROVER",
				status: "ACTIVE",
				isFirstLogin: false,
				createdAt: new Date(),
				updatedAt: new Date(),
				loginAttempts: 0,
				isLocked: false,
				emailVerified: true,
			},
		});
		await prisma.user.create({
			data: {
				id: "user10",
				username: "advisor_cs",
				passwordHash: await hashPassword("C0mpSc1!P@ss2"),
				firstName: "Ethan",
				fatherName: "Scott",
				grandfatherName: "Green",
				email: "advisor_cs@example.com",
				role: "APPROVER",
				status: "ACTIVE",
				isFirstLogin: false,
				createdAt: new Date(),
				updatedAt: new Date(),
				loginAttempts: 0,
				isLocked: false,
				emailVerified: true,
			},
		});
		await prisma.user.create({
			data: {
				id: "user11",
				username: "advisor_ee",
				passwordHash: await hashPassword("3l3ctr1c!W1r3"),
				firstName: "Isabella",
				fatherName: "Adams",
				grandfatherName: "Baker",
				email: "advisor_ee@example.com",
				role: "APPROVER",
				status: "ACTIVE",
				isFirstLogin: false,
				createdAt: new Date(),
				updatedAt: new Date(),
				loginAttempts: 0,
				isLocked: false,
				emailVerified: true,
			},
		});
		await prisma.user.create({
			data: {
				id: "user12",
				username: "head_se",
				passwordHash: await hashPassword("H3adS0ft!2025"),
				firstName: "James",
				fatherName: "Nelson",
				grandfatherName: "Carter",
				email: "head_se@example.com",
				role: "APPROVER",
				status: "ACTIVE",
				isFirstLogin: false,
				createdAt: new Date(),
				updatedAt: new Date(),
				loginAttempts: 0,
				isLocked: false,
				emailVerified: true,
			},
		});
		await prisma.user.create({
			data: {
				id: "user13",
				username: "head_cs",
				passwordHash: await hashPassword("C0mpH3ad!P@ss5"),
				firstName: "Mia",
				fatherName: "Hill",
				grandfatherName: "Mitchell",
				email: "head_cs@example.com",
				role: "APPROVER",
				status: "ACTIVE",
				isFirstLogin: false,
				createdAt: new Date(),
				updatedAt: new Date(),
				loginAttempts: 0,
				isLocked: false,
				emailVerified: true,
			},
		});
		await prisma.user.create({
			data: {
				id: "user14",
				username: "head_ee",
				passwordHash: await hashPassword("3l3cH3ad!2025"),
				firstName: "Alexander",
				fatherName: "Perez",
				grandfatherName: "Roberts",
				email: "head_ee@example.com",
				role: "APPROVER",
				status: "ACTIVE",
				isFirstLogin: false,
				createdAt: new Date(),
				updatedAt: new Date(),
				loginAttempts: 0,
				isLocked: false,
				emailVerified: true,
			},
		});
		await prisma.user.create({
			data: {
				id: "user15",
				username: "dorm_head",
				passwordHash: await hashPassword("D0rm!S3cur37"),
				firstName: "Charlotte",
				fatherName: "Turner",
				grandfatherName: "Phillips",
				email: "dorm_head@example.com",
				role: "APPROVER",
				status: "ACTIVE",
				isFirstLogin: false,
				createdAt: new Date(),
				updatedAt: new Date(),
				loginAttempts: 0,
				isLocked: false,
				emailVerified: true,
			},
		});
		await prisma.user.create({
			data: {
				id: "user16",
				username: "lib_a",
				passwordHash: await hashPassword("L1br@ry!P@ss8"),
				firstName: "Benjamin",
				fatherName: "Campbell",
				grandfatherName: "Parker",
				email: "lib_a@example.com",
				role: "APPROVER",
				status: "ACTIVE",
				isFirstLogin: false,
				createdAt: new Date(),
				updatedAt: new Date(),
				loginAttempts: 0,
				isLocked: false,
				emailVerified: true,
			},
		});
		await prisma.user.create({
			data: {
				id: "user17",
				username: "lib_b",
				passwordHash: await hashPassword("B00ks!S3cur39"),
				firstName: "Amelia",
				fatherName: "Evans",
				grandfatherName: "Edwards",
				email: "lib_b@example.com",
				role: "APPROVER",
				status: "ACTIVE",
				isFirstLogin: false,
				createdAt: new Date(),
				updatedAt: new Date(),
				loginAttempts: 0,
				isLocked: false,
				emailVerified: true,
			},
		});
		await prisma.user.create({
			data: {
				id: "user18",
				username: "lib_c",
				passwordHash: await hashPassword("L1bC!P@ss10"),
				firstName: "Lucas",
				fatherName: "Collins",
				grandfatherName: "Stewart",
				email: "lib_c@example.com",
				role: "APPROVER",
				status: "ACTIVE",
				isFirstLogin: false,
				createdAt: new Date(),
				updatedAt: new Date(),
				loginAttempts: 0,
				isLocked: false,
				emailVerified: true,
			},
		});
		await prisma.user.create({
			data: {
				id: "user19",
				username: "pg_dean",
				passwordHash: await hashPassword("D3an!P0stGr@d11"),
				firstName: "Harper",
				fatherName: "Sanchez",
				grandfatherName: "Morris",
				email: "pg_dean@example.com",
				role: "APPROVER",
				status: "ACTIVE",
				isFirstLogin: false,
				createdAt: new Date(),
				updatedAt: new Date(),
				loginAttempts: 0,
				isLocked: false,
				emailVerified: true,
			},
		});
		await prisma.user.create({
			data: {
				id: "user20",
				username: "registrar",
				passwordHash: await hashPassword("R3g1str@r!2025"),
				firstName: "Evelyn",
				fatherName: "Reed",
				grandfatherName: "Cook",
				email: "registrar@example.com",
				role: "APPROVER",
				status: "ACTIVE",
				isFirstLogin: false,
				createdAt: new Date(),
				updatedAt: new Date(),
				loginAttempts: 0,
				isLocked: false,
				emailVerified: true,
			},
		});
		await prisma.user.create({
			data: {
				id: "user21",
				username: "book_store",
				passwordHash: await hashPassword("B00k$!S3cur313"),
				firstName: "Mason",
				fatherName: "Bell",
				grandfatherName: "Murphy",
				email: "book_store@example.com",
				role: "APPROVER",
				status: "ACTIVE",
				isFirstLogin: false,
				createdAt: new Date(),
				updatedAt: new Date(),
				loginAttempts: 0,
				isLocked: false,
				emailVerified: true,
			},
		});
		await prisma.user.create({
			data: {
				id: "user22",
				username: "campus_police",
				passwordHash: await hashPassword("P0l1c3!S@f3ty14"),
				firstName: "Aria",
				fatherName: "Bailey",
				grandfatherName: "Rivera",
				email: "campus_police@example.com",
				role: "APPROVER",
				status: "ACTIVE",
				isFirstLogin: false,
				createdAt: new Date(),
				updatedAt: new Date(),
				loginAttempts: 0,
				isLocked: false,
				emailVerified: true,
			},
		});
		await prisma.user.create({
			data: {
				id: "user23",
				username: "cafeteria_head",
				passwordHash: await hashPassword("C@f3!H3ad15"),
				firstName: "Logan",
				fatherName: "Cooper",
				grandfatherName: "Richardson",
				email: "cafeteria_head@example.com",
				role: "APPROVER",
				status: "ACTIVE",
				isFirstLogin: false,
				createdAt: new Date(),
				updatedAt: new Date(),
				loginAttempts: 0,
				isLocked: false,
				emailVerified: true,
			},
		});
		await prisma.user.create({
			data: {
				id: "user24",
				username: "finance",
				passwordHash: await hashPassword("F1n@nc3!202516"),
				firstName: "Scarlett",
				fatherName: "Ward",
				grandfatherName: "Peterson",
				email: "finance@example.com",
				role: "APPROVER",
				status: "ACTIVE",
				isFirstLogin: false,
				createdAt: new Date(),
				updatedAt: new Date(),
				loginAttempts: 0,
				isLocked: false,
				emailVerified: true,
			},
		});
		await prisma.user.create({
			data: {
				id: "user25",
				username: "cont_edu",
				passwordHash: await hashPassword("3duC0nt!P@ss17"),
				firstName: "Jacob",
				fatherName: "Cox",
				grandfatherName: "Howard",
				email: "cont_edu@example.com",
				role: "APPROVER",
				status: "ACTIVE",
				isFirstLogin: false,
				createdAt: new Date(),
				updatedAt: new Date(),
				loginAttempts: 0,
				isLocked: false,
				emailVerified: true,
			},
		});
		await prisma.user.create({
			data: {
				id: "user26",
				username: "main_lib",
				passwordHash: await hashPassword("M@1nL1b!S3cur318"),
				firstName: "Chloe",
				fatherName: "Diaz",
				grandfatherName: "Gray",
				email: "main_lib@example.com",
				role: "APPROVER",
				status: "ACTIVE",
				isFirstLogin: false,
				createdAt: new Date(),
				updatedAt: new Date(),
				loginAttempts: 0,
				isLocked: false,
				emailVerified: true,
			},
		});
		await prisma.user.create({
			data: {
				id: "user27",
				username: "comm_service",
				passwordHash: await hashPassword("C0mm$3rv!202519"),
				firstName: "William",
				fatherName: "Brooks",
				grandfatherName: "Sanders",
				email: "comm_service@example.com",
				role: "APPROVER",
				status: "ACTIVE",
				isFirstLogin: false,
				createdAt: new Date(),
				updatedAt: new Date(),
				loginAttempts: 0,
				isLocked: false,
				emailVerified: true,
			},
		});
		await prisma.user.create({
			data: {
				id: "user28",
				username: "research_dir",
				passwordHash: await hashPassword("R3s3@rch!D1r20"),
				firstName: "Zoe",
				fatherName: "Price",
				grandfatherName: "Bennett",
				email: "research_dir@example.com",
				role: "APPROVER",
				status: "ACTIVE",
				isFirstLogin: false,
				createdAt: new Date(),
				updatedAt: new Date(),
				loginAttempts: 0,
				isLocked: false,
				emailVerified: true,
			},
		});
		await prisma.user.create({
			data: {
				id: "user29",
				username: "industry_liaison",
				passwordHash: await hashPassword("1ndu$try!L1@21"),
				firstName: "Daniel",
				fatherName: "Wood",
				grandfatherName: "Barnes",
				email: "industry_liaison@example.com",
				role: "APPROVER",
				status: "ACTIVE",
				isFirstLogin: false,
				createdAt: new Date(),
				updatedAt: new Date(),
				loginAttempts: 0,
				isLocked: false,
				emailVerified: true,
			},
		});
		await prisma.user.create({
			data: {
				id: "user30",
				username: "comm_dir",
				passwordHash: await hashPassword("C0mmD1r!P@ss22"),
				firstName: "Lily",
				fatherName: "Ross",
				grandfatherName: "Henderson",
				email: "comm_dir@example.com",
				role: "APPROVER",
				status: "ACTIVE",
				isFirstLogin: false,
				createdAt: new Date(),
				updatedAt: new Date(),
				loginAttempts: 0,
				isLocked: false,
				emailVerified: true,
			},
		});
		await prisma.user.create({
			data: {
				id: "user31",
				username: "senior_research",
				passwordHash: await hashPassword("$3n10rR3s!202523"),
				firstName: "Henry",
				fatherName: "Coleman",
				grandfatherName: "Jenkins",
				email: "senior_research@example.com",
				role: "APPROVER",
				status: "ACTIVE",
				isFirstLogin: false,
				createdAt: new Date(),
				updatedAt: new Date(),
				loginAttempts: 0,
				isLocked: false,
				emailVerified: true,
			},
		});
		await prisma.user.create({
			data: {
				id: "user32",
				username: "lib_equip",
				passwordHash: await hashPassword("L1b3qu1p!P@ss24"),
				firstName: "Grace",
				fatherName: "Perry",
				grandfatherName: "Powell",
				email: "lib_equip@example.com",
				role: "APPROVER",
				status: "ACTIVE",
				isFirstLogin: false,
				createdAt: new Date(),
				updatedAt: new Date(),
				loginAttempts: 0,
				isLocked: false,
				emailVerified: true,
			},
		});
		await prisma.user.create({
			data: {
				id: "user33",
				username: "property_group",
				passwordHash: await hashPassword("Pr0p3rty!S3cur325"),
				firstName: "Owen",
				fatherName: "Long",
				grandfatherName: "Patterson",
				email: "property_group@example.com",
				role: "APPROVER",
				status: "ACTIVE",
				isFirstLogin: false,
				createdAt: new Date(),
				updatedAt: new Date(),
				loginAttempts: 0,
				isLocked: false,
				emailVerified: true,
			},
		});
		await prisma.user.create({
			data: {
				id: "user34",
				username: "chief_cashier",
				passwordHash: await hashPassword("C@sh13r!202526"),
				firstName: "Hannah",
				fatherName: "Hughes",
				grandfatherName: "Flores",
				email: "chief_cashier@example.com",
				role: "APPROVER",
				status: "ACTIVE",
				isFirstLogin: false,
				createdAt: new Date(),
				updatedAt: new Date(),
				loginAttempts: 0,
				isLocked: false,
				emailVerified: true,
			},
		});
		await prisma.user.create({
			data: {
				id: "user35",
				username: "asst_cashier",
				passwordHash: await hashPassword("@sstC@sh!P@ss27"),
				firstName: "Jack",
				fatherName: "Washington",
				grandfatherName: "Simmons",
				email: "asst_cashier@example.com",
				role: "APPROVER",
				status: "ACTIVE",
				isFirstLogin: false,
				createdAt: new Date(),
				updatedAt: new Date(),
				loginAttempts: 0,
				isLocked: false,
				emailVerified: true,
			},
		});
		await prisma.user.create({
			data: {
				id: "user36",
				username: "college_dean",
				passwordHash: await hashPassword("D3@nC0ll3g3!28"),
				firstName: "Sofia",
				fatherName: "Butler",
				grandfatherName: "Gonzales",
				email: "college_dean@example.com",
				role: "APPROVER",
				status: "ACTIVE",
				isFirstLogin: false,
				createdAt: new Date(),
				updatedAt: new Date(),
				loginAttempts: 0,
				isLocked: false,
				emailVerified: true,
			},
		});
		await prisma.user.create({
			data: {
				id: "user37",
				username: "college_acct",
				passwordHash: await hashPassword("@cctC0ll3g3!29"),
				firstName: "Luke",
				fatherName: "Fisher",
				grandfatherName: "West",
				email: "college_acct@example.com",
				role: "APPROVER",
				status: "ACTIVE",
				isFirstLogin: false,
				createdAt: new Date(),
				updatedAt: new Date(),
				loginAttempts: 0,
				isLocked: false,
				emailVerified: true,
			},
		});
		await prisma.user.create({
			data: {
				id: "user38",
				username: "college_cashier",
				passwordHash: await hashPassword("C0ll3g3C@sh!30"),
				firstName: "Mila",
				fatherName: "Meyer",
				grandfatherName: "Wagner",
				email: "college_cashier@example.com",
				role: "APPROVER",
				status: "ACTIVE",
				isFirstLogin: false,
				createdAt: new Date(),
				updatedAt: new Date(),
				loginAttempts: 0,
				isLocked: false,
				emailVerified: true,
			},
		});
		await prisma.user.create({
			data: {
				id: "user39",
				username: "collect_acct",
				passwordHash: await hashPassword("C0ll3ct!@cct31"),
				firstName: "Gabriel",
				fatherName: "Webb",
				grandfatherName: "Tucker",
				email: "collect_acct@example.com",
				role: "APPROVER",
				status: "ACTIVE",
				isFirstLogin: false,
				createdAt: new Date(),
				updatedAt: new Date(),
				loginAttempts: 0,
				isLocked: false,
				emailVerified: true,
			},
		});
		await prisma.user.create({
			data: {
				id: "user40",
				username: "ibek",
				passwordHash: await hashPassword("1b3k!S3cur332"),
				firstName: "Avery",
				fatherName: "Marshall",
				grandfatherName: "Olson",
				email: "ibek@example.com",
				role: "APPROVER",
				status: "ACTIVE",
				isFirstLogin: false,
				createdAt: new Date(),
				updatedAt: new Date(),
				loginAttempts: 0,
				isLocked: false,
				emailVerified: true,
			},
		});
		await prisma.user.create({
			data: {
				id: "user41",
				username: "revenue",
				passwordHash: await hashPassword("R3v3nu3!P@ss33"),
				firstName: "Ella",
				fatherName: "Mcdonald",
				grandfatherName: "Cruz",
				email: "revenue@example.com",
				role: "APPROVER",
				status: "ACTIVE",
				isFirstLogin: false,
				createdAt: new Date(),
				updatedAt: new Date(),
				loginAttempts: 0,
				isLocked: false,
				emailVerified: true,
			},
		});
		await prisma.user.create({
			data: {
				id: "user42",
				username: "gen_service",
				passwordHash: await hashPassword("G3n$3rv!202534"),
				firstName: "Jackson",
				fatherName: "Ford",
				grandfatherName: "Dixon",
				email: "gen_service@example.com",
				role: "APPROVER",
				status: "ACTIVE",
				isFirstLogin: false,
				createdAt: new Date(),
				updatedAt: new Date(),
				loginAttempts: 0,
				isLocked: false,
				emailVerified: true,
			},
		});
		await prisma.user.create({
			data: {
				id: "user43",
				username: "auditor",
				passwordHash: await hashPassword("@ud1t0r!S3cur335"),
				firstName: "Aubrey",
				fatherName: "Shaw",
				grandfatherName: "Gordon",
				email: "auditor@example.com",
				role: "APPROVER",
				status: "ACTIVE",
				isFirstLogin: false,
				createdAt: new Date(),
				updatedAt: new Date(),
				loginAttempts: 0,
				isLocked: false,
				emailVerified: true,
			},
		});
		await prisma.user.create({
			data: {
				id: "user44",
				username: "legal_service",
				passwordHash: await hashPassword("L3g@l!P@ss36"),
				firstName: "Carter",
				fatherName: "Ellis",
				grandfatherName: "Harrison",
				email: "legal_service@example.com",
				role: "APPROVER",
				status: "ACTIVE",
				isFirstLogin: false,
				createdAt: new Date(),
				updatedAt: new Date(),
				loginAttempts: 0,
				isLocked: false,
				emailVerified: true,
			},
		});
		await prisma.user.create({
			data: {
				id: "user45",
				username: "cooperative",
				passwordHash: await hashPassword("C00p3r@t1v3!37"),
				firstName: "Madison",
				fatherName: "Woods",
				grandfatherName: "Knight",
				email: "cooperative@example.com",
				role: "APPROVER",
				status: "ACTIVE",
				isFirstLogin: false,
				createdAt: new Date(),
				updatedAt: new Date(),
				loginAttempts: 0,
				isLocked: false,
				emailVerified: true,
			},
		});
		await prisma.user.create({
			data: {
				id: "user46",
				username: "ethics",
				passwordHash: await hashPassword("3th1cs!S3cur338"),
				firstName: "Jayden",
				fatherName: "Gibson",
				grandfatherName: "Mcdaniel",
				email: "ethics@example.com",
				role: "APPROVER",
				status: "ACTIVE",
				isFirstLogin: false,
				createdAt: new Date(),
				updatedAt: new Date(),
				loginAttempts: 0,
				isLocked: false,
				emailVerified: true,
			},
		});

		// Admin
		await prisma.user.create({
			data: {
				id: "user47",
				username: "admin1",
				passwordHash: await hashPassword("@dm1n!S3cur32025"),
				firstName: "Admin",
				fatherName: "User",
				grandfatherName: "System",
				email: "admin@example.com",
				role: "ADMIN",
				status: "ACTIVE",
				isFirstLogin: false,
				createdAt: new Date(),
				updatedAt: new Date(),
				loginAttempts: 0,
				isLocked: false,
				emailVerified: true,
			},
		});

		// Step 6: Create Students
		console.log("Creating students...");
		await prisma.student.createMany({
			data: [
				{
					id: "stu1",
					userId: "user1",
					startDate: new Date("2023-09-01"),
					programId: "prog2",
					currentYear: 2,
					semester: 1,
					academicStatus: "ENROLLED",
					departmentId: "dept1",
				},
				{
					id: "stu2",
					userId: "user2",
					startDate: new Date("2023-09-01"),
					programId: "prog2",
					currentYear: 2,
					semester: 1,
					academicStatus: "ENROLLED",
					departmentId: "dept1",
				},
				{
					id: "stu3",
					userId: "user3",
					startDate: new Date("2023-09-01"),
					programId: "prog1",
					currentYear: 2,
					semester: 1,
					academicStatus: "ENROLLED",
					departmentId: "dept1",
				},
				{
					id: "stu4",
					userId: "user4",
					startDate: new Date("2023-09-01"),
					programId: "prog3",
					currentYear: 1,
					semester: 1,
					academicStatus: "ENROLLED",
					departmentId: "dept2",
				},
			],
		});

		// Step 7: Create Teachers
		console.log("Creating teachers...");
		await prisma.teacher.createMany({
			data: [
				{
					id: "tch1",
					userId: "user5",
					hireDate: new Date("2018-01-01"),
					position: "Professor",
					departmentId: "dept1",
					employmentStatus: "ACTIVE",
					yearsOfService: 5,
				},
				{
					id: "tch2",
					userId: "user6",
					hireDate: new Date("2019-01-01"),
					position: "Associate Professor",
					departmentId: "dept2",
					employmentStatus: "ACTIVE",
					yearsOfService: 4,
				},
				{
					id: "tch3",
					userId: "user7",
					hireDate: new Date("2020-01-01"),
					position: "Assistant Professor",
					departmentId: "dept3",
					employmentStatus: "ACTIVE",
					yearsOfService: 3,
				},
				{
					id: "tch4",
					userId: "user8",
					hireDate: new Date("2021-01-01"),
					position: "Lecturer",
					departmentId: "dept4",
					employmentStatus: "ACTIVE",
					yearsOfService: 2,
				},
			],
		});

		// Step 8: Create Approvers
		console.log("Creating approvers...");
		await prisma.approver.createMany({
			data: [
				{
					id: "app1",
					userId: "user9",
					officeId: "off1",
					departmentId: "dept1",
					yearsOfExperience: 10,
					digitalSignature: "sig_advisor_se",
				},
				{
					id: "app2",
					userId: "user10",
					officeId: "off2",
					departmentId: "dept2",
					yearsOfExperience: 8,
					digitalSignature: "sig_advisor_cs",
				},
				{
					id: "app3",
					userId: "user11",
					officeId: "off3",
					departmentId: "dept3",
					yearsOfExperience: 7,
					digitalSignature: "sig_advisor_ee",
				},
				{
					id: "app4",
					userId: "user12",
					officeId: "off4",
					departmentId: "dept1",
					yearsOfExperience: 12,
					digitalSignature: "sig_head_se",
				},
				{
					id: "app5",
					userId: "user13",
					officeId: "off5",
					departmentId: "dept2",
					yearsOfExperience: 11,
					digitalSignature: "sig_head_cs",
				},
				{
					id: "app6",
					userId: "user14",
					officeId: "off6",
					departmentId: "dept3",
					yearsOfExperience: 9,
					digitalSignature: "sig_head_ee",
				},
				{
					id: "app7",
					userId: "user15",
					officeId: "off7",
					yearsOfExperience: 5,
					digitalSignature: "sig_dorm_head",
				},
				{
					id: "app8",
					userId: "user16",
					officeId: "off8",
					yearsOfExperience: 6,
					digitalSignature: "sig_lib_a",
				},
				{
					id: "app9",
					userId: "user17",
					officeId: "off9",
					yearsOfExperience: 6,
					digitalSignature: "sig_lib_b",
				},
				{
					id: "app10",
					userId: "user18",
					officeId: "off10",
					yearsOfExperience: 4,
					digitalSignature: "sig_lib_c",
				},
				{
					id: "app11",
					userId: "user19",
					officeId: "off11",
					yearsOfExperience: 15,
					digitalSignature: "sig_pg_dean",
				},
				{
					id: "app12",
					userId: "user20",
					officeId: "off12",
					yearsOfExperience: 20,
					digitalSignature: "sig_registrar",
				},
				{
					id: "app13",
					userId: "user21",
					officeId: "off13",
					yearsOfExperience: 3,
					digitalSignature: "sig_book_store",
				},
				{
					id: "app14",
					userId: "user22",
					officeId: "off14",
					yearsOfExperience: 5,
					digitalSignature: "sig_campus_police",
				},
				{
					id: "app15",
					userId: "user23",
					officeId: "off15",
					yearsOfExperience: 4,
					digitalSignature: "sig_cafeteria_head",
				},
				{
					id: "app16",
					userId: "user24",
					officeId: "off16",
					yearsOfExperience: 8,
					digitalSignature: "sig_finance",
				},
				{
					id: "app17",
					userId: "user25",
					officeId: "off17",
					yearsOfExperience: 7,
					digitalSignature: "sig_cont_edu",
				},
				{
					id: "app18",
					userId: "user26",
					officeId: "off18",
					yearsOfExperience: 10,
					digitalSignature: "sig_main_lib",
				},
				{
					id: "app19",
					userId: "user27",
					officeId: "off19",
					yearsOfExperience: 12,
					digitalSignature: "sig_comm_service",
				},
				{
					id: "app20",
					userId: "user28",
					officeId: "off20",
					yearsOfExperience: 11,
					digitalSignature: "sig_research_dir",
				},
				{
					id: "app21",
					userId: "user29",
					officeId: "off21",
					yearsOfExperience: 9,
					digitalSignature: "sig_industry_liaison",
				},
				{
					id: "app22",
					userId: "user30",
					officeId: "off22",
					yearsOfExperience: 8,
					digitalSignature: "sig_comm_dir",
				},
				{
					id: "app23",
					userId: "user31",
					officeId: "off23",
					yearsOfExperience: 7,
					digitalSignature: "sig_senior_research",
				},
				{
					id: "app24",
					userId: "user32",
					officeId: "off24",
					yearsOfExperience: 5,
					digitalSignature: "sig_lib_equip",
				},
				{
					id: "app25",
					userId: "user33",
					officeId: "off25",
					yearsOfExperience: 6,
					digitalSignature: "sig_property_group",
				},
				{
					id: "app26",
					userId: "user34",
					officeId: "off26",
					yearsOfExperience: 4,
					digitalSignature: "sig_chief_cashier",
				},
				{
					id: "app27",
					userId: "user35",
					officeId: "off27",
					yearsOfExperience: 3,
					digitalSignature: "sig_asst_cashier",
				},
				{
					id: "app28",
					userId: "user36",
					officeId: "off28",
					yearsOfExperience: 15,
					digitalSignature: "sig_college_dean",
				},
				{
					id: "app29",
					userId: "user37",
					officeId: "off29",
					yearsOfExperience: 5,
					digitalSignature: "sig_college_acct",
				},
				{
					id: "app30",
					userId: "user38",
					officeId: "off30",
					yearsOfExperience: 4,
					digitalSignature: "sig_college_cashier",
				},
				{
					id: "app31",
					userId: "user39",
					officeId: "off31",
					yearsOfExperience: 6,
					digitalSignature: "sig_collect_acct",
				},
				{
					id: "app32",
					userId: "user40",
					officeId: "off32",
					yearsOfExperience: 7,
					digitalSignature: "sig_ibek",
				},
				{
					id: "app33",
					userId: "user41",
					officeId: "off33",
					yearsOfExperience: 8,
					digitalSignature: "sig_revenue",
				},
				{
					id: "app34",
					userId: "user42",
					officeId: "off34",
					yearsOfExperience: 9,
					digitalSignature: "sig_gen_service",
				},
				{
					id: "app35",
					userId: "user43",
					officeId: "off35",
					yearsOfExperience: 10,
					digitalSignature: "sig_auditor",
				},
				{
					id: "app36",
					userId: "user44",
					officeId: "off36",
					yearsOfExperience: 11,
					digitalSignature: "sig_legal_service",
				},
				{
					id: "app37",
					userId: "user45",
					officeId: "off37",
					yearsOfExperience: 12,
					digitalSignature: "sig_cooperative",
				},
				{
					id: "app38",
					userId: "user46",
					officeId: "off38",
					yearsOfExperience: 13,
					digitalSignature: "sig_ethics",
				},
			],
		});

		// Step 9: Create Admin
		console.log("Creating admin...");
		await prisma.admin.create({
			data: {
				id: "adm1",
				userId: "user47",
				permissions: [
					"MANAGE_USERS",
					"REASSIGN_REQUESTS",
					"APPROVE_REQUESTS",
					"MANAGE_WORKFLOWS",
				],
			},
		});

		// Step 10: Create Workflow Rules
		console.log("Creating workflow rules...");
		await prisma.workflowRule.createMany({
			data: [
				{
					id: "wr1",
					formType: "TERMINATION",
					programId: "prog1",
					description: "Postgraduate Regular Termination",
				}, // Added for student3
				{
					id: "wr2",
					formType: "TERMINATION",
					programId: "prog2",
					description: "Postgraduate Extension Termination",
				},
				{
					id: "wr3",
					formType: "ID_REPLACEMENT",
					programId: "prog1",
					description: "Postgraduate Regular ID Replacement",
				},
				{
					id: "wr4",
					formType: "TERMINATION",
					programId: "prog3",
					description: "Diploma Summer Termination",
				},
				{
					id: "wr5",
					formType: "ID_REPLACEMENT",
					programId: "prog2",
					description: "Postgraduate Extension ID Replacement",
				},
				{
					id: "wr6",
					formType: "ID_REPLACEMENT",
					programId: "prog4",
					description: "Diploma Regular ID Replacement",
				},
				{
					id: "wr7",
					formType: "ID_REPLACEMENT",
					programId: "prog3",
					description: "Diploma Summer ID Replacement",
				},
				{
					id: "wr8",
					formType: "TEACHER_CLEARANCE",
					description: "Teacher Clearance",
				},
			],
		});

		// Step 11: Create Workflow Steps
		console.log("Creating workflow steps...");
		await prisma.workflowStep.createMany({
			data: [
				// Postgraduate Regular Termination (8 steps) - Added for student3
				{
					id: "ws1",
					workflowRuleId: "wr1",
					stepOrder: 1,
					officeId: "off1",
					description: "Academic Advisor SE",
				},
				{
					id: "ws2",
					workflowRuleId: "wr1",
					stepOrder: 2,
					officeId: "off4",
					description: "Department Head SE",
				},
				{
					id: "ws3",
					workflowRuleId: "wr1",
					stepOrder: 3,
					officeId: "off7",
					description: "Dormitory Head",
				},
				{
					id: "ws4",
					workflowRuleId: "wr1",
					stepOrder: 4,
					officeId: "off8",
					description: "Library A",
				},
				{
					id: "ws5",
					workflowRuleId: "wr1",
					stepOrder: 5,
					officeId: "off9",
					description: "Library B",
				},
				{
					id: "ws6",
					workflowRuleId: "wr1",
					stepOrder: 6,
					officeId: "off10",
					description: "Library C",
				},
				{
					id: "ws7",
					workflowRuleId: "wr1",
					stepOrder: 7,
					officeId: "off11",
					description: "Post Graduate Dean",
				},
				{
					id: "ws8",
					workflowRuleId: "wr1",
					stepOrder: 8,
					officeId: "off12",
					description: "Registrar",
				},
				// Postgraduate Extension Termination (8 steps)
				{
					id: "ws9",
					workflowRuleId: "wr2",
					stepOrder: 1,
					officeId: "off1",
					description: "Academic Advisor SE",
				},
				{
					id: "ws10",
					workflowRuleId: "wr2",
					stepOrder: 2,
					officeId: "off4",
					description: "Department Head SE",
				},
				{
					id: "ws11",
					workflowRuleId: "wr2",
					stepOrder: 3,
					officeId: "off7",
					description: "Dormitory Head",
				},
				{
					id: "ws12",
					workflowRuleId: "wr2",
					stepOrder: 4,
					officeId: "off8",
					description: "Library A",
				},
				{
					id: "ws13",
					workflowRuleId: "wr2",
					stepOrder: 5,
					officeId: "off9",
					description: "Library B",
				},
				{
					id: "ws14",
					workflowRuleId: "wr2",
					stepOrder: 6,
					officeId: "off10",
					description: "Library C",
				},
				{
					id: "ws15",
					workflowRuleId: "wr2",
					stepOrder: 7,
					officeId: "off11",
					description: "Post Graduate Dean",
				},
				{
					id: "ws16",
					workflowRuleId: "wr2",
					stepOrder: 8,
					officeId: "off12",
					description: "Registrar",
				},
				// Postgraduate Regular ID Replacement (10 steps)
				{
					id: "ws17",
					workflowRuleId: "wr3",
					stepOrder: 1,
					officeId: "off1",
					description: "Academic Advisor SE",
				},
				{
					id: "ws18",
					workflowRuleId: "wr3",
					stepOrder: 2,
					officeId: "off8",
					description: "Library A",
				},
				{
					id: "ws19",
					workflowRuleId: "wr3",
					stepOrder: 3,
					officeId: "off9",
					description: "Library B",
				},
				{
					id: "ws20",
					workflowRuleId: "wr3",
					stepOrder: 4,
					officeId: "off18",
					description: "Main Library",
				},
				{
					id: "ws21",
					workflowRuleId: "wr3",
					stepOrder: 5,
					officeId: "off13",
					description: "Book Store",
				},
				{
					id: "ws22",
					workflowRuleId: "wr3",
					stepOrder: 6,
					officeId: "off14",
					description: "Campus Police",
				},
				{
					id: "ws23",
					workflowRuleId: "wr3",
					stepOrder: 7,
					officeId: "off7",
					description: "Dormitory Head",
				},
				{
					id: "ws24",
					workflowRuleId: "wr3",
					stepOrder: 8,
					officeId: "off15",
					description: "Students Cafeteria Head",
				},
				{
					id: "ws25",
					workflowRuleId: "wr3",
					stepOrder: 9,
					officeId: "off16",
					description: "Finance Office",
				},
				{
					id: "ws26",
					workflowRuleId: "wr3",
					stepOrder: 10,
					officeId: "off12",
					description: "Registrar",
				},
				// Diploma Summer Termination (8 steps)
				{
					id: "ws27",
					workflowRuleId: "wr4",
					stepOrder: 1,
					officeId: "off2",
					description: "Academic Advisor CS",
				},
				{
					id: "ws28",
					workflowRuleId: "wr4",
					stepOrder: 2,
					officeId: "off5",
					description: "Department Head CS",
				},
				{
					id: "ws29",
					workflowRuleId: "wr4",
					stepOrder: 3,
					officeId: "off7",
					description: "Dormitory Head",
				},
				{
					id: "ws30",
					workflowRuleId: "wr4",
					stepOrder: 4,
					officeId: "off8",
					description: "Library A",
				},
				{
					id: "ws31",
					workflowRuleId: "wr4",
					stepOrder: 5,
					officeId: "off9",
					description: "Library B",
				},
				{
					id: "ws32",
					workflowRuleId: "wr4",
					stepOrder: 6,
					officeId: "off18",
					description: "Main Library",
				},
				{
					id: "ws33",
					workflowRuleId: "wr4",
					stepOrder: 7,
					officeId: "off15",
					description: "Students Cafeteria Head",
				},
				{
					id: "ws34",
					workflowRuleId: "wr4",
					stepOrder: 8,
					officeId: "off12",
					description: "Registrar",
				},
				// Postgraduate Extension ID Replacement (9 steps)
				{
					id: "ws35",
					workflowRuleId: "wr5",
					stepOrder: 1,
					officeId: "off1",
					description: "Academic Advisor SE",
				},
				{
					id: "ws36",
					workflowRuleId: "wr5",
					stepOrder: 2,
					officeId: "off17",
					description: "Continuing Education",
				},
				{
					id: "ws37",
					workflowRuleId: "wr5",
					stepOrder: 3,
					officeId: "off8",
					description: "Library A",
				},
				{
					id: "ws38",
					workflowRuleId: "wr5",
					stepOrder: 4,
					officeId: "off9",
					description: "Library B",
				},
				{
					id: "ws39",
					workflowRuleId: "wr5",
					stepOrder: 5,
					officeId: "off18",
					description: "Main Library",
				},
				{
					id: "ws40",
					workflowRuleId: "wr5",
					stepOrder: 6,
					officeId: "off13",
					description: "Book Store",
				},
				{
					id: "ws41",
					workflowRuleId: "wr5",
					stepOrder: 7,
					officeId: "off14",
					description: "Campus Police",
				},
				{
					id: "ws42",
					workflowRuleId: "wr5",
					stepOrder: 8,
					officeId: "off16",
					description: "Finance Office",
				},
				{
					id: "ws43",
					workflowRuleId: "wr5",
					stepOrder: 9,
					officeId: "off12",
					description: "Registrar",
				},
				// Diploma Regular ID Replacement (10 steps)
				{
					id: "ws44",
					workflowRuleId: "wr6",
					stepOrder: 1,
					officeId: "off3",
					description: "Academic Advisor EE",
				},
				{
					id: "ws45",
					workflowRuleId: "wr6",
					stepOrder: 2,
					officeId: "off6",
					description: "Department Head EE",
				},
				{
					id: "ws46",
					workflowRuleId: "wr6",
					stepOrder: 3,
					officeId: "off8",
					description: "Library A",
				},
				{
					id: "ws47",
					workflowRuleId: "wr6",
					stepOrder: 4,
					officeId: "off9",
					description: "Library B",
				},
				{
					id: "ws48",
					workflowRuleId: "wr6",
					stepOrder: 5,
					officeId: "off18",
					description: "Main Library",
				},
				{
					id: "ws49",
					workflowRuleId: "wr6",
					stepOrder: 6,
					officeId: "off13",
					description: "Book Store",
				},
				{
					id: "ws50",
					workflowRuleId: "wr6",
					stepOrder: 7,
					officeId: "off14",
					description: "Campus Police",
				},
				{
					id: "ws51",
					workflowRuleId: "wr6",
					stepOrder: 8,
					officeId: "off7",
					description: "Dormitory Head",
				},
				{
					id: "ws52",
					workflowRuleId: "wr6",
					stepOrder: 9,
					officeId: "off15",
					description: "Students Cafeteria Head",
				},
				{
					id: "ws53",
					workflowRuleId: "wr6",
					stepOrder: 10,
					officeId: "off12",
					description: "Registrar",
				},
				// Diploma Summer ID Replacement (10 steps)
				{
					id: "ws54",
					workflowRuleId: "wr7",
					stepOrder: 1,
					officeId: "off2",
					description: "Academic Advisor CS",
				},
				{
					id: "ws55",
					workflowRuleId: "wr7",
					stepOrder: 2,
					officeId: "off17",
					description: "Continuing Education",
				},
				{
					id: "ws56",
					workflowRuleId: "wr7",
					stepOrder: 3,
					officeId: "off8",
					description: "Library A",
				},
				{
					id: "ws57",
					workflowRuleId: "wr7",
					stepOrder: 4,
					officeId: "off9",
					description: "Library B",
				},
				{
					id: "ws58",
					workflowRuleId: "wr7",
					stepOrder: 5,
					officeId: "off18",
					description: "Main Library",
				},
				{
					id: "ws59",
					workflowRuleId: "wr7",
					stepOrder: 6,
					officeId: "off14",
					description: "Campus Police",
				},
				{
					id: "ws60",
					workflowRuleId: "wr7",
					stepOrder: 7,
					officeId: "off7",
					description: "Dormitory Head",
				},
				{
					id: "ws61",
					workflowRuleId: "wr7",
					stepOrder: 8,
					officeId: "off15",
					description: "Students Cafeteria Head",
				},
				{
					id: "ws62",
					workflowRuleId: "wr7",
					stepOrder: 9,
					officeId: "off16",
					description: "Finance Office",
				},
				{
					id: "ws63",
					workflowRuleId: "wr7",
					stepOrder: 10,
					officeId: "off12",
					description: "Registrar",
				},
				// Teacher Clearance (26 steps)
				{
					id: "ws64",
					workflowRuleId: "wr8",
					stepOrder: 1,
					officeId: "off19",
					description: "College Community Service",
				},
				{
					id: "ws65",
					workflowRuleId: "wr8",
					stepOrder: 2,
					officeId: "off20",
					description: "Research and Tech Transfer",
				},
				{
					id: "ws66",
					workflowRuleId: "wr8",
					stepOrder: 3,
					officeId: "off21",
					description: "Industry Liaison",
				},
				{
					id: "ws67",
					workflowRuleId: "wr8",
					stepOrder: 4,
					officeId: "off22",
					description: "Community Service",
				},
				{
					id: "ws68",
					workflowRuleId: "wr8",
					stepOrder: 5,
					officeId: "off23",
					description: "Senior Research Staff",
				},
				{
					id: "ws69",
					workflowRuleId: "wr8",
					stepOrder: 6,
					officeId: "off18",
					description: "Main Library",
				},
				{
					id: "ws70",
					workflowRuleId: "wr8",
					stepOrder: 7,
					officeId: "off8",
					description: "Library 1 (A)",
				},
				{
					id: "ws71",
					workflowRuleId: "wr8",
					stepOrder: 8,
					officeId: "off9",
					description: "Library 2 (B)",
				},
				{
					id: "ws72",
					workflowRuleId: "wr8",
					stepOrder: 9,
					officeId: "off24",
					description: "Library Equipment Store",
				},
				{
					id: "ws73",
					workflowRuleId: "wr8",
					stepOrder: 10,
					officeId: "off25",
					description: "Property Group",
				},
				{
					id: "ws74",
					workflowRuleId: "wr8",
					stepOrder: 11,
					officeId: "off26",
					description: "Chief Cashier",
				},
				{
					id: "ws75",
					workflowRuleId: "wr8",
					stepOrder: 12,
					officeId: "off27",
					description: "Assistant Cashier",
				},
				{
					id: "ws76",
					workflowRuleId: "wr8",
					stepOrder: 13,
					officeId: "off28",
					description: "College Dean",
				},
				{
					id: "ws77",
					workflowRuleId: "wr8",
					stepOrder: 14,
					officeId: "off29",
					description: "College Accounting",
				},
				{
					id: "ws78",
					workflowRuleId: "wr8",
					stepOrder: 15,
					officeId: "off30",
					description: "College Cashier",
				},
				{
					id: "ws79",
					workflowRuleId: "wr8",
					stepOrder: 16,
					officeId: "off31",
					description: "Collecting Accounting",
				},
				{
					id: "ws80",
					workflowRuleId: "wr8",
					stepOrder: 17,
					officeId: "off32",
					description: "IBEK",
				},
				{
					id: "ws81",
					workflowRuleId: "wr8",
					stepOrder: 18,
					officeId: "off33",
					description: "Revenue Collection",
				},
				{
					id: "ws82",
					workflowRuleId: "wr8",
					stepOrder: 19,
					officeId: "off34",
					description: "General Service",
				},
				{
					id: "ws83",
					workflowRuleId: "wr8",
					stepOrder: 20,
					officeId: "off4",
					description: "Department Head SE",
				},
				{
					id: "ws84",
					workflowRuleId: "wr8",
					stepOrder: 21,
					officeId: "off17",
					description: "Continuing Education",
				},
				{
					id: "ws85",
					workflowRuleId: "wr8",
					stepOrder: 22,
					officeId: "off12",
					description: "Registrar",
				},
				{
					id: "ws86",
					workflowRuleId: "wr8",
					stepOrder: 23,
					officeId: "off35",
					description: "Auditor",
				},
				{
					id: "ws87",
					workflowRuleId: "wr8",
					stepOrder: 24,
					officeId: "off36",
					description: "Legal Service",
				},
				{
					id: "ws88",
					workflowRuleId: "wr8",
					stepOrder: 25,
					officeId: "off37",
					description: "Cooperative Association",
				},
				{
					id: "ws89",
					workflowRuleId: "wr8",
					stepOrder: 26,
					officeId: "off38",
					description: "Ethics Directorate",
				},
			],
		});

		// Step 12: Create Clearance Requests
		console.log("Creating clearance requests...");
		await prisma.clearanceRequest.createMany({
			data: [
				{
					id: "req1",
					userId: "user1",
					formType: "TERMINATION",
					programId: "prog2",
					status: "PENDING",
					submittedAt: new Date(),
					updatedAt: new Date(),
					currentStep: 1,
					resubmissionCount: 0,
				},
				{
					id: "req2",
					userId: "user2",
					formType: "TERMINATION",
					programId: "prog2",
					status: "PENDING",
					submittedAt: new Date(),
					updatedAt: new Date(),
					currentStep: 1,
					resubmissionCount: 0,
				},
				{
					id: "req3",
					userId: "user3",
					formType: "TERMINATION",
					programId: "prog1",
					status: "PENDING",
					submittedAt: new Date(),
					updatedAt: new Date(),
					currentStep: 1,
					resubmissionCount: 0,
				}, // Updated to TERMINATION
				{
					id: "req4",
					userId: "user4",
					formType: "TERMINATION",
					programId: "prog3",
					status: "PENDING",
					submittedAt: new Date(),
					updatedAt: new Date(),
					currentStep: 1,
					resubmissionCount: 0,
				},
				{
					id: "req5",
					userId: "user5",
					formType: "TEACHER_CLEARANCE",
					programId: "prog1",
					status: "PENDING",
					submittedAt: new Date(),
					updatedAt: new Date(),
					currentStep: 1,
					resubmissionCount: 0,
				},
				{
					id: "req6",
					userId: "user6",
					formType: "TEACHER_CLEARANCE",
					programId: "prog2",
					status: "PENDING",
					submittedAt: new Date(),
					updatedAt: new Date(),
					currentStep: 1,
					resubmissionCount: 0,
				},
				{
					id: "req7",
					userId: "user7",
					formType: "TEACHER_CLEARANCE",
					programId: "prog3",
					status: "PENDING",
					submittedAt: new Date(),
					updatedAt: new Date(),
					currentStep: 1,
					resubmissionCount: 0,
				},
				{
					id: "req8",
					userId: "user8",
					formType: "TEACHER_CLEARANCE",
					programId: "prog4",
					status: "PENDING",
					submittedAt: new Date(),
					updatedAt: new Date(),
					currentStep: 1,
					resubmissionCount: 0,
				},
			],
		});

		// Step 13: Create Reasons
		console.log("Creating reasons...");
		await prisma.$transaction([
			prisma.terminationReason.createMany({
				data: [
					{
						id: "tr1",
						clearanceRequestId: "req1",
						reason: "VACATION",
						description: "Student leaving for vacation",
					},
					{
						id: "tr2",
						clearanceRequestId: "req2",
						reason: "GRADUATION",
						description: "Student completed program",
					},
					{
						id: "tr3",
						clearanceRequestId: "req3",
						reason: "TRANSFER",
						description: "Student transferring to another institution",
					},
					{
						id: "tr4",
						clearanceRequestId: "req4",
						reason: "TRANSFER",
						description: "Student transferring to another institution",
					},
				],
			}),
			prisma.teacherClearanceReason.createMany({
				data: [
					{ id: "tcr1", clearanceRequestId: "req5", reason: "RETIREMENT" },
					{ id: "tcr2", clearanceRequestId: "req6", reason: "RESIGNATION" },
					{ id: "tcr3", clearanceRequestId: "req7", reason: "TRANSFER" },
					{ id: "tcr4", clearanceRequestId: "req8", reason: "END_OF_CONTRACT" },
				],
			}),
		]);
		await prisma.idReplacementReason.createMany({
			data: [
				{
					id: "idr1",
					clearanceRequestId: "req1", // Adjust based on existing clearance requests
					reason: "LOST_ID",
					description: "ID card was lost",
				},
				{
					id: "idr2",
					clearanceRequestId: "req2",
					reason: "DAMAGED_ID",
					description: "ID card was damaged",
				},
				{
					id: "idr3",
					clearanceRequestId: "req3",
					reason: "STOLEN_ID",
					description: "ID card was stolen",
				},
			],
		});

		// Step 14: Create Documents
		console.log("Creating documents...");
		await prisma.document.createMany({
			data: [
				{
					id: "doc1",
					clearanceRequestId: "req1",
					documentTypeId: "dt1",
					filePath: "/uploads/req1_payment.pdf",
					uploadedAt: new Date(),
				},
				{
					id: "doc2",
					clearanceRequestId: "req3",
					documentTypeId: "dt1",
					filePath: "/uploads/req3_payment.pdf",
					uploadedAt: new Date(),
				}, // Updated to TERMINATION doc
				{
					id: "doc3",
					clearanceRequestId: "req5",
					documentTypeId: "dt2",
					filePath: "/uploads/req5_clearance.pdf",
					uploadedAt: new Date(),
				},
			],
		});

		// Step 15: Create Approval Actions
		console.log("Creating approval actions...");
		await prisma.approvalAction.createMany({
			data: [
				{
					id: "aa1",
					clearanceRequestId: "req1",
					approverId: "app1",
					status: "PENDING",
					actionDueBy: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
				},
				{
					id: "aa2",
					clearanceRequestId: "req2",
					approverId: "app1",
					status: "PENDING",
					actionDueBy: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
				},
				{
					id: "aa3",
					clearanceRequestId: "req3",
					approverId: "app1",
					status: "PENDING",
					actionDueBy: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
				},
				{
					id: "aa4",
					clearanceRequestId: "req4",
					approverId: "app2",
					status: "PENDING",
					actionDueBy: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
				},
				{
					id: "aa5",
					clearanceRequestId: "req5",
					approverId: "app19",
					status: "PENDING",
					actionDueBy: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
				},
				{
					id: "aa6",
					clearanceRequestId: "req6",
					approverId: "app19",
					status: "PENDING",
					actionDueBy: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
				},
				{
					id: "aa7",
					clearanceRequestId: "req7",
					approverId: "app19",
					status: "PENDING",
					actionDueBy: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
				},
				{
					id: "aa8",
					clearanceRequestId: "req8",
					approverId: "app19",
					status: "PENDING",
					actionDueBy: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
				},
			],
		});

		// Step 16: Create Notifications
		console.log("Creating notifications...");
		await prisma.notification.createMany({
			data: [
				{
					id: "not1",
					userId: "user1",
					clearanceRequestId: "req1",
					title: "Termination Request Submitted",
					message: "Your termination request has been submitted.",
					type: "INFO",
					status: "SENT",
					sentAt: new Date(),
					read: false,
				},
				{
					id: "not2",
					userId: "user2",
					clearanceRequestId: "req2",
					title: "Termination Request Submitted",
					message: "Your termination request has been submitted.",
					type: "INFO",
					status: "SENT",
					sentAt: new Date(),
					read: false,
				},
				{
					id: "not3",
					userId: "user3",
					clearanceRequestId: "req3",
					title: "Termination Request Submitted",
					message: "Your termination request has been submitted.",
					type: "INFO",
					status: "SENT",
					sentAt: new Date(),
					read: false,
				}, // Updated to TERMINATION
				{
					id: "not4",
					userId: "user4",
					clearanceRequestId: "req4",
					title: "Termination Request Submitted",
					message: "Your termination request has been submitted.",
					type: "INFO",
					status: "SENT",
					sentAt: new Date(),
					read: false,
				},
				{
					id: "not5",
					userId: "user5",
					clearanceRequestId: "req5",
					title: "Teacher Clearance Submitted",
					message: "Your clearance request has been submitted.",
					type: "INFO",
					status: "SENT",
					sentAt: new Date(),
					read: false,
				},
				{
					id: "not6",
					userId: "user6",
					clearanceRequestId: "req6",
					title: "Teacher Clearance Submitted",
					message: "Your clearance request has been submitted.",
					type: "INFO",
					status: "SENT",
					sentAt: new Date(),
					read: false,
				},
				{
					id: "not7",
					userId: "user7",
					clearanceRequestId: "req7",
					title: "Teacher Clearance Submitted",
					message: "Your clearance request has been submitted.",
					type: "INFO",
					status: "SENT",
					sentAt: new Date(),
					read: false,
				},
				{
					id: "not8",
					userId: "user8",
					clearanceRequestId: "req8",
					title: "Teacher Clearance Submitted",
					message: "Your clearance request has been submitted.",
					type: "INFO",
					status: "SENT",
					sentAt: new Date(),
					read: false,
				},
			],
		});

		// Step 17: Create Audit Logs
		console.log("Creating audit logs...");
		await prisma.auditLog.createMany({
			data: [
				{
					id: "al1",
					userId: "user1",
					clearanceRequestId: "req1",
					action: "SUBMIT",
					details: "Submitted termination request",
					timestamp: new Date(),
				},
				{
					id: "al2",
					userId: "user2",
					clearanceRequestId: "req2",
					action: "SUBMIT",
					details: "Submitted termination request",
					timestamp: new Date(),
				},
				{
					id: "al3",
					userId: "user3",
					clearanceRequestId: "req3",
					action: "SUBMIT",
					details: "Submitted termination request",
					timestamp: new Date(),
				}, // Updated to TERMINATION
				{
					id: "al4",
					userId: "user4",
					clearanceRequestId: "req4",
					action: "SUBMIT",
					details: "Submitted termination request",
					timestamp: new Date(),
				},
				{
					id: "al5",
					userId: "user5",
					clearanceRequestId: "req5",
					action: "SUBMIT",
					details: "Submitted teacher clearance request",
					timestamp: new Date(),
				},
				{
					id: "al6",
					userId: "user6",
					clearanceRequestId: "req6",
					action: "SUBMIT",
					details: "Submitted teacher clearance request",
					timestamp: new Date(),
				},
				{
					id: "al7",
					userId: "user7",
					clearanceRequestId: "req7",
					action: "SUBMIT",
					details: "Submitted teacher clearance request",
					timestamp: new Date(),
				},
				{
					id: "al8",
					userId: "user8",
					clearanceRequestId: "req8",
					action: "SUBMIT",
					details: "Submitted teacher clearance request",
					timestamp: new Date(),
				},
			],
		});

		console.log("Seeding completed successfully.");
	} catch (e) {
		console.error("Error seeding database:", e);
		throw e;
	}
}

main()
	.catch((e) => {
		console.error("Error in main:", e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
