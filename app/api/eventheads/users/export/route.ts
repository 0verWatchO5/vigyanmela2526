import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/adminAuth";
import connect from "@/dbconfig/dbconn";
import User from "@/models/registration";
import ExcelJS from "exceljs";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {

    const adminData = await verifyAdminToken(request);
    if (!adminData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connect();

    const users = await User.find({}).select("-password").lean();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Users");


    worksheet.columns = [
      { header: "First Name", key: "firstName", width: 15 },
      { header: "Last Name", key: "lastName", width: 15 },
      { header: "Email", key: "email", width: 30 },
      { header: "Phone", key: "contact", width: 18 },
      { header: "Is Admin", key: "isAdmin", width: 12 },
      { header: "Is Super Admin", key: "isSuperAdmin", width: 16 },
      { header: "Registered At", key: "createdAt", width: 22 },
    ];

    worksheet.getRow(1).font = { bold: true, size: 12 };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4F46E5" }, // Indigo-600
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    worksheet.getRow(1).alignment = { vertical: "middle", horizontal: "center" };

    users.forEach((user) => {
      worksheet.addRow({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        contact: (user as any).contact || "",
        isAdmin: user.isAdmin ? "Yes" : "No",
        isSuperAdmin: user.isSuperAdmin ? "Yes" : "No",
        createdAt: user.createdAt
          ? new Date(user.createdAt).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "",
      });
    });

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        row.alignment = { vertical: "middle", horizontal: "left" };
      }
    });

    const buffer = await workbook.xlsx.writeBuffer();

    const filename = `users_export_${new Date().toISOString().split("T")[0]}.xlsx`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    
    return NextResponse.json(
      { error: "Failed to export users" },
      { status: 500 }
    );
  }
}
