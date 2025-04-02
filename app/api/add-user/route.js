import { NextResponse } from 'next/server';
import supabase from '@/configs/supabaseConfig';
import generateUuid from '@/utils/generateUuid';

export async function POST(request) {
  try {
    const inputData = await request.json();
    console.log(inputData);

    const uuid = generateUuid();

    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          user_id: uuid,
          clerk_id: inputData.id,
          username: inputData.username,
          email: inputData.email,
          full_name: inputData.fullName,
          image: inputData.image,
        },
      ])
      .select();

    if (error) {
      console.error('Supabase Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('Data:', data);
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error('Fetch Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
