import Image from 'next/image';
import { redirect } from 'next/navigation';

export default function Page() {
  redirect('/sign-in');

  return (
    <div>
      <p>Hello</p>
    </div>
  );
}
