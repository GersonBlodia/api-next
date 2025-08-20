 
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET - Obtener todas las personas
export async function GET() {
  try {
    const personas = await prisma.persona.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(personas);
  } catch (error) {
    console.error('Error al obtener personas:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
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
        { error: 'Nombre, apellido y email son requeridos' },
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Formato de email inválido' },
        { status: 400 }
      );
    }

    // Verificar si el email ya existe
    const emailExists = await prisma.persona.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (emailExists) {
      return NextResponse.json(
        { error: 'El email ya está registrado' },
        { status: 409 }
      );
    }

    const nuevaPersona = await prisma.persona.create({
      data: {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        email: email.toLowerCase().trim()
      }
    });

    return NextResponse.json(nuevaPersona, { status: 201 });
  } catch (error) {
    console.error('Error al crear persona:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}