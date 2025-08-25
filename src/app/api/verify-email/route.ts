// app/api/verify-email/route.ts
import { verifyEmailWithHunter } from "@/service/service";
import { NextRequest, NextResponse } from "next/server";

// Configuración de CORS
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // 👈 acepta todos los orígenes
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email es requerido" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validación básica de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { isValid: false, error: "Formato de email inválido" },
        { status: 200, headers: corsHeaders }
      );
    }

    const isValid = await verifyEmailWithHunter(email);

    return NextResponse.json(
      {
        isValid,
        email,
        timestamp: new Date().toISOString(),
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error verificando email:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// OPTIONS - Necesario para preflight CORS
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}
