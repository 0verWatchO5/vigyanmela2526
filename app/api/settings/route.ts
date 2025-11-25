import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Dbconns from "@/dbconfig/dbconn";
import SiteSettings from "@/models/siteSettings";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET - Fetch site settings
export async function GET() {
  try {
    await Dbconns();

    // Get or create settings document (should only be one)
    let settings = await SiteSettings.findOne();
    
    if (!settings) {
      // Create default settings if none exist
      settings = await SiteSettings.create({
        strictFootfallEnabled: false,
      });
    }

    return NextResponse.json({
      success: true,
      settings: {
        strictFootfallEnabled: settings.strictFootfallEnabled,
      },
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// PUT - Update site settings (admin only)
export async function PUT(request: Request) {
  try {
    await Dbconns();

    const session = await getServerSession(authOptions as any) as any;
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized - Please log in" },
        { status: 401 }
      );
    }

    // Check if user is admin (you'll need to verify this based on your admin auth)
    // For now, assuming logged in users with admin rights
    const body = await request.json();
    const { strictFootfallEnabled } = body;

    if (typeof strictFootfallEnabled !== "boolean") {
      return NextResponse.json(
        { success: false, error: "Invalid settings data" },
        { status: 400 }
      );
    }

    // Update or create settings
    let settings = await SiteSettings.findOne();
    
    if (!settings) {
      settings = await SiteSettings.create({
        strictFootfallEnabled,
      });
    } else {
      settings.strictFootfallEnabled = strictFootfallEnabled;
      await settings.save();
    }

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
      settings: {
        strictFootfallEnabled: settings.strictFootfallEnabled,
      },
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
