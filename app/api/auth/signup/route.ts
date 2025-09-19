import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function POST(request: Request) {
  const { name, email, password } = await request.json();

  if (!name || !email || !password) {
    return NextResponse.json({ message: 'Name, email, and password are required' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          name: name
        }
      }
    });

    if (error) {
      console.error('Supabase signup error:', error);
      return NextResponse.json({ success: false, message: 'Failed to sign up', error: error.message }, { status: 400 });
    }

    if (data.user) {
      return NextResponse.json({ success: true, message: 'User signed up successfully', user: data.user }, { status: 201 });
    }

  } catch (error) {
    console.error('Unexpected error during signup:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}