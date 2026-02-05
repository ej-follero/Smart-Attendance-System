export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Prisma, yearLevel, Status } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    
    // Extract query parameters
    const search = (url.searchParams.get('search') || url.searchParams.get('q') || '').trim();
    const page = Math.max(1, Number(url.searchParams.get('page') || 1));
    const pageSize = Math.min(1000, Math.max(1, Number(url.searchParams.get('pageSize') || 20)));
    const studentId = url.searchParams.get('studentId');
    const departmentId = url.searchParams.get('departmentId');
    const courseId = url.searchParams.get('courseId');
    const sectionId = url.searchParams.get('sectionId');
    const yearLevelParam = url.searchParams.get('yearLevel');
    const subjectId = url.searchParams.get('subjectId');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const statusParam = url.searchParams.get('status');

    console.log('Received student attendance filter parameters:', {
      studentId,
      departmentId,
      courseId,
      sectionId,
      yearLevel: yearLevelParam,
      subjectId,
      startDate,
      endDate,
      status: statusParam,
      search,
      page,
      pageSize
    });

    // Build where clause
    const where: Prisma.StudentWhereInput = {};

    // Search filter - comprehensive search across multiple fields
    if (search) {
      where.OR = [
        // Full name matching for multi-word searches (e.g., "abel cruz")
        ...(search.includes(' ') ? [
          {
            AND: [
              { firstName: { contains: search.split(' ')[0], mode: Prisma.QueryMode.insensitive } },
              { lastName: { contains: search.split(' ').slice(1).join(' '), mode: Prisma.QueryMode.insensitive } }
            ]
          },
          // Also check reverse order (last word as firstName, first words as lastName)
          {
            AND: [
              { firstName: { contains: search.split(' ').slice(-1)[0], mode: Prisma.QueryMode.insensitive } },
              { lastName: { contains: search.split(' ').slice(0, -1).join(' '), mode: Prisma.QueryMode.insensitive } }
            ]
          }
        ] : []),
        // Individual name fields (for single word or partial matches)
        { firstName: { contains: search, mode: Prisma.QueryMode.insensitive } },
        { lastName: { contains: search, mode: Prisma.QueryMode.insensitive } },
        // Other student fields
        { studentIdNum: { contains: search, mode: Prisma.QueryMode.insensitive } },
        { email: { contains: search, mode: Prisma.QueryMode.insensitive } },
        { phoneNumber: { contains: search, mode: Prisma.QueryMode.insensitive } },
        { rfidTag: { contains: search, mode: Prisma.QueryMode.insensitive } },
        // Department
        {
          Department: {
            OR: [
              { departmentName: { contains: search, mode: Prisma.QueryMode.insensitive } },
              { departmentCode: { contains: search, mode: Prisma.QueryMode.insensitive } }
            ]
          }
        },
        // Course
        {
          CourseOffering: {
            OR: [
              { courseName: { contains: search, mode: Prisma.QueryMode.insensitive } },
              { courseCode: { contains: search, mode: Prisma.QueryMode.insensitive } }
            ]
          }
        },
        // Guardian
        {
          Guardian: {
            OR: [
              { firstName: { contains: search, mode: Prisma.QueryMode.insensitive } },
              { lastName: { contains: search, mode: Prisma.QueryMode.insensitive } },
              { email: { contains: search, mode: Prisma.QueryMode.insensitive } },
              { phoneNumber: { contains: search, mode: Prisma.QueryMode.insensitive } }
            ]
          }
        },
        // Section
        {
          StudentSection: {
            some: {
              Section: { sectionName: { contains: search, mode: Prisma.QueryMode.insensitive } }
            }
          }
        },
        // Subject
        {
          StudentSchedules: {
            some: {
              schedule: {
                OR: [
                  { subject: { subjectName: { contains: search, mode: Prisma.QueryMode.insensitive } } },
                  { subject: { subjectCode: { contains: search, mode: Prisma.QueryMode.insensitive } } }
                ]
              }
            }
          }
        }
      ];
    }

    // Department filter
    if (departmentId && departmentId !== 'all') {
      const deptNum = Number(departmentId);
      if (Number.isFinite(deptNum) && !isNaN(deptNum)) {
        where.departmentId = deptNum;
      } else {
        // Try to match by department code first, then by department name
        where.Department = {
          OR: [
            { departmentCode: departmentId },
            { departmentName: { contains: departmentId, mode: Prisma.QueryMode.insensitive } }
          ]
        };
      }
    }

    // Course filter
    if (courseId && courseId !== 'all') {
      const courseNum = Number(courseId);
      if (Number.isFinite(courseNum) && !isNaN(courseNum)) {
        where.courseId = courseNum;
      } else {
        where.CourseOffering = {
          OR: [
            { courseCode: courseId },
            { courseName: { contains: courseId, mode: Prisma.QueryMode.insensitive } }
          ]
        };
      }
    }

    // Section filter
    if (sectionId && sectionId !== 'all') {
      const sectionNum = Number(sectionId);
      if (Number.isFinite(sectionNum) && !isNaN(sectionNum)) {
        where.StudentSection = {
          some: {
            sectionId: sectionNum
          }
        };
      } else {
        where.StudentSection = {
          some: {
            Section: {
              sectionName: { contains: sectionId, mode: Prisma.QueryMode.insensitive }
            }
          }
        };
      }
    }

    // Year level filter - must be a valid enum value
    if (yearLevelParam && yearLevelParam !== 'all') {
      // Convert string to enum if it's a valid value
      const validYearLevels = Object.values(yearLevel);
      if (validYearLevels.includes(yearLevelParam as yearLevel)) {
        where.yearLevel = yearLevelParam as yearLevel;
      } else {
        // Try to convert common formats (e.g., "FIRST_YEAR", "First Year", "1st Year")
        const normalized = yearLevelParam.toUpperCase().replace(/\s+/g, '_');
        if (validYearLevels.includes(normalized as yearLevel)) {
          where.yearLevel = normalized as yearLevel;
        }
      }
    }

    // Subject filter
    if (subjectId && subjectId !== 'all') {
      const subjectNum = Number(subjectId);
      if (Number.isFinite(subjectNum) && !isNaN(subjectNum)) {
        where.StudentSchedules = {
          some: {
            schedule: {
              subjectId: subjectNum
            }
          }
        };
      }
    }

    // Student ID filter
    if (studentId) {
      const studentIdNum = Number(studentId);
      if (Number.isFinite(studentIdNum) && !isNaN(studentIdNum)) {
        where.studentId = studentIdNum;
      }
    }

    // Status filter - must be a valid enum value
    if (statusParam && statusParam !== 'all') {
      const validStatuses = Object.values(Status);
      if (validStatuses.includes(statusParam as Status)) {
        where.status = statusParam as Status;
      } else {
        // Try uppercase conversion
        const normalized = statusParam.toUpperCase();
        if (validStatuses.includes(normalized as Status)) {
          where.status = normalized as Status;
        }
      }
    }

    // Execute query with pagination
    const [total, items] = await prisma.$transaction([
      prisma.student.count({ where }),
      prisma.student.findMany({
        where,
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          studentId: true,
          studentIdNum: true,
          firstName: true,
          lastName: true,
          email: true,
          phoneNumber: true,
          rfidTag: true,
          yearLevel: true,
          status: true,
          departmentId: true,
          courseId: true,
          Department: {
            select: {
              departmentId: true,
              departmentName: true,
              departmentCode: true
            }
          },
          CourseOffering: {
            select: {
              courseId: true,
              courseName: true,
              courseCode: true
            }
          },
          StudentSection: {
            select: {
              sectionId: true,
              Section: {
                select: {
                  sectionId: true,
                  sectionName: true
                }
              }
            }
          },
          StudentSchedules: {
            select: {
              schedule: {
                select: {
                  subjectSchedId: true,
                  subject: {
                    select: {
                      subjectId: true,
                      subjectName: true,
                      subjectCode: true
                    }
                  }
                }
              }
            }
          }
        },
      }),
    ]);

    // Transform the data to match the expected format
    const transformedItems = items.map(student => ({
      id: String(student.studentId),
      studentId: String(student.studentId),
      studentIdNum: student.studentIdNum || '',
      studentName: `${student.firstName} ${student.lastName}`.trim(),
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email || '',
      phoneNumber: student.phoneNumber || '',
      rfidTag: student.rfidTag || '',
      department: student.Department?.departmentName || '',
      departmentId: student.departmentId,
      course: student.CourseOffering?.courseName || '',
      courseCode: student.CourseOffering?.courseCode || '',
      courseId: student.CourseOffering?.courseId || student.courseId,
      yearLevel: student.yearLevel || '',
      status: student.status || Status.ACTIVE,
      sections: student.StudentSection?.map((ss: any) => ({
        sectionId: ss.sectionId,
        sectionName: ss.Section?.sectionName || ''
      })) || [],
      schedules: student.StudentSchedules?.map((ss: any) => ({
        scheduleId: ss.schedule?.subjectSchedId,
        subjectId: ss.schedule?.subject?.subjectId,
        subjectName: ss.schedule?.subject?.subjectName || '',
        subjectCode: ss.schedule?.subject?.subjectCode || ''
      })) || [],
      // Placeholder values for attendance stats (these would come from attendance records)
      attendanceRate: 0,
      totalScheduledClasses: 0,
      attendedClasses: 0,
      absentClasses: 0,
      lateClasses: 0,
      riskLevel: 'NONE' as const
    }));

    return NextResponse.json({
      items: transformedItems,
      total,
      page,
      pageSize
    });
  } catch (e: any) {
    console.error('GET /api/attendance/students error:', e);
    return NextResponse.json(
      { error: e?.message ?? 'Failed to fetch student attendance data' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
