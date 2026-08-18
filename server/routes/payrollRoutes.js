// routes/payrollRoutes.js
const express = require("express");
const router = express.Router();
const payrollController = require("../controllers/payrollController");

// Uncomment and adjust if your other routes (e.g. employeeRoutes.js)
// protect endpoints with an auth middleware:
// const requireAuth = require("../middleware/authMiddleware");
// router.use(requireAuth);

router.get("/summary", payrollController.getSummary);
router.get("/table", payrollController.getTable);
router.post("/run", payrollController.runPayroll);
router.get("/payslip/:employeeId", payrollController.getPayslip);
router.get("/ytd/:employeeId", payrollController.getYTD);

module.exports = router;