import { PrismaClient } from "../generated/prisma";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

// Helper function to hash passwords
async function hashPassword(password: string): Promise<string> {
	return await bcrypt.hash(password, 10);
}

async function main() {
	try {
		// Clear existing data
		await prisma.approvalAction.deleteMany();
		await prisma.document.deleteMany();
		await prisma.clearanceRequest.deleteMany();
		await prisma.workflowStep.deleteMany();
		await prisma.workflowRule.deleteMany();
		await prisma.approver.deleteMany();
		await prisma.student.deleteMany();
		await prisma.teacher.deleteMany();
		await prisma.user.deleteMany();
		await prisma.office.deleteMany();
		await prisma.department.deleteMany();
		await prisma.program.deleteMany();
		await prisma.documentType.deleteMany();
		await prisma.terminationReason.deleteMany();
		await prisma.idReplacementReason.deleteMany();

		console.log("Existing data cleared.");
	} catch (error) {
		console.error("Error clearing existing data:", error);
	}

	try {
		// Create Departments
		const departments = await prisma.department.createMany({
			data: [
				{ name: "Computer Science" },
				{ name: "Information Technology" },
				{ name: "Mechanical Engineering" },
				{ name: "Electrical Engineering" },
				{ name: "Medicine" },
			],
		});
		console.log("Departments created:", departments);

		// Map department names to their IDs
		const deptMap: Record<string, string> = {};
		const allDepartments = await prisma.department.findMany();
		allDepartments.forEach((dept: { id: string; name: string }) => {
			deptMap[dept.name] = dept.id;
		});

		// Create Offices
		const offices = await prisma.office.createMany({
			data: [
				{ officeName: "Academic Advisor", departmentId: null },
				{
					officeName: "Department Head",
					departmentId: deptMap["Computer Science"],
				},
				{ officeName: "Library (A)", departmentId: null },
				{ officeName: "Library (B)", departmentId: null },
				{ officeName: "Library (C)", departmentId: null },
				{ officeName: "Main Library", departmentId: null },
				{ officeName: "Library Equipment Store", departmentId: null },
				{ officeName: "Book Store", departmentId: null },
				{ officeName: "Campus Police", departmentId: null },
				{ officeName: "Dormitory Head", departmentId: null },
				{ officeName: "Students' Cafeteria Head", departmentId: null },
				{ officeName: "Finance Office", departmentId: null },
				{ officeName: "Registrar", departmentId: null },
				{ officeName: "Post Graduate Dean", departmentId: null },
				{ officeName: "Continuing Education", departmentId: null },
				{ officeName: "College Community Service", departmentId: null },
				{
					officeName: "Director of Research and Technology Transfer",
					departmentId: null,
				},
				{
					officeName: "Industry Liaison and Technology Transfer",
					departmentId: null,
				},
				{ officeName: "Community Service", departmentId: null },
				{
					officeName: "Senior Staff for Research and Community Service",
					departmentId: null,
				},
				{ officeName: "Property Group", departmentId: null },
				{ officeName: "Chief Cashier", departmentId: null },
				{ officeName: "Assistant Cashier", departmentId: null },
				{ officeName: "College Dean", departmentId: null },
				{ officeName: "College Accounting Staff", departmentId: null },
				{ officeName: "College Cashier", departmentId: null },
				{ officeName: "Collecting Accounting Staff", departmentId: null },
				{ officeName: "IBEK", departmentId: null },
				{ officeName: "Revenue Collection Specialist", departmentId: null },
				{ officeName: "General Service Directorate", departmentId: null },
				{ officeName: "Immediate Supervisor", departmentId: null },
				{ officeName: "Auditor", departmentId: null },
				{ officeName: "Legal Service", departmentId: null },
				{
					officeName: "Teachers and Staff Cooperative Association",
					departmentId: null,
				},
				{
					officeName: "Ethics and Anti-Corruption Directorate",
					departmentId: null,
				},
			],
		});
		console.log("Offices created:", offices);

		// Map office names to their IDs
		const officeMap: Record<string, string> = {};
		const allOffices = await prisma.office.findMany();
		allOffices.forEach((office: { id: string; officeName: string }) => {
			officeMap[office.officeName] = office.id;
		});

		// Validate officeMap and ensure all office names are mapped
		Object.keys(officeMap).forEach((officeName) => {
			if (!officeMap[officeName]) {
				console.error(`Office ID for "${officeName}" is missing in officeMap.`);
			}
		});

		// Create Programs
		const programs = await prisma.program.createMany({
			data: [
				{ name: "Undergraduate CS", type: "DEGREE", category: "REGULAR" },
				{ name: "Postgraduate CS", type: "DEGREE", category: "EXTENSION" },
				{ name: "Diploma IT", type: "DIPLOMA", category: "SUMMER" },
				{ name: "Diploma Mechanical", type: "DIPLOMA", category: "EVENING" },
			],
		});
		console.log("Programs created:", programs);

		// Map program names to their IDs
		const programMap: Record<string, string> = {};
		const allPrograms = await prisma.program.findMany();
		allPrograms.forEach((program: { id: string; name: string }) => {
			programMap[program.name] = program.id;
		});

		// Seed Users, Students, Teachers, and Approvers
		const defaultPassword = "Default@123"; // Minimum 6 characters with complexity
		const hashedDefaultPassword = await hashPassword(defaultPassword);

		// Create Students

		const studentUsers = await prisma.user.createMany({
			data: [
				{
					username: "SE12345678",
					passwordHash: hashedDefaultPassword,
					firstName: "John",
					fatherName: "Doe",
					grandfatherName: "Smith",
					email: "john.doe@example.com",
					role: "STUDENT",
					status: "ACTIVE",
					isFirstLogin: true,
				},
				{
					username: "NSR-4284932",
					passwordHash: hashedDefaultPassword,
					firstName: "Alice",
					fatherName: "Brown",
					grandfatherName: "Johnson",
					email: "alice.brown@example.com",
					role: "STUDENT",
					status: "ACTIVE",
					isFirstLogin: true,
				},
				{
					username: "SE98765432",
					passwordHash: await hashPassword("StrongPass@2023"),
					firstName: "Michael",
					fatherName: "Clark",
					grandfatherName: "Williams",
					email: "michael.clark@example.com",
					role: "STUDENT",
					status: "ACTIVE",
					isFirstLogin: false,
				},
				{
					username: "NSR-98765432",
					passwordHash: await hashPassword("Secure@2023"),
					firstName: "Sarah",
					fatherName: "Davis",
					grandfatherName: "Miller",
					email: "sarah.davis@example.com",
					role: "STUDENT",
					status: "ACTIVE",
					isFirstLogin: false,
				},
				{
					username: "MECH-12345678",
					passwordHash: await hashPassword("AnotherSecure@2023"),
					firstName: "David",
					fatherName: "Wilson",
					grandfatherName: "Taylor",
					email: "david.wilson@example.com",
					role: "STUDENT",
					status: "ACTIVE",
					isFirstLogin: false,
				},
			],
		});
		console.log("Student users created:", studentUsers);

		// Retrieve the IDs of the created users
		const createdStudentUsers = await prisma.user.findMany({
			where: { role: "STUDENT" },
		});
		const userIdMap: Record<string, string> = {};
		createdStudentUsers.forEach((user) => {
			userIdMap[user.username] = user.id; // Map username to user ID
		});

		// Add Student-Specific Data
		const students = await prisma.student.createMany({
			data: [
				{
					userId: userIdMap["SE12345678"], // Use the mapped user ID
					startDate: new Date("2020-09-01"),
					programId: programMap["Undergraduate CS"],
					currentYear: 5,
					semester: "SPRING",
					academicStatus: "ENROLLED",
				},
				{
					userId: userIdMap["NSR-4284932"], // Use the mapped user ID
					startDate: new Date("2021-09-01"),
					programId: programMap["Diploma IT"],
					currentYear: 4,
					semester: "FALL",
					academicStatus: "ENROLLED",
				},
			],
		});
		console.log("Students created:", students);

		// Create Teachers
		const teacherUsers = await prisma.user.createMany({
			data: [
				{
					username: "TEA-CS-12345678",
					passwordHash: hashedDefaultPassword,
					firstName: "Dr. Emily",
					fatherName: "White",
					grandfatherName: "Brown",
					email: "emily.white@example.com",
					role: "TEACHER",
					status: "ACTIVE",
					isFirstLogin: true,
				},
				{
					username: "TEA-IT-98765432",
					passwordHash: hashedDefaultPassword,
					firstName: "Dr. Robert",
					fatherName: "Green",
					grandfatherName: "Black",
					email: "robert.green@example.com",
					role: "TEACHER",
					status: "ACTIVE",
					isFirstLogin: true,
				},
				{
					username: "TEA-MECH-12345678",
					passwordHash: await hashPassword("TeacherPass@2023"),
					firstName: "Dr. Laura",
					fatherName: "King",
					grandfatherName: "Queen",
					email: "laura.king@example.com",
					role: "TEACHER",
					status: "ACTIVE",
					isFirstLogin: false,
				},
				{
					username: "TEA-ELEC-98765432",
					passwordHash: await hashPassword("SecureTeacher@2023"),
					firstName: "Dr. James",
					fatherName: "Scott",
					grandfatherName: "Adams",
					email: "james.scott@example.com",
					role: "TEACHER",
					status: "ACTIVE",
					isFirstLogin: false,
				},
				{
					username: "TEA-MED-12345678",
					passwordHash: await hashPassword("AnotherTeacher@2023"),
					firstName: "Dr. Susan",
					fatherName: "Lee",
					grandfatherName: "Park",
					email: "susan.lee@example.com",
					role: "TEACHER",
					status: "ACTIVE",
					isFirstLogin: false,
				},
			],
		});
		console.log("Teacher users created:", teacherUsers);

		// Retrieve the IDs of the created teacher users
		const createdTeacherUsers = await prisma.user.findMany({
			where: { role: "TEACHER" },
		});
		const teacherUserIdMap: Record<string, string> = {};
		createdTeacherUsers.forEach((user) => {
			teacherUserIdMap[user.username] = user.id; // Map username to user ID
		});

		// Add Teacher-Specific Data
		const teachers = await prisma.teacher.createMany({
			data: [
				{
					userId: teacherUserIdMap["TEA-CS-12345678"], // Use the mapped user ID
					hireDate: new Date("2018-09-01"),
					position: "Professor",
					departmentId: deptMap["Computer Science"],
					employmentStatus: "ACTIVE",
					yearsOfService: 6,
				},
				{
					userId: teacherUserIdMap["TEA-IT-98765432"], // Use the mapped user ID
					hireDate: new Date("2019-09-01"),
					position: "Lecturer",
					departmentId: deptMap["Information Technology"],
					employmentStatus: "ACTIVE",
					yearsOfService: 5,
				},
				{
					userId: teacherUserIdMap["TEA-MECH-12345678"], // Use the mapped user ID
					hireDate: new Date("2017-09-01"),
					position: "Associate Professor",
					departmentId: deptMap["Mechanical Engineering"],
					employmentStatus: "ACTIVE",
					yearsOfService: 7,
				},
				{
					userId: teacherUserIdMap["TEA-ELEC-98765432"], // Use the mapped user ID
					hireDate: new Date("2020-09-01"),
					position: "Assistant Professor",
					departmentId: deptMap["Electrical Engineering"],
					employmentStatus: "ACTIVE",
					yearsOfService: 4,
				},
				{
					userId: teacherUserIdMap["TEA-MED-12345678"], // Use the mapped user ID
					hireDate: new Date("2016-09-01"),
					position: "Professor",
					departmentId: deptMap["Medicine"],
					employmentStatus: "ACTIVE",
					yearsOfService: 8,
				},
			],
		});
		console.log("Teachers created:", teachers);

		// Create Approvers
		const approverUsers = await prisma.user.createMany({
			data: [
				{
					username: "approver_academic_advisor",
					passwordHash: await hashPassword("AdvisorPass@2023"),
					firstName: "Dr. Academic",
					fatherName: "Advisor",
					grandfatherName: "One",
					email: "academic.advisor@example.com",
					role: "APPROVER",
					status: "ACTIVE",
					isFirstLogin: false,
				},
				{
					username: "approver_dept_head_cs",
					passwordHash: await hashPassword("DeptHeadPass@2023"),
					firstName: "Dr. Department",
					fatherName: "Head",
					grandfatherName: "CS",
					email: "department.head.cs@example.com",
					role: "APPROVER",
					status: "ACTIVE",
					isFirstLogin: false,
				},
				{
					username: "approver_library_a",
					passwordHash: await hashPassword("LibraryAPass@2023"),
					firstName: "Ms. Library",
					fatherName: "A",
					grandfatherName: "Circulation",
					email: "library.a@example.com",
					role: "APPROVER",
					status: "ACTIVE",
					isFirstLogin: false,
				},
				{
					username: "approver_main_library",
					passwordHash: await hashPassword("MainLibraryPass@2023"),
					firstName: "Mr. Main",
					fatherName: "Library",
					grandfatherName: "Admin",
					email: "main.library@example.com",
					role: "APPROVER",
					status: "ACTIVE",
					isFirstLogin: false,
				},
				{
					username: "approver_registrar",
					passwordHash: await hashPassword("RegistrarPass@2023"),
					firstName: "Mr. Registrar",
					fatherName: "Office",
					grandfatherName: "Admin",
					email: "registrar.office@example.com",
					role: "APPROVER",
					status: "ACTIVE",
					isFirstLogin: false,
				},
				{
					username: "approver_library_b",
					passwordHash: await hashPassword("LibraryBPass@2023"),
					firstName: "Ms. Library",
					fatherName: "B",
					grandfatherName: "Circulation",
					email: "library.b@example.com",
					role: "APPROVER",
					status: "ACTIVE",
					isFirstLogin: false,
				},
				{
					username: "approver_dormitory_head",
					passwordHash: await hashPassword("DormitoryPass@2023"),
					firstName: "Mr. Dormitory",
					fatherName: "Head",
					grandfatherName: "Admin",
					email: "dormitory.head@example.com",
					role: "APPROVER",
					status: "ACTIVE",
					isFirstLogin: false,
				},
				{
					username: "approver_cafeteria_head",
					passwordHash: await hashPassword("CafeteriaPass@2023"),
					firstName: "Ms. Cafeteria",
					fatherName: "Head",
					grandfatherName: "Admin",
					email: "cafeteria.head@example.com",
					role: "APPROVER",
					status: "ACTIVE",
					isFirstLogin: false,
				},
				{
					username: "approver_post_graduate_dean",
					passwordHash: await hashPassword("PostGradDeanPass@2023"),
					firstName: "Dr. Post Graduate",
					fatherName: "Dean",
					grandfatherName: "Admin",
					email: "postgraduate.dean@example.com",
					role: "APPROVER",
					status: "ACTIVE",
					isFirstLogin: false,
				},
				{
					username: "approver_continuing_education",
					passwordHash: await hashPassword("ContinuingEduPass@2023"),
					firstName: "Dr. Continuing",
					fatherName: "Education",
					grandfatherName: "Admin",
					email: "continuing.education@example.com",
					role: "APPROVER",
					status: "ACTIVE",
					isFirstLogin: false,
				},
				{
					username: "approver_community_service",
					passwordHash: await hashPassword("CommunityServicePass@2023"),
					firstName: "Dr. Community",
					fatherName: "Service",
					grandfatherName: "Admin",
					email: "community.service@example.com",
					role: "APPROVER",
					status: "ACTIVE",
					isFirstLogin: false,
				},
				{
					username: "approver_research_directorate",
					passwordHash: await hashPassword("ResearchDirPass@2023"),
					firstName: "Dr. Research",
					fatherName: "Directorate",
					grandfatherName: "Admin",
					email: "research.directorate@example.com",
					role: "APPROVER",
					status: "ACTIVE",
					isFirstLogin: false,
				},
				{
					username: "approver_industry_liaison",
					passwordHash: await hashPassword("IndustryLiaisonPass@2023"),
					firstName: "Dr. Industry",
					fatherName: "Liaison",
					grandfatherName: "Admin",
					email: "industry.liaison@example.com",
					role: "APPROVER",
					status: "ACTIVE",
					isFirstLogin: false,
				},
				{
					username: "approver_senior_staff",
					passwordHash: await hashPassword("SeniorStaffPass@2023"),
					firstName: "Mr. Senior",
					fatherName: "Staff",
					grandfatherName: "Admin",
					email: "senior.staff@example.com",
					role: "APPROVER",
					status: "ACTIVE",
					isFirstLogin: false,
				},
				{
					username: "approver_property_group",
					passwordHash: await hashPassword("PropertyGroupPass@2023"),
					firstName: "Mr. Property",
					fatherName: "Group",
					grandfatherName: "Admin",
					email: "property.group@example.com",
					role: "APPROVER",
					status: "ACTIVE",
					isFirstLogin: false,
				},
				{
					username: "approver_chief_cashier",
					passwordHash: await hashPassword("ChiefCashierPass@2023"),
					firstName: "Mr. Chief",
					fatherName: "Cashier",
					grandfatherName: "Admin",
					email: "chief.cashier@example.com",
					role: "APPROVER",
					status: "ACTIVE",
					isFirstLogin: false,
				},
				{
					username: "approver_assistant_cashier",
					passwordHash: await hashPassword("AssistantCashierPass@2023"),
					firstName: "Ms. Assistant",
					fatherName: "Cashier",
					grandfatherName: "Admin",
					email: "assistant.cashier@example.com",
					role: "APPROVER",
					status: "ACTIVE",
					isFirstLogin: false,
				},
				{
					username: "approver_college_dean",
					passwordHash: await hashPassword("CollegeDeanPass@2023"),
					firstName: "Dr. College",
					fatherName: "Dean",
					grandfatherName: "Admin",
					email: "college.dean@example.com",
					role: "APPROVER",
					status: "ACTIVE",
					isFirstLogin: false,
				},
				{
					username: "approver_college_accounting",
					passwordHash: await hashPassword("CollegeAccountingPass@2023"),
					firstName: "Mr. College",
					fatherName: "Accounting",
					grandfatherName: "Admin",
					email: "college.accounting@example.com",
					role: "APPROVER",
					status: "ACTIVE",
					isFirstLogin: false,
				},
				{
					username: "approver_collecting_accounting",
					passwordHash: await hashPassword("CollectingAccountingPass@2023"),
					firstName: "Ms. Collecting",
					fatherName: "Accounting",
					grandfatherName: "Admin",
					email: "collecting.accounting@example.com",
					role: "APPROVER",
					status: "ACTIVE",
					isFirstLogin: false,
				},
				{
					username: "approver_ibek",
					passwordHash: await hashPassword("IBEKPass@2023"),
					firstName: "Mr. IBEK",
					fatherName: "Department",
					grandfatherName: "Admin",
					email: "ibek.department@example.com",
					role: "APPROVER",
					status: "ACTIVE",
					isFirstLogin: false,
				},
				{
					username: "approver_revenue_collection",
					passwordHash: await hashPassword("RevenueCollectionPass@2023"),
					firstName: "Mr. Revenue",
					fatherName: "Collection",
					grandfatherName: "Admin",
					email: "revenue.collection@example.com",
					role: "APPROVER",
					status: "ACTIVE",
					isFirstLogin: false,
				},
				{
					username: "approver_general_service",
					passwordHash: await hashPassword("GeneralServicePass@2023"),
					firstName: "Dr. General",
					fatherName: "Service",
					grandfatherName: "Admin",
					email: "general.service@example.com",
					role: "APPROVER",
					status: "ACTIVE",
					isFirstLogin: false,
				},
				{
					username: "approver_auditor",
					passwordHash: await hashPassword("AuditorPass@2023"),
					firstName: "Mr. Auditor",
					fatherName: "Office",
					grandfatherName: "Admin",
					email: "auditor.office@example.com",
					role: "APPROVER",
					status: "ACTIVE",
					isFirstLogin: false,
				},
				{
					username: "approver_legal_service",
					passwordHash: await hashPassword("LegalServicePass@2023"),
					firstName: "Mr. Legal",
					fatherName: "Service",
					grandfatherName: "Admin",
					email: "legal.service@example.com",
					role: "APPROVER",
					status: "ACTIVE",
					isFirstLogin: false,
				},
				{
					username: "approver_ethics_directorate",
					passwordHash: await hashPassword("EthicsDirectoratePass@2023"),
					firstName: "Dr. Ethics",
					fatherName: "Directorate",
					grandfatherName: "Admin",
					email: "ethics.directorate@example.com",
					role: "APPROVER",
					status: "ACTIVE",
					isFirstLogin: false,
				},
			],
		});
		console.log("Approver users created:", approverUsers);

		// Retrieve the IDs of the created approver users
		const createdApproverUsers = await prisma.user.findMany({
			where: { role: "APPROVER" },
		});
		const approverUserIdMap: Record<string, string> = {};
		createdApproverUsers.forEach((user) => {
			approverUserIdMap[user.username] = user.id; // Map username to user ID
		});

		// Add Approver-Specific Data
		const approversData = [
			{
				userId: approverUserIdMap["approver_academic_advisor"], // Use the mapped user ID
				officeId: officeMap["Academic Advisor"],
				departmentId: null,
				yearsOfExperience: 10,
			},
			{
				userId: approverUserIdMap["approver_dept_head_cs"], // Use the mapped user ID
				officeId: officeMap["Department Head"],
				departmentId: deptMap["Computer Science"],
				yearsOfExperience: 8,
			},
			{
				userId: approverUserIdMap["approver_library_a"], // Use the mapped user ID
				officeId: officeMap["Library (A)"],
				departmentId: null,
				yearsOfExperience: 5,
			},
			{
				userId: approverUserIdMap["approver_main_library"], // Use the mapped user ID
				officeId: officeMap["Main Library"],
				departmentId: null,
				yearsOfExperience: 7,
			},
			{
				userId: approverUserIdMap["approver_registrar"], // Use the mapped user ID
				officeId: officeMap["Registrar"],
				departmentId: null,
				yearsOfExperience: 12,
			},
			{
				userId: approverUserIdMap["approver_library_b"], // Use the mapped user ID
				officeId: officeMap["Library (B)"],
				departmentId: null,
				yearsOfExperience: 6,
			},
			{
				userId: approverUserIdMap["approver_dormitory_head"], // Use the mapped user ID
				officeId: officeMap["Dormitory Head"],
				departmentId: null,
				yearsOfExperience: 8,
			},
			{
				userId: approverUserIdMap["approver_cafeteria_head"], // Use the mapped user ID
				officeId: officeMap["Students' Cafeteria Head"],
				departmentId: null,
				yearsOfExperience: 7,
			},
			{
				userId: approverUserIdMap["approver_post_graduate_dean"], // Use the mapped user ID
				officeId: officeMap["Post Graduate Dean"],
				departmentId: null,
				yearsOfExperience: 10,
			},
			{
				userId: approverUserIdMap["approver_continuing_education"], // Use the mapped user ID
				officeId: officeMap["Continuing Education"],
				departmentId: null,
				yearsOfExperience: 9,
			},
			{
				userId: approverUserIdMap["approver_community_service"], // Use the mapped user ID
				officeId: officeMap["Community Service"],
				departmentId: null,
				yearsOfExperience: 8,
			},
			{
				userId: approverUserIdMap["approver_research_directorate"], // Use the mapped user ID
				officeId: officeMap["Director of Research and Technology Transfer"],
				departmentId: null,
				yearsOfExperience: 12,
			},
			{
				userId: approverUserIdMap["approver_industry_liaison"], // Use the mapped user ID
				officeId: officeMap["Industry Liaison and Technology Transfer"],
				departmentId: null,
				yearsOfExperience: 11,
			},
			{
				userId: approverUserIdMap["approver_senior_staff"], // Use the mapped user ID
				officeId: officeMap["Senior Staff for Research and Community Service"],
				departmentId: null,
				yearsOfExperience: 15,
			},
			{
				userId: approverUserIdMap["approver_property_group"], // Use the mapped user ID
				officeId: officeMap["Property Group"],
				departmentId: null,
				yearsOfExperience: 10,
			},
			{
				userId: approverUserIdMap["approver_chief_cashier"], // Use the mapped user ID
				officeId: officeMap["Chief Cashier"],
				departmentId: null,
				yearsOfExperience: 14,
			},
			{
				userId: approverUserIdMap["approver_assistant_cashier"], // Use the mapped user ID
				officeId: officeMap["Assistant Cashier"],
				departmentId: null,
				yearsOfExperience: 13,
			},
			{
				userId: approverUserIdMap["approver_college_dean"], // Use the mapped user ID
				officeId: officeMap["College Dean"],
				departmentId: null,
				yearsOfExperience: 16,
			},
			{
				userId: approverUserIdMap["approver_college_accounting"], // Use the mapped user ID
				officeId: officeMap["College Accounting Staff"],
				departmentId: null,
				yearsOfExperience: 12,
			},
			{
				userId: approverUserIdMap["approver_collecting_accounting"], // Use the mapped user ID
				officeId: officeMap["Collecting Accounting Staff"],
				departmentId: null,
				yearsOfExperience: 11,
			},
			{
				userId: approverUserIdMap["approver_ibek"], // Use the mapped user ID
				officeId: officeMap["IBEK"],
				departmentId: null,
				yearsOfExperience: 10,
			},
			{
				userId: approverUserIdMap["approver_revenue_collection"], // Use the mapped user ID
				officeId: officeMap["Revenue Collection Specialist"],
				departmentId: null,
				yearsOfExperience: 9,
			},
			{
				userId: approverUserIdMap["approver_general_service"], // Use the mapped user ID
				officeId: officeMap["General Service Directorate"],
				departmentId: null,
				yearsOfExperience: 13,
			},
			{
				userId: approverUserIdMap["approver_auditor"], // Use the mapped user ID
				officeId: officeMap["Auditor"],
				departmentId: null,
				yearsOfExperience: 15,
			},
			{
				userId: approverUserIdMap["approver_legal_service"], // Use the mapped user ID
				officeId: officeMap["Legal Service"],
				departmentId: null,
				yearsOfExperience: 14,
			},
			{
				userId: approverUserIdMap["approver_ethics_directorate"], // Use the mapped user ID
				officeId: officeMap["Ethics and Anti-Corruption Directorate"],
				departmentId: null,
				yearsOfExperience: 16,
			},
		];
		// Before creating approvers, filter out any with undefined officeIds
		const validApproversData = approversData.filter((approver) => {
			if (!approver.officeId) {
				console.error(`Missing officeId for userId: ${approver.userId}`);
				return false;
			}
			return true;
		});
		// Create approvers
		const approvers = await prisma.approver.createMany({
			data: approversData,
		});
		console.log("Approvers created:", approvers);

		// Workflow for Postgraduate Regular Termination
		const terminationPostgraduateRegular = await prisma.workflowRule.create({
			data: {
				formType: "TERMINATION",
				programId: programMap["Postgraduate CS"],
				description: "Postgraduate Regular Termination Workflow",
			},
		});
		await prisma.workflowStep.createMany({
			data: [
				{
					ruleId: terminationPostgraduateRegular.id,
					officeId: officeMap["Academic Advisor"],
					stepOrder: 1,
				},
				{
					ruleId: terminationPostgraduateRegular.id,
					officeId: officeMap["Department Head"],
					stepOrder: 2,
				},
				{
					ruleId: terminationPostgraduateRegular.id,
					officeId: officeMap["Library (A)"],
					stepOrder: 3,
				},
				{
					ruleId: terminationPostgraduateRegular.id,
					officeId: officeMap["Library (B)"],
					stepOrder: 4,
				},
				{
					ruleId: terminationPostgraduateRegular.id,
					officeId: officeMap["Main Library"],
					stepOrder: 5,
				},
				{
					ruleId: terminationPostgraduateRegular.id,
					officeId: officeMap["Post Graduate Dean"],
					stepOrder: 6,
				},
				{
					ruleId: terminationPostgraduateRegular.id,
					officeId: officeMap["Registrar"],
					stepOrder: 7,
				},
			],
		});

		// Workflow for ID Card Replacement
		const idReplacementWorkflow = await prisma.workflowRule.create({
			data: {
				formType: "ID_REPLACEMENT",
				programId: programMap["Postgraduate CS"],
				description: "ID Card Replacement Workflow",
			},
		});
		await prisma.workflowStep.createMany({
			data: [
				{
					ruleId: idReplacementWorkflow.id,
					officeId: officeMap["Academic Advisor"],
					stepOrder: 1,
				},
				{
					ruleId: idReplacementWorkflow.id,
					officeId: officeMap["Library (A)"],
					stepOrder: 2,
				},
				{
					ruleId: idReplacementWorkflow.id,
					officeId: officeMap["Library (B)"],
					stepOrder: 3,
				},
				{
					ruleId: idReplacementWorkflow.id,
					officeId: officeMap["Main Library"],
					stepOrder: 4,
				},
				{
					ruleId: idReplacementWorkflow.id,
					officeId: officeMap["Book Store"],
					stepOrder: 5,
				},
				{
					ruleId: idReplacementWorkflow.id,
					officeId: officeMap["Campus Police"],
					stepOrder: 6,
				},
				{
					ruleId: idReplacementWorkflow.id,
					officeId: officeMap["Dormitory Head"],
					stepOrder: 7,
				},
				{
					ruleId: idReplacementWorkflow.id,
					officeId: officeMap["Students' Cafeteria Head"],
					stepOrder: 8,
				},
				{
					ruleId: idReplacementWorkflow.id,
					officeId: officeMap["Finance Office"],
					stepOrder: 9,
				},
				{
					ruleId: idReplacementWorkflow.id,
					officeId: officeMap["Registrar"],
					stepOrder: 10,
				},
			],
		});

		// Workflow for Teacher Clearance
		const teacherClearanceWorkflow = await prisma.workflowRule.create({
			data: {
				formType: "TEACHER_CLEARANCE",
				programId: null, // Teachers do not belong to a specific program
				description: "Teacher Clearance Workflow",
			},
		});
		await prisma.workflowStep.createMany({
			data: [
				{
					ruleId: teacherClearanceWorkflow.id,
					officeId: officeMap["College Community Service"],
					stepOrder: 1,
				},
				{
					ruleId: teacherClearanceWorkflow.id,
					officeId: officeMap["Director of Research and Technology Transfer"],
					stepOrder: 2,
				},
				{
					ruleId: teacherClearanceWorkflow.id,
					officeId: officeMap["Industry Liaison and Technology Transfer"],
					stepOrder: 3,
				},
				{
					ruleId: teacherClearanceWorkflow.id,
					officeId: officeMap["Community Service"],
					stepOrder: 4,
				},
				{
					ruleId: teacherClearanceWorkflow.id,
					officeId:
						officeMap["Senior Staff for Research and Community Service"],
					stepOrder: 5,
				},
				{
					ruleId: teacherClearanceWorkflow.id,
					officeId: officeMap["Main Library"],
					stepOrder: 6,
				},
				{
					ruleId: teacherClearanceWorkflow.id,
					officeId: officeMap["Library (A)"],
					stepOrder: 7,
				},
				{
					ruleId: teacherClearanceWorkflow.id,
					officeId: officeMap["Library (B)"],
					stepOrder: 8,
				},
				{
					ruleId: teacherClearanceWorkflow.id,
					officeId: officeMap["Library Equipment Store"],
					stepOrder: 9,
				},
				{
					ruleId: teacherClearanceWorkflow.id,
					officeId: officeMap["Property Group"],
					stepOrder: 10,
				},
				{
					ruleId: teacherClearanceWorkflow.id,
					officeId: officeMap["Chief Cashier"],
					stepOrder: 11,
				},
				{
					ruleId: teacherClearanceWorkflow.id,
					officeId: officeMap["Assistant Cashier"],
					stepOrder: 12,
				},
				{
					ruleId: teacherClearanceWorkflow.id,
					officeId: officeMap["College Dean"],
					stepOrder: 13,
				},
				{
					ruleId: teacherClearanceWorkflow.id,
					officeId: officeMap["College Accounting Staff"],
					stepOrder: 14,
				},
				{
					ruleId: teacherClearanceWorkflow.id,
					officeId: officeMap["College Cashier"],
					stepOrder: 15,
				},
				{
					ruleId: teacherClearanceWorkflow.id,
					officeId: officeMap["Collecting Accounting Staff"],
					stepOrder: 16,
				},
				{
					ruleId: teacherClearanceWorkflow.id,
					officeId: officeMap["IBEK"],
					stepOrder: 17,
				},
				{
					ruleId: teacherClearanceWorkflow.id,
					officeId: officeMap["Revenue Collection Specialist"],
					stepOrder: 18,
				},
				{
					ruleId: teacherClearanceWorkflow.id,
					officeId: officeMap["General Service Directorate"],
					stepOrder: 19,
				},
				{
					ruleId: teacherClearanceWorkflow.id,
					officeId: officeMap["Immediate Supervisor"],
					stepOrder: 20,
				},
				{
					ruleId: teacherClearanceWorkflow.id,
					officeId: officeMap["Continuing Education"],
					stepOrder: 21,
				},
				{
					ruleId: teacherClearanceWorkflow.id,
					officeId: officeMap["Registrar"],
					stepOrder: 22,
				},
				{
					ruleId: teacherClearanceWorkflow.id,
					officeId: officeMap["Auditor"],
					stepOrder: 23,
				},
				{
					ruleId: teacherClearanceWorkflow.id,
					officeId: officeMap["Legal Service"],
					stepOrder: 24,
				},
				{
					ruleId: teacherClearanceWorkflow.id,
					officeId: officeMap["Teachers and Staff Cooperative Association"],
					stepOrder: 25,
				},
				{
					ruleId: teacherClearanceWorkflow.id,
					officeId: officeMap["Ethics and Anti-Corruption Directorate"],
					stepOrder: 26,
				},
			],
		});

		// Add the rest of the workflows

		// Workflow for Student Termination Clearing Sheet (Postgraduate Extension)
		const terminationPostgraduateExtension = await prisma.workflowRule.create({
			data: {
				formType: "TERMINATION",
				programId: programMap["Postgraduate CS"],
				description:
					"Student Termination Clearing Sheet (Postgraduate Extension)",
			},
		});
		await prisma.workflowStep.createMany({
			data: [
				{
					ruleId: terminationPostgraduateExtension.id,
					officeId: officeMap["Academic Advisor"],
					stepOrder: 1,
				},
				{
					ruleId: terminationPostgraduateExtension.id,
					officeId: officeMap["Department Head"],
					stepOrder: 2,
				},
				{
					ruleId: terminationPostgraduateExtension.id,
					officeId: officeMap["Dormitory Head"],
					stepOrder: 3,
				},
				{
					ruleId: terminationPostgraduateExtension.id,
					officeId: officeMap["Library (A)"],
					stepOrder: 4,
				},
				{
					ruleId: terminationPostgraduateExtension.id,
					officeId: officeMap["Library (B)"],
					stepOrder: 5,
				},
				{
					ruleId: terminationPostgraduateExtension.id,
					officeId: officeMap["Library (C)"],
					stepOrder: 6,
				},
				{
					ruleId: terminationPostgraduateExtension.id,
					officeId: officeMap["Post Graduate Dean"],
					stepOrder: 7,
				},
				{
					ruleId: terminationPostgraduateExtension.id,
					officeId: officeMap["Registrar"],
					stepOrder: 8,
				},
			],
		});

		// Workflow for ID Card Replacement Form (Postgraduate Regular)
		const idReplacementPostgraduateRegular = await prisma.workflowRule.create({
			data: {
				formType: "ID_REPLACEMENT",
				programId: programMap["Postgraduate CS"],
				description: "ID Card Replacement Form (Postgraduate Regular)",
			},
		});
		await prisma.workflowStep.createMany({
			data: [
				{
					ruleId: idReplacementPostgraduateRegular.id,
					officeId: officeMap["Academic Advisor"],
					stepOrder: 1,
				},
				{
					ruleId: idReplacementPostgraduateRegular.id,
					officeId: officeMap["Library (A)"],
					stepOrder: 2,
				},
				{
					ruleId: idReplacementPostgraduateRegular.id,
					officeId: officeMap["Library (B)"],
					stepOrder: 3,
				},
				{
					ruleId: idReplacementPostgraduateRegular.id,
					officeId: officeMap["Main Library"],
					stepOrder: 4,
				},
				{
					ruleId: idReplacementPostgraduateRegular.id,
					officeId: officeMap["Book Store"],
					stepOrder: 5,
				},
				{
					ruleId: idReplacementPostgraduateRegular.id,
					officeId: officeMap["Campus Police"],
					stepOrder: 6,
				},
				{
					ruleId: idReplacementPostgraduateRegular.id,
					officeId: officeMap["Dormitory Head"],
					stepOrder: 7,
				},
				{
					ruleId: idReplacementPostgraduateRegular.id,
					officeId: officeMap["Students' Cafeteria Head"],
					stepOrder: 8,
				},
				{
					ruleId: idReplacementPostgraduateRegular.id,
					officeId: officeMap["Finance Office"],
					stepOrder: 9,
				},
				{
					ruleId: idReplacementPostgraduateRegular.id,
					officeId: officeMap["Registrar"],
					stepOrder: 10,
				},
			],
		});

		// Workflow for Student Termination Clearing Sheet (Postgraduate Regular)
		const terminationPostgraduateRegularWorkflow =
			await prisma.workflowRule.create({
				data: {
					formType: "TERMINATION",
					programId: programMap["Postgraduate CS"],
					description:
						"Student Termination Clearing Sheet (Postgraduate Regular)",
				},
			});
		await prisma.workflowStep.createMany({
			data: [
				{
					ruleId: terminationPostgraduateRegularWorkflow.id,
					officeId: officeMap["Academic Advisor"],
					stepOrder: 1,
				},
				{
					ruleId: terminationPostgraduateRegularWorkflow.id,
					officeId: officeMap["Department Head"],
					stepOrder: 2,
				},
				{
					ruleId: terminationPostgraduateRegularWorkflow.id,
					officeId: officeMap["Library (A)"],
					stepOrder: 3,
				},
				{
					ruleId: terminationPostgraduateRegularWorkflow.id,
					officeId: officeMap["Library (B)"],
					stepOrder: 4,
				},
				{
					ruleId: terminationPostgraduateRegularWorkflow.id,
					officeId: officeMap["Library (C)"],
					stepOrder: 5,
				},
				{
					ruleId: terminationPostgraduateRegularWorkflow.id,
					officeId: officeMap["Post Graduate Dean"],
					stepOrder: 6,
				},
				{
					ruleId: terminationPostgraduateRegularWorkflow.id,
					officeId: officeMap["Students' Cafeteria Head"],
					stepOrder: 7,
				},
				{
					ruleId: terminationPostgraduateRegularWorkflow.id,
					officeId: officeMap["Dormitory Head"],
					stepOrder: 8,
				},
				{
					ruleId: terminationPostgraduateRegularWorkflow.id,
					officeId: officeMap["Registrar"],
					stepOrder: 9,
				},
			],
		});

		// Workflow for ID Card Replacement Form (Postgraduate Extension)
		const idReplacementPostgraduateExtension = await prisma.workflowRule.create(
			{
				data: {
					formType: "ID_REPLACEMENT",
					programId: programMap["Postgraduate CS"],
					description: "ID Card Replacement Form (Postgraduate Extension)",
				},
			}
		);
		await prisma.workflowStep.createMany({
			data: [
				{
					ruleId: idReplacementPostgraduateExtension.id,
					officeId: officeMap["Academic Advisor"],
					stepOrder: 1,
				},
				{
					ruleId: idReplacementPostgraduateExtension.id,
					officeId: officeMap["Continuing Education"],
					stepOrder: 2,
				},
				{
					ruleId: idReplacementPostgraduateExtension.id,
					officeId: officeMap["Library (A)"],
					stepOrder: 3,
				},
				{
					ruleId: idReplacementPostgraduateExtension.id,
					officeId: officeMap["Library (B)"],
					stepOrder: 4,
				},
				{
					ruleId: idReplacementPostgraduateExtension.id,
					officeId: officeMap["Main Library"],
					stepOrder: 5,
				},
				{
					ruleId: idReplacementPostgraduateExtension.id,
					officeId: officeMap["Book Store"],
					stepOrder: 6,
				},
				{
					ruleId: idReplacementPostgraduateExtension.id,
					officeId: officeMap["Campus Police"],
					stepOrder: 7,
				},
				{
					ruleId: idReplacementPostgraduateExtension.id,
					officeId: officeMap["Finance Office"],
					stepOrder: 8,
				},
				{
					ruleId: idReplacementPostgraduateExtension.id,
					officeId: officeMap["Registrar"],
					stepOrder: 9,
				},
			],
		});

		// Workflow for ID Card Replacement Form (Summer)
		const idReplacementSummer = await prisma.workflowRule.create({
			data: {
				formType: "ID_REPLACEMENT",
				programId: programMap["Diploma IT"],
				description: "ID Card Replacement Form (Summer)",
			},
		});
		await prisma.workflowStep.createMany({
			data: [
				{
					ruleId: idReplacementSummer.id,
					officeId: officeMap["Academic Advisor"],
					stepOrder: 1,
				},
				{
					ruleId: idReplacementSummer.id,
					officeId: officeMap["Continuing Education"],
					stepOrder: 2,
				},
				{
					ruleId: idReplacementSummer.id,
					officeId: officeMap["Library (A)"],
					stepOrder: 3,
				},
				{
					ruleId: idReplacementSummer.id,
					officeId: officeMap["Library (B)"],
					stepOrder: 4,
				},
				{
					ruleId: idReplacementSummer.id,
					officeId: officeMap["Main Library"],
					stepOrder: 5,
				},
				{
					ruleId: idReplacementSummer.id,
					officeId: officeMap["Campus Police"],
					stepOrder: 6,
				},
				{
					ruleId: idReplacementSummer.id,
					officeId: officeMap["Dormitory Head"],
					stepOrder: 7,
				},
				{
					ruleId: idReplacementSummer.id,
					officeId: officeMap["Students' Cafeteria Head"],
					stepOrder: 8,
				},
				{
					ruleId: idReplacementSummer.id,
					officeId: officeMap["Finance Office"],
					stepOrder: 9,
				},
				{
					ruleId: idReplacementSummer.id,
					officeId: officeMap["Registrar"],
					stepOrder: 10,
				},
			],
		});

		// Workflow for Student Termination Clearing Sheet (Summer)
		const terminationSummer = await prisma.workflowRule.create({
			data: {
				formType: "TERMINATION",
				programId: programMap["Diploma IT"],
				description: "Student Termination Clearing Sheet (Summer)",
			},
		});
		await prisma.workflowStep.createMany({
			data: [
				{
					ruleId: terminationSummer.id,
					officeId: officeMap["Academic Advisor"],
					stepOrder: 1,
				},
				{
					ruleId: terminationSummer.id,
					officeId: officeMap["Department Head"],
					stepOrder: 2,
				},
				{
					ruleId: terminationSummer.id,
					officeId: officeMap["Dormitory Head"],
					stepOrder: 3,
				},
				{
					ruleId: terminationSummer.id,
					officeId: officeMap["Library (A)"],
					stepOrder: 4,
				},
				{
					ruleId: terminationSummer.id,
					officeId: officeMap["Library (B)"],
					stepOrder: 5,
				},
				{
					ruleId: terminationSummer.id,
					officeId: officeMap["Main Library"],
					stepOrder: 6,
				},
				{
					ruleId: terminationSummer.id,
					officeId: officeMap["Students' Cafeteria Head"],
					stepOrder: 7,
				},
				{
					ruleId: terminationSummer.id,
					officeId: officeMap["Registrar"],
					stepOrder: 8,
				},
			],
		});

		console.log("Database seeding completed successfully!");
	} catch (error) {
		console.error("Error during seeding:", error);
		process.exit(1);
	} finally {
		await prisma.$disconnect();
	}
}

main()
	.then(() => {
		console.log("Seeding completed.");
	})
	.catch((e) => {
		console.error("Error during seeding:", e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
