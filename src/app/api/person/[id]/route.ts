import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // ⚠️ en producción pon tu dominio frontend
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// GET - Obtener persona por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400, headers: corsHeaders }
      );
    }

    const persona = await prisma.persona.findUnique({
      where: { id },
    });

    if (!persona) {
      return NextResponse.json(
        { error: 'Persona no encontrada' },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(persona, { headers: corsHeaders });
  } catch (error) {
    console.error('Error al obtener persona:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500, headers: corsHeaders }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT - Editar persona
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400, headers: corsHeaders }
      );
    }

    const body = await request.json();
    const { nombre, apellido, email } = body;

    if (!nombre || !apellido || !email) {
      return NextResponse.json(
        { error: 'Nombre, apellido y email son requeridos' },
        { status: 400, headers: corsHeaders }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Formato de email inválido' },
        { status: 400, headers: corsHeaders }
      );
    }

    const existingPersona = await prisma.persona.findUnique({ where: { id } });
    if (!existingPersona) {
      return NextResponse.json(
        { error: 'Persona no encontrada' },
        { status: 404, headers: corsHeaders }
      );
    }

    const emailExists = await prisma.persona.findFirst({
      where: { email, NOT: { id } },
    });

    if (emailExists) {
      return NextResponse.json(
        { error: 'El email ya está en uso' },
        { status: 409, headers: corsHeaders }
      );
    }

    const personaActualizada = await prisma.persona.update({
      where: { id },
      data: {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        email: email.toLowerCase().trim(),
      },
    });

    return NextResponse.json(personaActualizada, { headers: corsHeaders });
  } catch (error) {
    console.error('Error al actualizar persona:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500, headers: corsHeaders }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE - Eliminar persona
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400, headers: corsHeaders }
      );
    }

    const existingPersona = await prisma.persona.findUnique({ where: { id } });
    if (!existingPersona) {
      return NextResponse.json(
        { error: 'Persona no encontrada' },
        { status: 404, headers: corsHeaders }
      );
    }

    await prisma.persona.delete({ where: { id } });

    return NextResponse.json(
      { message: 'Persona eliminada correctamente' },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error al eliminar persona:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500, headers: corsHeaders }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// OPTIONS - Responder preflight CORS
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}
