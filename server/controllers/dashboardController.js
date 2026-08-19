import db from '../config/db.js';

export const getDashboardSummary = async (req, res) => {
    try {
        // TOTAL EMPLOYEES

        const [employeeRows] = await db.query(`
            SELECT COUNT(*) AS totalEmployees
            FROM employees
        `);

        // TOTAL DEPARTMENTS

        const [deptRows] = await db.query(`
            SELECT COUNT(*) AS totalDepartments
            FROM departments
        `);

        // MONTHLY PAYROLL
        // July 2025

        const [payrollRows] = await db.query(`
            SELECT COALESCE(SUM(net_pay), 0) AS monthlyPayroll
            FROM payroll
            WHERE MONTH(month) = 7
            AND YEAR(month) = 2025
        `);

        // PENDING LEAVE REQUESTS

        const [leaveRows] = await db.query(`
            SELECT COUNT(*) AS pendingLeave
            FROM leave_requests
            WHERE status = 'Pending'
        `);

        // AVERAGE PERFORMANCE RATING

        const [ratingRows] = await db.query(`
            SELECT COALESCE(AVG(rating), 0) AS averageRating
            FROM performance_reviews
        `);

        // ATTENDANCE BY DAY

        const [attendanceRows] = await db.query(`
            SELECT
                DATE(MIN(date)) AS fullDate,
                DATE_FORMAT(MIN(date), '%b %d') AS dayLabel,

                SUM(
                    CASE
                        WHEN status = 'Present' THEN 1
                        ELSE 0
                    END
                ) AS present,

                SUM(
                    CASE
                        WHEN status = 'Absent' THEN 1
                        ELSE 0
                    END
                ) AS absent,

                SUM(
                    CASE
                        WHEN status = 'Remote' THEN 1
                        ELSE 0
                    END
                ) AS remote,

                SUM(
                    CASE
                        WHEN status = 'On Leave' THEN 1
                        ELSE 0
                    END
                ) AS onLeave,

                COUNT(*) AS total

            FROM attendance

            WHERE YEAR(date) = 2025

            GROUP BY DATE(date)

            ORDER BY DATE(date) ASC
        `);

        // OVERALL ATTENDANCE STATISTICS

        const [attendanceStats] = await db.query(`
            SELECT
                COUNT(
                    CASE
                        WHEN status = 'Present' THEN 1
                    END
                ) AS present_count,

                COUNT(*) AS total_count

            FROM attendance

            WHERE YEAR(date) = 2025
        `);

        // EMPLOYEES BY DEPARTMENT

        const [departmentRows] = await db.query(`
            SELECT
                d.name AS name,
                COUNT(e.id) AS count

            FROM departments d

            LEFT JOIN employees e
                ON d.id = e.department_id

            GROUP BY d.id, d.name

            ORDER BY count DESC
        `);
        // FORMAT ATTENDANCE DATA

        let dayLabels = [];
        let dailyPresent = [];
        let attendanceRate = 0;

        if (attendanceRows && attendanceRows.length > 0) {

            dayLabels = attendanceRows.map(
                d => d.dayLabel || ''
            );

            dailyPresent = attendanceRows.map(
                d => Number(d.present) || 0
            );

            const totalPresent =
                Number(attendanceStats[0]?.present_count) || 0;

            const totalDays =
                Number(attendanceStats[0]?.total_count) || 0;

            attendanceRate =
                totalDays > 0
                    ? Math.round(
                        (totalPresent / totalDays) * 100
                    )
                    : 0;

        } else {

            // Fallback data if there is no attendance data
            dayLabels = [
                'Jul 25',
                'Jul 26',
                'Jul 27',
                'Jul 28',
                'Jul 29'
            ];

            dailyPresent = [
                8,
                7,
                8,
                8,
                9
            ];

            attendanceRate = 85;
        }

        // GET FINAL VALUES

        const totalMonthlyPayroll =
            Number(payrollRows[0]?.monthlyPayroll) || 0;

        const totalEmployees =
            Number(employeeRows[0]?.totalEmployees) || 0;

        const totalDepartments =
            Number(deptRows[0]?.totalDepartments) || 0;

        const pendingLeave =
            Number(leaveRows[0]?.pendingLeave) || 0;

        const averageRating =
            Number(ratingRows[0]?.averageRating) || 0;

        const departmentStats =
            departmentRows || [];

        // SEND RESPONSE

        res.json({
            totalEmployees,

            departments: totalDepartments,

            attendance: attendanceRate,

            pendingRequests: pendingLeave,

            totalMonthlyPayroll,

            avgRating: parseFloat(
                averageRating.toFixed(1)
            ),

            dayLabels,

            dailyPresent,

            attendanceRate,

            departmentStats
        });

    } catch (error) {

        console.error(
            'Dashboard error:',
            error
        );

        res.status(500).json({
            message: 'Failed to load dashboard summary',
            error: error.message
        });
    }
};