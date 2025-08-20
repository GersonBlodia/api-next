import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Configuración de CORS
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // 👈 acepta todos los orígenes
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};


// GET - Obtener todas las personas
export async function GET() {
  try {
    const personas = await prisma.persona.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(personas, { headers: corsHeaders });
  } catch (error) {
    console.error("Error al obtener personas:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500, headers: corsHeaders }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST - Crear nueva persona
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre, apellido, email } = body;

    // Validaciones básicas
    if (!nombre || !apellido || !email) {
      return NextResponse.json(
        { error: "Nombre, apellido y email son requeridos" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Formato de email inválido" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Verificar si el email ya existe
    const emailExists = await prisma.persona.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (emailExists) {
      return NextResponse.json(
        { error: "El email ya está registrado" },
        { status: 409, headers: corsHeaders }
      );
    }

    const nuevaPersona = await prisma.persona.create({
      data: {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        email: email.toLowerCase().trim(),
      },
    });

    return NextResponse.json(nuevaPersona, {
      status: 201,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error("Error al crear persona:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500, headers: corsHeaders }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// OPTIONS - Necesario para preflight CORS
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}
