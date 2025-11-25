import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import Dbconns from "@/dbconfig/dbconn";
import Visitor from "@/models/visitor";
import { verifyAdminToken } from "@/lib/adminAuth";

export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdminToken(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await Dbconns();

    const visitors = await Visitor.find().sort({ createdAt: -1 }).lean();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Visitors");

    // Define columns
    worksheet.columns = [
      { header: "Ticket Code", key: "ticketCode", width: 15 },
      { header: "First Name", key: "firstName", width: 20 },
      { header: "Last Name", key: "lastName", width: 20 },
      { header: "Email", key: "email", width: 30 },
      { header: "Contact", key: "contact", width: 15 },
      { header: "Age", key: "age", width: 10 },
      { header: "Organization", key: "organization", width: 30 },
      { header: "Role/Industry", key: "industry", width: 20 },
      { header: "LinkedIn", key: "linkedin", width: 40 },
      { header: "Registered On", key: "createdAt", width: 20 },
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0A66C2" },
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };

    // Add data rows
    visitors.forEach((visitor) => {
      worksheet.addRow({
        ticketCode: visitor.ticketCode || "",
        firstName: visitor.firstName || "",
        lastName: visitor.lastName || "",
        email: visitor.email || "",
        contact: visitor.contact || "",
        age: visitor.age || "",
        organization: visitor.organization || "",
        industry: visitor.industry || "",
        linkedin: visitor.linkedin || "",
        createdAt: visitor.createdAt
          ? new Date(visitor.createdAt).toLocaleString()
          : "",
      });
    });

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Return as downloadable file
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename=visitors_export_${new Date().toISOString().split("T")[0]}.xlsx`,
      },
    });
  } catch (err: any) {
    console.error("Export error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to export visitors" },
      { status: 500 }
    );
  }
}
