
// app/api/verify-email/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const verifyEmailWithHunter = async (email: string) => {
  const res = await fetch(
    `https://api.hunter.io/v2/email-verifier?email=${email}&api_key=${process.env.HUNTER_API_KEY}`
  );
  const data = await res.json();
  return data.data?.result === 'deliverable';
};

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email es requerido' },
        { status: 400 }
      );
    }

    // Validación básica de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { isValid: false, error: 'Formato de email inválido' },
        { status: 200 }
      );
    }

    const isValid = await verifyEmailWithHunter(email);
    
    return NextResponse.json({
      isValid,
      email,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error verificando email:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}